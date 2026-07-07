import { Avatar } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

interface Props {
  firstName: string;
  lastName: string;
  size?: number;
  sx?: SxProps<Theme>;
}

export function UserAvatar({ firstName, lastName, size = 32, sx }: Props) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  return (
    <Avatar sx={{ width: size, height: size, fontSize: Math.round(size * 0.44), bgcolor: "primary.main", ...sx }}>
      {initials}
    </Avatar>
  );
}
