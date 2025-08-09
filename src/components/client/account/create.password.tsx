import { Button, Form, Input, message, notification } from "antd";
import { useState } from "react";
import { createPasswordAPI } from "@/services/api";
import { useAppDispatch } from "@/redux/hook";
import { fetchAccount } from "@/redux/slice/accountSlice";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen?: (value: boolean) => void;
}

const CreatePassword = ({ isModalOpen, setIsModalOpen }: IProps) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  const onFinish = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setSubmitting(true);
      const res = await createPasswordAPI(
        values.password,
        values.confirmPassword
      );
      if (res?.statusCode === 200) {
        message.success("Tạo mật khẩu thành công!");
        await dispatch(fetchAccount());
        if (setIsModalOpen) setIsModalOpen(false);
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: Array.isArray(res?.message)
            ? res.message[0]
            : res?.message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu" },
          { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
        ]}
        hasFeedback
      >
        <Input.Password placeholder="Nhập mật khẩu" />
      </Form.Item>

      <Form.Item
        label="Xác nhận mật khẩu"
        name="confirmPassword"
        dependencies={["password"]}
        hasFeedback
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value)
                return Promise.resolve();
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Nhập lại mật khẩu" />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={submitting} block>
        Tạo mật khẩu
      </Button>
    </Form>
  );
};

export default CreatePassword;
