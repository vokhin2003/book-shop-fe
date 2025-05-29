import { useState } from "react";
import { FaReact } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { VscSearchFuzzy } from "react-icons/vsc";
import { Divider, Badge, Drawer, Avatar, Popover, Empty, message } from "antd";
import { Dropdown, Space } from "antd";
import { useNavigate } from "react-router";
import "styles/app.header.scss";
import { isMobile } from "react-device-detect";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { Link } from "react-router-dom";
import { logoutAPI } from "@/services/api";
import { setLogoutAction } from "@/redux/slice/accountSlice";
import { convertSlug } from "@/utils";
import { clearCartAction } from "@/redux/slice/cartSlice";

interface IProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    filter: string;
    setFilter: (value: string) => void;
}

const Header = (props: IProps) => {
    const { searchTerm, setSearchTerm, filter, setFilter } = props;

    // const { carts, setCarts } = useCurrentApp();
    const [openDrawer, setOpenDrawer] = useState(false);

    const [openManageAccount, setOpenManageAccount] = useState<boolean>(false);

    // const { isAuthenticated, user, setUser, setIsAuthenticated } =
    //     useCurrentApp();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // const [carts, setCarts] = useState<any[]>([]);

    const isAuthenticated = useAppSelector(
        (state) => state.account.isAuthenticated
    );

    const user = useAppSelector((state) => state.account.user);

    const carts = useAppSelector((state) => state.cart.items);

    const handleLogout = async () => {
        const res = await logoutAPI();
        if (res && res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            dispatch(clearCartAction());
            message.success("Đăng xuất thành công");
            navigate("/");
        }
    };

    const handleSearch = () => {
        const cleanSearchQuery = searchTerm
            ? searchTerm
                  .trim() // Loại bỏ khoảng trắng ở đầu và cuối
                  .replace(
                      /[^a-zA-Z0-9\s-.,:áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđĐ]/g,
                      ""
                  ) // Giữ chữ, số, dấu -.,: và ký tự tiếng Việt
                  .replace(/\s+/g, " ") // Thay thế nhiều khoảng trắng bằng một khoảng trắng
                  .trim() // Trim lại
            : "";

        setSearchTerm(cleanSearchQuery);

        // Nếu sau khi xử lý, chuỗi tìm kiếm rỗng
        if (!cleanSearchQuery) {
            // Nếu filter hiện tại rỗng
            if (!filter) {
                setFilter("");
                return;
            }

            // Kiểm tra nếu filter chỉ chứa một điều kiện tìm kiếm
            if (filter.match(/^\(title~~'[^']*'\)$/)) {
                setFilter("");
                return;
            }

            // Kiểm tra nếu filter có chứa điều kiện tìm kiếm kết hợp với điều kiện khác
            const searchTermRegex = /\s+and\s+\(title~~'[^']*'\)$/;
            if (searchTermRegex.test(filter)) {
                // Loại bỏ điều kiện tìm kiếm hiện tại
                setFilter(filter.replace(searchTermRegex, ""));
            }
            // Nếu không có điều kiện tìm kiếm, giữ nguyên filter
            return;
        }

        // Xử lý với chuỗi tìm kiếm hợp lệ
        let baseFilterQuery = "";

        // Nếu filter hiện tại rỗng
        if (!filter) {
            setFilter(`(title~~'${cleanSearchQuery}')`);
            return;
        }

        // Kiểm tra nếu filter chỉ chứa một điều kiện tìm kiếm
        if (filter.match(/^\(title~~'[^']*'\)$/)) {
            setFilter(`(title~~'${cleanSearchQuery}')`);
            return;
        }

        // Kiểm tra nếu filter có chứa điều kiện tìm kiếm kết hợp với điều kiện khác
        const searchTermRegex = /\s+and\s+\(title~~'[^']*'\)$/;
        if (searchTermRegex.test(filter)) {
            // Loại bỏ điều kiện tìm kiếm hiện tại
            baseFilterQuery = filter.replace(searchTermRegex, "");
        } else {
            // Không có điều kiện tìm kiếm, giữ nguyên filter
            baseFilterQuery = filter;
        }

        // Kết hợp baseFilterQuery với điều kiện tìm kiếm mới
        setFilter(`${baseFilterQuery} and (title~~'${cleanSearchQuery}')`);
    };

    const items = [
        {
            label: (
                <label
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenManageAccount(true)}
                >
                    Quản lý tài khoản
                </label>
            ),
            key: "account",
        },
        {
            label: <Link to="/history">Lịch sử mua hàng</Link>,
            key: "history",
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
    if (user?.role === "ADMIN") {
        items.unshift({
            label: <Link to="/admin">Trang quản trị</Link>,
            key: "admin",
        });
    }

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
        user?.avatar
    }`;

    const contentPopover = () => {
        // Chỉ hiển thị tối đa 4 sản phẩm
        const displayCarts = carts?.slice(0, 4) || [];
        const hasMoreItems = carts?.length > 4;

        const handleItemClick = (book: any) => {
            const slug = convertSlug(book.title);
            navigate(`/book/${slug}?id=${book.id}`);
        };

        return (
            <div className="pop-cart-body">
                <div className="pop-cart-header">
                    <span className="cart-title">Sản Phẩm Mới Thêm</span>
                </div>
                <div className="pop-cart-content">
                    {displayCarts?.map((item, index) => {
                        return (
                            <div
                                className="cart-item"
                                key={`book-${index}`}
                                onClick={() => handleItemClick(item.book)}
                            >
                                <div className="item-image">
                                    <img
                                        src={item.book.thumbnail}
                                        alt={item.book.title}
                                    />
                                </div>
                                <div className="item-info">
                                    <div className="item-title">
                                        {item.book.title}
                                    </div>
                                </div>
                                <div className="item-price">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(item.book.price ?? 0)}
                                </div>
                            </div>
                        );
                    })}
                    {hasMoreItems && (
                        <div className="more-items">
                            <span>Và {carts.length - 4} sản phẩm khác...</span>
                        </div>
                    )}
                </div>
                {carts.length > 0 ? (
                    <div className="pop-cart-footer">
                        <div className="cart-summary">
                            <span>{carts.length} Thêm Hàng Vào Giỏ</span>
                        </div>
                        <button
                            className="view-cart-btn"
                            onClick={() => navigate("/order")}
                        >
                            Xem giỏ hàng
                        </button>
                    </div>
                ) : (
                    <Empty description="Không có sản phẩm trong giỏ hàng" />
                )}
            </div>
        );
    };
    return (
        <>
            <div className="header-container">
                <header className="page-header">
                    <div className="page-header__top">
                        <div
                            className="page-header__toggle"
                            onClick={() => {
                                setOpenDrawer(true);
                            }}
                        >
                            ☰
                        </div>
                        <div className="page-header__logo">
                            <span className="logo">
                                <span onClick={() => navigate("/")}>
                                    {" "}
                                    <FaReact className="rotate icon-react" />
                                    Rober
                                </span>

                                <VscSearchFuzzy className="icon-search" />
                            </span>
                            <input
                                className="input-search"
                                type={"text"}
                                placeholder="Bạn tìm gì hôm nay"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        // Call your function here
                                        handleSearch();
                                        console.log(">>> enter:");
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <nav className="page-header__bottom">
                        <ul id="navigation" className="navigation">
                            <li className="navigation__item">
                                {!isMobile ? (
                                    <>
                                        <Popover
                                            className="popover-carts"
                                            placement="topRight"
                                            rootClassName={"popover-carts"}
                                            title={null}
                                            content={contentPopover}
                                            arrow={true}
                                            overlayClassName="cart-popover-overlay"
                                        >
                                            <Badge
                                                count={carts?.length ?? 0}
                                                // count={10}
                                                size={"small"}
                                                showZero
                                            >
                                                <FiShoppingCart className="icon-cart" />
                                            </Badge>
                                        </Popover>
                                    </>
                                ) : (
                                    <Badge
                                        count={carts?.length ?? 0}
                                        size="small"
                                        showZero
                                        onClick={() => navigate("/order")}
                                    >
                                        <FiShoppingCart className="icon-cart" />
                                    </Badge>
                                )}
                            </li>
                            <li className="navigation__item mobile">
                                <Divider type="vertical" />
                            </li>
                            <li className="navigation__item mobile">
                                {!isAuthenticated ? (
                                    <span onClick={() => navigate("/login")}>
                                        {" "}
                                        Tài Khoản
                                    </span>
                                ) : (
                                    <Dropdown
                                        menu={{ items }}
                                        trigger={["click"]}
                                    >
                                        <Space>
                                            <Avatar src={urlAvatar} />
                                            {user?.fullName}
                                        </Space>
                                    </Dropdown>
                                )}
                            </li>
                        </ul>
                    </nav>
                </header>
            </div>
            <Drawer
                title="Menu chức năng"
                placement="left"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
            >
                <p>Quản lý tài khoản</p>
                <Divider />

                <p onClick={() => handleLogout()}>Đăng xuất</p>
                <Divider />
            </Drawer>

            {/* <ManageAccount
                isModalOpen={openManageAccount}
                setIsModalOpen={setOpenManageAccount}
            /> */}
        </>
    );
};

export default Header;
