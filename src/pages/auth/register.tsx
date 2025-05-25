import {
    Button,
    Divider,
    Form,
    FormProps,
    Input,
    Row,
    Select,
    message,
    notification,
} from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "styles/auth.module.scss";
import { IUser } from "@/types/backend";
import { registerAPI } from "@/services/api";
const { Option } = Select;

type FieldType = {
    fullName: string;
    email: string;
    password: string;
    phone: string;
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        const { fullName, email, password, phone } = values;
        setIsSubmit(true);
        const res = await registerAPI(fullName, email, password, phone);
        if (res?.data?.id) {
            message.success("Đăng ký tài khoản thành công!");
            navigate("/login");
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description:
                    res.message && Array.isArray(res.message)
                        ? res.message[0]
                        : res.message,
                duration: 5,
            });
        }

        setIsSubmit(false);
    };

    return (
        <div className={styles["register-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles.heading}>
                            <h2
                                className={`${styles.text} ${styles["text-large"]}`}
                            >
                                {" "}
                                Đăng Ký Tài Khoản{" "}
                            </h2>
                            <Divider />
                        </div>
                        <Form
                            name="basic"
                            // style={{ maxWidth: 600, margin: '0 auto' }}
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }} //whole column
                                label="Họ tên"
                                name="fullName"
                                rules={[
                                    {
                                        required: true,
                                        message: "Họ tên không được để trống!",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }} //whole column
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        type: "email",
                                        message: "Email không đúng định dạng!",
                                    },
                                    {
                                        required: true,
                                        message: "Email không được để trống!",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }} //whole column
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Mật khẩu không được để trống!",
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Số điện thoại"
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Số điện thoại không được để trống!",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                            // wrapperCol={{ offset: 6, span: 16 }}
                            >
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmit}
                                >
                                    Đăng ký
                                </Button>
                            </Form.Item>
                            <Divider> Or </Divider>
                            <p className="text text-normal">
                                {" "}
                                Đã có tài khoản ?
                                <span>
                                    <Link to="/login"> Đăng Nhập </Link>
                                </span>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
