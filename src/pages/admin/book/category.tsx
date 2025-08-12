import ModalCategory from "@/components/admin/category/modal.category";
import DataTable from "@/components/client/data-table";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/permission";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchCategory } from "@/redux/slice/categorySlice";
import { deleteCategoryAPI } from "@/services/api";
import { ICategory } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Button, message, notification, Popconfirm, Space } from "antd";
import dayjs from "dayjs";
import queryString from "query-string";
import { useRef, useState } from "react";
import { sfLike } from "spring-filter-query-builder";

const CategoryPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<ICategory | null>(null);

  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.category.isFetching);
  const meta = useAppSelector((state) => state.category.meta);
  const categories = useAppSelector((state) => state.category.result);
  const dispatch = useAppDispatch();

  const handleDeleteCategory = async (id: number) => {
    if (id) {
      const res = await deleteCategoryAPI(id);
      if (res && +res.statusCode === 200) {
        message.success("Xóa category thành công");
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<ICategory>[] = [
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
      title: "Danh mục",
      dataIndex: "name",
      sorter: true,
      ellipsis: true,
      copyable: true,
    },

    // {
    //     title: "Created By",
    //     dataIndex: "createdBy",
    //     hideInSearch: true,
    // },

    // {
    //     title: "Updated By",
    //     dataIndex: "updatedBy",
    //     hideInSearch: true,
    // },
    {
      title: "Mô tả",
      dataIndex: "description",
      hideInSearch: true,
      width: 350,
      ellipsis: true,
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 200,
      sorter: true,
      render: (_text, record: ICategory) => (
        <>
          {record.createdAt
            ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
            : ""}
        </>
      ),
      hideInSearch: true,
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      width: 200,
      sorter: true,
      render: (_text, record: ICategory) => (
        <>
          {record.updatedAt
            ? dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm:ss")
            : ""}
        </>
      ),
      hideInSearch: true,
    },
    {
      title: "Thao tác",
      hideInSearch: true,
      width: 100,
      render: (_value, entity) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.CATEGORIES.UPDATE} hideChildren>
            <EditOutlined
              style={{
                fontSize: 20,
                color: "#ffa500",
              }}
              type=""
              onClick={() => {
                setOpenModal(true);
                setDataInit(entity);
              }}
            />
          </Access>

          <Access permission={ALL_PERMISSIONS.CATEGORIES.DELETE} hideChildren>
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa category"}
              description={"Bạn có chắc chắn muốn xóa category này?"}
              onConfirm={() => handleDeleteCategory(entity.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <span style={{ cursor: "pointer", margin: "0 10px" }}>
                <DeleteOutlined
                  style={{
                    fontSize: 20,
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

  const buildQuery = (
    params: { current?: number; pageSize?: number; name?: string },
    sort: Record<string, string>,
    _filter: unknown
  ) => {
    const q: { page: number; size: number; filter?: string } = {
      page: params.current ?? 1,
      size: params.pageSize ?? 10,
      filter: "",
    };

    // return "page=1&size=10";

    if (params.name) q.filter = `${sfLike("name", params.name)}`;
    if (!q.filter) delete q.filter;

    const query = queryString.stringify(q as Record<string, unknown>);

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
      <Access
        permission={ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE}
        showLoading={true}
      >
        <DataTable<ICategory>
          actionRef={tableRef}
          headerTitle="Danh sách danh mục"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={categories}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchCategory({ query }));
          }}
          scroll={{ x: true }}
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
              <Access
                permission={ALL_PERMISSIONS.CATEGORIES.CREATE}
                hideChildren
              >
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  onClick={() => setOpenModal(true)}
                >
                  Thêm mới
                </Button>
              </Access>
            );
          }}
        />
      </Access>
      <ModalCategory
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default CategoryPage;
