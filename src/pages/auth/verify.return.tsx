import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { message, Result, Button } from "antd";
import { Link } from "react-router-dom";

const VerifyReturn = () => {
    const [status, setStatus] = useState<string>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");
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
        }
    }, [searchParams]);

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
                    extra={[
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
                    ]}
                />
            </div>
        </div>
    );
};

export default VerifyReturn;
