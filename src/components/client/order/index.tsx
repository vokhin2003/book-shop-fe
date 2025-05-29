import {
    App,
    Button,
    Col,
    Divider,
    Empty,
    InputNumber,
    message,
    notification,
    Row,
} from "antd";
import { DeleteTwoTone } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { IBook } from "@/types/backend";
import { removeFromCart, updateCart } from "@/redux/slice/cartSlice";

interface IProps {
    setCurrentStep: (step: number) => void;
}

const OrderDetail = (props: IProps) => {
    const { setCurrentStep } = props;
    // const { carts, setCarts } = useCurrentApp();
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const carts = useAppSelector((state) => state.cart.items);

    const dispatch = useAppDispatch();

    const handleOnChangeInput = async (value: number, book: IBook) => {
        if (!value || value < 1) return;
        if (!isNaN(value)) {
            console.log("handleOnChangeInput", value, book);
            try {
                await dispatch(
                    updateCart({
                        bookId: book.id,
                        quantity: Math.min(value, book.quantity),
                    })
                ).unwrap();
                if (value >= book.quantity) {
                    notification.warning({
                        message: "Số lượng vượt quá số lượng sản phẩm có sẵn",
                        description: `Số lượng tối đa bạn có thể mua là ${book.quantity}`,
                    });
                }
            } catch (error) {
                notification.error({
                    message: "Đã có lỗi xảy ra",
                    description: error as string,
                });
            }
        }
    };

    const handleRemoveBook = async (id: number) => {
        try {
            await dispatch(removeFromCart(id)).unwrap();
            message.success("Sản phẩm đã được xoá khỏi giỏ hàng");
        } catch (error) {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: error as string,
            });
        }
    };

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

    const handleNextStep = () => {
        if (!carts.length) {
            message.error("Không tồn tại sản phẩm trong giỏ hàng");
            return;
        }
        setCurrentStep(1);
    };

    return (
        <Row gutter={20}>
            <Col md={18} xs={24}>
                {carts?.map((item) => {
                    const currentBookPrice =
                        item.book.price * (1 - item.book.discount / 100);
                    return (
                        <div
                            className="order-book"
                            key={`index-${item.id}`}
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
                                            <InputNumber
                                                onChange={(value) =>
                                                    handleOnChangeInput(
                                                        value as number,
                                                        item.book
                                                    )
                                                }
                                                value={item.quantity}
                                                max={item.book.quantity}
                                                min={1}
                                            />
                                        </div>
                                        <div className="sum">
                                            Tổng:{" "}
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(
                                                currentBookPrice *
                                                    (item?.quantity ?? 0)
                                            )}
                                        </div>
                                        <DeleteTwoTone
                                            style={{ cursor: "pointer" }}
                                            onClick={() =>
                                                handleRemoveBook(item.book.id)
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
                                                <InputNumber
                                                    onChange={(value) =>
                                                        handleOnChangeInput(
                                                            value as number,
                                                            item.book
                                                        )
                                                    }
                                                    value={item.quantity}
                                                />
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
                                            currentBookPrice *
                                                (item.quantity ?? 0)
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
                {carts.length === 0 && (
                    <div className="order-book-empty">
                        <Empty
                            description={"Không có sản phẩm trong giỏ hàng"}
                        />
                    </div>
                )}
            </Col>
            <Col md={6} xs={24}>
                <div className="order-sum">
                    <div className="calculate">
                        <span> Tạm tính</span>
                        <span>
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
                    {/* <button
                        // disabled={carts.length === 0}
                        // onClick={() => setCurrentStep(1)}
                        onClick={() => handleNextStep()}
                    >
                        Mua Hàng ({carts?.length ?? 0})
                    </button> */}
                    <Button
                        color="danger"
                        variant="solid"
                        onClick={() => handleNextStep()}
                        // loading={true}
                    >
                        Mua Hàng ({carts?.length ?? 0})
                    </Button>
                </div>
            </Col>
        </Row>
    );
};

export default OrderDetail;
