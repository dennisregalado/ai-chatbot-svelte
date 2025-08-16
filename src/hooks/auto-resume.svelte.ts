import type { ChatMessage } from '$lib/types';
import { useDataStream } from '$components/data-stream-provider.svelte';
import type { Chat } from '$server/db/schema';


export interface UseAutoResumeParams {
    autoResume: boolean;
    initialMessages: ChatMessage[];
    resumeStream: () => void;
    setMessages: (messages: ChatMessage[]) => void;
}

export class AutoResume {
    #loading = $state(false);
    #revalidating = $state(false);
    autoResume = $state(false);
    initialMessages = $state<ChatMessage[]>([]);
    resumeStream = $state<() => void>(() => { });
    setMessages = $state<(messages: ChatMessage[]) => void>(() => { });

    get loading() {
        return this.#loading;
    }

    get revalidating() {
        return this.#revalidating;
    }

    constructor(props: UseAutoResumeParams) {
        this.#loading = true;
        this.#revalidating = true;
        this.resumeStream = props.resumeStream;
        this.setMessages = props.setMessages;
        this.autoResume = props.autoResume;
        this.initialMessages = props.initialMessages;

        $effect(() => {
            if (!this.autoResume) return;

            const mostRecentMessage = this.initialMessages.at(-1);

            if (mostRecentMessage?.role === 'user') {
                this.resumeStream();
            }
        });

        $effect(() => {
            if (!this.dataStream) return;
            if (this.dataStream.length === 0) return;

            const dataPart = this.dataStream[0];

            if (dataPart.type === 'data-appendMessage') {
                const message = JSON.parse(dataPart.data);
                this.setMessages([...this.initialMessages, message]);
            }
        });
    }
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
