import { Col, Divider, message, notification, Rate, Row } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { BsCartPlus } from "react-icons/bs";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"; // Sửa import
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { useEffect, useState } from "react";
import { IBook } from "@/types/backend";
import "styles/book.scss";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/redux/hook";
import { addToCart } from "@/redux/slice/cartSlice";

interface IProps {
    bookData: IBook | null;
}

type UserAction = "PLUS" | "MINUS";

const BookDetail = (props: IProps) => {
    const { bookData } = props;
    const [isOpenLightbox, setIsOpenLightbox] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [currentQuantity, setCurrentQuantity] = useState<number>(1);

    const [images, setImages] = useState<
        { src: string; width: number; height: number }[]
    >([]);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (bookData) {
            const bookImage = bookData
                ? [
                      { src: bookData.thumbnail, width: 800, height: 600 },
                      ...bookData.slider.map((url) => ({
                          src: url,
                          width: 800,
                          height: 600,
                      })),
                  ]
                : [];

            setImages(bookImage);
        }
    }, [bookData]);

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        // Cho phép ô trống tạm thời khi đang nhập
        if (inputValue === "") {
            setCurrentQuantity(0);
            return;
        }

        // Loại bỏ các ký tự không phải số
        const numericValue = inputValue.replace(/[^0-9]/g, "");

        // Nếu sau khi loại bỏ ký tự không hợp lệ mà còn lại chuỗi rỗng
        if (numericValue === "") {
            setCurrentQuantity(0);
            return;
        }

        const parsedValue = parseInt(numericValue, 10);

        // Kiểm tra giới hạn tối đa
        if (bookData?.quantity) {
            if (parsedValue <= bookData.quantity) {
                setCurrentQuantity(parsedValue);
            } else {
                // Nếu vượt quá giới hạn, set về giá trị tối đa
                setCurrentQuantity(bookData.quantity);
            }
        } else {
            setCurrentQuantity(parsedValue);
        }
    };

    const handleBlurInput = () => {
        // Khi rời khỏi ô input, kiểm tra và điều chỉnh giá trị
        if (!currentQuantity || currentQuantity < 1) {
            setCurrentQuantity(1);
        } else if (bookData?.quantity && currentQuantity > bookData.quantity) {
            setCurrentQuantity(bookData.quantity);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Cho phép: Backspace, Delete, Tab, Escape, Enter, Home, End, Arrow keys
        const allowedKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "Escape",
            "Enter",
            "Home",
            "End",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
        ];

        // Cho phép Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if (
            event.ctrlKey &&
            ["a", "c", "v", "x"].includes(event.key.toLowerCase())
        ) {
            return;
        }

        // Nếu không phải phím được phép và không phải số
        if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pastedText = event.clipboardData.getData("text");
        const numericText = pastedText.replace(/[^0-9]/g, "");

        if (numericText) {
            const parsedValue = parseInt(numericText, 10);
            if (bookData?.quantity) {
                if (parsedValue <= bookData.quantity && parsedValue > 0) {
                    setCurrentQuantity(parsedValue);
                } else if (parsedValue > bookData.quantity) {
                    setCurrentQuantity(bookData.quantity);
                } else {
                    setCurrentQuantity(1);
                }
            } else {
                setCurrentQuantity(parsedValue > 0 ? parsedValue : 1);
            }
        }
    };

    const handleChangeButton = (type: UserAction) => {
        if (type === "MINUS") {
            if (currentQuantity >= 2) {
                setCurrentQuantity(currentQuantity - 1);
            }
        }

        if (type === "PLUS") {
            if (bookData?.quantity) {
                if (currentQuantity < bookData.quantity) {
                    setCurrentQuantity(currentQuantity + 1);
                }
            }
        }
    };

    const handleAddToCart = async (quantity: number, book: IBook) => {
        try {
            await dispatch(addToCart({ bookId: book.id, quantity })).unwrap();
            message.success("Sản phẩm đã được thêm vào giỏ hàng");
        } catch (error) {
            console.log(">>> check error when add to cart:", error);
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: error as string,
            });
        }
    };

    const handleBuyNow = async (quantity: number, book: IBook) => {
        // const res = await addToCartAPI({ quantity, product: laptop.id });
        // if (res.data) {
        //     // message.success("Sản phẩm đã được thêm vào giỏ hàng");
        //     // dispatch(doAddToCartAction({ quantity, laptop }));
        //     navigate("/order");
        // } else {
        //     notification.error({
        //         message: "Đã có lỗi xảy ra",
        //         description: res.message,
        //     });
        // }

        try {
            await dispatch(addToCart({ bookId: book.id, quantity })).unwrap();
            // message.success("Sản phẩm đã được thêm vào giỏ hàng");
            navigate("/order");
        } catch (error) {
            // console.log(">>> check error when add to cart:", error);
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: error as string,
            });
        }
    };

    return (
        <div style={{ background: "#efefef", padding: "20px 0" }}>
            <div
                className="view-detail-book"
                style={{
                    maxWidth: 1440,
                    margin: "0 auto",
                    minHeight: "calc(100vh - 150px)",
                }}
            >
                <div
                    style={{
                        padding: "20px",
                        background: "#fff",
                        borderRadius: 5,
                    }}
                >
                    <Row gutter={20}>
                        <Col md={10} sm={0} xs={0}>
                            {/* Hiển thị ảnh chính với kích thước cố định */}
                            <div
                                className="original-image"
                                style={{ cursor: "pointer" }}
                            >
                                {images.length > 0 && (
                                    <img
                                        src={images[currentIndex].src}
                                        alt={bookData?.title}
                                        style={{
                                            width: "100%",
                                            height: "400px",
                                            objectFit: "contain",
                                        }}
                                        onClick={() => setIsOpenLightbox(true)}
                                    />
                                )}
                                {/* Danh sách ảnh nhỏ bên dưới với kích thước cố định */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        marginTop: "10px",
                                        overflowX: "auto",
                                    }}
                                >
                                    {images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img.src}
                                            alt={`Thumbnail ${index}`}
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                                border:
                                                    currentIndex === index
                                                        ? "2px solid #1890ff"
                                                        : "1px solid #ddd",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                setCurrentIndex(index)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </Col>
                        <Col md={14} sm={24}>
                            <Col md={0} sm={24} xs={24}>
                                {/* Hiển thị ảnh chính cho màn hình nhỏ với kích thước cố định */}
                                <div
                                    className="original-image"
                                    style={{ cursor: "pointer" }}
                                >
                                    {images.length > 0 && (
                                        <img
                                            src={images[currentIndex].src}
                                            alt={bookData?.title}
                                            style={{
                                                width: "100%",
                                                height: "400px",
                                                objectFit: "contain",
                                            }}
                                            onClick={() =>
                                                setIsOpenLightbox(true)
                                            }
                                        />
                                    )}
                                    {/* Danh sách ảnh nhỏ bên dưới với kích thước cố định */}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            marginTop: "10px",
                                            overflowX: "auto",
                                        }}
                                    >
                                        {images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img.src}
                                                alt={`Thumbnail ${index}`}
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    objectFit: "cover",
                                                    border:
                                                        currentIndex === index
                                                            ? "2px solid #1890ff"
                                                            : "1px solid #ddd",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    setCurrentIndex(index)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="author">
                                    Tác giả: <a href="#">{bookData?.author}</a>{" "}
                                </div>
                                <div className="title">{bookData?.title}</div>
                                <div className="rating">
                                    <Rate
                                        value={5}
                                        disabled
                                        style={{
                                            color: "#ffce3d",
                                            fontSize: 12,
                                        }}
                                    />
                                    <span className="sold">
                                        <Divider type="vertical" />
                                        Đã bán {bookData?.sold ?? 0}
                                    </span>
                                </div>
                                <div className="price">
                                    <span className="currency">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(bookData?.price ?? 0)}
                                    </span>
                                </div>
                                <div className="delivery">
                                    <div>
                                        <span className="left-side">
                                            Vận chuyển
                                        </span>
                                        <span className="right-side">
                                            Miễn phí vận chuyển
                                        </span>
                                    </div>
                                </div>
                                <div className="quantity">
                                    <span className="left-side">Số lượng</span>
                                    <span className="right-side">
                                        <button
                                            onClick={() =>
                                                handleChangeButton("MINUS")
                                            }
                                        >
                                            <MinusOutlined />
                                        </button>
                                        <input
                                            type="text" // Sử dụng text thay vì number
                                            value={
                                                currentQuantity === 0
                                                    ? ""
                                                    : currentQuantity.toString()
                                            }
                                            onChange={handleChangeInput}
                                            onBlur={handleBlurInput}
                                            onKeyDown={handleKeyDown}
                                            onPaste={handlePaste}
                                            // placeholder="1"
                                            style={{ textAlign: "center" }} // Căn giữa text
                                        />

                                        <button
                                            onClick={() =>
                                                handleChangeButton("PLUS")
                                            }
                                        >
                                            <PlusOutlined />
                                        </button>
                                    </span>
                                </div>
                                <div className="buy">
                                    <button
                                        className="cart"
                                        onClick={() =>
                                            handleAddToCart(
                                                currentQuantity,
                                                bookData!
                                            )
                                        }
                                    >
                                        <BsCartPlus className="icon-cart" />
                                        <span>Thêm vào giỏ hàng</span>
                                    </button>
                                    <button
                                        className="now"
                                        onClick={() =>
                                            handleBuyNow(
                                                currentQuantity,
                                                bookData!
                                            )
                                        }
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </div>
            </div>

            <Lightbox
                open={isOpenLightbox}
                close={() => setIsOpenLightbox(false)}
                slides={images}
                index={currentIndex}
                plugins={images.length >= 5 ? [Thumbnails, Counter] : [Counter]}
                counter={{ container: { style: { top: "unset", bottom: 0 } } }}
                thumbnails={
                    images.length >= 5
                        ? {
                              position: "bottom",
                              width: 120,
                              height: 80,
                              border: 1,
                              borderRadius: 4,
                              padding: 4,
                              gap: 16,
                              showToggle: false,
                          }
                        : undefined
                }
                on={{
                    view: ({ index }) => setCurrentIndex(index), // Đồng bộ khi user lướt trong lightbox
                }}
                carousel={{
                    finite: images.length < 5, // Cho phép loop vô hạn
                    preload: Math.min(2, images.length - 1), // Preload 2 ảnh trước/sau
                }}
                styles={{
                    container: {
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    },
                    button: { color: "#fff", background: "rgba(0, 0, 0, 0.3)" },
                    slide: {
                        maxHeight: "calc(100vh-200px)",
                    },
                }}
                render={{
                    slide: ({ slide }) => (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position: "relative",
                                width: "100%",
                                maxWidth: "900px",
                                // aspectRatio: "3 / 2", // Tạo giao diện inline trong modal
                                margin: "0 auto",
                            }}
                        >
                            <img
                                src={slide.src}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                                alt="Book Image"
                            />
                        </div>
                    ),
                }}
            />
        </div>
    );
};

export default BookDetail;
