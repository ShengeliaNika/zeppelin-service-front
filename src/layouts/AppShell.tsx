import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AppBar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popper,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Roles } from "../auth/roles";
import { useThemeMode } from "../theme/ThemeModeContext";
import { getChromeGlow } from "../theme";
import { UserAvatar } from "../components/UserAvatar";
import { SettingsDialog, type SettingsTab } from "../components/SettingsDialog";
import HeaderSearch from "./HeaderSearch";

const DRAWER_WIDTH = 220;
const COLLAPSED_WIDTH = 60;
const COLLAPSE_STORAGE_KEY = "zeppelin_sidebar_collapsed";
const FOOTER_HEIGHT = 8;
const RIGHT_RAIL_WIDTH = 8;

interface AdminItem {
  to: string;
  icon: ReactNode;
  label: string;
}

const ADMIN_ITEMS: AdminItem[] = [
  { to: "/admin/users", icon: <BadgeOutlinedIcon />, label: "Staff" },
  { to: "/admin/audit-log", icon: <HistoryOutlinedIcon />, label: "Audit Log" },
];

function NavContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(() => location.pathname.startsWith("/admin"));

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) setAdminOpen(true);
  }, [location.pathname]);

  const navItemSx = {
    borderRadius: "999px",
    mb: 0.25,
    py: 0.5,
    "& .MuiListItemIcon-root": { minWidth: 32 },
    "& .MuiSvgIcon-root": { fontSize: 20 },
    "&.active": { bgcolor: "primary.main", color: "white", "& .MuiListItemIcon-root": { color: "white" } },
  };
  const subItemSx = {
    borderRadius: "999px",
    mb: 0.25,
    py: 0.375,
    pl: 2.25,
    "& .MuiListItemIcon-root": { minWidth: 28 },
    "& .MuiSvgIcon-root": { fontSize: 18 },
    "&.active": { bgcolor: "primary.main", color: "white", "& .MuiListItemIcon-root": { color: "white" } },
  };

  const NL = ({
    to,
    end,
    sx,
    icon,
    label,
  }: {
    to: string;
    end?: boolean;
    sx?: object;
    icon: ReactNode;
    label: string;
  }) => {
    const button = (
      <ListItemButton
        component={NavLink}
        to={to}
        end={end}
        onClick={() => onNavigate?.()}
        sx={{ ...sx, ...(collapsed && { justifyContent: "center", px: 1.5, pl: 1.5 }) }}
      >
        <ListItemIcon sx={collapsed ? { minWidth: "auto !important" } : undefined}>{icon}</ListItemIcon>
        {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ noWrap: true, variant: "body2" }} />}
      </ListItemButton>
    );
    return collapsed ? (
      <Tooltip title={label} placement="right">
        <span>{button}</span>
      </Tooltip>
    ) : (
      button
    );
  };

  const isAdmin = user?.roles.includes(Roles.Admin);
  const isClinicalStaff = user?.roles.some((r) => [Roles.Admin, Roles.Dentist, Roles.Hygienist].includes(r));

  return (
    <List sx={{ px: 1 }}>
      <NL to="/" end sx={navItemSx} icon={<DashboardOutlinedIcon />} label="Dashboard" />
      <NL to="/scheduler" sx={navItemSx} icon={<CalendarMonthOutlinedIcon />} label="Scheduler" />
      <NL to="/patients" sx={navItemSx} icon={<PeopleOutlinedIcon />} label="Patients" />
      <NL to="/inventory" sx={navItemSx} icon={<Inventory2OutlinedIcon />} label="Inventory" />
      {isClinicalStaff && (
        <NL to="/my-patients" sx={navItemSx} icon={<AssignmentTurnedInOutlinedIcon />} label="My Patients" />
      )}
      <NL to="/analysis" sx={navItemSx} icon={<InsightsOutlinedIcon />} label="Analysis" />

      {isAdmin &&
        (collapsed ? (
          <AdminFlyout />
        ) : (
          <>
            <ListItemButton
              onClick={() => setAdminOpen((o) => !o)}
              sx={{
                borderRadius: "999px",
                mb: 0.25,
                py: 0.5,
                "& .MuiListItemIcon-root": { minWidth: 32 },
                "& .MuiSvgIcon-root": { fontSize: 20 },
                ...(location.pathname.startsWith("/admin") && { bgcolor: "action.selected" }),
              }}
            >
              <ListItemIcon>
                <AdminPanelSettingsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Admin" primaryTypographyProps={{ noWrap: true, variant: "body2" }} />
              {adminOpen ? <ExpandLessIcon sx={{ fontSize: "18px !important" }} /> : <ExpandMoreIcon sx={{ fontSize: "18px !important" }} />}
            </ListItemButton>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ px: 1 }}>
                <NL to="/admin/users" sx={subItemSx} icon={<BadgeOutlinedIcon />} label="Staff" />
                <NL to="/admin/audit-log" sx={subItemSx} icon={<HistoryOutlinedIcon />} label="Audit Log" />
              </List>
            </Collapse>
          </>
        ))}
    </List>
  );
}

// Collapsed-sidebar hover flyout for the Admin group - mirrors the always-visible
// Collapse behavior above but as a small popup anchored to the icon, since there's
// no room for an inline sub-list once the rail is icon-only.
function AdminFlyout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const closeTimer = useRef<number | null>(null);
  const active = location.pathname.startsWith("/admin");

  function clearCloseTimer() {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }
  function openFlyout(e: React.MouseEvent<HTMLElement>) {
    clearCloseTimer();
    setAnchor(e.currentTarget);
  }
  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setAnchor(null), 150);
  }
  useEffect(() => () => clearCloseTimer(), []);

  return (
    <Box onMouseEnter={openFlyout} onMouseLeave={scheduleClose} sx={{ position: "relative" }}>
      <ListItemButton
        sx={{
          borderRadius: "999px",
          mb: 0.25,
          py: 0.5,
          justifyContent: "center",
          px: 1.5,
          "& .MuiSvgIcon-root": { fontSize: 20 },
          ...(active && { bgcolor: "action.selected" }),
        }}
      >
        <ListItemIcon sx={{ minWidth: "auto" }}>
          <AdminPanelSettingsOutlinedIcon />
        </ListItemIcon>
      </ListItemButton>
      <Popper open={!!anchor} anchorEl={anchor} placement="right-start" sx={{ zIndex: (t) => t.zIndex.drawer + 2 }}>
        <Paper variant="outlined" onMouseEnter={clearCloseTimer} onMouseLeave={scheduleClose} sx={{ ml: 0.5, minWidth: 180, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", px: 2, py: 0.75, display: "block" }}>
            Admin
          </Typography>
          <List disablePadding dense sx={{ px: 1, pb: 0.5 }}>
            {ADMIN_ITEMS.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
              return (
                <ListItemButton
                  key={item.to}
                  onClick={() => {
                    setAnchor(null);
                    navigate(item.to);
                  }}
                  sx={{
                    borderRadius: "999px",
                    mb: 0.25,
                    ...(isActive && { bgcolor: "primary.main", color: "white" }),
                    "& .MuiListItemIcon-root": { minWidth: 32, ...(isActive && { color: "white" }) },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2", noWrap: true }} />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>
      </Popper>
    </Box>
  );
}

function getInitialCollapsed(): boolean {
  return localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, accent } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const chromeGlow = getChromeGlow(mode, accent);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const railWidth = isMobile ? DRAWER_WIDTH : collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", pt: 1 }}>
        <NavContent collapsed={!isMobile && collapsed} onNavigate={isMobile ? () => setDrawerOpen(false) : undefined} />
      </Box>
      {!isMobile && (
        <>
          <Divider />
          <List sx={{ px: 1, py: 0.5 }}>
            {collapsed ? (
              <Tooltip title="Expand sidebar" placement="right">
                <ListItemButton onClick={() => setCollapsed(false)} sx={{ borderRadius: "999px", justifyContent: "center", px: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: "auto" }}>
                    <KeyboardDoubleArrowRightIcon />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            ) : (
              <ListItemButton onClick={() => setCollapsed(true)} sx={{ borderRadius: "999px" }}>
                <ListItemIcon>
                  <KeyboardDoubleArrowLeftIcon />
                </ListItemIcon>
                <ListItemText primary="Collapse sidebar" primaryTypographyProps={{ variant: "body2" }} />
              </ListItemButton>
            )}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", borderBottomRightRadius: 8 }}>
      {/* One shared paint layer behind header + sidebar, fixed to the viewport, so the
          gradient reads as one continuous plane instead of two separately-anchored copies. */}
      <Box sx={{ position: "fixed", inset: 0, zIndex: -1, background: chromeGlow }} />

      <AppBar position="static" sx={{ background: "transparent", boxShadow: "none" }}>
        <Toolbar disableGutters sx={{ gap: 1.5, minHeight: "48px !important", px: 2 }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen((o) => !o)} size="small" sx={{ mr: 0.5 }}>
              <MenuIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton onClick={() => navigate("/")} size="small" sx={{ p: 0.5 }} aria-label="Home">
            <span style={{ fontSize: 20 }}>🦷</span>
          </IconButton>
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", px: 2 }}>
              <HeaderSearch />
            </Box>
          )}
          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />
          {user && (
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <UserAvatar firstName={user.firstName} lastName={user.lastName} size={26} />
            </IconButton>
          )}
          <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {user?.roles.join(", ")}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setSettingsTab("profile");
              }}
            >
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setSettingsTab("preferences");
              }}
            >
              <ListItemIcon>
                <TuneOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Preferences
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <SettingsDialog open={!!settingsTab} initialTab={settingsTab ?? "profile"} onClose={() => setSettingsTab(null)} />

      <Box sx={{ flexGrow: 1, display: "flex", minHeight: 0 }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box", background: chromeGlow } }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Box
            sx={{
              width: railWidth,
              flexShrink: 0,
              height: "100%",
              background: "transparent",
              overflow: "hidden",
              transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
            }}
          >
            {drawerContent}
          </Box>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 2.5 },
            minWidth: 0,
            bgcolor: "background.default",
            overflow: "auto",
            borderRadius: 2,
          }}
        >
          <Outlet />
        </Box>

        {!isMobile && <Box sx={{ width: RIGHT_RAIL_WIDTH, flexShrink: 0, height: "100%", background: "transparent" }} />}
      </Box>

      <Box sx={{ height: FOOTER_HEIGHT, flexShrink: 0, background: "transparent" }} />
    </Box>
  );
}
