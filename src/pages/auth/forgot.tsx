import {
  Button,
  Form,
  Input,
  message,
  notification,
  Typography,
  Card,
} from "antd";
import { useState } from "react";
import { forgotPasswordAPI } from "@/services/api";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const res = await forgotPasswordAPI(values.email);
      if (res?.statusCode === 200) {
        message.success(
          "Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi."
        );
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

  return (
    <div style={{ background: "#efefef", padding: "32px 0" }}>
      <Card style={{ maxWidth: 420, margin: "0 auto" }}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Quên mật khẩu
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: "center" }}>
          Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng không bỏ trống" },
              { type: "email", message: "Email không đúng định dạng" },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Gửi liên kết đặt lại
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
