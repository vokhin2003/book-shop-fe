import { Tabs, TabsProps } from "antd";
import BookPage from "./book";
import CategoryPage from "./category";

const BookTab = () => {
    const onChange = (key: string) => {
        // console.log(key);
    };

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "Manage book",
            children: <BookPage />,
        },
        {
            key: "2",
            label: "Manage category",
            children: <CategoryPage />,
        },
    ];
    return (
        <div>
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </div>
    );
};

export default BookTab;
