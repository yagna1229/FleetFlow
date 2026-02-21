/**
 * Role constants, permissions map, and UI metadata.
 */

export const ROLES = {
    MANAGER: 'manager',
    DISPATCHER: 'dispatcher',
    SAFETY_OFFICER: 'safety_officer',
    FINANCIAL_ANALYST: 'financial_analyst',
}

/** UI labels and icons for the role selector cards */
export const ROLE_META = {
    [ROLES.MANAGER]: {
        label: 'Fleet Manager',
        icon: '🏗️',
        description: 'Full access — vehicles, drivers, trips, maintenance, expenses, analytics',
    },
    [ROLES.DISPATCHER]: {
        label: 'Dispatcher',
        icon: '📦',
        description: 'Create & manage trips, view vehicles and drivers',
    },
    [ROLES.SAFETY_OFFICER]: {
        label: 'Safety Officer',
        icon: '🛡️',
        description: 'Monitor driver compliance, license expirations, safety scores',
    },
    [ROLES.FINANCIAL_ANALYST]: {
        label: 'Financial Analyst',
        icon: '📊',
        description: 'View expenses, analytics, and trip cost data',
    },
}

/** Routes each role is allowed to access (frontend route paths) */
export const ROLE_PERMISSIONS = {
    [ROLES.MANAGER]: [
        '/dashboard', '/vehicles', '/drivers', '/trips',
        '/maintenance', '/expenses', '/analytics',
    ],
    [ROLES.DISPATCHER]: [
        '/dashboard', '/trips', '/vehicles', '/drivers',
    ],
    [ROLES.SAFETY_OFFICER]: [
        '/dashboard', '/drivers', '/trips',
    ],
    [ROLES.FINANCIAL_ANALYST]: [
        '/dashboard', '/expenses', '/analytics', '/trips',
    ],
}

/** Check if a role can access a given path */
export function canAccess(role, path) {
    const perms = ROLE_PERMISSIONS[role]
    if (!perms) return false
    // Match /vehicles, /vehicles/new, /vehicles/123, etc.
    return perms.some((p) => path === p || path.startsWith(p + '/'))
}
