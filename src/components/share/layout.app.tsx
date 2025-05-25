import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setRefreshTokenAction } from "@/redux/slice/accountSlice";
import { message } from "antd";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
    children: React.ReactNode;
}

const LayoutApp = (props: IProps) => {
    const isRefreshToken = useAppSelector(
        (state) => state.account.isRefreshToken
    );
    const errorRefreshToken = useAppSelector(
        (state) => state.account.errorRefreshToken
    );
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const location = useLocation();

    //handle refresh token error
    useEffect(() => {
        if (isRefreshToken === true) {
            localStorage.removeItem("access_token");
            message.error(errorRefreshToken);
            dispatch(setRefreshTokenAction({ status: false, message: "" }));
            const callback = encodeURIComponent(
                location.pathname + location.search
            );
            console.log(">>> Redirecting to login with callback:", callback);
            // navigate("/login");
            navigate(`/login?callback=${callback}`);
        }
    }, [isRefreshToken]);

    return <>{props.children}</>;
};

export default LayoutApp;
