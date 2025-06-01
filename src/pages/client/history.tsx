import React, { useEffect, useState } from "react";
import { Tabs, Card, Avatar, Button, Empty, Spin, message } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";
// import "./HistoryPage.css";
import "styles/history.scss";
import { createPaymentUrlAPI, historyOrderAPI } from "@/services/api";
import { IOrder } from "@/types/backend";
import { useNavigate } from "react-router-dom";
import { convertSlug } from "@/utils";

const ORDER_STATUS = {
    ALL: "page=1&size=5&sort=updatedAt,desc",
    PENDING: "page=1&size=5&sort=updatedAt,desc&filter=status ~ 'PENDING'",
    CONFIRMED: "page=1&size=5&sort=updatedAt,desc&filter=status ~ 'CONFIRMED'",
    SHIPPING: "page=1&size=5&sort=updatedAt,desc&filter=status ~ 'SHIPPING'",
    DELIVERED: "page=1&size=5&sort=updatedAt,desc&filter=status ~ 'DELIVERED'",
    CANCELLED: "page=1&size=5&sort=updatedAt,desc&filter=status ~ 'CANCELLED'",
};

const ORDER_STATUS_VALUES = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    SHIPPING: "SHIPPING",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
};

const STATUS_LABELS = {
    [ORDER_STATUS.ALL]: "Tất cả",
    [ORDER_STATUS.PENDING]: "Chờ xác nhận",
    [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
    [ORDER_STATUS.SHIPPING]: "Đang giao hàng",
    [ORDER_STATUS.DELIVERED]: "Đã giao hàng",
    [ORDER_STATUS.CANCELLED]: "Đã hủy",
};

const STATUS_COLORS = {
    [ORDER_STATUS_VALUES.PENDING]: "#faad14",
    [ORDER_STATUS_VALUES.CONFIRMED]: "#1890ff",
    [ORDER_STATUS_VALUES.SHIPPING]: "#722ed1",
    [ORDER_STATUS_VALUES.DELIVERED]: "#52c41a",
    [ORDER_STATUS_VALUES.CANCELLED]: "#ff4d4f",
};

const HistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>(ORDER_STATUS.ALL);

    const navigate = useNavigate();

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            const res = await historyOrderAPI(activeTab);
            if (res.data) {
                setOrders(res.data.result);
            } else {
                message.error("Không thể tải danh sách đơn hàng");
            }
            setLoading(false);
        };

        loadOrders();
    }, [activeTab]);

    const formatPrice = (price: number): string => {
        return price.toLocaleString("vi-VN");
    };

    // const formatDate = (dateString?: string): string => {
    //     if (!dateString) return "";
    //     return new Date(dateString).toLocaleDateString("vi-VN");
    // };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getStatusColor = (status: string): string => {
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#666";
    };

    const handleViewOrder = (orderId: number) => {
        console.log("View order:", orderId);
        // Navigate to order detail page
        navigate(`/order/detail/${orderId}`);
    };

    const handleReorder = (orderId: number) => {
        console.log("Reorder:", orderId);
        // Handle reorder logic
    };

    const handleRetryPayment = async (order: IOrder) => {
        // if (!orderId) {
        //     message.error("Không tìm thấy thông tin đơn hàng");
        //     return;
        // }

        const paymentData = {
            orderId: order.id,
            amount: Number(order.totalAmount.toFixed(2)), // Lấy từ API getOrder nếu cần
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
            message.error(
                paymentRes.message || "Không thể thực hiện thanh toán lại"
            );
        }
    };

    const tabItems = Object.entries(STATUS_LABELS).map(([key, label]) => ({
        key,
        label,
        children: (
            <div className="order-list">
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : orders.length === 0 ? (
                    <Empty
                        description="Không có đơn hàng nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    orders.map((order) => (
                        <Card key={order.id} className="order-card" hoverable>
                            <div className="order-header">
                                <div className="order-info">
                                    <span className="order-id">
                                        Đơn hàng #{order.id}
                                    </span>
                                    <span className="order-date">
                                        {formatDate(order.updatedAt)}
                                    </span>
                                </div>
                                <div
                                    className="order-status"
                                    style={{
                                        color: getStatusColor(order.status),
                                    }}
                                >
                                    {STATUS_LABELS[
                                        order.status as keyof typeof STATUS_LABELS
                                    ] || order.status}
                                </div>
                            </div>

                            <div className="order-items">
                                {order.orderItems.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <Avatar
                                            src={item.book.thumbnail}
                                            shape="square"
                                            size={64}
                                            icon={<ShoppingCartOutlined />}
                                        />
                                        <div className="item-details">
                                            <div className="item-title">
                                                {item.book.title}
                                            </div>
                                            <div className="item-meta">
                                                {/* <span>
                                                    Phân loại hàng:{" "}
                                                    {item.book.description}
                                                </span> */}
                                                <span>
                                                    Thể loại:{" "}
                                                    {item.book.category.name}
                                                </span>
                                            </div>
                                            <div className="item-quantity">
                                                x{item.quantity}
                                            </div>
                                        </div>
                                        <div className="item-price">
                                            {item.book.discount > 0 && (
                                                <span className="original-price">
                                                    {formatPrice(
                                                        item.book.price
                                                    )}
                                                </span>
                                            )}
                                            <span className="current-price">
                                                {formatPrice(item.price)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <div className="order-total">
                                    <span>Thành tiền: </span>
                                    <span className="total-amount">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                                <div className="order-actions">
                                    <Button
                                        type="default"
                                        icon={<EyeOutlined />}
                                        onClick={() =>
                                            handleViewOrder(order.id)
                                        }
                                        style={{
                                            width: "120px",
                                            height: "36px",
                                        }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                    {order.status === "DELIVERED" && (
                                        <Button
                                            type="primary"
                                            onClick={() =>
                                                handleReorder(order.id)
                                            }
                                            style={{
                                                width: "120px",
                                                height: "36px",
                                            }}
                                        >
                                            Mua lại
                                        </Button>
                                    )}
                                    {order.status === "PENDING" &&
                                        order.paymentMethod === "VNPAY" && (
                                            <Button
                                                type="primary"
                                                onClick={() =>
                                                    handleRetryPayment(order)
                                                }
                                                style={{
                                                    width: "120px",
                                                    height: "36px",
                                                }}
                                            >
                                                Thanh toán lại
                                            </Button>
                                        )}
                                    {/* {order.status === "DELIVERED" && (
                                        <Button type="default">
                                            Yêu cầu trả hàng/hoàn tiền
                                        </Button>
                                    )} */}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        ),
    }));

    return (
        <div className="history-page">
            <div className="history-container">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </div>
        </div>
    );
};

export default HistoryPage;
