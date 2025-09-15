import type { ChatInit, ChatTransport, UIMessage } from 'ai';
import { DefaultChatTransport, getToolName, isToolUIPart } from 'ai';
import { Chat } from '@ai-sdk/svelte';
import { nanoid } from 'nanoid';
import { MessageType } from './ai.types.js';
import type { OutgoingMessage } from './ai.types.js';

export type AITool<Input = unknown, Output = unknown> = {
	description?: string;
	inputSchema?: unknown;
	execute?: (input: Input) => Output | Promise<Output>;
};

type GetInitialMessagesOptions = {
	agent: string;
	name: string;
	url: string;
};

type UseAgentReturn<State = unknown> = {
	agent: string;
	name: string;
	_url?: string | null;
	_pkurl?: string;
	send: (message: string) => void;
	addEventListener: (event: string, handler: (event: MessageEvent) => void, options?: { signal?: AbortSignal }) => void;
	removeEventListener: (event: string, handler: (event: MessageEvent) => void) => void;
	setState: (state: State) => void;
};

export interface AgentChatOptions<State = unknown, ChatMessage extends UIMessage = UIMessage> {
	/** Agent connection from useAgent */
	agent: UseAgentReturn<State>;

	/** Initial messages */
	messages?: ChatMessage[];

	getInitialMessages?:
		| undefined
		| null
		| ((options: GetInitialMessagesOptions) => Promise<ChatMessage[]>);

	/** Request credentials */
	credentials?: RequestCredentials;

	/** Request headers */
	headers?: HeadersInit;

	/** Whether to automatically resolve tool calls that do not require human interaction */
	experimental_automaticToolResolution?: boolean;

	/** Tools object for automatic detection of confirmation requirements */
	tools?: Record<string, AITool<unknown, unknown>>;

	/** Manual override for tools requiring confirmation */
	toolsRequiringConfirmation?: string[];

	/** Chat configuration */
	api?: string;
	id?: string;
	generateId?: () => string;
	onFinish?: (options: { message: ChatMessage; messages: ChatMessage[]; isAbort: boolean; isDisconnect: boolean; isError: boolean }) => void;
	onError?: (error: Error) => void;
}

// Global request cache for initial messages
const requestCache = new Map<string, Promise<UIMessage[]>>();

/**
 * Automatically detects which tools require confirmation based on their configuration.
 * Tools require confirmation if they have no execute function AND are not server-executed.
 */
export function detectToolsRequiringConfirmation(
	tools?: Record<string, AITool<unknown, unknown>>
): string[] {
	if (!tools) return [];
	return Object.entries(tools)
		.filter(([_name, tool]) => !tool.execute)
		.map(([name]) => name);
}

export class AgentChat<State = unknown, ChatMessage extends UIMessage = UIMessage> {
	#agent: UseAgentReturn<State>;
	#options: AgentChatOptions<State, ChatMessage>;
	#agentUrlString: string;
	#toolsRequiringConfirmation: string[];
	#processedToolCalls = new Set<string>();
	#transport: ChatTransport<ChatMessage>;
	#chat: Chat<ChatMessage>;

	// Expose chat properties and methods through delegation
	get id() { return this.#chat.id; }
	get messages() { return this.#chat.messages; }
	get status() { return this.#chat.status; }
	get isLoading() { return this.#chat.status === 'streaming'; }
	get error() { return this.#chat.error; }

	// Input handling (if the underlying Chat supports it)
	input = $state('');

	// Methods that delegate to the chat instance
	sendMessage = (message: ChatMessage, options?: any) => this.#chat.sendMessage(message, options);
	addToolResult = async (toolCallId: string, tool: string, output: any) => {
		await this.#chat.addToolResult({ toolCallId, tool, output });
	};
	stop = () => this.#chat.stop?.();

	// Handle form submission (common pattern in chat interfaces)
	handleSubmit = (event?: Event) => {
		event?.preventDefault();
		if (this.input.trim() && this.status !== 'streaming') {
			this.sendMessage({
				role: 'user',
				parts: [{ type: 'text', text: this.input }]
			} as ChatMessage);
			this.input = '';
		}
	};
	
	constructor(options: AgentChatOptions<State, ChatMessage>) {
		this.#agent = options.agent;
		this.#options = options;

		// Auto-detect tools requiring confirmation, or use manual override
		this.#toolsRequiringConfirmation = options.toolsRequiringConfirmation ??
			detectToolsRequiringConfirmation(options.tools);

			console.log(this.#agent);
		// Build agent URL
		const wsUrl = (this.#agent._url as string | null) || this.#agent._pkurl;
		const httpUrl = wsUrl?.replace("ws://", "http://")
			.replace("wss://", "https://");
		const agentUrl = new URL(httpUrl);
		agentUrl.searchParams.delete("_pk");
		this.#agentUrlString = agentUrl.toString();

		// Initialize transport
		this.#transport = this.#createTransport();

		// Initialize the underlying Chat with agent transport
		this.#chat = new Chat({
			id: options.id,
			messages: options.messages || [],
			generateId: options.generateId ?? nanoid,
			transport: this.#transport,
			onFinish: options.onFinish,
			onError: options.onError
		});

		// Load initial messages if needed
		this.#loadInitialMessages();

		// Set up agent event listeners
		this.#setupAgentListeners();

		// Set up automatic tool resolution effect
		this.#setupAutomaticToolResolution();
	}

	#createTransport(): ChatTransport<ChatMessage> {
		return {
			sendMessages: async (options: any) => {
				const transport = new DefaultChatTransport({
					api: this.#agentUrlString,
					fetch: this.#createAiFetch()
				});
				return transport.sendMessages(options);
			},
			reconnectToStream: async (options: any) => {
				const transport = new DefaultChatTransport({
					api: this.#agentUrlString,
					fetch: this.#createAiFetch()
				});
				return transport.reconnectToStream(options);
			}
		};
	}

	#createAiFetch() {
		return async (request: RequestInfo | URL, options: RequestInit = {}) => {
			const { method, keepalive, headers, body, redirect, integrity, signal, credentials, mode, referrer, referrerPolicy, window } = options;
			const id = nanoid(8);
			const abortController = new AbortController();
			let controller: ReadableStreamDefaultController;
			let isToolCallInProgress = false;

			signal?.addEventListener("abort", () => {
				this.#agent.send(
					JSON.stringify({
						id,
						type: MessageType.CF_AGENT_CHAT_REQUEST_CANCEL
					})
				);
				abortController.abort();
				if (!isToolCallInProgress) {
					controller.close();
				}
			});

			this.#agent.addEventListener(
				"message",
				(event) => {
					let data: OutgoingMessage;
					try {
						data = JSON.parse(event.data) as OutgoingMessage;
					} catch (_error) {
						return;
					}

					if (data.type === MessageType.CF_AGENT_USE_CHAT_RESPONSE) {
						if (data.id === id) {
							if (data.error) {
								controller.error(new Error(data.body));
								abortController.abort();
							} else {
								if (data.body?.trim()) {
									if (data.body.includes('"tool_calls"')) {
										isToolCallInProgress = true;
									}
									controller.enqueue(
										new TextEncoder().encode(`data: ${data.body}\n\n`)
									);
								}
								if (data.done && !isToolCallInProgress) {
									controller.close();
									abortController.abort();
								}
							}
						}
					}
				},
				{ signal: abortController.signal }
			);

			const stream = new ReadableStream({
				start(c) {
					controller = c;
				}
			});

			this.#agent.send(
				JSON.stringify({
					id,
					init: {
						body,
						credentials,
						headers,
						integrity,
						keepalive,
						method,
						mode,
						redirect,
						referrer,
						referrerPolicy,
						window
					},
					type: MessageType.CF_AGENT_USE_CHAT_REQUEST,
					url: request.toString()
				})
			);

			return new Response(stream);
		};
	}

	async #defaultGetInitialMessagesFetch({ url }: GetInitialMessagesOptions): Promise<ChatMessage[]> {
		const getMessagesUrl = new URL(url);
		getMessagesUrl.pathname += "/get-messages";
		
		const response = await fetch(getMessagesUrl.toString(), {
			credentials: this.#options.credentials,
			headers: this.#options.headers
		});

		if (!response.ok) {
			console.warn(
				`Failed to fetch initial messages: ${response.status} ${response.statusText}`
			);
			return [];
		}

		const text = await response.text();
		if (!text.trim()) {
			return [];
		}

		try {
			return JSON.parse(text) as ChatMessage[];
		} catch (error) {
			console.warn("Failed to parse initial messages JSON:", error);
			return [];
		}
	}

	#loadInitialMessages() {
		if (this.#options.getInitialMessages === null) {
			return;
		}

		const getInitialMessagesFetch = this.#options.getInitialMessages ||
			this.#defaultGetInitialMessagesFetch.bind(this);

		if (requestCache.has(this.#agentUrlString)) {
			const promise = requestCache.get(this.#agentUrlString)!;
			promise.then(messages => {
				// Update the chat state directly since setMessages isn't exposed
				(this.#chat as any).state.setMessages(messages as ChatMessage[]);
			});
		} else {
			const promise = getInitialMessagesFetch({
				agent: this.#agent.agent,
				name: this.#agent.name,
				url: this.#agentUrlString
			});

			requestCache.set(this.#agentUrlString, promise);
			promise.then(messages => {
				// Update the chat state directly since setMessages isn't exposed
				(this.#chat as any).state.setMessages(messages as ChatMessage[]);
			});
		}
	}

	#setupAgentListeners() {
		const onClearHistory = (event: MessageEvent) => {
			if (typeof event.data !== "string") return;
			let data: OutgoingMessage;
			try {
				data = JSON.parse(event.data) as OutgoingMessage;
			} catch (_error) {
				return;
			}
			if (data.type === MessageType.CF_AGENT_CHAT_CLEAR) {
				(this.#chat as any).state.setMessages([]);
			}
		};

		const onMessages = (event: MessageEvent) => {
			if (typeof event.data !== "string") return;
			let data: OutgoingMessage;
			try {
				data = JSON.parse(event.data) as OutgoingMessage;
			} catch (_error) {
				return;
			}
			if (data.type === MessageType.CF_AGENT_CHAT_MESSAGES) {
				(this.#chat as any).state.setMessages(data.messages as ChatMessage[]);
			}
		};

		this.#agent.addEventListener("message", onClearHistory);
		this.#agent.addEventListener("message", onMessages);
	}

	#setupAutomaticToolResolution() {
		$effect(() => {
			if (!this.#options.experimental_automaticToolResolution) {
				return;
			}

			const lastMessage = this.#chat.messages[this.#chat.messages.length - 1];
			if (!lastMessage || lastMessage.role !== "assistant") {
				return;
			}

			const toolCalls = lastMessage.parts?.filter(
				(part) => isToolUIPart(part) && 
					part.state === "input-available" && 
					!this.#processedToolCalls.has(part.toolCallId)
			) ?? [];

			if (toolCalls.length > 0) {
				(async () => {
					const toolCallsToResolve = toolCalls.filter(
						(part) => isToolUIPart(part) && 
							!this.#toolsRequiringConfirmation.includes(getToolName(part)) &&
							this.#options.tools?.[getToolName(part)]?.execute
					);

					if (toolCallsToResolve.length > 0) {
						for (const part of toolCallsToResolve) {
							if (isToolUIPart(part)) {
								this.#processedToolCalls.add(part.toolCallId);
								let toolOutput = null;
								const toolName = getToolName(part);
								const tool = this.#options.tools?.[toolName];

								if (tool?.execute && part.input) {
									try {
										toolOutput = await tool.execute(part.input);
									} catch (error) {
										toolOutput = `Error executing tool: ${error instanceof Error ? error.message : String(error)}`;
									}
								}

								await this.#chat.addToolResult({
									toolCallId: part.toolCallId,
									tool: toolName,
									output: toolOutput
								});
							}
						}
						this.#chat.sendMessage();
					}
				})();
			}
		});
	}

	// Agent-specific methods
	clearHistory() {
		this.setMessages([]);
		this.#agent.send(
			JSON.stringify({
				type: MessageType.CF_AGENT_CHAT_CLEAR
			})
		);
	}

	setMessages(messages: ChatMessage[]) {
		(this.#chat as any).state.setMessages(messages);
		this.#agent.send(
			JSON.stringify({
				messages: messages,
				type: MessageType.CF_AGENT_CHAT_MESSAGES
			})
		);
	}

	get transport() {
		return this.#transport;
	}
}
