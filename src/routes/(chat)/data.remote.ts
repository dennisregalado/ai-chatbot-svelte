
import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { generateText } from 'ai';
import {
    deleteMessagesByChatIdAfterTimestamp,
    getMessageById,
    updateChatVisiblityById,
} from '$lib/queries.remote';
import type { VisibilityType } from '$components/visibility-selector.svelte';
import { myProvider } from '$ai/providers';

export const saveChatModelAsCookie = command(z.string(), async (model: string) => {
    const { cookies } = getRequestEvent();

    cookies.set('chat-model', model, {
        path: '/',
    });
});

export const generateTitleFromUserMessage = command(z.object({
    message: z.string(),
}), async ({ message }) => {

    const { text: title } = await generateText({
        model: myProvider.languageModel('title-model'),
        system: `\n
        - you will generate a short title based on the first message a user begins a conversation with
        - ensure it is not more than 80 characters long
        - the title should be a summary of the user's message
        - do not use quotes or colons`,
        prompt: JSON.stringify(message),
    });

    return title;
});

export const deleteTrailingMessages = command(z.object({
    id: z.string(),
}), async ({ id }: { id: string }) => {
    const [message] = await getMessageById(id);

    await deleteMessagesByChatIdAfterTimestamp({
        chatId: message.chatId,
        timestamp: message.createdAt,
    });
});

export const updateChatVisibility = command(z.object({
    chatId: z.string(),
    visibility: z.enum(['public', 'private']),
}), async ({ chatId, visibility }: { chatId: string; visibility: VisibilityType }) => {
    await updateChatVisiblityById({ chatId, visibility });
});
