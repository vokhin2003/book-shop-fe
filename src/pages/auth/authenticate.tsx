import {
  messaging,
  setupForegroundNotification,
} from "@/notifications/firebase";
import { useAppDispatch } from "@/redux/hook";
import { setUserLoginInfo } from "@/redux/slice/accountSlice";
import { outboundAuthenticateAPI } from "@/services/api";
import { message, notification } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthenticatePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const authenticate = async () => {
      console.log(window.location.href);

      const authCodeRegex = /code=([^&]+)/;
      const isMatch = window.location.href.match(authCodeRegex);

      if (isMatch) {
        const authCode = isMatch[1];

        const res = await outboundAuthenticateAPI(authCode);
        console.log(">>> check res: ", res);

        if (res?.data) {
          console.log("success");
          localStorage.setItem("access_token", res.data.access_token);
          dispatch(setUserLoginInfo(res.data.user));

          // Lưu deviceToken
          // await generateToken(res.data.user.id);

          // Thiết lập foreground notification
          setupForegroundNotification(messaging);

          message.success("Đăng nhập tài khoản thành công!");
          navigate("/");
        } else {
          notification.error({
            message: "Có lỗi xảy ra",
            description:
              res.message && Array.isArray(res.message)
                ? res.message[0]
                : res.message,
            duration: 5,
          });
        }
      }
    };

    authenticate();
  }, [dispatch, navigate]);

  return <>Authenticate page</>;
}
