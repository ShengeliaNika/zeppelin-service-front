import { useState } from "react";
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
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Roles } from "../auth/roles";
import { useThemeMode } from "../theme/ThemeModeContext";
import { UserAvatar } from "../components/UserAvatar";

const DRAWER_WIDTH = 230;

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(() => location.pathname.startsWith("/admin"));

  const navItemSx = {
    borderRadius: 1,
    mb: 0.5,
    "&.active": { bgcolor: "primary.main", color: "white", "& .MuiListItemIcon-root": { color: "white" } },
  };
  const subItemSx = { ...navItemSx, pl: 3.5 };

  const NL = ({ to, end, sx, children }: { to: string; end?: boolean; sx?: object; children: React.ReactNode }) => (
    <ListItemButton component={NavLink} to={to} end={end} sx={sx} onClick={() => onNavigate?.()}>
      {children}
    </ListItemButton>
  );

  const isAdmin = user?.roles.includes(Roles.Admin);

  return (
    <List sx={{ px: 1 }}>
      <NL to="/" end sx={navItemSx}>
        <ListItemIcon>
          <DashboardOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </NL>
      <NL to="/scheduler" sx={navItemSx}>
        <ListItemIcon>
          <CalendarMonthOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Scheduler" />
      </NL>
      <NL to="/patients" sx={navItemSx}>
        <ListItemIcon>
          <PeopleOutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Patients" />
      </NL>
      <NL to="/inventory" sx={navItemSx}>
        <ListItemIcon>
          <Inventory2OutlinedIcon />
        </ListItemIcon>
        <ListItemText primary="Inventory" />
      </NL>

      {isAdmin && (
        <>
          <ListItemButton
            onClick={() => setAdminOpen((o) => !o)}
            sx={{ borderRadius: 1, mb: 0.5, ...(location.pathname.startsWith("/admin") && { bgcolor: "action.selected" }) }}
          >
            <ListItemIcon>
              <AdminPanelSettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Admin" />
            {adminOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </ListItemButton>
          <Collapse in={adminOpen} timeout="auto" unmountOnExit>
            <List disablePadding sx={{ px: 1 }}>
              <NL to="/admin/users" sx={subItemSx}>
                <ListItemIcon>
                  <BadgeOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Staff" slotProps={{ primary: { variant: "body2" } }} />
              </NL>
              <NL to="/admin/audit-log" sx={subItemSx}>
                <ListItemIcon>
                  <HistoryOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Audit Log" slotProps={{ primary: { variant: "body2" } }} />
              </NL>
            </List>
          </Collapse>
        </>
      )}
    </List>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const drawerContent = (
    <>
      <Toolbar />
      <NavContent onNavigate={isMobile ? () => setDrawerOpen(false) : undefined} />
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar sx={{ gap: 1.5 }}>
          {isMobile && (
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen((o) => !o)} sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          )}
          <span style={{ fontSize: 24 }}>🦷</span>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
            Zeppelin Dental
          </Typography>
          <IconButton onClick={toggleMode} color="inherit">
            {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
          {user && (
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <UserAvatar firstName={user.firstName} lastName={user.lastName} size={32} />
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
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
