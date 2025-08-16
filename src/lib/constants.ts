import { dev } from '$app/environment';
import { generateDummyPassword } from '$lib/server/db/utils';

export const isProductionEnvironment = !dev;
export const isDevelopmentEnvironment = dev;
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();
