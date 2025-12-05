import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	shouldOnboard: integer('should_onboard', { mode: 'boolean' }),
	completedSteps: text('completed_steps'),
	firstName: text('first_name'),
	lastName: text('last_name')
});

export const sessions = sqliteTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		timezone: text('timezone'),
		city: text('city'),
		country: text('country'),
		region: text('region'),
		regionCode: text('region_code'),
		colo: text('colo'),
		latitude: text('latitude'),
		longitude: text('longitude'),
		activeOrganizationId: text('active_organization_id'),
		activeTeamId: text('active_team_id')
	},
	(table) => [index('sessions_userId_idx').on(table.userId)]
);

export const accounts = sqliteTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at', {
			mode: 'timestamp_ms'
		}),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', {
			mode: 'timestamp_ms'
		}),
		scope: text('scope'),
		password: text('password'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('accounts_userId_idx').on(table.userId)]
);

export const verifications = sqliteTable(
	'verifications',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('verifications_identifier_idx').on(table.identifier)]
);

export const userFiles = sqliteTable('user_files', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	contentType: text('content_type').notNull(),
	size: integer('size').notNull(),
	r2Key: text('r2_key').notNull(),
	uploadedAt: integer('uploaded_at', { mode: 'timestamp_ms' }).notNull(),
	category: text('category'),
	isPublic: integer('is_public', { mode: 'boolean' }),
	description: text('description')
});

export const passkeys = sqliteTable(
	'passkeys',
	{
		id: text('id').primaryKey(),
		name: text('name'),
		publicKey: text('public_key').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		credentialID: text('credential_id').notNull(),
		counter: integer('counter').notNull(),
		deviceType: text('device_type').notNull(),
		backedUp: integer('backed_up', { mode: 'boolean' }).notNull(),
		transports: text('transports'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }),
		aaguid: text('aaguid')
	},
	(table) => [
		index('passkeys_userId_idx').on(table.userId),
		index('passkeys_credentialID_idx').on(table.credentialID)
	]
);

export const organizations = sqliteTable('organizations', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	logo: text('logo'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	metadata: text('metadata')
});

export const teams = sqliteTable(
	'teams',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organizations.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).$onUpdate(
			() => /* @__PURE__ */ new Date()
		)
	},
	(table) => [index('teams_organizationId_idx').on(table.organizationId)]
);

export const teamMembers = sqliteTable(
	'team_members',
	{
		id: text('id').primaryKey(),
		teamId: text('team_id')
			.notNull()
			.references(() => teams.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
	},
	(table) => [
		index('teamMembers_teamId_idx').on(table.teamId),
		index('teamMembers_userId_idx').on(table.userId)
	]
);

export const members = sqliteTable(
	'members',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organizations.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: text('role').default('member').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
	},
	(table) => [
		index('members_organizationId_idx').on(table.organizationId),
		index('members_userId_idx').on(table.userId)
	]
);

export const invitations = sqliteTable(
	'invitations',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organizations.id, { onDelete: 'cascade' }),
		email: text('email').notNull(),
		role: text('role'),
		teamId: text('team_id'),
		status: text('status').default('pending').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		inviterId: text('inviter_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(table) => [
		index('invitations_organizationId_idx').on(table.organizationId),
		index('invitations_email_idx').on(table.email)
	]
);

export const preferences = sqliteTable('preferences', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	scopeId: text('scope_id'),
	scope: text('scope'),
	key: text('key'),
	value: text('value'),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const userRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	accounts: many(accounts),
	userFiles: many(userFiles),
	passkeys: many(passkeys),
	teamMembers: many(teamMembers),
	members: many(members),
	invitations: many(invitations),
	preferences: many(preferences)
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
	users: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const accountRelations = relations(accounts, ({ one }) => ({
	users: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	})
}));

export const userFileRelations = relations(userFiles, ({ one }) => ({
	users: one(users, {
		fields: [userFiles.userId],
		references: [users.id]
	})
}));

export const passkeyRelations = relations(passkeys, ({ one }) => ({
	users: one(users, {
		fields: [passkeys.userId],
		references: [users.id]
	})
}));

export const organizationRelations = relations(organizations, ({ many }) => ({
	teams: many(teams),
	members: many(members),
	invitations: many(invitations)
}));

export const teamRelations = relations(teams, ({ one, many }) => ({
	organizations: one(organizations, {
		fields: [teams.organizationId],
		references: [organizations.id]
	}),
	teamMembers: many(teamMembers)
}));

export const teamMemberRelations = relations(teamMembers, ({ one }) => ({
	teams: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
	users: one(users, {
		fields: [teamMembers.userId],
		references: [users.id]
	})
}));

export const memberRelations = relations(members, ({ one }) => ({
	organizations: one(organizations, {
		fields: [members.organizationId],
		references: [organizations.id]
	}),
	users: one(users, {
		fields: [members.userId],
		references: [users.id]
	})
}));

export const invitationRelations = relations(invitations, ({ one }) => ({
	organizations: one(organizations, {
		fields: [invitations.organizationId],
		references: [organizations.id]
	}),
	users: one(users, {
		fields: [invitations.inviterId],
		references: [users.id]
	})
}));

export const preferenceRelations = relations(preferences, ({ one }) => ({
	users: one(users, {
		fields: [preferences.userId],
		references: [users.id]
	})
}));
