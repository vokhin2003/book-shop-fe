import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { IUser } from "@/types/backend";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  Avatar,
  Button,
  message,
  notification,
  Popconfirm,
  Space,
  Switch,
} from "antd";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import DataTable from "@/components/client/data-table";
import { fetchUser, setUsers } from "@/redux/slice/userSlice";
import { sfAnd, sfIn, sfLike } from "spring-filter-query-builder";
import queryString from "query-string";
import ModalUser from "@/components/admin/user/modal.user";
import { fetchRoleAPI, toggleAdminActiveAPI } from "@/services/api";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/permission";

interface IRoleSelect {
  id: number;
  name: string;
}

const UserPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState<IUser | null>(null);
  // const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [roleList, setRoleList] = useState<IRoleSelect[]>([]);

  const tableRef = useRef<ActionType>();

  const isFetching = useAppSelector((state) => state.user.isFetching);
  const meta = useAppSelector((state) => state.user.meta);
  const users = useAppSelector((state) => state.user.result);
  const dispatch = useAppDispatch();

  const handleDeleteUser = async (id: number) => {
    // if (id) {
    //     const res = await callDeleteUser(id);
    //     if (+res.statusCode === 200) {
    //         message.success("Xóa User thành công");
    //         reloadTable();
    //     } else {
    //         notification.error({
    //             message: "Có lỗi xảy ra",
    //             description: res.message,
    //         });
    //     }
    // }
  };

  useEffect(() => {
    // console.log(">>> check fetch roles");
    const fetchRoles = async () => {
      try {
        const res = await fetchRoleAPI("page=1&size=100"); // Giả sử trả về { data: [{ id, name }, ...] }
        if (res.data) {
          setRoleList(res.data.result);
        }
        // console.log(">>> check fetch role success", res.data);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<IUser>[] = [
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
      title: "Người dùng",
      dataIndex: "fullName",
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            key={record.avatar}
            src={record.avatar || undefined}
            icon={<UserOutlined />}
            size={40}
          />
          <Space direction="vertical" size={0}>
            <span>{record.fullName}</span>
            <span style={{ fontSize: "12px", color: "#666" }}>
              {record.email}
            </span>
          </Space>
        </Space>
      ),
    },
    // {
    //   title: "Full Name",
    //   dataIndex: "fullName",
    //   sorter: true,
    // },
    {
      title: "Email",
      dataIndex: "email",
      width: 250,
      sorter: true,
      hideInTable: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      // sorter: true,
      hideInSearch: true,
    },
    // {
    //     title: "Role",
    //     dataIndex: "roleIds",
    //     // sorter: true,
    //     valueType: "select",
    //     fieldProps: {
    //         mode: "multiple",
    //         placeholder: "Chọn role",
    //     },
    //     request: async () => {
    //         return roleList.map((role) => ({
    //             label: role.name,
    //             value: role.id,
    //         }));
    //     },
    //     render: (_value, entity) => entity.role?.name || "",
    // },

    {
      title: "Vai trò",
      dataIndex: "roleIds",
      valueType: "select",
      fieldProps: {
        mode: "multiple",
        placeholder: "Chọn role",
        options: roleList.map((role) => ({
          label: role.name,
          value: role.id,
        })),
      },
      render: (_value, entity) => entity.role?.name || "",
    },

    {
      title: "Kích hoạt (Admin)",
      dataIndex: "adminActive",
      width: 120,
      valueType: "switch",
      render: (_v, entity) => (
        <Access permission={ALL_PERMISSIONS.USERS.UPDATE} hideChildren>
          <Switch
            checked={entity.adminActive ?? true}
            checkedChildren="On"
            unCheckedChildren="Off"
            onChange={async (checked) => {
              try {
                const res = await toggleAdminActiveAPI(entity.id, checked);
                if (res.data && +res.statusCode === 200) {
                  message.success("Cập nhật trạng thái thành công");

                  // Cập nhật local state thay vì reload bảng
                  // Điều này giúp tránh hiện tượng chớp nháy và giữ nguyên vị trí record
                  const updatedUsers = users.map((user) =>
                    user.id === entity.id
                      ? { ...user, adminActive: checked }
                      : user
                  );

                  // Cập nhật state users
                  dispatch(setUsers(updatedUsers));

                  // Không cần gọi reloadTable() nữa
                  // reloadTable();
                } else {
                  notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message ?? "Không thể cập nhật trạng thái",
                  });
                }
              } catch (e: any) {
                notification.error({
                  message: "Có lỗi xảy ra",
                  description:
                    e?.response?.data?.message ??
                    e?.message ??
                    "Lỗi không xác định",
                });
              }
            }}
          />
        </Access>
      ),
      hideInSearch: true,
    },
    {
      title: "Ngày tạo",
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
      title: "Thao tác",
      hideInSearch: true,
      width: 50,
      render: (_value, entity, _index, _action) => (
        <Space>
          <Access permission={ALL_PERMISSIONS.USERS.UPDATE} hideChildren>
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

          <Access permission={ALL_PERMISSIONS.USERS.DELETE} hideChildren>
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa user"}
              description={"Bạn có chắc chắn muốn xóa user này ?"}
              onConfirm={() => handleDeleteUser(entity.id)}
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
    // console.log(">>> check params", params);
    // console.log(">>> check sort", sort);
    // console.log(">>> check filter", filter);

    const q: any = {
      page: params.current,
      size: params.pageSize,
      filter: "",
    };

    const filters: any[] = [];

    if (params.fullName) {
      filters.push(sfLike("fullName", params.fullName));
    }

    if (params.email) {
      filters.push(sfLike("email", params.email));
    }

    if (params.phone) {
      filters.push(sfLike("phone", `${params.phone}`));
    }

    if (params.roleIds?.length > 0) {
      filters.push(
        sfIn(
          "role.id",
          Array.isArray(params.roleIds) ? params.roleIds : [params.roleIds]
        )
      );
    }

    // const query = filters.length > 0 ? sfAnd(filters).toString() : "";
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
        permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}
        showLoading={true}
      >
        <DataTable<IUser>
          actionRef={tableRef}
          headerTitle="Danh sách người dùng"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={users}
          request={async (params, sort, filter): Promise<any> => {
            const query = buildQuery(params, sort, filter);
            dispatch(fetchUser({ query }));
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
              <Access permission={ALL_PERMISSIONS.USERS.CREATE} hideChildren>
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
      <ModalUser
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
        roleList={roleList}
      />
      {/* <ViewDetailUser
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            /> */}
    </div>
  );
};

export default UserPage;
