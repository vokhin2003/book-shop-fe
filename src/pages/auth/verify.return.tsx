import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message, Result, Button, Input, Space, notification } from "antd";
import { resendVerifyEmailAPI } from "@/services/api";

const VerifyReturn = () => {
  const [status, setStatus] = useState<string>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isUserDeleted, setIsUserDeleted] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyStatus = searchParams.get("status");
    const errorMsg =
      searchParams.get("message") ||
      "Đã xảy ra lỗi trong quá trình xác minh. Vui lòng thử lại hoặc liên hệ hỗ trợ.";
    if (verifyStatus === "success") {
      setStatus("success");
      message.success("Xác minh tài khoản thành công!");
    } else {
      setStatus("error");
      // message.error("Xác minh tài khoản thất bại. Vui lòng thử lại.");
      setErrorMessage(errorMsg);
      message.error(errorMsg);
      const lowerMsg = (errorMsg || "").toLowerCase();
      const userDeletedKeywords = [
        "user not found",
        "user not found for this token",
        "không tìm thấy người dùng",
        "tài khoản không tồn tại",
      ];
      setIsUserDeleted(userDeletedKeywords.some((k) => lowerMsg.includes(k)));
    }
  }, [searchParams]);

  const handleResend = async () => {
    if (!email) {
      message.warning("Vui lòng nhập email đã đăng ký");
      return;
    }
    try {
      setLoading(true);
      const res = await resendVerifyEmailAPI(email);
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
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ background: "#efefef", padding: "20px 0" }}>
        <div
          className="verify-container"
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            overflow: "hidden",
          }}
        >
          <div>Đang kiểm tra trạng thái xác minh...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#efefef", padding: "20px 0" }}>
      <div
        className="verify-container"
        style={{ maxWidth: 1440, margin: "0 auto", overflow: "hidden" }}
      >
        <Result
          status={status === "success" ? "success" : "error"}
          title={
            status === "success"
              ? "Xác minh tài khoản thành công"
              : "Xác minh tài khoản thất bại"
          }
          subTitle={
            status === "success"
              ? "Tài khoản của bạn đã được xác minh. Bạn có thể đăng nhập ngay bây giờ."
              : // : "Đã xảy ra lỗi trong quá trình xác minh. Vui lòng thử lại hoặc liên hệ hỗ trợ."
                errorMessage
          }
          extra={
            status === "success"
              ? [
                  <Button key="home" onClick={() => navigate("/")}>
                    Trang chủ
                  </Button>,
                  <Button
                    key="login"
                    type="primary"
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập
                  </Button>,
                ]
              : [
                  isUserDeleted ? (
                    <div
                      key="deleted-actions"
                      style={{
                        width: 360,
                        margin: "0 auto",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ marginBottom: 12 }}>
                        Tài khoản không tồn tại hoặc đã bị xóa. Vui lòng đăng ký
                        lại.
                      </div>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Button
                          type="primary"
                          onClick={() => navigate("/register")}
                        >
                          Đăng ký
                        </Button>
                        <Button onClick={() => navigate("/")}>Trang chủ</Button>
                      </Space>
                    </div>
                  ) : (
                    <div
                      key="actions"
                      style={{
                        width: 360,
                        margin: "0 auto",
                      }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Input
                          placeholder="Nhập email để nhận lại liên kết xác minh"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                          type="primary"
                          onClick={handleResend}
                          loading={loading}
                        >
                          Gửi lại email xác minh
                        </Button>
                        <Button onClick={() => navigate("/")}>Trang chủ</Button>
                      </Space>
                    </div>
                  ),
                ]
          }
        />
      </div>
    </div>
  );
};

export default VerifyReturn;
