import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import CountUp from "react-countup";
import dayjs from "dayjs";
import { sfAnd, sfGt, sfLike } from "spring-filter-query-builder";
import { useEffect, useMemo, useState } from "react";
import { fetchBookAPI, fetchOrderAPI, fetchUserAPI } from "@/services/api";
import { IBook, IModelPaginate, IOrder } from "@/types/backend";
import DashboardCharts from "@/components/admin/DashboardCharts";

const enum EOrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

const DashboardPage = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [newUsersToday, setNewUsersToday] = useState<number>(0);

  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>(
    {}
  );
  const [todayRevenue, setTodayRevenue] = useState<number>(0);

  const [topBooks, setTopBooks] = useState<IBook[]>([]);

  const formatter = (value: number | string) => {
    return <CountUp end={Number(value || 0)} separator="," />;
  };

  const statusList = useMemo(
    () => [
      EOrderStatus.PENDING,
      EOrderStatus.CONFIRMED,
      EOrderStatus.SHIPPING,
      EOrderStatus.DELIVERED,
      EOrderStatus.CANCELLED,
    ],
    []
  );

  // Lấy màu sắc cho từng status (copy từ order.tsx)
  const getStatusColor = (status?: string) => {
    switch (status) {
      case EOrderStatus.PENDING:
        return "#faad14";
      case EOrderStatus.CONFIRMED:
        return "#1890ff";
      case EOrderStatus.SHIPPING:
        return "#722ed1";
      case EOrderStatus.DELIVERED:
        return "#52c41a";
      case EOrderStatus.CANCELLED:
        return "#ff4d4f";
      default:
        return "default";
    }
  };

  // Lấy tên tiếng Việt cho từng status (copy từ order.tsx)
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case EOrderStatus.PENDING:
        return "Chờ xác nhận";
      case EOrderStatus.CONFIRMED:
        return "Đã xác nhận";
      case EOrderStatus.SHIPPING:
        return "Đang giao hàng";
      case EOrderStatus.DELIVERED:
        return "Đã giao hàng";
      case EOrderStatus.CANCELLED:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Users total
        const usersRes = await fetchUserAPI("page=1&size=1");
        setTotalUsers(usersRes.data?.meta.total || 0);

        // New users today
        const startOfDay = dayjs().startOf("day").toISOString();
        const filterNewUsers = sfGt("createdAt", startOfDay).toString();
        const newUsersRes = await fetchUserAPI(
          `page=1&size=1&filter=${encodeURIComponent(filterNewUsers)}`
        );
        setNewUsersToday(newUsersRes.data?.meta.total || 0);

        // Orders total
        const ordersRes = await fetchOrderAPI("page=1&size=1");
        setTotalOrders(ordersRes.data?.meta.total || 0);

        // Orders by status
        const byStatusEntries: Array<[string, number]> = [];
        for (const st of statusList) {
          const filter = sfLike("status", st).toString();
          const res = await fetchOrderAPI(
            `page=1&size=1&filter=${encodeURIComponent(filter)}`
          );
          byStatusEntries.push([st, res.data?.meta.total || 0]);
        }
        setOrdersByStatus(Object.fromEntries(byStatusEntries));

        // Today's revenue (approximate: fetch up to 9999 of today's orders and sum)
        const filterTodayOrders = sfAnd([
          sfGt("createdAt", startOfDay),
          sfLike("status", EOrderStatus.DELIVERED),
        ]).toString();
        const todayOrdersRes = await fetchOrderAPI(
          `page=1&size=9999&filter=${encodeURIComponent(filterTodayOrders)}`
        );
        const todayOrders: IModelPaginate<IOrder> | undefined =
          todayOrdersRes.data;
        const revenue = (todayOrders?.result || []).reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0
        );
        setTodayRevenue(revenue);

        // Top selling books
        const topBooksRes = await fetchBookAPI(`page=1&size=5&sort=sold,desc`);
        setTopBooks(topBooksRes.data?.result || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusList]);

  return (
    <Row gutter={[20, 20]}>
      <Col span={24} md={6}>
        <Card loading={loading} bordered={false}>
          <Statistic
            title="Tổng người dùng"
            value={totalUsers}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={24} md={6}>
        <Card loading={loading} bordered={false}>
          <Statistic
            title="Người dùng mới hôm nay"
            value={newUsersToday}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={24} md={6}>
        <Card loading={loading} bordered={false}>
          <Statistic
            title="Tổng đơn hàng"
            value={totalOrders}
            formatter={formatter}
          />
        </Card>
      </Col>
      <Col span={24} md={6}>
        <Card loading={loading} bordered={false}>
          <Statistic
            title="Doanh thu hôm nay (đ)"
            value={todayRevenue}
            formatter={formatter}
          />
        </Card>
      </Col>

      <Col span={24} md={12}>
        <Card
          title="Đơn hàng theo trạng thái"
          loading={loading}
          bordered={false}
        >
          <Row gutter={[12, 12]}>
            {statusList.map((st) => (
              <Col span={12} key={st}>
                <Card size="small" bordered>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Tag
                      color={getStatusColor(st)}
                      style={{
                        width: 100,
                        textAlign: "center",
                      }}
                    >
                      {getStatusLabel(st)}
                    </Tag>
                    <b>{ordersByStatus[st] ?? 0}</b>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>

      <Col span={24} md={12}>
        <Card title="Top sách bán chạy" loading={loading} bordered={false}>
          <Table
            size="small"
            rowKey="id"
            pagination={false}
            dataSource={topBooks}
            columns={[
              { title: "Sách", dataIndex: "title", key: "title" },
              {
                title: "Tác giả",
                dataIndex: "author",
                key: "author",
                width: 150,
              },
              {
                title: "Đã bán",
                dataIndex: "sold",
                key: "sold",
                width: 100,
              },
              {
                title: "Tồn kho",
                dataIndex: "quantity",
                key: "quantity",
                width: 100,
              },
            ]}
          />
        </Card>
      </Col>

      {/* Chart section - tích hợp DashboardCharts */}
      <Col span={24}>
        <DashboardCharts
          ordersByStatus={ordersByStatus}
          topBooks={topBooks}
          loading={loading}
        />
      </Col>
    </Row>
  );
};

export default DashboardPage;
