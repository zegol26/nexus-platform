type RoleLike = string | null | undefined;

export type AppAccessLike = {
  status: string;
  accessExpiresAt: Date | string | null;
};

export function isAdminRole(role: RoleLike) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isValidAppAccess(access: AppAccessLike | null | undefined, now = new Date()) {
  if (!access || access.status !== "ACTIVE") return false;
  if (!access.accessExpiresAt) return true;

  const expiresAt =
    access.accessExpiresAt instanceof Date
      ? access.accessExpiresAt
      : new Date(access.accessExpiresAt);

  return expiresAt.getTime() > now.getTime();
}

export function filterValidAppAccess<T extends AppAccessLike>(accessRows: T[], now = new Date()) {
  return accessRows.filter((access) => isValidAppAccess(access, now));
}
