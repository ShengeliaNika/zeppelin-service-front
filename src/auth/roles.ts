// Mirrors Zeppelin.Domain.Common.Roles on the backend.
export const Roles = {
  Admin: "Admin",
  Dentist: "Dentist",
  Hygienist: "Hygienist",
  FrontDesk: "FrontDesk",
} as const;

export const AllRoles = [Roles.Admin, Roles.Dentist, Roles.Hygienist, Roles.FrontDesk];
