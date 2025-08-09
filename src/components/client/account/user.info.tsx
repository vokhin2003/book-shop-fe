import {
  AntDesignOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  Form,
  FormProps,
  Input,
  Row,
  Upload,
  UploadFile,
  message,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import type { UploadProps } from "antd";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { updateUserInfoAPI, uploadFileAPI } from "@/services/api";
import { setUpdateUserInfo } from "@/redux/slice/accountSlice";

type FieldType = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
};

const { TextArea } = Input;

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen?: (value: boolean) => void;
}

const UserInfo = ({ isModalOpen, setIsModalOpen }: IProps) => {
  // const { user, setUser } = useCurrentApp();
  const [form] = Form.useForm();

  const user = useAppSelector((state) => state.account.user);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [userAvatar, setUserAvatar] = useState<string>(user.avatar);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user && isModalOpen) {
      form.setFieldsValue({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
      });
      setUserAvatar(user.avatar); // Reset avatar về giá trị ban đầu
    } else if (!isModalOpen) {
      form.resetFields();
      setUserAvatar(user.avatar); // Reset form khi modal đóng
    }
  }, [user, isModalOpen, form]);

  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;
    const res = await uploadFileAPI(file, "avatar");
    if (res.data) {
      const newAvatar = res.data.url;
      setUserAvatar(newAvatar);
      if (onSuccess) {
        onSuccess("ok");
      }
    } else {
      message.error(res.message);
    }
  };

  const propsUpload: UploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    customRequest: handleUploadFile,
    onChange(info) {
      const { status } = info.file;

      if (status === "done") {
        message.success(`Upload file thành công`);
      } else if (status === "error") {
        message.error(`Upload file thất bại`);
      }
    },
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { fullName, phone, id, address } = values;
    setIsSubmit(true);
    const res = await updateUserInfoAPI(
      id,
      fullName,
      phone,
      userAvatar,
      address
    );
    if (res.data) {
      dispatch(
        setUpdateUserInfo({
          fullName,
          phone,
          address,
          avatar: userAvatar,
        })
      );
      message.success("Cập nhật thông tin thành công");
      localStorage.removeItem("access_token");
      if (setIsModalOpen) {
        setIsModalOpen(false); // Đóng modal sau khi cập nhật thành công
      }
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message,
      });
    }
    setIsSubmit(false);
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Row>
        <Col md={12} sm={24}>
          <Row gutter={30}>
            <Col span={24}>
              <Avatar
                size={{
                  xs: 32,
                  sm: 64,
                  md: 80,
                  lg: 128,
                  xl: 160,
                  xxl: 200,
                }}
                icon={<UserOutlined />}
                shape="circle"
                src={userAvatar}
              />
            </Col>
            <Col span={24}>
              <Upload {...propsUpload} style={{ marginTop: 10 }}>
                <Button icon={<UploadOutlined />}>Upload Avatar</Button>
              </Upload>
            </Col>
          </Row>
        </Col>
        <Col md={12} sm={24}>
          <Form
            form={form}
            onFinish={onFinish}
            labelCol={{ span: 24 }}
            name="user-info"
            autoComplete="off"
          >
            <Form.Item<FieldType> label="_id" name="id" hidden>
              <Input disabled hidden />
            </Form.Item>

            <Form.Item<FieldType> label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item<FieldType>
              label="Tên hiển thị"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: "Tên hiển thị không được để trống!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item<FieldType>
              label="Số điện thoại"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Số điện thoại không được để trống!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item<FieldType>
              label="Địa chỉ nhận hàng"
              name="address"
              rules={[
                {
                  required: true,
                  message: "Địa chỉ không được để trống!",
                },
              ]}
            >
              <TextArea rows={3} autoFocus />
            </Form.Item>
            <Button
              type="primary"
              loading={isSubmit}
              onClick={() => form.submit()}
            >
              Cập nhật
            </Button>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default UserInfo;
