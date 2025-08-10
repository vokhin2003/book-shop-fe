import {
  Button,
  Card,
  Form,
  Input,
  message,
  notification,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordAPI } from "@/services/api";

export default function ForgotReturnPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      notification.error({
        message: "Liên kết không hợp lệ hoặc đã hết hạn",
      });
    }
  }, [status]);

  const onFinish = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      const res = await resetPasswordAPI(
        token,
        values.newPassword,
        values.confirmPassword
      );
      if (res?.statusCode === 200) {
        message.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res?.message || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (status !== "success") {
    return (
      <div
        style={{
          background: "#efefef",
          padding: "32px 0",
          textAlign: "center",
        }}
      >
        <Card style={{ maxWidth: 420, margin: "0 auto" }}>
          <Typography.Title level={3}>Liên kết không hợp lệ</Typography.Title>
          <Button type="primary" onClick={() => navigate("/forgot")}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ background: "#efefef", padding: "32px 0" }}>
      <Card style={{ maxWidth: 420, margin: "0 auto" }}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Đặt lại mật khẩu
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              {
                required: true,
                min: 6,
                message: "Mật khẩu tối thiểu phải 6 ký tự",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["newPassword"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue("newPassword") === value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Mật khẩu không khớp"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
