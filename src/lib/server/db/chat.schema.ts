import type { InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { users } from './auth.schema';

export const chat = sqliteTable('Chat', {
    id: text('id')
        .primaryKey()
        .notNull()
        .$defaultFn(() => crypto.randomUUID()),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
    title: text('title').notNull(),
    userId: text('userId')
        .notNull()
        .references(() => users.id),
    visibility: text('visibility', { enum: ['public', 'private'] })
        .notNull()
        .default('private'),
    favorite: integer('favorite', { mode: 'boolean' }).notNull().default(false)
});

export type Chat = InferSelectModel<typeof chat>;

export const message = sqliteTable('Message', {
    id: text('id')
        .primaryKey()
        .notNull()
        .$defaultFn(() => crypto.randomUUID()),
    chatId: text('chatId')
        .notNull()
        .references(() => chat.id),
    role: text('role').notNull(),
    parts: text('parts', { mode: 'json' }).notNull(),
    attachments: text('attachments', { mode: 'json' }).notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull()
});

export type Message = InferSelectModel<typeof message>;

export const vote = sqliteTable(
    'Vote',
    {
        chatId: text('chatId')
            .notNull()
            .references(() => chat.id),
        messageId: text('messageId')
            .notNull()
            .references(() => message.id),
        isUpvoted: integer('isUpvoted', { mode: 'boolean' }).notNull()
    },
    (table) => [
        primaryKey({ columns: [table.chatId, table.messageId] })
    ]
);

export type Vote = InferSelectModel<typeof vote>;