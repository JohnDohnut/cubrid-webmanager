/**
 * Update group metadata.
 *
 * - `name`: rename group
 * - `defaultHostUid`: choose default host (must be in group)
 */
export type UpdateHostGroupRequest = {
  name?: string;
  defaultHostUid?: string | null;
};

