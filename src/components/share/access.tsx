import { useEffect, useState } from "react";
import { Result, Spin } from "antd";
import { useAppSelector } from "@/redux/hook";
interface IProps {
  hideChildren?: boolean;
  children: React.ReactNode;
  permission: { method: string; path: string; module: string };
  showLoading?: boolean; // Thêm option để hiển thị loading
}

const Access = (props: IProps) => {
  //set default: hideChildren = false => vẫn render children
  // hideChildren = true => ko render children, ví dụ hide button (button này check quyền)
  const { permission, hideChildren = false, showLoading = false } = props;
  const [allow, setAllow] = useState<boolean | null>(null); // null = loading, true = allow, false = deny

  const permissions = useAppSelector((state) => state.account.user.permissions);
  const isLoading = useAppSelector((state) => state.account.isLoading);

  useEffect(() => {
    // Chỉ check permission khi không còn loading và permissions đã được load
    if (!isLoading && permissions !== undefined) {
      if (permissions?.length) {
        const check = permissions.find(
          (item) =>
            item.path === permission.path &&
            item.method === permission.method &&
            item.module === permission.module
        );
        setAllow(!!check);
      } else {
        // Nếu permissions là array rỗng, có nghĩa là user không có quyền gì
        setAllow(false);
      }
    }
  }, [
    permissions,
    permission.method,
    permission.module,
    permission.path,
    isLoading,
  ]);

  // Nếu đang loading và showLoading = true, hiển thị loading
  if (allow === null && showLoading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Nếu đang loading và showLoading = false, không render gì cả
  if (allow === null) {
    return null;
  }

  return (
    <>
      {allow === true || import.meta.env.VITE_ACL_ENABLE === "false" ? (
        <>{props.children}</>
      ) : (
        <>
          {hideChildren === false ? (
            <Result
              status="403"
              title="Truy cập bị từ chối"
              subTitle="Xin lỗi, bạn không có quyền hạn (permission) truy cập thông tin này"
            />
          ) : (
            <>{/* render nothing */}</>
          )}
        </>
      )}
    </>
  );
};

export default Access;
