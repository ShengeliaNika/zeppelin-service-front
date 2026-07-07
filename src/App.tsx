import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import RequireRole from "./auth/RequireRole";
import LoginPage from "./auth/LoginPage";
import { Roles } from "./auth/roles";
import AppShell from "./layouts/AppShell";
import DashboardPage from "./routes/DashboardPage";
import UsersPage from "./routes/admin/UsersPage";
import PatientsListPage from "./routes/patients/PatientsListPage";
import NewPatientPage from "./routes/patients/NewPatientPage";
import PatientDetailPage from "./routes/patients/PatientDetailPage";
import SchedulerPage from "./routes/scheduler/SchedulerPage";
import InventoryListPage from "./routes/inventory/InventoryListPage";
import InventoryItemDetailPage from "./routes/inventory/InventoryItemDetailPage";
import AuditLogPage from "./routes/admin/AuditLogPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/scheduler" element={<SchedulerPage />} />
              <Route path="/patients" element={<PatientsListPage />} />
              <Route path="/patients/new" element={<NewPatientPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/inventory" element={<InventoryListPage />} />
              <Route path="/inventory/:id" element={<InventoryItemDetailPage />} />
              <Route element={<RequireRole roles={[Roles.Admin]} />}>
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/audit-log" element={<AuditLogPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
