// Re-export types from agents package
export type {
  Agent,
  MCPServersState,
  RPCRequest,
  RPCResponse,
  AgentContext,
  AgentEmail,
  AgentNamespace,
  AgentOptions,
  CallableMetadata,
  EmailResolver,
  EmailRoutingOptions,
  EmailSendOptions,
  MCPServer,
  MCPServerMessage,
  QueueItem,
  Schedule,
  StateUpdateMessage,
  StreamingResponse
} from "agents";

export {
  callable,
  unstable_callable,
  createAddressBasedEmailResolver,
  createCatchAllEmailResolver,
  createHeaderBasedEmailResolver,
  getAgentByName,
  getCurrentAgent,
  routeAgentEmail,
  routeAgentRequest
} from "agents";

// Re-export our local types and utilities
export type { AITool } from "./ai.svelte.js";
export { detectToolsRequiringConfirmation } from "./ai.svelte.js";
export { usePartySocket, PartySocket as PartySocketClass } from "./partysocket.svelte.js";
export { Agent } from "./agent.svelte.js";
export type { AgentChatOptions } from "./ai.svelte.js";
export { AgentChat } from "./ai.svelte.js";
export type { StreamOptions, AgentClientOptions, AgentClientFetchOptions } from "./client.js";
export { AgentClient, agentFetch } from "./client.js";
export type { SerializableValue, SerializableReturnValue, Method, RPCMethod } from "./serializable.js";
export { MessageType } from "./ai.types.js";
export type { OutgoingMessage, IncomingMessage } from "./ai.types.js";
