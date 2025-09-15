<script lang="ts">
	import { Agent } from '$hooks/agent.svelte.js';
	import { AgentChat } from '$hooks/ai.svelte.js';
	import { nanoid } from 'nanoid';

	// Connect to the chat agent
	const agent = $derived(
		new Agent({
			agent: "chat"
		})
	);

	$inspect(agent);

	// Initialize chat using the agent connection
	const chat = $derived(
		new AgentChat({
			agent,
			messages: [
				{
					id: nanoid(),
					role: 'system',
					parts: [{ type: 'text', text: "You're chatting with our AI assistant." }]
				},
				{
					id: nanoid(),
					role: 'assistant',
					parts: [{ type: 'text', text: 'Hello! How can I help you today?' }]
				}
			]
		})
	);

	const isLoading = $derived(chat.status !== 'ready');
</script>

<div class="chat-container">
	<div class="message-history">
		{#each chat.messages as message, i}
			<div class={`message ${message.role}`}>
				{message.role === 'assistant' ? '🤖' : '👤'}
				{#each message.parts as part}
					{#if part.type === 'text'}
						{part.text}
					{/if}
				{/each}
			</div>
		{/each}

		{#if isLoading}
			<div class="loading">AI is typing...</div>
		{/if}
		{#if chat.error}
			<div class="error">Error: {chat.error.message}</div>
		{/if}
	</div>

	<form class="message-input" onsubmit={chat.handleSubmit}>
		<input bind:value={chat.input} placeholder="Type your message..." disabled={isLoading} />
		<button type="submit" disabled={isLoading || !chat.input.trim()}>Send</button>
		<button type="button" onclick={() => chat.clearHistory()}>Clear Chat</button>
	</form>
</div>

<style>
	.chat-container {
		display: grid;
		gap: 0.75rem;
		max-width: 720px;
		margin: 0 auto;
	}
	.message-history {
		display: grid;
		gap: 0.5rem;
		padding: 0.75rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 0.5rem;
	}
	.message {
		padding: 0.375rem 0.5rem;
		border-radius: 0.375rem;
	}
	.message.user {
		background: color-mix(in oklab, canvas, canvastext 3%);
	}
	.message.assistant {
		background: color-mix(in oklab, canvas, canvastext 5%);
	}
	.loading {
		opacity: 0.7;
		font-style: italic;
	}
	.error {
		color: #dc2626;
	}
	.message-input {
		display: flex;
		gap: 0.5rem;
	}
	.message-input input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 0.375rem;
	}
</style>
