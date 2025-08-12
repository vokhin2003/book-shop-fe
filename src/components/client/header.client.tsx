import { useEffect, useState, useMemo } from "react";
import { FaReact } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { VscSearchFuzzy } from "react-icons/vsc";
import { Divider, Badge, Drawer, Avatar, Popover, Empty, message } from "antd";
import { Dropdown, Space } from "antd";
import { useNavigate } from "react-router";
import "styles/app.header.scss";
import { isMobile } from "react-device-detect";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { Link, useLocation } from "react-router-dom";
import { fetchBookAPI, logoutAPI } from "@/services/api";
import { setLogoutAction } from "@/redux/slice/accountSlice";
import { convertSlug } from "@/utils";
import { clearCartAction } from "@/redux/slice/cartSlice";
import ManageAccount from "./account";
import { removeToken } from "@/notifications/firebase";
import { UserOutlined } from "@ant-design/icons";
import type { IBook } from "@/types/backend";
import debounce from "lodash/debounce";

interface IProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  current: number;
  setCurrent: (value: number) => void;
}

const Header = (props: IProps) => {
  const { searchTerm, setSearchTerm, filter, setFilter, setCurrent } = props;

  // const { carts, setCarts } = useCurrentApp();
  const [openDrawer, setOpenDrawer] = useState(false);

  const [openManageAccount, setOpenManageAccount] = useState<boolean>(false);

  // const { isAuthenticated, user, setUser, setIsAuthenticated } =
  //     useCurrentApp();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // const [carts, setCarts] = useState<any[]>([]);

  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );

  const user = useAppSelector((state) => state.account.user);

  const carts = useAppSelector((state) => state.cart.items);

  // search suggestions state
  const [suggestions, setSuggestions] = useState<IBook[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState<boolean>(false);
  // removed old timer ref in favor of lodash.debounce

  const sanitizeSearchQuery = (value: string): string => {
    return value
      ? value
          .trim()
          .replace(
            /[^a-zA-Z0-9\s-.,:áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđĐ]/g,
            ""
          )
          .replace(/\s+/g, " ")
          .trim()
      : "";
  };

  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce(async (term: string) => {
        try {
          const res = await fetchBookAPI(
            `page=1&size=6&sort=sold,desc&filter=(title~~'${term}')`
          );
          const result: IBook[] = res?.data?.result ?? [];
          setSuggestions(result);
          setShowSuggestions(true);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300),
    []
  );

  // debounce suggestions when typing
  useEffect(() => {
    const term = sanitizeSearchQuery(searchTerm || "");
    if (!term) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    debouncedFetchSuggestions(term);
    return () => debouncedFetchSuggestions.cancel();
  }, [searchTerm, debouncedFetchSuggestions]);

  const handleLogout = async () => {
    // Lấy userId và deviceToken trước khi xóa
    const userId = user.id;
    const deviceToken = localStorage.getItem("deviceToken");
    if (userId && deviceToken) {
      await removeToken(userId, deviceToken); // Gọi API xóa device token
    }
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
      // Nếu đang ở landing thì đưa về shop để hiển thị danh sách trống
      if (location.pathname !== "/shop") navigate("/shop");
      // blur suggestions by hiding dropdown and clearing focus
      setShowSuggestions(false);
      return;
    }

    // Xử lý với chuỗi tìm kiếm hợp lệ
    let baseFilterQuery = "";

    // Nếu filter hiện tại rỗng
    if (!filter) {
      setFilter(`(title~~'${cleanSearchQuery}')`);
      setCurrent(1);
      if (location.pathname !== "/shop") navigate("/shop");
      setShowSuggestions(false);
      return;
    }

    // Kiểm tra nếu filter chỉ chứa một điều kiện tìm kiếm
    if (filter.match(/^\(title~~'[^']*'\)$/)) {
      setFilter(`(title~~'${cleanSearchQuery}')`);
      setCurrent(1);
      if (location.pathname !== "/shop") navigate("/shop");
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
    setCurrent(1);
    if (location.pathname !== "/shop") navigate("/shop");
    setShowSuggestions(false);
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
      label: <Link to="/addresses">Địa chỉ</Link>,
      key: "addresses",
    },
    {
      label: <Link to="/history">Lịch sử mua hàng</Link>,
      key: "history",
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
  if (user?.role === "ADMIN" || user.role.startsWith("admin")) {
    items.unshift({
      label: <Link to="/admin">Trang quản trị</Link>,
      key: "admin",
    });
  }

  // const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
  //     user?.avatar
  // }`;

  const contentPopover = () => {
    // Chỉ hiển thị tối đa 4 sản phẩm
    const displayCarts = carts?.slice(0, 4) || [];
    const hasMoreItems = carts?.length > 4;

    const handleItemClick = (book: IBook) => {
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
                  <img src={item.book.thumbnail} alt={item.book.title} />
                </div>
                <div className="item-info">
                  <div className="item-title">{item.book.title}</div>
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
              </span>
              <div className="search-box">
                <VscSearchFuzzy
                  className="icon-search"
                  onClick={() => handleSearch()}
                />
                <input
                  className="input-search"
                  type={"text"}
                  placeholder="Bạn tìm gì hôm nay"
                  value={searchTerm}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                />
                {showSuggestions &&
                  (suggestions.length > 0 || isLoadingSuggestions) && (
                    <div
                      className="search-suggestions"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {isLoadingSuggestions ? (
                        <div className="suggestion-loading">Đang tìm kiếm…</div>
                      ) : (
                        suggestions.slice(0, 4).map((book: IBook) => {
                          const handleClick = () => {
                            const slug = convertSlug(book.title);
                            navigate(`/book/${slug}?id=${book.id}`);
                            setShowSuggestions(false);
                          };
                          return (
                            <div
                              key={book.id}
                              className="suggestion-item"
                              onClick={handleClick}
                            >
                              <div className="thumb">
                                <img src={book.thumbnail} alt={book.title} />
                              </div>
                              <div className="meta">
                                <div className="title" title={book.title}>
                                  {book.title}
                                </div>
                                <div className="price">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(book.price ?? 0)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      {suggestions.length > 4 && (
                        <div
                          className="suggestion-footer"
                          onClick={() => {
                            handleSearch();
                            // ensure input loses focus to close popup immediately
                            const input =
                              document.querySelector<HTMLInputElement>(
                                ".page-header .input-search"
                              );
                            input?.blur();
                          }}
                        >
                          Xem tất cả kết quả cho “
                          {sanitizeSearchQuery(searchTerm)}”
                        </div>
                      )}
                    </div>
                  )}
              </div>
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
                  <Badge count={carts?.length ?? 0} size="small" showZero>
                    <FiShoppingCart
                      className="icon-cart"
                      onClick={() => navigate("/order")}
                    />
                  </Badge>
                )}
              </li>
              <li className="navigation__item mobile">
                <Divider type="vertical" />
              </li>
              <li className="navigation__item mobile">
                {!isAuthenticated ? (
                  <span onClick={() => navigate("/login")}> Tài Khoản</span>
                ) : (
                  <Dropdown menu={{ items }} trigger={["click"]}>
                    <Space>
                      <Avatar
                        key={user?.avatar} // ép remount khi URL đổi
                        src={user?.avatar || undefined} // tránh truyền chuỗi rỗng
                        icon={<UserOutlined />} // fallback
                      />
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

      <ManageAccount
        isModalOpen={openManageAccount}
        setIsModalOpen={setOpenManageAccount}
      />
    </>
  );
};

export default Header;
