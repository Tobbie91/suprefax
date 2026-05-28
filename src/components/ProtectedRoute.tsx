import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useStore from "../store/useStore";
import type { UserRole } from "../types/api";

interface Props {
  allowedRole?: UserRole;
  requireVerifiedKyc?: boolean;
  children: ReactNode;
}

const ProtectedRoute = ({ allowedRole, requireVerifiedKyc, children }: Props) => {
  const user = useStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    const roleMap: Record<UserRole, string> = {
      borrower: "/borrower",
      agent: "/agent",
      admin: "/admin",
    };
    return <Navigate to={roleMap[user.role] || "/login"} replace />;
  }
  if (requireVerifiedKyc && user.role !== "admin" && user.kyc_status !== "verified") {
    const kycRoute = user.role === "agent" ? "/agent/kyc" : "/borrower/kyc";
    return <Navigate to={kycRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
