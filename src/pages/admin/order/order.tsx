import DataTable from "@/components/client/data-table";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/permission";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchOrder } from "@/redux/slice/orderSlice";
import { processDateRangeFilter } from "@/services/helper";
import { IOrder } from "@/types/backend";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Button, Space, Tag } from "antd";
import dayjs from "dayjs";
import queryString from "query-string";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sfAnd, sfGe, sfLe, sfLike } from "spring-filter-query-builder";

enum EOrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

const OrderPage = () => {
  // return <div>Order</div>;

  const tableRef = useRef<ActionType>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isFetching = useAppSelector((state) => state.order.isFetching);
  const meta = useAppSelector((state) => state.order.meta);
  const orders = useAppSelector((state) => state.order.result);

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

  const columns: ProColumns<IOrder>[] = [
    // {
    //     title: "STT",
    //     key: "index",
    //     width: 50,
    //     align: "center",
    //     render: (text, record, index) => {
    //         return <>{index + 1 + (meta.current - 1) * meta.pageSize}</>;
    //     },
    //     hideInSearch: true,
    // },
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      width: 100,
      hideInSearch: true,
      render: (text) => <span>#{text}</span>,
    },
    {
      title: "Người nhận",
      dataIndex: "fullName",
      width: 200,
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      width: 120,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      sorter: true,
      width: 120,
      render: (text) => <span>{Number(text).toLocaleString("vi-VN")} đ</span>,
      hideInSearch: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      align: "center",
      render: (text, record, index, action) => (
        <Tag
          color={getStatusColor(record.status)}
          style={{
            width: 120,
            textAlign: "center",
            padding: "0 8px",
          }}
        >
          {getStatusLabel(record.status)}
        </Tag>
      ),
      valueType: "select",
      valueEnum: {
        [EOrderStatus.PENDING]: { text: "Chờ xác nhận" },
        [EOrderStatus.CONFIRMED]: { text: "Đã xác nhận" },
        [EOrderStatus.SHIPPING]: { text: "Đang giao hàng" },
        [EOrderStatus.DELIVERED]: { text: "Đã giao hàng" },
        [EOrderStatus.CANCELLED]: { text: "Đã hủy" },
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 150,
      sorter: true,
      render: (text, record, index, action) => {
        return (
          <>
            {record.createdAt
              ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt", // Tên cột ảo
      valueType: "dateRange", // Kiểu bộ lọc khoảng ngày
      hideInTable: true, // Chỉ hiển thị trong thanh tìm kiếm, không hiển thị trong bảng
      fieldProps: {
        format: "DD-MM-YYYY", // Định dạng ngày hiển thị trong bộ chọn
        placeholder: ["Từ ngày", "Đến ngày"], // Placeholder cho bộ lọc
      },
    },
    // {
    //     title: "Ngày cập nhật",
    //     dataIndex: "updatedAt",
    //     width: 150,
    //     sorter: true,
    //     render: (text, record, index, action) => {
    //         return (
    //             <>
    //                 {record.createdAt
    //                     ? dayjs(record.updatedAt).format(
    //                           "DD-MM-YYYY HH:mm:ss"
    //                       )
    //                     : ""}
    //             </>
    //         );
    //     },
    //     hideInSearch: true,
    // },
    {
      title: "Actions",
      hideInSearch: true,
      width: 50,
      render: (_value, entity) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.ORDERS.UPDATE} hideChildren>
            <EditOutlined
              style={{ fontSize: 20, color: "#ffa500" }}
              onClick={() => {
                navigate(`/admin/order/upsert?id=${entity.id}`);
              }}
            />
          </Access>
        </Space>
      ),
    },
  ];

  const buildQuery = (params: any, sort: any, filter: any) => {
    // return "page=1&size=10";
    const q: any = {
      page: params.current,
      size: params.pageSize,
      filter: "",
    };

    const filters: any[] = [];

    if (params) {
      if (params.createdAt) {
        const [startDate, endDate] = processDateRangeFilter(params.createdAt);

        if (startDate && endDate) {
          filters.push(sfGe("createdAt", startDate));
          filters.push(sfLe("createdAt", endDate));
        } else if (startDate && !endDate) {
          filters.push(sfGe("createdAt", startDate));
        } else if (!startDate && endDate) {
          filters.push(sfLe("createdAt", endDate));
        } else {
          // console.log(
          //     ">>> No valid dates found for createdAt filter"
          // );
        }
      }

      if (params.fullName) {
        filters.push(sfLike("fullName", params.fullName));
      }
      if (params.phone) {
        filters.push(sfLike("phone", params.phone));
      }
      if (params.status) {
        filters.push(sfLike("status", params.status));
      }
      // if (params.createdAtRange) {
      //     const [startDate, endDate] = params.createdAtRange;
      //     if (startDate && endDate) {
      //         filters.push(sfGe("createdAt", startDate));
      //         filters.push(sfLe("createdAt", endDate));
      //     }
      // }
    }

    q.filter = filters.length > 0 ? sfAnd(filters).toString() : "";

    if (!q.filter) delete q.filter;
    const query = queryString.stringify(q);

    let sortQuery = "";
    if (sort) {
      const sortField = Object.keys(sort)[0];
      const sortOrder = sort[sortField] === "ascend" ? "asc" : "desc";
      if (sortField !== undefined) {
        sortQuery = `&sort=${sortField},${sortOrder}`;
      } else {
        sortQuery = `&sort=updatedAt,desc`;
      }
    }

    return query + sortQuery;
  };

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.ORDERS.GET_PAGINATE}>
        <DataTable<IOrder>
          actionRef={tableRef}
          headerTitle="Danh sách đơn hàng"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={orders}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchOrder({ query }));
          }}
          pagination={{
            current: meta.current,
            pageSize: meta.pageSize,
            showSizeChanger: true,
            total: meta.total,
            showTotal: (total, range) => (
              <div>
                {range[0]}-{range[1]} trên {total} rows
              </div>
            ),
          }}
          rowSelection={false}
          toolBarRender={(_action, _rows): any => {
            return (
              <Access permission={ALL_PERMISSIONS.ORDERS.CREATE} hideChildren>
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => navigate("upsert")}
                >
                  Thêm mới
                </Button>
              </Access>
            );
          }}
        />
      </Access>
    </div>
  );
};

export default OrderPage;
