import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, ClickAwayListener, List, ListItemButton, ListItemText, Paper, Popper, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../auth/AuthContext";
import { Roles } from "../auth/roles";

interface SearchPage {
  path: string;
  label: string;
  adminOnly?: boolean;
}

const PAGES: SearchPage[] = [
  { path: "/", label: "Dashboard" },
  { path: "/scheduler", label: "Scheduler" },
  { path: "/patients", label: "Patients" },
  { path: "/inventory", label: "Inventory" },
  { path: "/my-patients", label: "My Patients" },
  { path: "/analysis", label: "Analysis" },
  { path: "/admin/users", label: "Staff", adminOnly: true },
  { path: "/admin/audit-log", label: "Audit Log", adminOnly: true },
];

// A fast way to jump to a page by name - press "/" anywhere (outside another
// input) to focus it, type to filter, click or Enter to navigate. Not a real
// search index, just page-name matching over the app's own nav catalog.
export default function HeaderSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const pages = useMemo(() => PAGES.filter((p) => !p.adminOnly || user?.roles.includes(Roles.Admin)), [user]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.label.toLowerCase().includes(q));
  }, [pages, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(path: string) {
    navigate(path);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", width: "100%", maxWidth: 480 }}>
        <Box
          component="input"
          ref={inputRef}
          value={query}
          autoComplete="off"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
            if (e.key === "Enter" && results[0]) go(results[0].path);
          }}
          placeholder="Search or go to…"
          sx={{
            width: "100%",
            font: "inherit",
            color: "inherit",
            bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"),
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "999px",
            pl: 4.5,
            pr: 4.5,
            py: 0.75,
            outline: "none",
            "&:focus": { borderColor: "primary.main" },
          }}
        />
        <SearchIcon
          sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "text.secondary", pointerEvents: "none" }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            px: 0.75,
            py: 0.125,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            fontSize: 11,
            color: "text.secondary",
            lineHeight: 1.4,
            pointerEvents: "none",
          }}
        >
          /
        </Box>
        <Popper open={open} anchorEl={inputRef.current} placement="bottom-start" sx={{ zIndex: (t) => t.zIndex.modal, width: 480 }}>
          <Paper variant="outlined" sx={{ mt: 0.5, maxHeight: 360, overflowY: "auto" }}>
            {results.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
                No matches
              </Typography>
            ) : (
              <List disablePadding dense sx={{ py: 0.5 }}>
                {results.map((p) => (
                  <ListItemButton key={p.path} onClick={() => go(p.path)}>
                    <ListItemText primary={p.label} primaryTypographyProps={{ variant: "body2" }} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
