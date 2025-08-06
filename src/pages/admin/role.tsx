import ModalRole from "@/components/admin/role/modal.role";
import DataTable from "@/components/client/data-table";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/permission";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchRole } from "@/redux/slice/roleSlice";
import { deleteRoleAPI, fetchPermissionAPI } from "@/services/api";
import { IPermission, IRole } from "@/types/backend";
import { groupByPermission } from "@/utils";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Button, message, notification, Popconfirm, Space, Tag } from "antd";
import dayjs from "dayjs";
import queryString from "query-string";
import { useEffect, useRef, useState } from "react";
import { sfAnd, sfLike } from "spring-filter-query-builder";

const RolePage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.role.isFetching);
  const meta = useAppSelector((state) => state.role.meta);
  const roles = useAppSelector((state) => state.role.result);
  const dispatch = useAppDispatch();

  //all backend permissions
  const [listPermissions, setListPermissions] = useState<
    | {
        module: string;
        permissions: IPermission[];
      }[]
    | null
  >(null);

  //current role
  const [singleRole, setSingleRole] = useState<IRole | null>(null);

  useEffect(() => {
    const init = async () => {
      const res = await fetchPermissionAPI(`page=1&size=100`);
      if (res.data?.result) {
        setListPermissions(groupByPermission(res.data?.result));
      }
    };
    init();
  }, []);

  const handleDeleteRole = async (id: number) => {
    if (id) {
      const res = await deleteRoleAPI(id);
      if (res && res.statusCode === 200) {
        message.success("Xóa role thành công");
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

  const columns: ProColumns<IRole>[] = [
    {
      title: "Id",
      dataIndex: "id",
      width: 200,
      render: (text, record, index, action) => {
        return <span>{record.id}</span>;
      },
      hideInSearch: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
    },

    {
      title: "Trạng thái",
      // dataIndex: 'active',
      render(dom, entity, index, action, schema) {
        return (
          <>
            <Tag color={"lime"}>ACTIVE</Tag>
          </>
        );
      },
      hideInSearch: true,
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
          <Access permission={ALL_PERMISSIONS.ROLES.UPDATE} hideChildren>
            <EditOutlined
              style={{
                fontSize: 20,
                color: "#ffa500",
              }}
              type=""
              onClick={() => {
                setSingleRole(entity);
                setOpenModal(true);
              }}
            />
          </Access>
          <Access permission={ALL_PERMISSIONS.ROLES.DELETE} hideChildren>
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa role"}
              description={"Bạn có chắc chắn muốn xóa role này ?"}
              onConfirm={() => handleDeleteRole(entity.id)}
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
    // const clone = { ...params };
    const q: any = {
      page: params.current,
      size: params.pageSize,
      filter: "",
    };

    const filters: any[] = [];

    if (params.name) {
      filters.push(sfLike("name", params.name, true));
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
      <Access permission={ALL_PERMISSIONS.ROLES.GET_PAGINATE}>
        <DataTable<IRole>
          actionRef={tableRef}
          headerTitle="Danh sách Roles (Vai Trò)"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={roles}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchRole({ query }));
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
              <Access permission={ALL_PERMISSIONS.ROLES.CREATE} hideChildren>
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
      <ModalRole
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        listPermissions={listPermissions!}
        singleRole={singleRole}
        setSingleRole={setSingleRole}
      />
    </div>
  );
};

export default RolePage;
