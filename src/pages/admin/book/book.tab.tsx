import { Tabs, Result, Spin } from "antd";
import BookPage from "./book";
import CategoryPage from "./category";
import { ALL_PERMISSIONS } from "@/permission";
import { useAppSelector } from "@/redux/hook";
import { useEffect, useState } from "react";

const tabConfigs = [
  {
    key: "1",
    label: "Manage book",
    permission: ALL_PERMISSIONS.BOOKS.GET_PAGINATE,
    children: <BookPage />,
  },
  {
    key: "2",
    label: "Manage category",
    permission: ALL_PERMISSIONS.CATEGORIES.GET_PAGINATE,
    children: <CategoryPage />,
  },
];

const BookTab = () => {
  const permissions = useAppSelector((state) => state.account.user.permissions);
  const isLoading = useAppSelector((state) => state.account.isLoading);
  const [items, setItems] = useState<
    { key: string; label: React.ReactNode; children: React.ReactNode }[]
  >([]);

  useEffect(() => {
    // Chỉ filter tabs khi không còn loading và permissions đã được load
    if (!isLoading && permissions !== undefined) {
      if (permissions?.length) {
        const filtered = tabConfigs.filter((cfg) =>
          permissions.find(
            (item) =>
              item.path === cfg.permission.path &&
              item.method === cfg.permission.method &&
              item.module === cfg.permission.module
          )
        );
        setItems(
          filtered.map((cfg) => ({
            key: cfg.key,
            label: cfg.label,
            children: cfg.children,
          }))
        );
      } else {
        // Nếu permissions là array rỗng, set items rỗng
        setItems([]);
      }
    }
  }, [permissions, isLoading]);

  // Nếu đang loading, hiển thị loading
  if (isLoading || permissions === undefined) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!items.length) {
    // Không có quyền với cả 2 tab
    return (
      <Result
        status="403"
        title="Truy cập bị từ chối"
        subTitle="Xin lỗi, bạn không có quyền hạn (permission) truy cập thông tin này"
      />
    );
  }

  return <Tabs defaultActiveKey="1" items={items} />;
};

export default BookTab;
