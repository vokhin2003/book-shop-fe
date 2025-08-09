import { useAppSelector } from "@/redux/hook";
import { changePasswordAPI } from "@/services/api";
import {
  Button,
  Col,
  Form,
  FormProps,
  Input,
  Row,
  message,
  notification,
} from "antd";
import { useEffect, useState } from "react";

type FieldType = {
  email: string;
  oldPassword: string;
  newPassword: string;
};

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen?: (value: boolean) => void;
}
const ChangePassword = ({ isModalOpen, setIsModalOpen }: IProps) => {
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const user = useAppSelector((state) => state.account.user);

  useEffect(() => {
    if (user && isModalOpen) {
      form.setFieldsValue({
        email: user.email,
        oldPassword: "",
        newPassword: "",
      });
    } else if (!isModalOpen) {
      form.resetFields(); // Reset form khi modal đóng
    }
  }, [user, isModalOpen, form]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { newPassword, oldPassword } = values;
    setIsSubmit(true);
    const res = await changePasswordAPI(user.id, oldPassword, newPassword);
    if (res.statusCode === 200) {
      message.success("Cập nhật mật khẩu thành công");
      form.setFieldValue("oldPassword", "");
      form.setFieldValue("newPassword", "");
      if (setIsModalOpen) {
        setIsModalOpen(false); // Đóng modal sau khi đổi mật khẩu thành công
      }

      // form.resetFields(); // Reset form sau khi đổi mật khẩu thành công
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
        <Col span={1}></Col>
        <Col span={12}>
          <Form
            name="basic"
            form={form}
            onFinish={onFinish}
            labelCol={{ span: 24 }}
          >
            <Form.Item<FieldType>
              label="Email"
              name="email"
              initialValue={user?.email}
              rules={[
                {
                  required: true,
                  message: "Email không được để trống!",
                },
              ]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item<FieldType>
              label="Mật khẩu hiện tại"
              name="oldPassword"
              rules={[
                {
                  required: true,
                  message: "Mật khẩu không được để trống!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item<FieldType>
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Mật khẩu không được để trống!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isSubmit}>
                Xác nhận
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ChangePassword;
