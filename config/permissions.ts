import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

/**
 * SHIFFTO domain access control definitions.
 *
 * This file MUST be shared with the backend's better-auth config (auth.ts)
 * so both sides agree on role permissions.
 *
 * Statements define resources and their available actions.
 * Roles map each resource to the actions a role can perform.
 */

export const statement = {
  ...defaultStatements,
  shipment: ['create', 'view', 'cancel', 'browse'],
  trip: ['create', 'view', 'update-status'],
  settlement: ['release', 'view'],
  withdrawal: ['process', 'view'],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  shipment: ['create', 'view', 'cancel', 'browse'],
  trip: ['create', 'view', 'update-status'],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  shipment: ['create', 'view', 'cancel', 'browse'],
  trip: ['create', 'view', 'update-status'],
  settlement: ['release', 'view'],
  withdrawal: ['process', 'view'],
});
