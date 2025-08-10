import {
  messaging,
  setupForegroundNotification,
} from "@/notifications/firebase";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setUserLoginInfo } from "@/redux/slice/accountSlice";
import { loginAPI, resendVerifyEmailAPI } from "@/services/api";
import { GoogleOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Form,
  FormProps,
  Input,
  message,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "styles/auth.module.scss";

type FieldType = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isSubmit, setIsSubmit] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState<string>("");

  // Lấy callback từ query parameter
  const queryParams = new URLSearchParams(location.search);
  const callback = queryParams.get("callback") || ""; // Lấy giá trị callback

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );

  const handleContinueWithGoogle = () => {
    const callbackUrl = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const authUrl = import.meta.env.VITE_GOOGLE_AUTH_URI;
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

    console.log(targetUrl);

    window.location.href = targetUrl;
  };

  useEffect(() => {
    //đã login => redirect to '/'
    if (isAuthenticated) {
      navigate(callback || "/");
    }
  }, [isAuthenticated, callback, navigate]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { username, password } = values;
    setResendEmail(username);
    setIsSubmit(true);
    const res = await loginAPI(username, password);

    if (res?.data) {
      console.log("success");
      localStorage.setItem("access_token", res.data.access_token);
      dispatch(setUserLoginInfo(res.data.user));

      // Lưu deviceToken
      // await generateToken(res.data.user.id);

      // Thiết lập foreground notification
      setupForegroundNotification(messaging);

      // await dispatch(fetchCart());
      message.success("Đăng nhập tài khoản thành công!");
      // window.location.href = callback ? callback : "/";
      // navigate(callback || "/");
      const decodedCallback = callback ? decodeURIComponent(callback) : "/";
      navigate(decodedCallback);
    } else {
      const errorMessage =
        (res.message && Array.isArray(res.message)
          ? res.message[0]
          : res.message) || "Đăng nhập thất bại";
      notification.error({
        message: "Có lỗi xảy ra",
        description: errorMessage,
        duration: 5,
      });
      const msg = (errorMessage || "").toLowerCase();
      if (
        msg.includes("not verified") ||
        msg.includes("not activated") ||
        msg.includes("kích hoạt")
      ) {
        setShowResend(true);
      } else {
        setShowResend(false);
      }
    }

    setIsSubmit(false);
  };

  const handleResendVerify = async () => {
    if (!resendEmail) {
      message.warning("Vui lòng nhập email trước");
      return;
    }
    try {
      setResendLoading(true);
      const res = await resendVerifyEmailAPI(resendEmail);
      if (res?.statusCode === 200) {
        message.success(
          "Đã gửi lại email xác minh. Vui lòng kiểm tra hộp thư."
        );
      } else {
        notification.error({
          message: "Gửi lại email thất bại",
          description:
            res?.message && Array.isArray(res.message)
              ? res.message[0]
              : res?.message || "",
        });
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles["login-page"]}>
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.wrapper}>
            <div className={styles.heading}>
              <h2 className={`${styles.text} ${styles["text-large"]}`}>
                Đăng Nhập
              </h2>
              <Divider />
            </div>
            <Form
              name="basic"
              // style={{ maxWidth: 600, margin: '0 auto' }}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item<FieldType>
                labelCol={{ span: 24 }} //whole column
                label="Email"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Email không được để trống!",
                  },
                ]}
              >
                <Input onChange={(e) => setResendEmail(e.target.value)} />
              </Form.Item>

              <Form.Item<FieldType>
                labelCol={{ span: 24 }} //whole column
                label="Mật khẩu"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Mật khẩu không được để trống!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <div style={{ textAlign: "right", marginBottom: 16 }}>
                <a onClick={() => navigate("/forgot")}>Quên mật khẩu?</a>
              </div>

              <Form.Item style={{ marginBottom: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmit}
                  block
                  size="large"
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              {showResend && (
                <Form.Item>
                  <Button
                    type="dashed"
                    block
                    size="large"
                    onClick={handleResendVerify}
                    loading={resendLoading}
                  >
                    Gửi lại email xác minh
                  </Button>
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<GoogleOutlined />}
                  onClick={handleContinueWithGoogle}
                >
                  Tiếp Tục Với Google
                </Button>
              </Form.Item>
              <Divider>Hoặc</Divider>
              <Form.Item>
                <Button
                  type="primary"
                  block
                  size="large"
                  htmlType="button"
                  onClick={() => navigate("/register")}
                >
                  Đăng Ký
                </Button>
              </Form.Item>
            </Form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
