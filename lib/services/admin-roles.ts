type UserMetadataLike = {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

function normalizeRoles(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((role): role is string => typeof role === "string");
  }

  return [];
}

export function getUserRoles(user: UserMetadataLike): string[] {
  const appMetadata = user.app_metadata ?? {};
  const userMetadata = user.user_metadata ?? {};

  const roles = [
    ...normalizeRoles(appMetadata.roles),
    ...normalizeRoles(appMetadata.role),
    ...normalizeRoles(userMetadata.roles),
    ...normalizeRoles(userMetadata.role),
  ];

  return Array.from(new Set(roles.map((role) => role.trim()).filter(Boolean)));
}

export function isAuthorizedAdmin(user: UserMetadataLike): boolean {
  const configuredAdminRole = process.env.ADMIN_ROLE?.trim();
  const roles = getUserRoles(user);

  if (configuredAdminRole) {
    return roles.includes(configuredAdminRole);
  }

  if (roles.length === 0) {
    return true;
  }

  return roles.includes("admin");
}
