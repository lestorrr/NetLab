// Central config for allowlist/denylist and admin settings.
export const ADMIN_ALLOWLIST: string[] = [];

// Simple deny patterns (strings or regex-like substrings). Adjust as needed.
export const DENY_LIST: string[] = [
    // private/local networks
    '10.', '192.168.', '127.', '::1', 'localhost', 'fc00:', 'fe80:',
    // typical internal hostnames
    '.local', '.lan', '.home',
    // Tor / internal protocols
    '.onion'
];

export function isDenied(target: string) {
    if (!target) return true;
    const t = String(target).toLowerCase();
    for (const d of DENY_LIST) {
        if (t.includes(d)) return true;
    }
    return false;
}
