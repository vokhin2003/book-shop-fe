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
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const carts = useAppSelector((state) => state.cart.items);
    const dispatch = useAppDispatch();

    const handleOnChangeInput = async (value: number, book: IBook) => {
        if (!value || value < 1) return;
        if (!isNaN(value)) {
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
                    const originalPrice = item.book.price;
                    const hasDiscount = item.book.discount > 0;

                    return (
                        <div className="order-book" key={`index-${item.id}`}>
                            <div className="book-image">
                                <img
                                    src={item.book.thumbnail}
                                    alt={item.book.title}
                                />
                            </div>

                            <div className="book-info">
                                <div className="book-title">
                                    {item.book.title}
                                </div>
                                <div className="book-category">
                                    Thể loại:{" "}
                                    {item.book.category?.name ||
                                        "Không xác định"}
                                </div>
                                {/* <div className="book-stock">
                                    {item.book.quantity > 0
                                        ? `Còn ${item.book.quantity} sản phẩm`
                                        : "Hết hàng"}
                                </div> */}
                            </div>

                            <div className="book-price">
                                {hasDiscount && (
                                    <span className="original-price">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(originalPrice)}
                                    </span>
                                )}
                                <span className="current-price">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(currentBookPrice)}
                                </span>
                            </div>

                            <div className="book-quantity">
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
                                    size="small"
                                />
                            </div>

                            <div className="book-total">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(
                                    currentBookPrice * (item?.quantity ?? 0)
                                )}
                            </div>

                            <div className="book-actions">
                                <DeleteTwoTone
                                    style={{
                                        cursor: "pointer",
                                        fontSize: "16px",
                                    }}
                                    onClick={() =>
                                        handleRemoveBook(item.book.id)
                                    }
                                    twoToneColor="#ff4d4f"
                                />
                            </div>
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
                        <span>Tạm tính</span>
                        <span>
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(totalPrice || 0)}
                        </span>
                    </div>
                    <Divider style={{ margin: "10px 0" }} />
                    <div className="calculate">
                        <span>Tổng tiền</span>
                        <span className="sum-final">
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(totalPrice || 0)}
                        </span>
                    </div>
                    <Divider style={{ margin: "10px 0" }} />
                    <button
                        disabled={carts.length === 0}
                        onClick={() => handleNextStep()}
                    >
                        Mua Hàng ({carts?.length ?? 0})
                    </button>
                </div>
            </Col>
        </Row>
    );
};

export default OrderDetail;
