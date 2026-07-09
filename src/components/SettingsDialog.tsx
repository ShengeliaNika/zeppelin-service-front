import { useEffect, useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, Stack, Switch, Tab, Tabs, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useThemeMode } from "../theme/ThemeModeContext";
import { ACCENT_OPTIONS } from "../theme";
import { useAuth } from "../auth/AuthContext";
import { UserAvatar } from "./UserAvatar";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.8, display: "block", mb: 1.5 }}
    >
      {children}
    </Typography>
  );
}

export type SettingsTab = "profile" | "preferences";

export function SettingsDialog({
  open,
  onClose,
  initialTab = "profile",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}) {
  const { mode, toggleMode, accent, setAccent } = useThemeMode();
  const { user } = useAuth();
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  // The dialog stays mounted (just toggling `open`), so the tab needs to be re-synced with
  // `initialTab` each time it opens - a plain useState initializer only applies once, on first
  // mount, and would otherwise ignore whichever menu item was actually clicked afterward.
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
        Settings
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Tab value="profile" label="Profile" icon={<PersonOutlineIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 40 }} />
        <Tab value="preferences" label="Preferences" icon={<TuneOutlinedIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 40 }} />
      </Tabs>

      <DialogContent sx={{ pt: 2 }}>
        {tab === "profile" && user && (
          <>
            <SectionLabel>Profile</SectionLabel>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <UserAvatar firstName={user.firstName} lastName={user.lastName} size={64} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {user.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.roles.join(", ")}
                </Typography>
              </Box>
            </Stack>
          </>
        )}

        {tab === "preferences" && (
          <>
            <SectionLabel>Appearance</SectionLabel>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <DarkModeOutlinedIcon color="action" />
                <div>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Dark mode
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Switch between light and dark appearance
                  </Typography>
                </div>
              </Stack>
              <FormControlLabel control={<Switch checked={mode === "dark"} onChange={toggleMode} />} label="" sx={{ m: 0 }} />
            </Stack>

            <SectionLabel>Theme</SectionLabel>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
              Select the accent color used across the application.
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {ACCENT_OPTIONS.map((option) => (
                <Box key={option.key} sx={{ textAlign: "center" }}>
                  <Box
                    onClick={() => setAccent(option.key)}
                    sx={{
                      width: 44,
                      height: 32,
                      borderRadius: 1.5,
                      cursor: "pointer",
                      bgcolor: option.key === "default" ? "action.hover" : option.hex,
                      border: "2px solid",
                      borderColor: accent === option.key ? "text.primary" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border-color 0.15s ease",
                    }}
                  >
                    {accent === option.key && (
                      <CheckIcon fontSize="small" sx={{ color: option.key === "default" ? "text.primary" : "#fff" }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    {option.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
