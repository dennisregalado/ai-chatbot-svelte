import type { ChatMessage } from '$lib/types';
import { useDataStream } from '$lib/components/data-stream-provider.svelte';

export interface UseAutoResumeParams {
    autoResume: boolean;
    initialMessages: ChatMessage[];
    resumeStream: () => void;
    setMessages: (messages: ChatMessage[]) => void;
}

export function AutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
}: UseAutoResumeParams) {
    const { dataStream } = useDataStream();

    // we intentionally run this once 
    $effect(() => {
        if (!autoResume) return;

        const mostRecentMessage = initialMessages.at(-1);

        if (mostRecentMessage?.role === 'user') {
            resumeStream();
        }
    });

    $effect(() => {
        if (!dataStream) return;
        if (dataStream.length === 0) return;

        const dataPart = dataStream[0];

        if (dataPart.type === 'data-appendMessage') {
            const message = JSON.parse(dataPart.data);
            setMessages([...initialMessages, message]);
        }
    });
}
