import React, { useEffect, useState } from "react";
import {
    Card,
    Steps,
    Avatar,
    Button,
    Descriptions,
    Divider,
    Tag,
    Spin,
    message,
    Row,
    Col,
    Space,
    Modal,
    notification,
} from "antd";
import {
    ArrowLeftOutlined,
    ShoppingCartOutlined,
    TruckOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import "styles/order.detail.scss";
import { cancelOrderAPI, getOrderDetailAPI } from "@/services/api";
import { convertSlug } from "@/utils";
import { IBook, IOrder, IOrderItem } from "@/types/backend";

const STATUS_STEPS = {
    PENDING: 0,
    CONFIRMED: 1,
    SHIPPING: 2,
    DELIVERED: 3,
    CANCELLED: -1,
};

const STATUS_LABELS = {
    PENDING: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<IOrder | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const loadOrderDetail = async () => {
            setLoading(true);

            const res = await getOrderDetailAPI(Number(orderId));

            if (res.data) {
                setOrder(res.data);
            } else {
                message.error("Không tìm thấy đơn hàng");
            }

            setLoading(false);
        };

        // if (orderId) {
        //     loadOrderDetail();
        // }

        if (orderId) {
            const numericOrderId = Number(orderId);

            if (!isNaN(numericOrderId)) {
                loadOrderDetail();
            }
        }
    }, [orderId]);

    const formatPrice = (price: number): string => {
        return price.toLocaleString("vi-VN");
    };

    // const formatDate = (dateString?: string): string => {
    //     if (!dateString) return "";
    //     return new Date(dateString).toLocaleString("vi-VN");
    // };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    const getCurrentStep = (status: string): number => {
        return STATUS_STEPS[status as keyof typeof STATUS_STEPS] || 0;
    };

    const getPaymentMethodText = (method: string): string => {
        switch (method) {
            case "COD":
                return "Thanh toán khi nhận hàng";
            case "BANK_TRANSFER":
                return "Chuyển khoản ngân hàng";
            case "CREDIT_CARD":
                return "Thẻ tín dụng";
            default:
                return method;
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleReorder = () => {
        message.info("Chức năng mua lại đang được phát triển");
    };

    const handleCancelOrder = async () => {
        // message.info("Chức năng hủy đơn hàng đang được phát triển");

        Modal.confirm({
            title: "Xác nhận hủy đơn hàng",
            content: `Bạn có chắc muốn hủy đơn hàng #${orderId}? Hành động này không thể hoàn tác.`,
            okText: "Hủy đơn hàng",
            okType: "danger",
            cancelText: "Quay lại",
            onOk: async () => {
                const res = await cancelOrderAPI(Number(orderId));
                if (res.data) {
                    message.success("Đơn hàng đã được hủy thành công!");
                    navigate("/history");
                } else {
                    notification.error({
                        message: "Lỗi hủy đơn hàng",
                        description:
                            res.message ||
                            "Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại sau.",
                    });
                }
            },
            onCancel: () => {
                // message.info("Hủy bỏ hành động");
            },
        });
    };

    const handleViewBook = (item: IBook) => {
        const slug = convertSlug(item.title);
        navigate(`/book/${slug}?id=${item.id}`);
    };

    if (loading) {
        return (
            <div className="order-detail-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-error">
                <p>Không tìm thấy đơn hàng</p>
                <Button type="primary" onClick={handleGoBack}>
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div className="order-detail-page">
            <div className="order-detail-container">
                {/* Header */}
                <div className="order-detail-header">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleGoBack}
                        className="back-button"
                    >
                        Quay lại
                    </Button>
                    <div className="header-info">
                        <h2>Chi tiết đơn hàng #{order.id}</h2>
                        <Tag
                            color={
                                order.status === "DELIVERED"
                                    ? "success"
                                    : order.status === "CANCELLED"
                                    ? "error"
                                    : "processing"
                            }
                        >
                            {
                                STATUS_LABELS[
                                    order.status as keyof typeof STATUS_LABELS
                                ]
                            }
                        </Tag>
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    {/* Order Progress */}
                    <Col span={24}>
                        <Card
                            title="Trạng thái đơn hàng"
                            className="status-card"
                        >
                            {order.status !== "CANCELLED" ? (
                                <Steps
                                    current={getCurrentStep(order.status)}
                                    items={[
                                        {
                                            title: "Chờ thanh toán",
                                            icon: <ClockCircleOutlined />,
                                        },
                                        {
                                            title: "Đã xác nhận",
                                            icon: <CheckCircleOutlined />,
                                        },
                                        {
                                            title: "Đang giao hàng",
                                            icon: <TruckOutlined />,
                                        },
                                        {
                                            title: "Đã giao hàng",
                                            icon: <CheckCircleOutlined />,
                                        },
                                    ]}
                                />
                            ) : (
                                <div className="cancelled-status">
                                    <Tag
                                        color="error"
                                        style={{
                                            fontSize: "16px",
                                            padding: "8px 16px",
                                        }}
                                    >
                                        Đơn hàng đã bị hủy
                                    </Tag>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Order Information */}
                    <Col lg={16} md={24}>
                        <Card title="Thông tin đơn hàng" className="info-card">
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="Mã đơn hàng">
                                    #{order.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày đặt hàng">
                                    {formatDate(order.createdAt)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Người nhận">
                                    {order.fullName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {order.phone}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ giao hàng">
                                    {order.shippingAddress}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    {getPaymentMethodText(order.paymentMethod)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Order Items */}
                        <Card title="Sản phẩm đã đặt" className="items-card">
                            <div className="order-items">
                                {order.orderItems.map((item: IOrderItem) => (
                                    <div
                                        key={item.id}
                                        className="order-item"
                                        onClick={() =>
                                            handleViewBook(item.book)
                                        }
                                    >
                                        <Avatar
                                            src={item.book.thumbnail}
                                            shape="square"
                                            size={80}
                                            icon={<ShoppingCartOutlined />}
                                        />
                                        <div className="item-details">
                                            <h4 className="item-title">
                                                {item.book.title}
                                            </h4>
                                            <p className="item-author">
                                                Tác giả: {item.book.author}
                                            </p>
                                            <p className="item-category">
                                                Danh mục:{" "}
                                                {item.book.category.name}
                                            </p>
                                            <div className="item-quantity">
                                                Số lượng:{" "}
                                                <strong>
                                                    x{item.quantity}
                                                </strong>
                                            </div>
                                        </div>
                                        <div className="item-price">
                                            {item.book.discount > 0 && (
                                                <div className="original-price">
                                                    {formatPrice(
                                                        item.book.price
                                                    )}
                                                </div>
                                            )}
                                            <div className="current-price">
                                                {formatPrice(item.price)}
                                            </div>
                                            <div className="total-price">
                                                Tổng:{" "}
                                                {formatPrice(
                                                    item.price * item.quantity
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>

                    {/* Order Summary */}
                    <Col lg={8} md={24}>
                        <Card
                            title="Tổng kết đơn hàng"
                            className="summary-card"
                        >
                            <div className="summary-content">
                                <div className="summary-row">
                                    <span>Tạm tính:</span>
                                    <span>
                                        {formatPrice(order.totalAmount - 30000)}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span>Phí vận chuyển:</span>
                                    <span>{formatPrice(30000)}</span>
                                </div>
                                <Divider />
                                <div className="summary-row total-row">
                                    <span>Tổng cộng:</span>
                                    <span className="total-amount">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Actions */}
                        {order.status === "PENDING" ||
                        order.status === "DELIVERED" ? (
                            <Card className="actions-card">
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                    size="middle"
                                >
                                    {order.status === "DELIVERED" && (
                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            onClick={handleReorder}
                                        >
                                            Mua lại
                                        </Button>
                                    )}
                                    {order.status === "PENDING" && (
                                        <Button
                                            danger
                                            size="large"
                                            block
                                            onClick={handleCancelOrder}
                                        >
                                            Hủy đơn hàng
                                        </Button>
                                    )}
                                    {/* {order.status === "DELIVERED" && (
                                    <Button type="default" size="large" block>
                                        Yêu cầu trả hàng
                                    </Button>
                                )} */}
                                </Space>
                            </Card>
                        ) : (
                            <></>
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default OrderDetailPage;
