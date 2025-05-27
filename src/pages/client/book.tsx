import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { IBook } from "@/types/backend";
import { fetchBookByIdAPI } from "@/services/api";
import BookLoader from "@/components/client/book/book.loader";
import BookDetail from "@/components/client/book/book.detail";
import { notification } from "antd";

const BookPage = () => {
    // const { slug } = useParams();
    // console.log(">>> check params:", params);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id"); // Lấy id từ query parameter (?id=12)

    const [bookData, setBookData] = useState<IBook | null>(null);
    const [isLoadingBook, setIsLoadingBook] = useState<boolean>(false);

    useEffect(() => {
        console.log(">>> check id:", id);
        // console.log(">>> check slug:", slug);
        if (id) {
            const fetchBook = async () => {
                setIsLoadingBook(true);
                const res = await fetchBookByIdAPI(parseInt(id));
                if (res.data) {
                    setBookData(res.data);
                } else {
                    notification.error({
                        message: "Đã có lỗi xảy ra",
                        description: res.message,
                    });
                }
                setIsLoadingBook(false);
            };

            fetchBook();
        }
    }, [id]);

    return (
        <div>
            {isLoadingBook ? (
                <BookLoader />
            ) : (
                <BookDetail bookData={bookData} />
            )}
        </div>
    );
};

export default BookPage;
