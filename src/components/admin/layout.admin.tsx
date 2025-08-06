import React, { useState, useEffect } from "react";
import {
  AppstoreOutlined,
  ExceptionOutlined,
  ApiOutlined,
  UserOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AliwangwangOutlined,
  BugOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { isMobile } from "react-device-detect";
import type { MenuProps } from "antd";
import { logoutAPI } from "@/services/api";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setLogoutAction } from "@/redux/slice/accountSlice";
import { clearCartAction } from "@/redux/slice/cartSlice";
import { ALL_PERMISSIONS } from "@/permission";
import { ALL } from "dns";
import { removeToken } from "@/notifications/firebase";

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const user = useAppSelector((state) => state.account.user);

  const permissions = useAppSelector((state) => state.account.user.permissions);
  const [menuItems, setMenuItems] = useState<MenuProps["items"]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (permissions?.length) {
      const viewBook = permissions?.find(
        (item) =>
          item.path === ALL_PERMISSIONS.BOOKS.GET_PAGINATE.path &&
          item.method === ALL_PERMISSIONS.BOOKS.GET_PAGINATE.method
      );

      const viewCategory = permissions?.find(
        (item) =>
          item.path === ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE.path &&
          item.method === ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE.method
      );

      const viewOrder = permissions?.find(
        (item) =>
          item.path === ALL_PERMISSIONS.ORDERS.GET_PAGINATE.path &&
          item.method === ALL_PERMISSIONS.ORDERS.GET_PAGINATE.method
      );

      const viewUser = permissions?.find(
        (item) =>
          item.path === ALL_PERMISSIONS.USERS.GET_PAGINATE.path &&
          item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
      );

      const viewRole = permissions?.find(
        (item) =>
          item.path === ALL_PERMISSIONS.ROLES.GET_PAGINATE.path &&
          item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
      );

      const viewPermission = permissions?.find(
        (item) =>
          item.path === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.path &&
          item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
      );

      const full = [
        {
          label: <Link to="/admin">Dashboard</Link>,
          key: "/admin",
          icon: <AppstoreOutlined />,
        },
        ...(viewBook || viewCategory
          ? [
              {
                label: <Link to="/admin/book">Book & Category</Link>,
                key: "/admin/book",
                icon: <ExceptionOutlined />,
              },
            ]
          : []),
        ...(viewOrder
          ? [
              {
                label: <Link to="/admin/order">Order</Link>,
                key: "/admin/order",
                icon: <ScheduleOutlined />,
              },
            ]
          : []),
        ...(viewUser
          ? [
              {
                label: <Link to="/admin/user">User</Link>,
                key: "/admin/user",
                icon: <UserOutlined />,
              },
            ]
          : []),
        ...(viewRole
          ? [
              {
                label: <Link to="/admin/role">Role</Link>,
                key: "/admin/role",
                icon: <ExceptionOutlined />,
              },
            ]
          : []),
        ...(viewPermission
          ? [
              {
                label: <Link to="/admin/permission">Permission</Link>,
                key: "/admin/permission",
                icon: <ApiOutlined />,
              },
            ]
          : []),
      ];

      setMenuItems(full);
    }
  }, [permissions]);

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location]);

  const handleLogout = async () => {
    // Lấy userId và deviceToken trước khi xóa
    const userId = user.id;
    const deviceToken = localStorage.getItem("deviceToken");
    if (userId && deviceToken) {
      await removeToken(userId, deviceToken); // Gọi API xóa device token
    }
    const res = await logoutAPI();
    if (res && +res.statusCode === 200) {
      dispatch(setLogoutAction({}));
      dispatch(clearCartAction());
      message.success("Đăng xuất thành công");
      navigate("/");
    }
  };

  // if (isMobile) {
  //     items.push({
  //         label: <label
  //             style={{ cursor: 'pointer' }}
  //             onClick={() => handleLogout()}
  //         >Đăng xuất</label>,
  //         key: 'logout',
  //         icon: <LogoutOutlined />
  //     })
  // }

  const itemsDropdown = [
    {
      label: <Link to={"/"}>Trang chủ</Link>,
      key: "home",
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={() => handleLogout()}>
          Đăng xuất
        </label>
      ),
      key: "logout",
    },
  ];

  return (
    <>
      <Layout style={{ minHeight: "100vh" }} className="layout-admin">
        {!isMobile ? (
          <Sider
            theme="light"
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <div
              style={{
                height: 32,
                margin: 16,
                textAlign: "center",
              }}
            >
              <BugOutlined /> ADMIN
            </div>
            <Menu
              selectedKeys={[activeMenu]}
              mode="inline"
              items={menuItems}
              onClick={(e) => setActiveMenu(e.key)}
            />
          </Sider>
        ) : (
          <Menu
            selectedKeys={[activeMenu]}
            items={menuItems}
            onClick={(e) => setActiveMenu(e.key)}
            mode="horizontal"
          />
        )}

        <Layout>
          {!isMobile && (
            <div
              className="admin-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginRight: 20,
              }}
            >
              <Button
                type="text"
                icon={
                  collapsed
                    ? React.createElement(MenuUnfoldOutlined)
                    : React.createElement(MenuFoldOutlined)
                }
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />

              <Dropdown menu={{ items: itemsDropdown }} trigger={["click"]}>
                <Space style={{ cursor: "pointer" }}>
                  Welcome {user?.fullName}
                  <Avatar src={user?.avatar} size="large">
                    {" "}
                    {user?.fullName?.substring(0, 2)?.toUpperCase()}{" "}
                  </Avatar>
                </Space>
              </Dropdown>
            </div>
          )}
          <Content style={{ padding: "15px" }}>
            <Outlet />
          </Content>
          {/* <Footer style={{ padding: 10, textAlign: 'center' }}>
                        React Typescript series Nest.JS &copy; Hỏi Dân IT - Made with <HeartTwoTone />
                    </Footer> */}
        </Layout>
      </Layout>
    </>
  );
};

export default LayoutAdmin;
