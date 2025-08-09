import { Navigate, useLocation } from "react-router-dom";
import NotPermitted from "./not-permitted";
import Loading from "../loading";
import { useAppSelector } from "@/redux/hook";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[]; // if provided, only these roles can access
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.account
  );
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    const callback = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?callback=${callback}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <NotPermitted />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
