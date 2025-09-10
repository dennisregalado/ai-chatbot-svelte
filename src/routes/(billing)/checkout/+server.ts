// /api/portal/+server.ts
import { POLAR_ACCESS_TOKEN } from "$env/static/private";
import { Checkout } from "@polar-sh/sveltekit";

export const GET = Checkout({
  accessToken: POLAR_ACCESS_TOKEN,
  successUrl: '/success?checkout_id={CHECKOUT_ID}',
  server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
  theme: "dark", // Enforces the theme - System-preferred theme will be set if left omitted
});