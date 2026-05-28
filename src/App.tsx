import { Routes, Route, Navigate } from "react-router-dom";
import useStore from "./store/useStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Kyc from "./components/Kyc";
import BorrowerDashboard from "./dashboards/borrower/Dashboard";
import AgentDashboard from "./dashboards/agent/Dashboard";
import AdminDashboard from "./dashboards/admin/Dashboard";
import type { UserRole } from "./types/api";

function App() {
  const user = useStore((state) => state.user);

  const defaultPath = (): string => {
    if (!user) return "/login";
    if (user.role === "agent" && user.kyc_status !== "verified") return "/agent/kyc";
    if (user.role === "borrower" && user.kyc_status !== "verified") return "/borrower/kyc";
    const map: Record<UserRole, string> = {
      borrower: "/borrower",
      agent: "/agent",
      admin: "/admin",
    };
    return map[user.role] || "/login";
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/borrower/kyc"
        element={
          <ProtectedRoute allowedRole="borrower">
            <Kyc />
          </ProtectedRoute>
        }
      />

      <Route
        path="/borrower"
        element={
          <ProtectedRoute allowedRole="borrower" requireVerifiedKyc>
            <BorrowerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent/kyc"
        element={
          <ProtectedRoute allowedRole="agent">
            <Kyc />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRole="agent" requireVerifiedKyc>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={defaultPath()} replace />} />
    </Routes>
  );
}

export default App;
