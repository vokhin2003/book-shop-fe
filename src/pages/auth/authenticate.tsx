import {
  messaging,
  setupForegroundNotification,
} from "@/notifications/firebase";
import { useAppDispatch } from "@/redux/hook";
import { fetchAccount, setUserLoginInfo } from "@/redux/slice/accountSlice";
import { outboundAuthenticateAPI } from "@/services/api";
import { message, notification } from "antd";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Form, Input, Spin, Typography } from "antd";
import { createPasswordAPI } from "@/services/api";

export default function AuthenticatePage() {
  const hasRun = useRef<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(true);
  const [needCreatePassword, setNeedCreatePassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const authenticate = async () => {
      const authCodeRegex = /code=([^&]+)/;
      const isMatch = window.location.href.match(authCodeRegex);

      if (isMatch) {
        const authCode = isMatch[1];

        const res = await outboundAuthenticateAPI(authCode);

        if (res?.data) {
          localStorage.setItem("access_token", res.data.access_token);
          dispatch(setUserLoginInfo(res.data.user));

          setupForegroundNotification(messaging);

          if (res.data.user?.noPassword) {
            setNeedCreatePassword(true);
            setLoading(false);
            return; // Hiển thị form tạo mật khẩu
          }

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
      setLoading(false);
    };

    authenticate();
  }, [dispatch, navigate]);

  const onFinish = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setSubmitting(true);
      const res = await createPasswordAPI(
        values.password,
        values.confirmPassword
      );
      if (res?.statusCode === 200) {
        message.success("Tạo mật khẩu thành công!");
        await dispatch(fetchAccount());
        // đảm bảo UI không còn hiển thị form trước khi rời trang
        setNeedCreatePassword(false);
        setLoading(false);
        navigate("/", { replace: true });
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: Array.isArray(res?.message)
            ? res.message[0]
            : res?.message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin tip="Đang xác thực..." size="large" />
      </div>
    );
  }

  if (needCreatePassword) {
    return (
      <div style={{ maxWidth: 420, margin: "60px auto" }}>
        <Typography.Title level={4} style={{ textAlign: "center" }}>
          Tạo mật khẩu cho tài khoản của bạn
        </Typography.Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu",
              },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={submitting} block>
            Tạo mật khẩu
          </Button>
          <Button
            style={{ marginTop: 12 }}
            onClick={() => {
              message.info("Bạn có thể tạo mật khẩu sau trong phần tài khoản.");
              navigate("/");
            }}
            block
          >
            Bỏ qua và vào trang chủ
          </Button>
        </Form>
      </div>
    );
  }

  // Nếu đã xong và không cần tạo mật khẩu, chủ động điều hướng về trang chủ
  return <Navigate to="/" replace />;
}
