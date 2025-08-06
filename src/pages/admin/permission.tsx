import ModalPermission from "@/components/admin/permission/modal.permission";
import DataTable from "@/components/client/data-table";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/permission";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchPermission } from "@/redux/slice/permissionSlice";
import { deletePermissionAPI } from "@/services/api";
import { IPermission } from "@/types/backend";
import { colorMethod } from "@/utils";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Button, message, notification, Popconfirm, Space } from "antd";
import dayjs from "dayjs";
import queryString from "query-string";
import { useRef, useState } from "react";
import { sfAnd, sfIn, sfLike } from "spring-filter-query-builder";

const PermissionPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IPermission | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.permission.isFetching);
  const meta = useAppSelector((state) => state.permission.meta);
  const permissions = useAppSelector((state) => state.permission.result);
  const dispatch = useAppDispatch();

  const handleDeletePermission = async (id: number) => {
    if (id) {
      const res = await deletePermissionAPI(id);
      if (res && res.statusCode === 200) {
        message.success("Xóa permission thành công");
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.error,
        });
      }
    }
  };

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<IPermission>[] = [
    {
      title: "Id",
      dataIndex: "id",
      align: "center",
      width: 70,
      render: (text, record, index, action) => {
        return (
          <a
            href="#"
            onClick={() => {
              setOpenViewDetail(true);
              setDataInit(record);
            }}
          >
            {record.id}
          </a>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "API",
      dataIndex: "path",
      sorter: true,
    },
    // {
    //     title: "Method",
    //     dataIndex: "method",
    //     sorter: true,
    //     render(dom, entity, index, action, schema) {
    //         return (
    //             <p
    //                 style={{
    //                     paddingLeft: 10,
    //                     fontWeight: "bold",
    //                     marginBottom: 0,
    //                     color: colorMethod(entity?.method as string),
    //                 }}
    //             >
    //                 {entity?.method || ""}
    //             </p>
    //         );
    //     },
    // },
    {
      title: "Method",
      dataIndex: "method",
      sorter: true,
      // align: "center",
      valueType: "select",
      fieldProps: {
        mode: "multiple",
        placeholder: "Chọn method",
      },
      valueEnum: {
        GET: { text: "GET" },
        POST: { text: "POST" },
        PUT: { text: "PUT" },
        DELETE: { text: "DELETE" },
        PATCH: { text: "PATCH" },
      },
      render: (dom, entity, index, action, schema) => {
        return (
          <p
            style={{
              // paddingLeft: 10,
              fontWeight: "bold",
              // marginBottom: 0,
              color: colorMethod(entity?.method as string),
            }}
          >
            {entity?.method || ""}
          </p>
        );
      },
    },
    {
      title: "Module",
      dataIndex: "module",
      sorter: true,
    },
    {
      title: "CreatedAt",
      dataIndex: "createdAt",
      width: 200,
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
      title: "UpdatedAt",
      dataIndex: "updatedAt",
      width: 200,
      sorter: true,
      render: (text, record, index, action) => {
        return (
          <>
            {record.updatedAt
              ? dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm:ss")
              : ""}
          </>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Actions",
      hideInSearch: true,
      width: 50,
      render: (_value, entity, _index, _action) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.PERMISSIONS.UPDATE} hideChildren>
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
          <Access permission={ALL_PERMISSIONS.PERMISSIONS.DELETE} hideChildren>
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa permission"}
              description={"Bạn có chắc chắn muốn xóa permission này ?"}
              onConfirm={() => handleDeletePermission(entity.id)}
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

  const buildQuery = (params: any, sort: any, filter: any) => {
    const q: any = {
      page: params.current,
      size: params.pageSize,
      filter: "",
    };

    const filters: any[] = [];

    if (params.name) {
      filters.push(sfLike("name", params.name, true));
    }

    if (params.path) {
      filters.push(sfLike("path", params.path, true));
    }

    // if (params.method) {
    //     filters.push(sfLike("method", params.method, true));
    // }

    if (params.method?.length > 0) {
      filters.push(
        sfIn(
          "method",
          Array.isArray(params.method) ? params.method : [params.method]
        )
      );
    }

    if (params.module) {
      filters.push(sfLike("module", params.module, true));
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
      <Access permission={ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE}>
        <DataTable<IPermission>
          actionRef={tableRef}
          headerTitle="Danh sách Permissions (Quyền Hạn)"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={permissions}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchPermission({ query }));
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
                permission={ALL_PERMISSIONS.PERMISSIONS.CREATE}
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
      <ModalPermission
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />

      {/* <ViewDetailPermission
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            /> */}
    </div>
  );
};

export default PermissionPage;
