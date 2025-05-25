import { Navigate, useLocation } from "react-router-dom";
import NotPermitted from "./not-permitted";
import Loading from "../loading";
import { useAppSelector } from "@/redux/hook";

const RoleBaseRoute = (props: any) => {
    const user = useAppSelector((state) => state.account.user);
    const userRole = user.role;

    if (userRole !== "NORMAL_USER") {
        return <>{props.children}</>;
    } else {
        return <NotPermitted />;
    }
};

const ProtectedRoute = (props: any) => {
    const isAuthenticated = useAppSelector(
        (state) => state.account.isAuthenticated
    );
    const isLoading = useAppSelector((state) => state.account.isLoading);

    const location = useLocation(); // Thêm useLocation

    console.log(">>> isAuthenticated:", isAuthenticated);

    // return (
    //     <>
    //         {isLoading === true ? (
    //             <Loading />
    //         ) : (
    //             <>
    //                 {isAuthenticated === true ? (
    //                     <>
    //                         <RoleBaseRoute>{props.children}</RoleBaseRoute>
    //                     </>
    //                 ) : (
    //                     <Navigate to="/login" replace />
    //                 )}
    //             </>
    //         )}
    //     </>
    // );

    if (isLoading) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        const callback = encodeURIComponent(
            location.pathname + location.search
        );
        return <Navigate to={`/login?callback=${callback}`} replace />;
    }

    return <RoleBaseRoute>{props.children}</RoleBaseRoute>;
};

export default ProtectedRoute;
