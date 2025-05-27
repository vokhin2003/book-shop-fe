import { Col, Divider, Rate, Row } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { BsCartPlus } from "react-icons/bs";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"; // Sửa import
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/thumbnails.css"; // Thêm CSS
import { useState } from "react";
import { IBook } from "@/types/backend";
import "styles/book.scss";

interface IProps {
    bookData: IBook | null;
}

const BookDetail = (props: IProps) => {
    const { bookData } = props;
    const [isOpenLightbox, setIsOpenLightbox] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Tạo danh sách ảnh từ thumbnail và slider
    const images = bookData
        ? [
              { src: bookData.thumbnail, width: 800, height: 600 },
              ...bookData.slider.map((url) => ({
                  src: url,
                  width: 800,
                  height: 600,
              })),
          ]
        : [];

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
                        </Col>
                    </Row>
                </div>
            </div>
            {/* Modal Lightbox khi zoom ảnh */}
            <Lightbox
            // plugins={[Thumbnails]}
            // open={isOpenLightbox}
            // close={() => setIsOpenLightbox(false)}
            // index={currentIndex}
            // slides={images}
            // on={{
            //     index: (index) => setCurrentIndex(index), // Sửa lỗi TypeScript
            // }}
            // render={{
            //     slide: ({ slide }) => (
            //         <div
            //             style={{
            //                 display: "flex",
            //                 flexDirection: "column",
            //                 alignItems: "center",
            //                 position: "relative",
            //                 width: "100%",
            //                 maxWidth: "900px",
            //                 aspectRatio: "3 / 2", // Tạo giao diện inline trong modal
            //                 margin: "0 auto",
            //             }}
            //         >
            //             <img
            //                 src={slide.src}
            //                 style={{
            //                     width: "100%",
            //                     height: "100%",
            //                     objectFit: "contain",
            //                 }}
            //                 alt="Book Image"
            //             />
            //             {/* Danh sách ảnh nhỏ tĩnh bên dưới */}
            //             <div
            //                 className="thumbnail-container"
            //                 style={{
            //                     position: "absolute",
            //                     bottom: "10px",
            //                     display: "flex",
            //                     gap: "10px",
            //                     maxWidth: "90%",
            //                     background: "rgba(0, 0, 0, 0.5)",
            //                     padding: "10px",
            //                     alignItems: "center",
            //                 }}
            //             >
            //                 {images.map((img, idx) => (
            //                     <img
            //                         key={idx}
            //                         src={img.src}
            //                         style={{
            //                             width: "60px",
            //                             height: "60px",
            //                             objectFit: "cover",
            //                             border:
            //                                 currentIndex === idx
            //                                     ? "2px solid #1890ff"
            //                                     : "1px solid #fff",
            //                             cursor: "pointer",
            //                         }}
            //                         onClick={() => setCurrentIndex(idx)}
            //                     />
            //                 ))}
            //             </div>
            //         </div>
            //     ),
            // }}
            // styles={{
            //     container: {
            //         backgroundColor: "rgba(0, 0, 0, 0.9)",
            //         display: "flex",
            //         justifyContent: "center",
            //         alignItems: "center",
            //     },
            //     button: { color: "#fff", background: "rgba(0, 0, 0, 0.3)" },
            // }}
            />

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
