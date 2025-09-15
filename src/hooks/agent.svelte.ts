import { onMount } from "svelte";
import { PartySocket } from "./partysocket.svelte.js";
import type { MCPServersState, RPCRequest, RPCResponse } from "agents";
import type { StreamOptions } from "./client.js";
import type { Method, RPCMethod } from "./index.js";
import { MessageType } from "./ai.types.js";

/**
 * Convert a camelCase string to a kebab-case string
 * @param str The string to convert
 * @returns The kebab-case string
 */
function camelCaseToKebabCase(str: string): string {
  // If string is all uppercase, convert to lowercase
  if (str === str.toUpperCase() && str !== str.toLowerCase()) {
    return str.toLowerCase().replace(/_/g, "-");
  }

  // Otherwise handle camelCase to kebab-case
  let kebabified = str.replace(
    /[A-Z]/g,
    (letter) => `-${letter.toLowerCase()}`
  );
  kebabified = kebabified.startsWith("-") ? kebabified.slice(1) : kebabified;
  // Convert any remaining underscores to hyphens and remove trailing -'s
  return kebabified.replace(/_/g, "-").replace(/-$/, "");
}

/**
 * Options for the Agent class
 * @template State Type of the Agent's state
 */
export type UseAgentOptions<State = unknown> = {
  /** Name of the agent to connect to */
  agent: string;
  /** Name of the specific Agent instance */
  name?: string;
  /** Called when the Agent's state is updated */
  onStateUpdate?: (state: State, source: "server" | "client") => void;
  /** Called when MCP server state is updated */
  onMcpUpdate?: (mcpServers: MCPServersState) => void;
  /** Called when a message is received (fallback for unhandled messages) */
  onMessage?: (data: unknown) => void;
};

type AllOptional<T> = T extends [infer A, ...infer R]
  ? undefined extends A
    ? AllOptional<R>
    : false
  : true; // no params means optional by default

type RPCMethods<T> = {
  [K in keyof T as T[K] extends RPCMethod<T[K]> ? K : never]: RPCMethod<T[K]>;
};

type OptionalParametersMethod<T extends RPCMethod> =
  AllOptional<Parameters<T>> extends true ? T : never;

// all methods of the Agent, excluding the ones that are declared in the base Agent class
// biome-ignore lint: suspicious/noExplicitAny
type AgentMethods<T> = Omit<RPCMethods<T>, keyof Agent<any>>

type OptionalAgentMethods<T> = {
  [K in keyof AgentMethods<T> as AgentMethods<T>[K] extends OptionalParametersMethod<
    AgentMethods<T>[K]
  >
    ? K
    : never]: OptionalParametersMethod<AgentMethods<T>[K]>;
};

type RequiredAgentMethods<T> = Omit<
  AgentMethods<T>,
  keyof OptionalAgentMethods<T>
>;

type AgentPromiseReturnType<T, K extends keyof AgentMethods<T>> =
  // biome-ignore lint: suspicious/noExplicitAny
  ReturnType<AgentMethods<T>[K]> extends Promise<any>
    ? ReturnType<AgentMethods<T>[K]>
    : Promise<ReturnType<AgentMethods<T>[K]>>;

type OptionalArgsAgentMethodCall<AgentT> = <
  K extends keyof OptionalAgentMethods<AgentT>
>(
  method: K,
  args?: Parameters<OptionalAgentMethods<AgentT>[K]>,
  streamOptions?: StreamOptions
) => AgentPromiseReturnType<AgentT, K>;

type RequiredArgsAgentMethodCall<AgentT> = <
  K extends keyof RequiredAgentMethods<AgentT>
>(
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

// we neet to use Method instead of RPCMethod here for retro-compatibility
type UntypedAgentStub = Record<string, Method>;

/**
 * Svelte 5 class for connecting to an Agent
 * @template State Type of the Agent's state
 * @param options Connection options
 * @returns Agent instance with WebSocket connection and agent methods
 */
export class Agent<State = unknown> {
  #socket: PartySocket;
  #agentNamespace: string;
  #options: UseAgentOptions<State>;
  #pendingCalls = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      stream?: StreamOptions;
    }
  >();

  // Public properties
  agent: string;
  name: string;

  // Reactive state
  get isConnected() {
    return this.#socket.isConnected;
  }

  // URL properties for compatibility with AI class
  get _url(): string | null {
    if (this.#socket.socket?.url) {
      // Build the agent URL in the format expected by the AI class
      const socketUrl = this.#socket.socket.url;
      // Replace the WebSocket URL with agent-specific URL structure
      return socketUrl.replace('/party/', `/party/agents/${this.#agentNamespace}/${this.name}/`);
    }
    return null;
  }

  get _pkurl(): string | null {
    return this._url;
  }

  constructor(options: UseAgentOptions<State>) {
    this.#agentNamespace = camelCaseToKebabCase(options.agent);
    this.agent = this.#agentNamespace;
    this.name = options.name || "default";
    this.#options = options;

    // For agents, we need to create a specialized PartySocket connection
    // that matches the Cloudflare agents pattern
    this.#socket = this.#createAgentSocket();

    // Set up message handling
    this.#setupMessageHandling();

    // warn if agent isn't in lowercase
    if (this.agent !== this.agent.toLowerCase()) {
      console.warn(
        `Agent name: ${this.agent} should probably be in lowercase. Received: ${this.agent}`
      );
    }
  }

  #createAgentSocket(): PartySocket {
    // Create a room ID that follows the agent pattern
    const roomId = `agents/${this.#agentNamespace}/${this.name}`;
    return new PartySocket(roomId);
  }


  #setupMessageHandling() {
    onMount(() => {
      // Subscribe to messages from our custom PartySocket wrapper
      const unsubscribe = this.#socket.subscribeToMessages((data: unknown) => {
        this.#handleMessage(data);
      });

      // Return cleanup function
      return unsubscribe;
    });
  }

  #handleMessage(data: unknown) {
    if (typeof data === 'object' && data !== null) {
      const parsedMessage = data as Record<string, unknown>;
      
      if (parsedMessage.type === MessageType.CF_AGENT_STATE) {
        this.#options.onStateUpdate?.(parsedMessage.state as State, "server");
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
        if ("done" in response) {
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
        return;
      }
    }
    
    // Fallback for unhandled messages
    this.#options.onMessage?.(data);
  }

  setState(state: State) {
    this.#socket.send({ state, type: MessageType.CF_AGENT_STATE });
    this.#options.onStateUpdate?.(state, "client");
  }

  call = <T = unknown>(
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

      this.#socket.send(request);
    });
  };

  // Create stub for method calls
  stub = new Proxy<UntypedAgentStub>(
    {},
    {
      get: (_target, method) => {
        return (...args: unknown[]) => {
          return this.call(method as string, args);
        };
      }
    }
  );

  // Delegate PartySocket methods
  get socket() {
    return this.#socket.socket;
  }

  send(data: unknown) {
    return this.#socket.send(data);
  }

  close() {
    return this.#socket.close();
  }

  reconnect() {
    return this.#socket.reconnect();
  }

  // Subscribe to raw messages (useful for debugging or custom handling)
  subscribeToMessages(listener: (data: unknown) => void) {
    return this.#socket.subscribeToMessages(listener);
  }
} 
