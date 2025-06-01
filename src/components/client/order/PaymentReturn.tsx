import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { message, Result, Button, Steps, Breadcrumb } from "antd";
import { useAppDispatch } from "@/redux/hook";
import {
    getTransactionStatusAPI,
    createPaymentUrlAPI,
    getOrderDetailAPI,
} from "@/services/api";
import { clearCart } from "@/redux/slice/cartSlice";
import { isMobile } from "react-device-detect";
import { Link } from "react-router-dom";

const PaymentReturn = () => {
    const [status, setStatus] = useState<string>("loading");
    const [orderId, setOrderId] = useState<number | null>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { transactionId } = useParams<{ transactionId: string }>();

    // Kiểm tra transactionId
    if (!transactionId) {
        throw new Error("Missing transactionId in URL");
    }

    useEffect(() => {
        // const transactionId = localStorage.getItem("pendingTransactionId");
        // if (!transactionId) {
        //     setStatus("error");
        //     return;
        // }

        const checkStatus = async () => {
            const res = await getTransactionStatusAPI(transactionId);
            if (res.data) {
                setStatus(res.data.status);
                setOrderId(Number(transactionId.split("_")[0]));
                if (res.data.status === "SUCCESS") {
                    // dispatch(clearCart());
                    // localStorage.removeItem("pendingTransactionId");
                    message.success("Thanh toán thành công!");
                } else {
                    message.error(res.data.message || "Thanh toán thất bại!");
                }
            } else {
                // throw new Error(res.message);
                message.error(
                    res.message || "Không thể kiểm tra trạng thái thanh toán"
                );
                setStatus("error");
            }
        };

        checkStatus();
    }, [dispatch, transactionId]);

    const handleRetryPayment = async () => {
        if (!orderId) {
            message.error("Không tìm thấy thông tin đơn hàng");
            return;
        }

        const orderRes = await getOrderDetailAPI(orderId);

        const paymentData = {
            orderId: orderId,
            amount: Number(orderRes.data?.totalAmount.toFixed(2)), // Lấy từ API getOrder nếu cần
            paymentMethod: "VNPAY",
        };
        const paymentRes = await createPaymentUrlAPI(paymentData);
        if (paymentRes.data?.paymentUrl) {
            localStorage.setItem(
                "pendingTransactionId",
                paymentRes.data.transactionId
            );
            window.location.href = paymentRes.data.paymentUrl;
        } else {
            if (paymentRes.message.includes("Maximum 3 payment attempts")) {
                message.error(
                    "Đã đạt tối đa 3 lần thanh toán. Đơn hàng không thể thanh toán lại."
                );
            } else {
                message.error(
                    paymentRes.message || "Không thể thực hiện thanh toán lại"
                );
            }

            // message.error(
            //     paymentRes.message || "Không thể thực hiện thanh toán lại"
            // );
        }
    };

    if (status === "loading") {
        return (
            <div style={{ background: "#efefef", padding: "20px 0" }}>
                <div
                    className="order-container"
                    style={{
                        maxWidth: 1440,
                        margin: "0 auto",
                        overflow: "hidden",
                    }}
                >
                    <div>Đang kiểm tra trạng thái thanh toán...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#efefef", padding: "20px 0" }}>
            <div
                className="order-container"
                style={{ maxWidth: 1440, margin: "0 auto", overflow: "hidden" }}
            >
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to="/">Trang chủ</Link>,
                        },
                        {
                            title: "Xác nhận thanh toán",
                        },
                    ]}
                />
                {!isMobile && (
                    <div className="order-steps" style={{ marginTop: 20 }}>
                        <Steps
                            size="small"
                            current={status === "SUCCESS" ? 3 : 2}
                            items={[
                                {
                                    title: "Đơn hàng",
                                },
                                {
                                    title: "Đặt hàng",
                                },
                                {
                                    title: "Thanh toán",
                                },
                            ]}
                        />
                    </div>
                )}
                <Result
                    status={status === "SUCCESS" ? "success" : "error"}
                    title={
                        status === "SUCCESS"
                            ? "Thanh toán thành công"
                            : "Thanh toán thất bại"
                    }
                    subTitle={
                        status === "SUCCESS"
                            ? "Đơn hàng của bạn đã được xác nhận"
                            : "Vui lòng thử lại hoặc chọn phương thức thanh toán khác"
                    }
                    extra={[
                        <Button key="home" onClick={() => navigate("/")}>
                            Trang chủ
                        </Button>,
                        <Button
                            key="history"
                            type="primary"
                            onClick={() => navigate("/history")}
                        >
                            Lịch sử mua hàng
                        </Button>,
                        status !== "SUCCESS" && orderId && (
                            <Button
                                key="retry"
                                type="primary"
                                onClick={handleRetryPayment}
                            >
                                Thanh toán lại
                            </Button>
                        ),
                    ].filter(Boolean)}
                />
            </div>
        </div>
    );
};

export default PaymentReturn;
