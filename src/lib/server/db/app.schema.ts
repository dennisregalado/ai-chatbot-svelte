import type { InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './auth.schema';

export const feedback = sqliteTable('Feedback', {
    id: text('id')
        .primaryKey()
        .notNull()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
        .notNull()
        .references(() => users.id),
    message: text('message'),
    sentiment: text('sentiment', { enum: ['sad', 'neutral', 'happy'] })
        .notNull()
        .default('neutral'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull()
});

export type Feedback = InferSelectModel<typeof feedback>;
