import DataTable from "@/components/client/data-table";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/permission";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchBook } from "@/redux/slice/bookSlice";
import { fetchCategoryAPI } from "@/services/api";
import { processDateRangeFilter } from "@/services/helper";
import { IBook } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ActionType,
  ProColumns,
  ProFormSelect,
} from "@ant-design/pro-components";
import { Button, Popconfirm, Space, Tag } from "antd";
import dayjs from "dayjs";
import queryString from "query-string";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sfAnd, sfGe, sfIn, sfLe, sfLike } from "spring-filter-query-builder";

interface ICategorySelect {
  id: number;
  name: string;
}

const BookPage = () => {
  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.book.isFetching);
  const meta = useAppSelector((state) => state.book.meta);
  const books = useAppSelector((state) => state.book.result);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ICategorySelect[]>([]);

  const handleDeleteBook = async (id: number) => {
    // if (id) {
    //     const res = await callDeleteJob(id);
    //     if (res && res.data) {
    //         message.success('Xóa Job thành công');
    //         reloadTable();
    //     } else {
    //         notification.error({
    //             message: 'Có lỗi xảy ra',
    //             description: res.message
    //         });
    //     }
    // }
  };

  useEffect(() => {
    // console.log(">>> check fetch roles");
    const fetchCategories = async () => {
      try {
        const res = await fetchCategoryAPI("page=1&size=100"); // Giả sử trả về { data: [{ id, name }, ...] }
        if (res.data) {
          setCategories(res.data.result);
        }
        // console.log(">>> check fetch role success", res.data);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchCategories();
  }, []);

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<IBook>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => {
        return <>{index + 1 + (meta.current - 1) * meta.pageSize}</>;
      },
      hideInSearch: true,
    },
    {
      title: "Tên sách",
      dataIndex: "title",
      sorter: true,
      ellipsis: true, // Cắt chữ nếu quá dài
      width: 200,
      copyable: true,
      // maxwidth: 200,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      sorter: true,
      ellipsis: true,
      width: 150,
      copyable: true,
    },
    // {
    //     title: "Thể loại",
    //     dataIndex: ["category", "name"],
    //     // sorter: true,
    //     ellipsis: true,
    //     width: 120,
    //     // hideInSearch: true,
    //     copyable: true,
    // },

    {
      title: "Thể loại",
      dataIndex: "categoryIds",
      valueType: "select",
      width: 120,
      fieldProps: {
        mode: "multiple",
        placeholder: "Chọn thể loại",
        options: categories.map((cate) => ({
          label: cate.name,
          value: cate.id,
        })),
      },
      render: (_value, entity) => entity.category?.name || "",
    },

    // {
    //     title: "Giá gốc",
    //     dataIndex: "price",
    //     sorter: true,
    //     render(dom, entity, index, action, schema) {
    //         const str = "" + entity.price;
    //         return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} đ</>;
    //     },
    // },
    {
      title: "Giá gốc",
      dataIndex: "price",
      sorter: true,
      render: (dom, entity) => (
        <>{Number(entity.price).toLocaleString("vi-VN")} đ</>
      ),
      width: 120,
      align: "center",
      hideInSearch: true,
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      sorter: true,
      render: (dom, entity) => <>{entity.discount || 0}%</>,
      width: 100,
      align: "center",
      hideInSearch: true,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      sorter: true,
      width: 100,
      align: "center",
      hideInSearch: true,
    },
    {
      title: "Đã bán",
      dataIndex: "sold",
      sorter: true,
      width: 100,
      align: "center",
      hideInSearch: true,
    },
    // {
    //     title: "Loại bìa",
    //     dataIndex: "coverType",
    //     // sorter: true,
    //     width: 120,
    // },
    {
      title: "Ngày xuất bản",
      dataIndex: "publicationDate",
      sorter: true,
      render: (text, record) =>
        record.publicationDate
          ? dayjs(record.publicationDate).format("DD-MM-YYYY")
          : "",
      width: 120,
      hideInSearch: true,
      align: "center",
    },

    {
      title: "Xuất bản",
      dataIndex: "publicationDateRange", // Tên cột ảo
      valueType: "dateRange", // Kiểu bộ lọc khoảng ngày
      hideInTable: true, // Chỉ hiển thị trong thanh tìm kiếm, không hiển thị trong bảng
      fieldProps: {
        format: "DD-MM-YYYY", // Định dạng ngày hiển thị trong bộ chọn
        placeholder: ["Từ ngày", "Đến ngày"], // Placeholder cho bộ lọc
      },
    },

    {
      title: "Actions",
      hideInSearch: true,
      width: 70,
      render: (_value, entity, _index, _action) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.BOOKS.UPDATE} hideChildren>
            <EditOutlined
              style={{
                fontSize: 16,
                color: "#ffa500",
              }}
              type=""
              onClick={() => {
                navigate(`/admin/book/upsert?id=${entity.id}`);
              }}
            />
          </Access>
          <Access permission={ALL_PERMISSIONS.BOOKS.DELETE} hideChildren>
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa sách"}
              description={"Bạn có chắc chắn muốn xóa sách này ?"}
              onConfirm={() => handleDeleteBook(entity.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <span style={{ cursor: "pointer", margin: "0 10px" }}>
                <DeleteOutlined
                  style={{
                    fontSize: 16,
                    color: "#ff4d4f",
                  }}
                />
              </span>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  // const buildQuery = (params: any, sort: any, filter: any) => {
  //     console.log(">>> check params:", params);
  //     console.log(">>> check sort:", sort);
  //     console.log(">>> check filter:", filter);

  //     const filters: any[] = [];

  //     return "page=1&size=10";
  // };

  const buildQuery = (params: any, sort: any, filter: any) => {
    console.log(">>> check params:", params);
    console.log(">>> check sort:", sort);
    console.log(">>> check filter:", filter);

    const q: any = {
      page: params.current,
      size: params.pageSize,
      filter: "",
    };

    const filters: any[] = [];

    // Build filters based on search parameters
    if (params) {
      // Date range filter for publication date (xuất bản)
      if (params.publicationDateRange) {
        const [startDate, endDate] = processDateRangeFilter(
          params.publicationDateRange
        );

        // console.log(">>> Converted startDate:", startDate);
        // console.log(">>> Converted endDate:", endDate);

        // Create filters based on available dates
        if (startDate && endDate) {
          filters.push(sfGe("publicationDate", startDate));
          filters.push(sfLe("publicationDate", endDate));
          // console.log(
          //     `>>> Filter: publicationDate BETWEEN ${startDate} AND ${endDate}`
          // );
        } else if (startDate && !endDate) {
          filters.push(sfGe("publicationDate", startDate));
          // console.log(`>>> Filter: publicationDate >= ${startDate}`);
        } else if (!startDate && endDate) {
          filters.push(sfLe("publicationDate", endDate));
          // console.log(`>>> Filter: publicationDate <= ${endDate}`);
        } else {
          // console.log(
          //     ">>> No valid dates found for publicationDate filter"
          // );
        }
      }

      if (params.title) {
        filters.push(sfLike("title", params.title));
      }

      if (params.author) {
        filters.push(sfLike("author", params.author));
      }

      if (params.categoryIds?.length > 0) {
        filters.push(
          sfIn(
            "category.id",
            Array.isArray(params.categoryIds)
              ? params.categoryIds
              : [params.categoryIds]
          )
        );
      }
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
        sortQuery = `&sort=updatedAt,desc`; // Mặc định sort theo updatedAt
      }
    }

    return query + sortQuery;
  };

  return (
    <div>
      <Access
        permission={ALL_PERMISSIONS.BOOKS.GET_PAGINATE}
        showLoading={true}
      >
        <DataTable<IBook>
          actionRef={tableRef}
          headerTitle="Danh sách Books"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={books}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchBook({ query }));
          }}
          // scroll={{ x: true }}
          pagination={{
            current: meta.current,
            pageSize: meta.pageSize,
            showSizeChanger: true,
            total: meta.total,
            showTotal: (total, range) => {
              return (
                <div>
                  {" "}
                  {range[0]}-{range[1]} trên {total} rows
                </div>
              );
            },
          }}
          rowSelection={false}
          toolBarRender={(_action, _rows): any => {
            return (
              <Access permission={ALL_PERMISSIONS.BOOKS.CREATE} hideChildren>
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => navigate("upsert")}
                >
                  Thêm mới
                </Button>
              </Access>
              // <Button
              //     icon={<PlusOutlined />}
              //     type="primary"
              //     onClick={() => navigate("upsert")}
              // >
              //     Thêm mới
              // </Button>
            );
          }}
        />
      </Access>
    </div>
  );
};

export default BookPage;
