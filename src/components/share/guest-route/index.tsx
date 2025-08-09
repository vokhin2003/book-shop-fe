import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import Loading from "../loading";
import { useAppSelector } from "@/redux/hook";

type GuestRouteProps = { children: ReactNode };

const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated, isLoading } = useAppSelector(
    (state) => state.account
  );
  const location = useLocation();

  const hasToken = Boolean(localStorage.getItem("access_token"));
  if (isLoading && hasToken) {
    return <Loading />;
  }

  if (isAuthenticated) {
    const params = new URLSearchParams(location.search);
    const callback = params.get("callback");
    const target = callback ? decodeURIComponent(callback) : "/";
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
