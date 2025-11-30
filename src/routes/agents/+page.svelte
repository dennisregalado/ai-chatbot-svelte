<script lang="ts">
	import { Agent } from '$lib/agents/index.svelte';
	import { AgentChat } from '$lib/agents/ai.svelte';

	// Input state (managed separately since AbstractChat doesn't have input)
	let input = $state('');

	// Connect to the chat agent
	const agent = new Agent({
		host: 'https://localhost:5174',
		agent: 'chat'
	});

	// Use the AgentChat class with the agent connection
	const chat = new AgentChat({
		agent
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!input.trim()) return;
		
		chat.sendMessage({
			role: 'user',
			parts: [{ type: 'text', text: input }]
		});
		input = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	}

</script>

<div class="chat-container">
	<div class="message-history">
		{#each chat.messages as message, i (message.id ?? i)}
			<div class="message {message.role}">
				{message.role === 'user' ? '👤' : '🤖'}
				{message.content}
			</div>
		{/each}

		{#if chat.isLoading}
			<div class="loading">AI is typing...</div>
		{/if}

		{#if chat.error}
			<div class="error">Error: {chat.error.message}</div>
		{/if}
	</div>

	<form onsubmit={handleSubmit} class="message-input">
		<input
			bind:value={input}
			onkeydown={handleKeydown}
			placeholder="Type your message..."
			disabled={chat.isLoading}
		/>
		<button type="submit" disabled={chat.isLoading || !input.trim()}>Send</button>
		<button type="button" onclick={() => chat.clearHistory()}>Clear Chat</button>
	</form>
</div>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
	}

	.message-history {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.message {
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		max-width: 80%;
	}

	.message.user {
		background: #3b82f6;
		color: white;
		align-self: flex-end;
	}

	.message.assistant {
		background: #f3f4f6;
		color: #1f2937;
		align-self: flex-start;
	}

	.message.system {
		background: #fef3c7;
		color: #92400e;
		align-self: center;
		font-size: 0.875rem;
	}

	.loading {
		color: #6b7280;
		font-style: italic;
		padding: 0.5rem;
	}

	.error {
		color: #dc2626;
		padding: 0.5rem;
		background: #fef2f2;
		border-radius: 0.25rem;
	}

	.message-input {
		display: flex;
		gap: 0.5rem;
	}

	.message-input input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		font-size: 1rem;
	}

	.message-input input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.message-input input:disabled {
		background: #f9fafb;
		cursor: not-allowed;
	}

	.message-input button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.message-input button[type='submit'] {
		background: #3b82f6;
		color: white;
	}

	.message-input button[type='submit']:hover:not(:disabled) {
		background: #2563eb;
	}

	.message-input button[type='button'] {
		background: #e5e7eb;
		color: #374151;
	}

	.message-input button[type='button']:hover {
		background: #d1d5db;
	}

	.message-input button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

