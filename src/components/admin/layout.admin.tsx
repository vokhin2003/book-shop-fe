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

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState("");
    const user = useAppSelector((state) => state.account.user);

    const [menuItems, setMenuItems] = useState<MenuProps["items"]>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const full = [
            {
                label: <Link to="/admin">Dashboard</Link>,
                key: "/admin",
                icon: <AppstoreOutlined />,
            },
            {
                label: <Link to="/admin/book">Book</Link>,
                key: "/admin/book",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/admin/user">User</Link>,
                key: "/admin/user",
                icon: <UserOutlined />,
            },
            {
                label: <Link to="/admin/role">Role</Link>,
                key: "/admin/role",
                icon: <ExceptionOutlined />,
            },
            {
                label: <Link to="/admin/permission">Permission</Link>,
                key: "/admin/permission",
                icon: <ApiOutlined />,
            },
        ];

        setMenuItems(full);
    }, []);

    useEffect(() => {
        setActiveMenu(location.pathname);
    }, [location]);

    const handleLogout = async () => {
        const res = await logoutAPI();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
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
                <label
                    style={{ cursor: "pointer" }}
                    onClick={() => handleLogout()}
                >
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
                                        ? React.createElement(
                                              MenuUnfoldOutlined
                                          )
                                        : React.createElement(MenuFoldOutlined)
                                }
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: "16px",
                                    width: 64,
                                    height: 64,
                                }}
                            />

                            <Dropdown
                                menu={{ items: itemsDropdown }}
                                trigger={["click"]}
                            >
                                <Space style={{ cursor: "pointer" }}>
                                    Welcome {user?.fullName}
                                    <Avatar>
                                        {" "}
                                        {user?.fullName
                                            ?.substring(0, 2)
                                            ?.toUpperCase()}{" "}
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
