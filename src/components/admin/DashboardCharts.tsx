import React from "react";
import { Card, Col, Row } from "antd";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

interface DashboardChartsProps {
    ordersByStatus: Record<string, number>;
    topBooks: Array<{
        id: number;
        title: string;
        sold: number;
        quantity: number;
    }>;
    loading?: boolean;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    label?: string;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
    ordersByStatus,
    topBooks,
    loading = false,
}) => {
    // Hàm lấy tên tiếng Việt cho status (copy từ dashboard)
    function getStatusLabel(status: string): string {
        switch (status) {
            case "PENDING":
                return "Chờ xác nhận";
            case "CONFIRMED":
                return "Đã xác nhận";
            case "SHIPPING":
                return "Đang giao hàng";
            case "DELIVERED":
                return "Đã giao hàng";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return "Không xác định";
        }
    }

    // Hàm lấy màu cho status (copy từ dashboard)
    function getStatusColor(status: string): string {
        switch (status) {
            case "PENDING":
                return "#faad14";
            case "CONFIRMED":
                return "#1890ff";
            case "SHIPPING":
                return "#722ed1";
            case "DELIVERED":
                return "#52c41a";
            case "CANCELLED":
                return "#ff4d4f";
            default:
                return "#d9d9d9";
        }
    }

    // Dữ liệu cho pie chart - đơn hàng theo trạng thái (sử dụng tên tiếng Việt)
    const pieChartData = Object.entries(ordersByStatus).map(
        ([status, count]) => ({
            name: getStatusLabel(status), // Sử dụng tên tiếng Việt
            value: count,
            color: getStatusColor(status),
            originalStatus: status, // Giữ lại status gốc để tham chiếu
        })
    );

    // Dữ liệu cho bar chart - top sách bán chạy
    const barChartData = topBooks.map((book) => ({
        name:
            book.title.length > 20
                ? book.title.substring(0, 20) + "..."
                : book.title,
        sold: book.sold,
        quantity: book.quantity,
    }));

    const CustomTooltip: React.FC<TooltipProps> = ({
        active,
        payload,
        label,
    }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        padding: "10px",
                        borderRadius: "4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 8px 0",
                            fontWeight: "bold",
                            fontSize: "14px",
                        }}
                    >
                        {label}
                    </p>
                    {payload.map((entry, index) => (
                        <p
                            key={index}
                            style={{
                                margin: "4px 0",
                                color: entry.color,
                                fontSize: "13px",
                            }}
                        >
                            {`${entry.name}: ${entry.value.toLocaleString()}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Row gutter={[20, 20]}>
            {/* Pie Chart - Đơn hàng theo trạng thái */}
            <Col span={24} md={12}>
                <Card
                    title="Đơn hàng theo trạng thái"
                    loading={loading}
                    bordered={false}
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${
                                        percent ? (percent * 100).toFixed(0) : 0
                                    }%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </Col>

            {/* Bar Chart - Top sách bán chạy */}
            <Col span={24} md={12}>
                <Card
                    title="Top sách bán chạy"
                    loading={loading}
                    bordered={false}
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="sold" fill="#1890ff" name="Đã bán" />
                            <Bar
                                dataKey="quantity"
                                fill="#52c41a"
                                name="Tồn kho"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );
};

export default DashboardCharts;
