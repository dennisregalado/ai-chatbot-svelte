import { ALLOW_GUEST_ACCOUNTS } from '$env/static/private';

// Normalize env var to boolean. Accepts: true/false (case-insensitive), 1/0, yes/no.
const normalizeBoolean = (value: string | undefined): boolean => {
  if (!value) return false;
  switch (value.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'y':
      return true;
    default:
      return false;
  }
};

export const allowGuestAccounts = normalizeBoolean(ALLOW_GUEST_ACCOUNTS);

