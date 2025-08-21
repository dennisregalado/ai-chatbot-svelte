<script lang="ts">
	import type { ChatMessage } from '$lib/types';
	import type { Vote } from '$server/db/schema';
	import { getVotesByChatId, updateVoteByChatId } from '$remote/chat.remote';
	import { Button } from '$components/ui/button';
	import { ThumbDownIcon, CopyIcon, ThumbUpIcon } from '$components/icons.svelte';
	import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '$components/ui/tooltip';
	import { toast } from 'svelte-sonner';

	let {
		chatId,
		message,
		vote,
		loading
	}: {
		chatId: string;
		message: ChatMessage;
		vote: Vote | undefined;
		loading: boolean;
	} = $props();
</script>

{#if loading}{:else if message.role === 'user'}{:else}
	<TooltipProvider delayDuration={0}>
		<div class="flex flex-row gap-2">
			<Tooltip>
				<TooltipTrigger>
					{#snippet child({ props })}
						<Button
							{...props}
							class="h-fit px-2 py-1 text-muted-foreground"
							variant="outline"
							onclick={async () => {
								const textFromParts = message.parts
									?.filter((part) => part.type === 'text')
									.map((part) => part.text)
									.join('\n')
									.trim();

								if (!textFromParts) {
									toast.error("There's no text to copy!");
									return;
								}

								await navigator.clipboard.writeText(textFromParts);
								toast.success('Copied to clipboard!');
							}}
						>
							{@render CopyIcon()}
						</Button>
					{/snippet}
				</TooltipTrigger>
				<TooltipContent>Copy</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					{#snippet child({ props })}
						<Button
							{...props}
							class="!pointer-events-auto h-fit px-2 py-1 text-muted-foreground"
							disabled={vote?.isUpvoted}
							variant="outline"
							onclick={async () => {
								try {
									const upvote = updateVoteByChatId({
										chatId,
										messageId: message.id,
										type: 'up'
									}).updates(
										getVotesByChatId(chatId).withOverride((currentVotes) => {
											if (!currentVotes) return [];

											const votesWithoutCurrent = currentVotes.filter(
												(vote) => vote.messageId !== message.id
											);

											return [
												...votesWithoutCurrent,
												{
													chatId,
													messageId: message.id,
													isUpvoted: true
												}
											];
										})
									);

									toast.promise(upvote, {
										loading: 'Upvoting Response...',
										success: 'Upvoted Response!',
										error: 'Failed to upvote response.'
									});
								} catch (error) {
									toast.error('Failed to upvote response.');
								}
							}}
						>
							{@render ThumbUpIcon()}
						</Button>
					{/snippet}
				</TooltipTrigger>
				<TooltipContent>Upvote Response</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger>
					{#snippet child({ props })}
						<Button
							{...props}
							class="!pointer-events-auto h-fit px-2 py-1 text-muted-foreground"
							variant="outline"
							disabled={vote && !vote.isUpvoted}
							onclick={async () => {
								try {
									const downvote = updateVoteByChatId({
										chatId,
										messageId: message.id,
										type: 'down'
									}).updates(
										getVotesByChatId(chatId).withOverride((currentVotes) => {
											if (!currentVotes) return [];

											const votesWithoutCurrent = currentVotes.filter(
												(vote) => vote.messageId !== message.id
											);

											return [
												...votesWithoutCurrent,
												{
													chatId,
													messageId: message.id,
													isUpvoted: false
												}
											];
										})
									);

									toast.promise(downvote, {
										loading: 'Downvoting Response...',
										success: 'Downvoted Response!',
										error: 'Failed to downvote response.'
									});
								} catch (error) {
									toast.error('Failed to downvote response.');
								}
							}}
						>
							{@render ThumbDownIcon()}
						</Button>
					{/snippet}
				</TooltipTrigger>
				<TooltipContent>Downvote Response</TooltipContent>
			</Tooltip>
		</div>
	</TooltipProvider>
{/if}
