import { Chat } from '@ai-sdk/svelte';
import { getToolName, isToolUIPart } from 'ai';
import type { ChatInit, ChatTransport, UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import { nanoid } from 'nanoid';
import { MessageType, type OutgoingMessage } from 'agents/ai-types';

// Use a more flexible socket type that works with both our PartySocket and node_modules version
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketLike = any;

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

/**
 * Agent connection - can be either:
 * 1. A PartySocket with extended properties (like React's useAgent return)
 * 2. An Agent class instance from index.svelte.ts
 */
export type AgentConnection<State = unknown> = {
	agent: string;
	name: string;
	setState?: (state: State) => void;
	call?: <T = unknown>(method: string, args?: unknown[]) => Promise<T>;
	// Socket access - either directly on the object or via a socket property
	socket?: SocketLike;
	// Socket methods (if directly a socket)
	send?: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
	addEventListener?: SocketLike['addEventListener'];
	removeEventListener?: SocketLike['removeEventListener'];
	// Internal socket properties for URL construction
	_pk?: string;
	_url?: string;
	_pkurl?: string;
};

/**
 * Helper to get the underlying socket from an agent connection
 */
function getSocket<State>(agent: AgentConnection<State>): SocketLike {
	// If agent has a socket property (Agent class), use it
	if (agent.socket) {
		return agent.socket;
	}
	// Otherwise assume agent is the socket itself (socket with extended props)
	return agent as unknown as SocketLike;
}

/**
 * Helper to get URL string from agent connection
 */
function getAgentUrl<State>(agent: AgentConnection<State>): string | undefined {
	const socket = getSocket(agent);
	// Try _url first, then _pkurl
	return socket._url ?? socket._pkurl;
}

export interface AgentChatOptions<
	State = unknown,
	ChatMessage extends UIMessage = UIMessage
> extends Omit<ChatInit<ChatMessage>, 'transport'> {
	agent: AgentConnection<State>;
	getInitialMessages?:
		| undefined
		| null
		| ((options: GetInitialMessagesOptions) => Promise<ChatMessage[]>);
	credentials?: RequestCredentials;
	headers?: HeadersInit;
	experimental_automaticToolResolution?: boolean;
	tools?: Record<string, AITool<unknown, unknown>>;
	toolsRequiringConfirmation?: string[];
	autoSendAfterAllConfirmationsResolved?: boolean;
	resume?: boolean;
}

const requestCache = new Map<string, Promise<UIMessage[]>>();

/**
 * Detects which tools require confirmation based on their configuration.
 */
export function detectToolsRequiringConfirmation(
	tools?: Record<string, AITool<unknown, unknown>>
): string[] {
	if (!tools) return [];

	return Object.entries(tools)
		.filter(([_name, tool]) => !tool.execute)
		.map(([name]) => name);
}

/**
 * Svelte 5 class for building AI chat interfaces using an Agent.
 * Wraps @ai-sdk/svelte's Chat class with agent-specific transport and message handling.
 */
export class AgentChat<State = unknown, ChatMessage extends UIMessage = UIMessage> {
	readonly chat: Chat<ChatMessage>;

	#agent: AgentConnection<State>;
	#socket: SocketLike;
	#credentials?: RequestCredentials;
	#headers?: HeadersInit;
	#experimental_automaticToolResolution: boolean;
	#tools?: Record<string, AITool<unknown, unknown>>;
	#toolsRequiringConfirmation: string[];
	#autoSendAfterAllConfirmationsResolved: boolean;
	#resume: boolean;

	#processedToolCalls = new Set<string>();
	#localRequestIds = new Set<string>();
	#activeStream: {
		id: string;
		messageId: string;
		parts: ChatMessage['parts'];
	} | null = null;

	#agentUrlString: string;
	#messageListener: ((event: MessageEvent) => void) | null = null;

	// Expose chat state reactively (mirrors useChat return values)
	get messages() {
		return this.chat.messages;
	}

	set messages(value: ChatMessage[]) {
		this.chat.messages = value;
	}

	get status() {
		return this.chat.status;
	}

	get error() {
		return this.chat.error;
	}

	get id() {
		return this.chat.id;
	}

	get lastMessage(): ChatMessage | undefined {
		return this.chat.messages[this.chat.messages.length - 1];
	}

	/**
	 * Whether the chat is currently loading/streaming
	 */
	get isLoading(): boolean {
		return this.chat.status === 'submitted' || this.chat.status === 'streaming';
	}

	get pendingConfirmations() {
		const lastMsg = this.lastMessage;
		if (!lastMsg || lastMsg.role !== 'assistant') {
			return { messageId: undefined, toolCallIds: new Set<string>() };
		}

		const pendingIds = new Set<string>();
		for (const part of lastMsg.parts ?? []) {
			if (
				isToolUIPart(part) &&
				part.state === 'input-available' &&
				this.#toolsRequiringConfirmation.includes(getToolName(part))
			) {
				pendingIds.add(part.toolCallId);
			}
		}
		return { messageId: lastMsg.id, toolCallIds: pendingIds };
	}

	constructor(options: AgentChatOptions<State, ChatMessage>) {
		const {
			agent,
			getInitialMessages,
			messages: initialMessages,
			credentials,
			headers,
			experimental_automaticToolResolution = false,
			tools,
			toolsRequiringConfirmation: manualToolsRequiringConfirmation,
			autoSendAfterAllConfirmationsResolved = true,
			resume = true,
			...chatOptions
		} = options;

		this.#agent = agent;
		this.#socket = getSocket(agent);
		this.#credentials = credentials;
		this.#headers = headers;
		this.#experimental_automaticToolResolution = experimental_automaticToolResolution;
		this.#tools = tools;
		this.#toolsRequiringConfirmation =
			manualToolsRequiringConfirmation ?? detectToolsRequiringConfirmation(tools);
		this.#autoSendAfterAllConfirmationsResolved = autoSendAfterAllConfirmationsResolved;
		this.#resume = resume;

		// Build agent URL from the socket
		const rawUrl = getAgentUrl(agent);

		if (!rawUrl) {
			throw new Error(
				`[AgentChat] Cannot construct agent URL. Neither _url nor _pkurl is available on the socket. ` +
					`Make sure the agent connection is properly established.`
			);
		}

		const agentUrl = new URL(rawUrl.replace('ws://', 'http://').replace('wss://', 'https://'));
		agentUrl.searchParams.delete('_pk');
		this.#agentUrlString = agentUrl.toString();

		// Create the Chat instance with custom transport
		const socketPk = (this.#socket as unknown as { _pk?: string })._pk;
		this.chat = new Chat<ChatMessage>({
			...chatOptions,
			messages: initialMessages,
			transport: this.#createTransport(),
			id: socketPk
		});

		// Fetch initial messages if needed
		if (getInitialMessages !== null) {
			this.#fetchInitialMessages(getInitialMessages);
		}

		// Setup message listener for agent-specific messages
		this.#setupMessageListener();

		// Auto tool resolution effect
		$effect(() => {
			if (!this.#experimental_automaticToolResolution) return;

			const lastMsg = this.lastMessage;
			if (!lastMsg || lastMsg.role !== 'assistant') return;

			const toolCalls = lastMsg.parts.filter(
				(part) =>
					isToolUIPart(part) &&
					part.state === 'input-available' &&
					!this.#processedToolCalls.has(part.toolCallId)
			);

			if (toolCalls.length > 0) {
				this.#resolveToolCalls(toolCalls);
			}
		});
	}

	#createTransport(): ChatTransport<ChatMessage> {
		return {
			sendMessages: async (
				options: Parameters<typeof DefaultChatTransport.prototype.sendMessages>[0]
			) => {
				const transport = new DefaultChatTransport<ChatMessage>({
					api: this.#agentUrlString,
					fetch: this.#createAiFetch()
				});
				return transport.sendMessages(options);
			},
			reconnectToStream: async () => null
		};
	}

	#createAiFetch() {
		return async (request: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
			const {
				method,
				keepalive,
				headers,
				body,
				redirect,
				integrity,
				signal,
				credentials,
				mode,
				referrer,
				referrerPolicy,
				window
			} = options;

			const id = nanoid(8);
			const abortController = new AbortController();
			let controller: ReadableStreamDefaultController;

			this.#localRequestIds.add(id);

			signal?.addEventListener('abort', () => {
				this.#socket.send(
					JSON.stringify({
						id,
						type: MessageType.CF_AGENT_CHAT_REQUEST_CANCEL
					})
				);
				abortController.abort();
				try {
					controller.close();
				} catch {
					// Stream may already be closed
				}
				this.#localRequestIds.delete(id);
			});

			const messageHandler = (event: MessageEvent) => {
				let data: OutgoingMessage<ChatMessage>;
				try {
					data = JSON.parse(event.data) as OutgoingMessage<ChatMessage>;
				} catch {
					return;
				}

				if (data.type === MessageType.CF_AGENT_USE_CHAT_RESPONSE && data.id === id) {
					if (data.error) {
						controller.error(new Error(data.body));
						abortController.abort();
						this.#localRequestIds.delete(id);
					} else {
						if (data.body?.trim()) {
							controller.enqueue(new TextEncoder().encode(`data: ${data.body}\n\n`));
						}
						if (data.done) {
							try {
								controller.close();
							} catch {
								// Stream may already be closed
							}
							abortController.abort();
							this.#localRequestIds.delete(id);
						}
					}
				}
			};

			this.#socket.addEventListener('message', messageHandler, { signal: abortController.signal });

			const stream = new ReadableStream({
				start(c) {
					controller = c;
				},
				cancel(reason?: unknown) {
					console.warn('[AgentChat] cancelling stream', id, reason || 'no reason');
				}
			});

			this.#socket.send(
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

	async #fetchInitialMessages(
		getInitialMessages?: ((options: GetInitialMessagesOptions) => Promise<ChatMessage[]>) | null
	) {
		const cacheKey = `${this.#agentUrlString}|${this.#agent.agent ?? ''}|${this.#agent.name ?? ''}`;

		if (requestCache.has(cacheKey)) {
			this.chat.messages = (await requestCache.get(cacheKey)!) as ChatMessage[];
			return;
		}

		const fetchFn = getInitialMessages ?? this.#defaultGetInitialMessages.bind(this);
		const promise = fetchFn({
			agent: this.#agent.agent,
			name: this.#agent.name,
			url: this.#agentUrlString
		});

		requestCache.set(cacheKey, promise as Promise<UIMessage[]>);

		try {
			this.chat.messages = await promise;
		} catch (error) {
			console.warn('Failed to fetch initial messages:', error);
		}
	}

	async #defaultGetInitialMessages({ url }: GetInitialMessagesOptions): Promise<ChatMessage[]> {
		const getMessagesUrl = new URL(url);
		getMessagesUrl.pathname += '/get-messages';

		const response = await fetch(getMessagesUrl.toString(), {
			credentials: this.#credentials,
			headers: this.#headers
		});

		if (!response.ok) {
			console.warn(`Failed to fetch initial messages: ${response.status} ${response.statusText}`);
			return [];
		}

		const text = await response.text();
		if (!text.trim()) return [];

		try {
			return JSON.parse(text) as ChatMessage[];
		} catch (error) {
			console.warn('Failed to parse initial messages JSON:', error);
			return [];
		}
	}

	#setupMessageListener() {
		this.#messageListener = (event: MessageEvent) => {
			if (typeof event.data !== 'string') return;

			let data: OutgoingMessage<ChatMessage>;
			try {
				data = JSON.parse(event.data) as OutgoingMessage<ChatMessage>;
			} catch {
				return;
			}

			switch (data.type) {
				case MessageType.CF_AGENT_CHAT_CLEAR:
					this.chat.messages = [];
					break;

				case MessageType.CF_AGENT_CHAT_MESSAGES:
					this.chat.messages = data.messages;
					break;

				case MessageType.CF_AGENT_STREAM_RESUMING:
					if (!this.#resume) return;
					this.#activeStream = {
						id: data.id,
						messageId: nanoid(),
						parts: []
					};
					this.#socket.send(
						JSON.stringify({
							type: MessageType.CF_AGENT_STREAM_RESUME_ACK,
							id: data.id
						})
					);
					break;

				case MessageType.CF_AGENT_USE_CHAT_RESPONSE: {
					// Skip if this is a response to a request this tab initiated
					if (this.#localRequestIds.has(data.id)) return;

					// Initialize stream state for broadcasts from other tabs
					if (!this.#activeStream || this.#activeStream.id !== data.id) {
						this.#activeStream = {
							id: data.id,
							messageId: nanoid(),
							parts: []
						};
					}

					const activeMsg = this.#activeStream;

					if (data.body?.trim()) {
						try {
							const chunkData = JSON.parse(data.body);
							this.#processChunk(chunkData, activeMsg);

							// Update messages with partial response
							const existingIdx = this.chat.messages.findIndex((m) => m.id === activeMsg.messageId);
							const partialMessage = {
								id: activeMsg.messageId,
								role: 'assistant' as const,
								parts: [...activeMsg.parts]
							} as unknown as ChatMessage;

							if (existingIdx >= 0) {
								const updated = [...this.chat.messages];
								updated[existingIdx] = partialMessage;
								this.chat.messages = updated;
							} else {
								this.chat.messages = [...this.chat.messages, partialMessage];
							}
						} catch (parseError) {
							console.warn('[AgentChat] Failed to parse stream chunk:', parseError);
						}
					}

					if (data.done || data.error) {
						this.#activeStream = null;
					}
					break;
				}
			}
		};

		this.#socket.addEventListener('message', this.#messageListener);
	}

	#processChunk(chunkData: Record<string, unknown>, activeMsg: { parts: ChatMessage['parts'] }) {
		switch (chunkData.type) {
			case 'text-start':
				activeMsg.parts.push({
					type: 'text',
					text: '',
					state: 'streaming'
				} as ChatMessage['parts'][number]);
				break;
			case 'text-delta': {
				const lastTextPart = [...activeMsg.parts].reverse().find((p) => p.type === 'text');
				if (lastTextPart && lastTextPart.type === 'text') {
					(lastTextPart as { text: string }).text += chunkData.delta;
				} else {
					activeMsg.parts.push({
						type: 'text',
						text: chunkData.delta as string
					} as ChatMessage['parts'][number]);
				}
				break;
			}
			case 'text-end': {
				const lastTextPart = [...activeMsg.parts].reverse().find((p) => p.type === 'text');
				if (lastTextPart && 'state' in lastTextPart) {
					(lastTextPart as { state: string }).state = 'done';
				}
				break;
			}
			case 'reasoning-start':
				activeMsg.parts.push({
					type: 'reasoning',
					text: '',
					state: 'streaming'
				} as ChatMessage['parts'][number]);
				break;
			case 'reasoning-delta': {
				const lastReasoningPart = [...activeMsg.parts]
					.reverse()
					.find((p) => p.type === 'reasoning');
				if (lastReasoningPart && lastReasoningPart.type === 'reasoning') {
					(lastReasoningPart as { text: string }).text += chunkData.delta;
				}
				break;
			}
			case 'reasoning-end': {
				const lastReasoningPart = [...activeMsg.parts]
					.reverse()
					.find((p) => p.type === 'reasoning');
				if (lastReasoningPart && 'state' in lastReasoningPart) {
					(lastReasoningPart as { state: string }).state = 'done';
				}
				break;
			}
			case 'file':
				activeMsg.parts.push({
					type: 'file',
					mediaType: chunkData.mediaType,
					url: chunkData.url
				} as ChatMessage['parts'][number]);
				break;
			case 'source-url':
				activeMsg.parts.push({
					type: 'source-url',
					sourceId: chunkData.sourceId,
					url: chunkData.url,
					title: chunkData.title
				} as ChatMessage['parts'][number]);
				break;
			case 'source-document':
				activeMsg.parts.push({
					type: 'source-document',
					sourceId: chunkData.sourceId,
					mediaType: chunkData.mediaType,
					title: chunkData.title,
					filename: chunkData.filename
				} as ChatMessage['parts'][number]);
				break;
			case 'tool-input-available':
				activeMsg.parts.push({
					type: `tool-${chunkData.toolName}`,
					toolCallId: chunkData.toolCallId,
					toolName: chunkData.toolName,
					state: 'input-available',
					input: chunkData.input
				} as ChatMessage['parts'][number]);
				break;
			case 'tool-output-available': {
				const toolPart = activeMsg.parts.find(
					(p) => 'toolCallId' in p && p.toolCallId === chunkData.toolCallId
				);
				if (toolPart && 'state' in toolPart) {
					(toolPart as Record<string, unknown>).state = 'output-available';
					(toolPart as Record<string, unknown>).output = chunkData.output;
				}
				break;
			}
			case 'step-start':
				activeMsg.parts.push({ type: 'step-start' } as ChatMessage['parts'][number]);
				break;
		}
	}

	async #resolveToolCalls(toolCalls: ChatMessage['parts']) {
		const toolCallsToResolve = toolCalls.filter(
			(part) =>
				isToolUIPart(part) &&
				!this.#toolsRequiringConfirmation.includes(getToolName(part)) &&
				this.#tools?.[getToolName(part)]?.execute
		);

		if (toolCallsToResolve.length === 0) return;

		for (const part of toolCallsToResolve) {
			if (isToolUIPart(part)) {
				this.#processedToolCalls.add(part.toolCallId);
				let toolOutput = null;
				const toolName = getToolName(part);
				const tool = this.#tools?.[toolName];

				if (tool?.execute && part.input) {
					try {
						toolOutput = await tool.execute(part.input);
					} catch (error) {
						toolOutput = `Error executing tool: ${error instanceof Error ? error.message : String(error)}`;
					}
				}

				await this.addToolResult({
					toolCallId: part.toolCallId,
					tool: toolName,
					output: toolOutput
				});
			}
		}

		if (this.pendingConfirmations.toolCallIds.size === 0) {
			this.sendMessage();
		}
	}

	/**
	 * Send a message to the AI
	 */
	sendMessage(
		message?: Parameters<Chat<ChatMessage>['sendMessage']>[0],
		options?: Parameters<Chat<ChatMessage>['sendMessage']>[1]
	) {
		return this.chat.sendMessage(message, options);
	}

	/**
	 * Regenerate the last assistant message
	 */
	regenerate(options?: Parameters<Chat<ChatMessage>['regenerate']>[0]) {
		return this.chat.regenerate(options);
	}

	/**
	 * Resume a stream
	 */
	resumeStream(options?: Parameters<Chat<ChatMessage>['resumeStream']>[0]) {
		return this.chat.resumeStream(options);
	}

	/**
	 * Add a tool result to the conversation
	 */
	async addToolResult(args: { toolCallId: string; tool: string; output: unknown }) {
		const { toolCallId } = args;

		await this.chat.addToolResult(args);

		if (!this.#autoSendAfterAllConfirmationsResolved) {
			this.sendMessage();
			return;
		}

		const pending = this.pendingConfirmations.toolCallIds;
		const wasLast = pending.size === 1 && pending.has(toolCallId);

		if (wasLast || pending.size === 0) {
			this.sendMessage();
		}
	}

	/**
	 * Set messages directly
	 */
	setMessages(messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[])) {
		const resolvedMessages =
			typeof messages === 'function' ? messages(this.chat.messages) : messages;
		this.chat.messages = resolvedMessages;
		// Only send array to agent - function updates are local only
		this.#socket.send(
			JSON.stringify({
				messages: Array.isArray(messages) ? messages : [],
				type: MessageType.CF_AGENT_CHAT_MESSAGES
			})
		);
	}

	/**
	 * Clear chat history
	 */
	clearHistory() {
		this.chat.messages = [];
		this.#socket.send(
			JSON.stringify({
				type: MessageType.CF_AGENT_CHAT_CLEAR
			})
		);
	}

	/**
	 * Stop the current generation
	 */
	stop() {
		this.chat.stop();
	}

	/**
	 * Cleanup when the instance is destroyed
	 */
	destroy() {
		if (this.#messageListener) {
			this.#socket.removeEventListener('message', this.#messageListener);
			this.#messageListener = null;
		}
		this.#activeStream = null;
	}
}
