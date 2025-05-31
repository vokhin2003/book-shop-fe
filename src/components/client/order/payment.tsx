import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { clearCart } from "@/redux/slice/cartSlice";
import { createPaymentUrlAPI, placeOrderAPI } from "@/services/api";
import { ICreateOrderRequest } from "@/types/backend";
import { DeleteTwoTone, LoadingOutlined } from "@ant-design/icons";
import {
    App,
    Button,
    Col,
    Divider,
    Form,
    FormProps,
    Input,
    Radio,
    Row,
    Space,
    message,
    notification,
} from "antd";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

type UserMethod = "COD" | "VNPAY";

type FieldType = {
    shippingAddress: string;
    fullName: string;
    phone: string;
    paymentMethod: UserMethod;
};

const { TextArea } = Input;

interface IProps {
    setCurrentStep: (step: number) => void;
}

const Payment = (props: IProps) => {
    const { setCurrentStep } = props;
    // const { carts, user, setCarts } = useCurrentApp();

    const carts = useAppSelector((state) => state.cart.items);
    const user = useAppSelector((state) => state.account.user);

    const dispatch = useAppDispatch();

    const [form] = Form.useForm();

    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const [totalPrice, setTotalPrice] = useState<number>(0);

    useEffect(() => {
        if (carts?.length > 0) {
            let sum = 0;
            carts.map((item) => {
                sum +=
                    item.quantity *
                    (item.book.price * (1 - item.book.discount / 100));
            });
            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
        }
    }, [carts]);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName,
                phone: user.phone,
                paymentMethod: "COD",
                shippingAddress: user.address,
            });
        }
    }, [user]);

    const handleRemoveBook = (id: number) => {
        // const cartStorage = localStorage.getItem("carts");
        // if (cartStorage) {
        //     const carts = JSON.parse(cartStorage) as ICart[];
        //     const newCarts = carts.filter((item) => item._id !== _id);
        //     localStorage.setItem("carts", JSON.stringify(newCarts));
        //     setCarts(newCarts);
        // }
    };

    // const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    //     console.log(">>> values:", values);
    //     // const { address, fullName, method, phone } = values;
    //     // const detail = carts.map((item) => ({
    //     //     bookName: item.detail.mainText,
    //     //     quantity: item.quantity,
    //     //     _id: item._id,
    //     // }));
    //     const items = carts.map((item) => ({
    //         bookId: item.book.id,
    //         quantity: item.quantity,
    //     }));

    //     const submitData: ICreateOrderRequest = {
    //         fullName: values.fullName,
    //         phone: values.phone,
    //         shippingAddress: values.shippingAddress,
    //         paymentMethod: values.paymentMethod,
    //         items: items,
    //     };
    //     setIsSubmit(true);
    //     const res = await placeOrderAPI(submitData);
    //     if (res.data) {
    //         // localStorage.removeItem("carts");
    //         // setCarts([]);
    //         dispatch(clearCart());
    //         message.success("Đặt hàng thành công!");
    //         setCurrentStep(2);
    //     } else {
    //         notification.error({
    //             message: "Đã có lỗi xảy ra",
    //             description: res.message,
    //         });
    //     }
    //     setIsSubmit(false);
    // };

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        console.log(">>> values:", values);
        const items = carts.map((item) => ({
            bookId: item.book.id,
            quantity: item.quantity,
        }));

        const submitData: ICreateOrderRequest = {
            fullName: values.fullName,
            phone: values.phone,
            shippingAddress: values.shippingAddress,
            paymentMethod: values.paymentMethod,
            items: items,
        };

        setIsSubmit(true);
        try {
            // Gọi API tạo đơn hàng
            const orderRes = await placeOrderAPI(submitData);
            if (!orderRes.data) {
                throw new Error(orderRes.message || "Failed to place order");
            }

            const order = orderRes.data;
            if (values.paymentMethod === "COD") {
                // Với COD, chuyển sang bước hoàn tất
                dispatch(clearCart());
                message.success("Đặt hàng thành công!");
                setCurrentStep(2);
            } else if (values.paymentMethod === "VNPAY") {
                // Với VNPay, gọi API lấy paymentUrl
                const paymentData = {
                    orderId: order.id,
                    amount: Number(order.totalAmount.toFixed(2)), // Đảm bảo 99000.00
                    paymentMethod: "VNPAY",
                };
                const paymentRes = await createPaymentUrlAPI(paymentData);
                if (!paymentRes.data) {
                    throw new Error(
                        paymentRes.message || "Failed to create payment URL"
                    );
                }

                const { paymentUrl, transactionId } = paymentRes.data;
                if (paymentUrl) {
                    // Lưu transactionId để kiểm tra sau
                    localStorage.setItem("pendingTransactionId", transactionId);
                    // Chuyển hướng đến trang thanh toán VNPay
                    window.location.href = paymentUrl;
                } else {
                    throw new Error("Payment URL not found");
                }
            } else {
                throw new Error("Unsupported payment method");
            }
        } catch (error: any) {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: error.message || "Unknown error",
            });
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <Row gutter={20}>
            <Col md={16} xs={24}>
                {carts?.map((item, index) => {
                    const currentBookPrice =
                        item.book.price * (1 - item.book.discount / 100);
                    return (
                        <div
                            className="order-book"
                            key={`index-${index}`}
                            style={isMobile ? { flexDirection: "column" } : {}}
                        >
                            {!isMobile ? (
                                <>
                                    <div className="book-content">
                                        <img src={item.book.thumbnail} />
                                        <div className="title">
                                            {item.book.title}
                                        </div>
                                        <div className="price">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(currentBookPrice)}
                                        </div>
                                    </div>
                                    <div className="action">
                                        <div className="quantity">
                                            Số lượng: {item.quantity}
                                        </div>
                                        <div className="sum">
                                            Tổng:{" "}
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(
                                                currentBookPrice * item.quantity
                                            )}
                                        </div>
                                        <DeleteTwoTone
                                            style={{ cursor: "pointer" }}
                                            onClick={() =>
                                                handleRemoveBook(item.id)
                                            }
                                            twoToneColor="#eb2f96"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>{item.book.title}</div>
                                    <div
                                        className="book-content"
                                        style={{ width: "100%" }}
                                    >
                                        <img src={item.book.thumbnail} />
                                        <div className="action">
                                            <div className="quantity">
                                                Số lượng: {item.quantity}
                                            </div>
                                            <DeleteTwoTone
                                                style={{ cursor: "pointer" }}
                                                onClick={() =>
                                                    handleRemoveBook(item.id)
                                                }
                                                twoToneColor="#eb2f96"
                                            />
                                        </div>
                                    </div>
                                    <div className="sum">
                                        Tổng:{" "}
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(
                                            currentBookPrice * item.quantity
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
                <div>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => setCurrentStep(0)}
                    >
                        Quay trở lại
                    </span>
                </div>
            </Col>

            <Col md={8} xs={24}>
                <div className="order-sum">
                    <Form
                        form={form}
                        onFinish={onFinish}
                        name="payment-form"
                        autoComplete="off"
                        layout="vertical"
                    >
                        <div className="order-sum">
                            <Form.Item<FieldType>
                                label="Hình thức thanh toán"
                                name="paymentMethod"
                            >
                                <Radio.Group>
                                    <Space direction="vertical">
                                        <Radio value={"COD"}>
                                            Thanh toán khi nhận hàng
                                        </Radio>
                                        <Radio value={"VNPAY"}>
                                            Thanh toán qua VNPAY
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item<FieldType>
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
                            <Form.Item<FieldType>
                                label="Địa chỉ nhận hàng"
                                name="shippingAddress"
                                rules={[
                                    {
                                        required: true,
                                        message: "Địa chỉ không được để trống!",
                                    },
                                ]}
                            >
                                <TextArea rows={4} autoFocus />
                            </Form.Item>
                            <div className="calculate">
                                <span> Tạm tính</span>
                                <span className="sum-final">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(totalPrice || 0)}
                                </span>
                            </div>
                            <Divider style={{ margin: "10px 0" }} />
                            <div className="calculate">
                                <span> Tổng tiền</span>
                                <span className="sum-final">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(totalPrice || 0)}
                                </span>
                            </div>
                            <Divider style={{ margin: "10px 0" }} />
                            <button
                                onClick={() => form.submit()}
                                disabled={isSubmit}
                            >
                                {isSubmit && (
                                    <span>
                                        <LoadingOutlined /> &nbsp;
                                    </span>
                                )}
                                Đặt Hàng ({carts?.length ?? 0})
                            </button>

                            {/* <Button
                                color="danger"
                                variant="solid"
                                onClick={() => form.submit()}
                                loading={isSubmit}
                            >
                                Đặt hàng ({carts?.length ?? 0})
                            </Button> */}
                        </div>
                    </Form>
                </div>
            </Col>
        </Row>
    );
};

export default Payment;
