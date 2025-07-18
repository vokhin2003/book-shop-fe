import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setUserLoginInfo } from "@/redux/slice/accountSlice";
import { fetchCart } from "@/redux/slice/cartSlice";
import { loginAPI } from "@/services/api";
import {
    Button,
    Divider,
    Form,
    FormProps,
    Input,
    message,
    notification,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "styles/auth.module.scss";

type FieldType = {
    username: string;
    password: string;
};

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const [isSubmit, setIsSubmit] = useState(false);

    // Lấy callback từ query parameter
    const queryParams = new URLSearchParams(location.search);
    const callback = queryParams.get("callback") || ""; // Lấy giá trị callback

    const isAuthenticated = useAppSelector(
        (state) => state.account.isAuthenticated
    );

    useEffect(() => {
        //đã login => redirect to '/'
        if (isAuthenticated) {
            // navigate('/');
            // window.location.href = "/";
            navigate(callback || "/");
        }
    }, []);

    //     useEffect(() => {
    //     if (isAuthenticated) {
    //       navigate(callback || '/');
    //     }
    //   }, [isAuthenticated, callback, navigate]);

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        // message.success("123456");
        const { username, password } = values;
        setIsSubmit(true);
        const res = await loginAPI(username, password);
        console.log(">>> check callback:", callback);
        console.log(res);
        console.log(res.data);

        if (res?.data) {
            console.log("success");
            localStorage.setItem("access_token", res.data.access_token);
            dispatch(setUserLoginInfo(res.data.user));
            await dispatch(fetchCart());
            message.success("Đăng nhập tài khoản thành công!");
            // window.location.href = callback ? callback : "/";
            // navigate(callback || "/");
            const decodedCallback = callback
                ? decodeURIComponent(callback)
                : "/";
            navigate(decodedCallback);
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
        <div className={styles["login-page"]}>
            <main className={styles.main}>
                <div className={styles.container}>
                    <section className={styles.wrapper}>
                        <div className={styles.heading}>
                            <h2
                                className={`${styles.text} ${styles["text-large"]}`}
                            >
                                Đăng Nhập
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
                                label="Email"
                                name="username"
                                rules={[
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

                            <Form.Item
                            // wrapperCol={{ offset: 6, span: 16 }}
                            >
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSubmit}
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                            <Divider>Or</Divider>
                            <p className="text text-normal">
                                Chưa có tài khoản ?
                                <span>
                                    <Link to="/register"> Đăng Ký </Link>
                                </span>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
