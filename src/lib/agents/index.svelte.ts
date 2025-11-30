import type { PartySocket, PartySocketOptions } from '$lib/partysocket';
import { PartySocketConnection } from '$lib/partysocket/index.svelte';
import type { Agent as AgentType, MCPServersState, RPCRequest, RPCResponse } from 'agents';
import type { StreamOptions } from 'agents/client';
import { MessageType } from 'agents/ai-types';
import type { Method, RPCMethod } from './serializable';

/**
 * Convert a camelCase string to a kebab-case string
 */
function camelCaseToKebabCase(str: string): string {
	if (str === str.toUpperCase() && str !== str.toLowerCase()) {
		return str.toLowerCase().replace(/_/g, '-');
	}
	let kebabified = str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
	kebabified = kebabified.startsWith('-') ? kebabified.slice(1) : kebabified;
	return kebabified.replace(/_/g, '-').replace(/-$/, '');
}

type QueryObject = Record<string, string | null>;

// Query cache for async query functions
const queryCache = new Map<
	unknown[],
	{
		promise: Promise<QueryObject>;
		refCount: number;
		expiresAt: number;
		cacheTtl?: number;
	}
>();

function arraysEqual(a: unknown[], b: unknown[]): boolean {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (!Object.is(a[i], b[i])) return false;
	}
	return true;
}

function findCacheEntry(targetKey: unknown[]): Promise<QueryObject> | undefined {
	for (const [existingKey, entry] of queryCache.entries()) {
		if (arraysEqual(existingKey, targetKey)) {
			if (Date.now() > entry.expiresAt) {
				queryCache.delete(existingKey);
				return undefined;
			}
			entry.refCount++;
			return entry.promise;
		}
	}
	return undefined;
}

function setCacheEntry(key: unknown[], value: Promise<QueryObject>, cacheTtl?: number): void {
	for (const [existingKey] of queryCache.entries()) {
		if (arraysEqual(existingKey, key)) {
			queryCache.delete(existingKey);
			break;
		}
	}
	const expiresAt = cacheTtl ? Date.now() + cacheTtl : Date.now() + 5 * 60 * 1000;
	queryCache.set(key, { promise: value, refCount: 1, expiresAt, cacheTtl });
}

function decrementCacheEntry(targetKey: unknown[]): boolean {
	for (const [existingKey, entry] of queryCache.entries()) {
		if (arraysEqual(existingKey, targetKey)) {
			entry.refCount--;
			if (entry.refCount <= 0) {
				queryCache.delete(existingKey);
			}
			return true;
		}
	}
	return false;
}

function createCacheKey(
	agentNamespace: string,
	name: string | undefined,
	deps: unknown[]
): unknown[] {
	return [agentNamespace, name || 'default', ...deps];
}

/**
 * Options for the Agent class
 */
export type AgentOptions<State = unknown> = Omit<PartySocketOptions, 'party' | 'room' | 'query'> & {
	/** Name of the agent to connect to */
	agent: string;
	/** Name of the specific Agent instance */
	name?: string;
	/** Query parameters - can be static object or async function */
	query?: QueryObject | (() => Promise<QueryObject>);
	/** Dependencies for async query caching */
	queryDeps?: unknown[];
	/** Cache TTL in milliseconds for auth tokens/time-sensitive data */
	cacheTtl?: number;
	/** Called when the Agent's state is updated */
	onStateUpdate?: (state: State, source: 'server' | 'client') => void;
	/** Called when MCP server state is updated */
	onMcpUpdate?: (mcpServers: MCPServersState) => void;
	/** Called when the socket opens */
	onOpen?: (event: Event) => void;
	/** Called when the socket closes */
	onClose?: (event: CloseEvent) => void;
	/** Called when an error occurs */
	onError?: (event: Event) => void;
	/** Called when a message is received (after internal processing) */
	onMessage?: (event: MessageEvent) => void;
};

// Type utilities for typed agent methods
type AllOptional<T> = T extends [infer A, ...infer R]
	? undefined extends A
		? AllOptional<R>
		: false
	: true;

type RPCMethods<T> = {
	[K in keyof T as T[K] extends RPCMethod<T[K]> ? K : never]: RPCMethod<T[K]>;
};

type OptionalParametersMethod<T extends RPCMethod> =
	AllOptional<Parameters<T>> extends true ? T : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AgentMethods<T> = Omit<RPCMethods<T>, keyof AgentType<any, any>>;

type OptionalAgentMethods<T> = {
	[K in keyof AgentMethods<T> as AgentMethods<T>[K] extends OptionalParametersMethod<
		AgentMethods<T>[K]
	>
		? K
		: never]: OptionalParametersMethod<AgentMethods<T>[K]>;
};

type RequiredAgentMethods<T> = Omit<AgentMethods<T>, keyof OptionalAgentMethods<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AgentPromiseReturnType<T, K extends keyof AgentMethods<T>> =
	ReturnType<AgentMethods<T>[K]> extends Promise<any>
		? ReturnType<AgentMethods<T>[K]>
		: Promise<ReturnType<AgentMethods<T>[K]>>;

type OptionalArgsAgentMethodCall<AgentT> = <K extends keyof OptionalAgentMethods<AgentT>>(
	method: K,
	args?: Parameters<OptionalAgentMethods<AgentT>[K]>,
	streamOptions?: StreamOptions
) => AgentPromiseReturnType<AgentT, K>;

type RequiredArgsAgentMethodCall<AgentT> = <K extends keyof RequiredAgentMethods<AgentT>>(
	method: K,
	args: Parameters<RequiredAgentMethods<AgentT>[K]>,
	streamOptions?: StreamOptions
) => AgentPromiseReturnType<AgentT, K>;

type AgentMethodCall<AgentT> = OptionalArgsAgentMethodCall<AgentT> &
	RequiredArgsAgentMethodCall<AgentT>;

type UntypedAgentMethodCall = <T = unknown>(
	method: string,
	args?: unknown[],
	streamOptions?: StreamOptions
) => Promise<T>;

type AgentStub<T> = {
	[K in keyof AgentMethods<T>]: (
		...args: Parameters<AgentMethods<T>[K]>
	) => AgentPromiseReturnType<AgentMethods<T>, K>;
};

type UntypedAgentStub = Record<string, Method>;

/**
 * Svelte 5 class for connecting to an Agent
 */
export class Agent<State = unknown> {
	#connection: PartySocketConnection;
	#options: AgentOptions<State>;
	#pendingCalls = new Map<
		string,
		{
			resolve: (value: unknown) => void;
			reject: (error: Error) => void;
			stream?: StreamOptions;
		}
	>();
	#cacheKey: unknown[];
	#queryPromise: Promise<QueryObject> | null = null;

	readonly agent: string;
	readonly name: string;

	// Expose the stub for typed method calls
	readonly stub: UntypedAgentStub;

	constructor(options: AgentOptions<State>) {
		this.#options = options;
		this.agent = camelCaseToKebabCase(options.agent);
		this.name = options.name || 'default';

		// Warn if agent name isn't lowercase
		if (this.agent !== this.agent.toLowerCase()) {
			console.warn(
				`Agent name: ${this.agent} should probably be in lowercase. Received: ${this.agent}`
			);
		}

		const {
			query,
			queryDeps,
			cacheTtl,
			onStateUpdate,
			onMcpUpdate,
			onOpen,
			onClose,
			onError,
			onMessage,
			...socketOptions
		} = options;

		// Setup cache key for async queries
		this.#cacheKey = createCacheKey(this.agent, this.name, queryDeps || []);

		// Handle async query resolution
		let resolvedQuery: QueryObject | undefined;

		if (query) {
			if (typeof query === 'function') {
				// For async queries, we need to resolve them before connecting
				// Check cache first
				const existingPromise = findCacheEntry(this.#cacheKey);
				if (existingPromise) {
					this.#queryPromise = existingPromise;
				} else {
					this.#queryPromise = query().catch((error) => {
						console.error(`[Agent] Query failed for agent "${options.agent}":`, error);
						decrementCacheEntry(this.#cacheKey);
						throw error;
					});
					setCacheEntry(this.#cacheKey, this.#queryPromise, cacheTtl);
				}
			} else {
				// Sync query - use directly
				resolvedQuery = query;
			}
		}

		// Create the PartySocket connection
		this.#connection = new PartySocketConnection({
			...socketOptions,
			party: this.agent,
			prefix: 'agents',
			room: this.name,
			query: resolvedQuery,
			onOpen,
			onClose,
			onError,
			onMessage: (event) => {
				this.#handleMessage(event);
				onMessage?.(event);
			}
		});

		// Create the stub proxy for typed method calls
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.stub = new Proxy<any>(
			{},
			{
				get: (_target, method) => {
					return (...args: unknown[]) => {
						return this.call(method as string, args);
					};
				}
			}
		);

		// Setup cleanup effect
		$effect(() => {
			return () => {
				if (this.#queryPromise) {
					decrementCacheEntry(this.#cacheKey);
				}
			};
		});
	}

	/** The underlying PartySocket */
	get socket(): PartySocket {
		return this.#connection.socket;
	}

	/** Send raw data through the socket */
	send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		this.#connection.socket.send(data);
	}

	/** Set the agent's state */
	setState(state: State) {
		this.send(JSON.stringify({ state, type: MessageType.CF_AGENT_STATE }));
		this.#options.onStateUpdate?.(state, 'client');
	}

	/** Call a method on the agent */
	call: UntypedAgentMethodCall = <T = unknown>(
		method: string,
		args: unknown[] = [],
		streamOptions?: StreamOptions
	): Promise<T> => {
		return new Promise((resolve, reject) => {
			const id = Math.random().toString(36).slice(2);
			this.#pendingCalls.set(id, {
				reject,
				resolve: resolve as (value: unknown) => void,
				stream: streamOptions
			});

			const request: RPCRequest = {
				args,
				id,
				method,
				type: MessageType.RPC
			};

			this.send(JSON.stringify(request));
		});
	};

	/** Close the connection */
	close(code?: number, reason?: string) {
		this.#connection.socket.close(code, reason);
	}

	/** Reconnect to the agent */
	reconnect(code?: number, reason?: string) {
		this.#connection.socket.reconnect(code, reason);
	}

	/** Wait for async query to resolve (call before using if query is async) */
	async ready(): Promise<void> {
		if (this.#queryPromise) {
			const resolvedQuery = await this.#queryPromise;
			// Validate query values
			if (resolvedQuery) {
				for (const [key, value] of Object.entries(resolvedQuery)) {
					if (
						value !== null &&
						value !== undefined &&
						typeof value !== 'string' &&
						typeof value !== 'number' &&
						typeof value !== 'boolean'
					) {
						console.warn(
							`[Agent] Query parameter "${key}" is an object and will be converted to "[object Object]". ` +
								'Query parameters should be string, number, boolean, or null.'
						);
					}
				}
			}
			// Update the socket with resolved query
			this.#connection.socket.updateProperties({ query: resolvedQuery });
			this.#connection.socket.reconnect();
		}
	}

	#handleMessage(event: MessageEvent) {
		if (typeof event.data !== 'string') return;

		let parsedMessage: Record<string, unknown>;
		try {
			parsedMessage = JSON.parse(event.data);
		} catch {
			return;
		}

		if (parsedMessage.type === MessageType.CF_AGENT_STATE) {
			this.#options.onStateUpdate?.(parsedMessage.state as State, 'server');
			return;
		}

		if (parsedMessage.type === MessageType.CF_AGENT_MCP_SERVERS) {
			this.#options.onMcpUpdate?.(parsedMessage.mcp as MCPServersState);
			return;
		}

		if (parsedMessage.type === MessageType.RPC) {
			const response = parsedMessage as RPCResponse;
			const pending = this.#pendingCalls.get(response.id);
			if (!pending) return;

			if (!response.success) {
				pending.reject(new Error(response.error));
				this.#pendingCalls.delete(response.id);
				pending.stream?.onError?.(response.error);
				return;
			}

			// Handle streaming responses
			if ('done' in response) {
				if (response.done) {
					pending.resolve(response.result);
					this.#pendingCalls.delete(response.id);
					pending.stream?.onDone?.(response.result);
				} else {
					pending.stream?.onChunk?.(response.result);
				}
			} else {
				// Non-streaming response
				pending.resolve(response.result);
				this.#pendingCalls.delete(response.id);
			}
		}
	}
}

// Re-export types
export type { AgentMethodCall, AgentStub, UntypedAgentMethodCall, UntypedAgentStub };
