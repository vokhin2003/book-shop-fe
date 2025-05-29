import { Breadcrumb, Button, Result, Steps } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import "styles/client.order.scss";
import { isMobile } from "react-device-detect";
import OrderDetail from "@/components/client/order";
import Payment from "@/components/client/order/payment";

const OrderPage = () => {
    const [currentStep, setCurrentStep] = useState<number>(0);

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
                            title: "Chi tiết giỏ hàng",
                        },
                    ]}
                />
                {!isMobile && (
                    <div className="order-steps" style={{ marginTop: 20 }}>
                        <Steps
                            size="small"
                            current={currentStep}
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

                {currentStep === 0 && (
                    <OrderDetail setCurrentStep={setCurrentStep} />
                )}
                {currentStep === 1 && (
                    <Payment setCurrentStep={setCurrentStep} />
                )}
                {currentStep === 2 && (
                    <Result
                        status={"success"}
                        title="Đặt hàng thành công"
                        subTitle="Hệ thống đã ghi nhận thông tin đơn hàng của bạn"
                        extra={[
                            <Button key="home">
                                <Link type="primary" to="/">
                                    Trang chủ
                                </Link>
                            </Button>,
                            <Button key="history">
                                <Link to="/history" type="primary">
                                    Lịch sử mua hàng
                                </Link>
                            </Button>,
                        ]}
                    />
                )}
            </div>
        </div>
    );
};

export default OrderPage;
