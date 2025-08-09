import { Modal, Tabs } from "antd";
import UserInfo from "./user.info";
import ChangePassword from "./change.password";
import CreatePassword from "./create.password";
import { useAppSelector } from "@/redux/hook";
import { useEffect, useState } from "react";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

const ManageAccount = (props: IProps) => {
  const { isModalOpen, setIsModalOpen } = props;
  const [activeKey, setActiveKey] = useState<string>("info");
  const user = useAppSelector((state) => state.account.user);

  const items = [
    {
      key: "info",
      label: "Cập nhật thông tin",
      children: (
        <UserInfo
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen} // Thêm prop này
        />
      ),
    },
    {
      key: "password",
      label: user?.noPassword ? "Tạo mật khẩu" : "Đổi mật khẩu",
      children: user?.noPassword ? (
        <CreatePassword
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      ) : (
        <ChangePassword
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      ),
    },
  ];

  const handleCancel = () => {
    setIsModalOpen(false);
    setActiveKey("info");
  };

  // Thêm handler để reset tab khi modal mở
  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  // Reset tab khi modal đóng/mở
  useEffect(() => {
    if (!isModalOpen) {
      setActiveKey("info");
    }
  }, [isModalOpen]);

  return (
    <Modal
      title="Quản lý tài khoản"
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      maskClosable={false}
      width={"60vw"}
      style={{ top: 50 }}
      // Thêm thuộc tính này để force reset khi modal đóng/mở
      destroyOnClose={true}
    >
      <Tabs activeKey={activeKey} items={items} onChange={handleTabChange} />
    </Modal>
  );
};

export default ManageAccount;
