import { IOrder, IBook, IUser } from "@/types/backend";
import {
    CheckSquareOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {
    FooterToolbar,
    ProForm,
    ProFormSelect,
    ProFormText,
    ProTable,
} from "@ant-design/pro-components";
import {
    Breadcrumb,
    Col,
    ConfigProvider,
    Form,
    Row,
    Card,
    Typography,
    Button,
    Space,
    InputNumber,
    Select,
    Modal,
    message,
    notification,
} from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import enUS from "antd/lib/locale/en_US";
import {
    createOrderAPI,
    fetchBookAPI,
    fetchOrderByIdAPI,
    fetchUserAPI,
    updateOrderAPI,
} from "@/services/api";

const { Title, Text } = Typography;
const { Option } = Select;

interface IUserSelect {
    label: string;
    value: number;
}

interface IBookSelect {
    label: string;
    value: number;
    price: number;
    quantity: number;
    discount: number;
}

interface IOrderItemForm {
    bookId: number;
    quantity: number;
    price: number;
    book: IBook;
}

enum EOrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    SHIPPING = "SHIPPING",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

const ViewUpsertOrder = () => {
    const [users, setUsers] = useState<IUserSelect[]>([]);
    const [books, setBooks] = useState<IBookSelect[]>([]);
    const [orderItems, setOrderItems] = useState<IOrderItemForm[]>([]);
    const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState<number | null>(null);
    const [itemQuantity, setItemQuantity] = useState<number>(1);

    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params?.get("id");
    const isUpdate = !!id;

    const [dataUpdate, setDataUpdate] = useState<IOrder | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        // Fetch users for dropdown
        const fetchUsers = async () => {
            try {
                const res = await fetchUserAPI("page=1&pageSize=100");
                if (res.data && res.data.result) {
                    const userOptions: IUserSelect[] = res.data.result.map(
                        (user: IUser) => ({
                            label: `${user.fullName} (${user.email})`,
                            value: user.id,
                        })
                    );
                    setUsers(userOptions);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        // Fetch books for item selection
        const fetchBooks = async () => {
            try {
                const res = await fetchBookAPI("page=1&pageSize=100");
                if (res.data && res.data.result) {
                    const bookOptions: IBookSelect[] = res.data.result.map(
                        (book: IBook) => ({
                            label: book.title,
                            value: book.id,
                            price: book.price,
                            quantity: book.quantity,
                            discount: book.discount || 0,
                        })
                    );
                    setBooks(bookOptions);
                }
            } catch (error) {
                console.error("Error fetching books:", error);
            }
        };

        fetchUsers();
        if (!isUpdate) {
            fetchBooks();
        }
    }, [isUpdate]);

    useEffect(() => {
        const init = async () => {
            if (id) {
                try {
                    const res = await fetchOrderByIdAPI(+id);
                    if (res.data) {
                        console.log(">>> check dataUpdate: ", res.data);
                        setDataUpdate(res.data);
                        setOrderItems(
                            res.data.orderItems.map((item) => ({
                                bookId: item.book.id,
                                quantity: item.quantity,
                                price: item.price,
                                book: item.book,
                            }))
                        );
                        form.setFieldsValue({
                            fullName: res.data.fullName,
                            phone: res.data.phone,
                            shippingAddress: res.data.shippingAddress,
                            status: res.data.status,
                            userId: res.data.userId,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching order:", error);
                }
            }
        };
        init();
    }, [id, form]);

    const handleAddItem = () => {
        if (!selectedBook || itemQuantity <= 0) {
            message.error("Vui lòng chọn sách và nhập số lượng hợp lệ");
            return;
        }

        const book = books.find((b) => b.value === selectedBook);
        if (!book) return;

        const newItem: IOrderItemForm = {
            bookId: selectedBook,
            quantity: itemQuantity,
            // price: book.price,
            price: book.price * (1 - book.discount / 100),
            book: {
                id: book.value,
                title: book.label,
                thumbnail: "",
                slider: [],
                author: "Author Name",
                price: book.price,
                quantity: book.quantity,
                description: null,
                category: { id: 1, name: "Books", description: "" },
                discount: 0,
                sold: 0,
                age: 0,
                publicationDate: "2024-01-01",
                publisher: "Publisher",
                pageCount: 200,
                coverType: "Hardcover",
            },
        };

        setOrderItems([...orderItems, newItem]);
        setIsAddItemModalVisible(false);
        setSelectedBook(null);
        setItemQuantity(1);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = orderItems.filter((_, i) => i !== index);
        setOrderItems(newItems);
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        const newItems = [...orderItems];
        newItems[index].quantity = quantity;
        setOrderItems(newItems);
    };

    const calculateTotals = () => {
        const subtotal = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const delivery = 30000;
        // const tax = subtotal * 0.2;

        const total = subtotal + delivery;

        return { subtotal, delivery, total };
    };

    const onFinish = async (values: any) => {
        if (!isUpdate && orderItems.length === 0) {
            message.error("Vui lòng thêm ít nhất một sản phẩm vào đơn hàng");
            return;
        }

        const { fullName, phone, shippingAddress, userId } = values;

        // const { total } = calculateTotals();
        // const orderData = {
        //     ...values,
        //     totalAmount: total,
        //     items: orderItems.map((item) => ({
        //         bookId: item.bookId,
        //         quantity: item.quantity,
        //     })),
        // };

        // console.log(">>> check orderData: ", orderData);

        if (dataUpdate?.id) {
            const updateOrderData = {
                fullName,
                phone,
                shippingAddress,
                status: values.status,
            };
            // Update order - only allow updating recipient info and status
            const res = await updateOrderAPI(dataUpdate.id, updateOrderData);
            if (res.data) {
                message.success("Cập nhật đơn hàng thành công");
                navigate("/admin/order");
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message || "Vui lòng thử lại sau",
                });
            }

            // navigate("/admin/order");
        } else {
            const createOrderData = {
                fullName,
                phone,
                shippingAddress,
                paymentMethod: "COD", // Assuming COD for simplicity
                userId,
                items: orderItems.map((item) => ({
                    bookId: item.bookId,
                    quantity: item.quantity,
                })),
            };

            // console.log(">>> check createOrderData: ", createOrderData);
            // Create new order
            const res = await createOrderAPI(createOrderData);
            if (res.data) {
                message.success("Tạo mới đơn hàng thành công");
                navigate("/admin/order");
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message || "Vui lòng thử lại sau",
                });
            }
        }
    };

    const { subtotal, delivery, total } = calculateTotals();

    const orderItemColumns = [
        {
            title: "Sản phẩm",
            dataIndex: "book",
            key: "book",
            render: (book: IBook) => book.title,
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            // render: (price: number) => `$${price.toFixed(2)}`,
            render: (price: number) =>
                `${Number(price).toLocaleString("vi-VN")} đ`,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity: number, record: IOrderItemForm, index: number) =>
                isUpdate ? (
                    <Text>{quantity}</Text>
                ) : (
                    <InputNumber
                        min={1}
                        max={101}
                        value={quantity}
                        onChange={(value) =>
                            handleQuantityChange(index, value || 1)
                        }
                    />
                ),
        },
        {
            title: "Thành tiền",
            key: "total",
            // render: (record: IOrderItemForm) =>
            //     `$${(record.price * record.quantity).toFixed(2)}`,
            render: (record: IOrderItemForm) =>
                `${Number(record.price * record.quantity).toLocaleString(
                    "vi-VN"
                )} đ`,
        },
        ...(isUpdate
            ? []
            : [
                  {
                      title: "Thao tác",
                      key: "action",
                      render: (
                          _: any,
                          record: IOrderItemForm,
                          index: number
                      ) => (
                          <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveItem(index)}
                          />
                      ),
                  },
              ]),
    ];

    return (
        <div className="upsert-order-container" style={{ padding: "24px" }}>
            <div className="title" style={{ marginBottom: "24px" }}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: (
                                <Link to="/admin/order">Quản lý đơn hàng</Link>
                            ),
                        },
                        {
                            title: isUpdate
                                ? "Cập nhật đơn hàng"
                                : "Tạo đơn hàng mới",
                        },
                    ]}
                />
            </div>

            <ConfigProvider locale={enUS}>
                <ProForm
                    form={form}
                    onFinish={onFinish}
                    submitter={{
                        searchConfig: {
                            resetText: "Hủy",
                            submitText: isUpdate
                                ? "Cập nhật đơn hàng"
                                : "Tạo đơn hàng",
                        },
                        onReset: () => navigate("/admin/order"),
                        render: (_: any, dom: any) => (
                            <FooterToolbar>{dom}</FooterToolbar>
                        ),
                        submitButtonProps: {
                            icon: <CheckSquareOutlined />,
                        },
                    }}
                >
                    <Row gutter={[24, 24]}>
                        {/* Order Information */}
                        <Col span={24}>
                            <Card
                                title="Thông tin đơn hàng"
                                style={{ marginBottom: "24px" }}
                            >
                                <Row gutter={[16, 16]}>
                                    {isUpdate && (
                                        <Col span={24} md={8}>
                                            <Text strong>Mã đơn hàng: </Text>
                                            <Text>GA{dataUpdate?.id}</Text>
                                        </Col>
                                    )}
                                    <Col span={24} md={8}>
                                        <Text strong>Ngày tạo: </Text>
                                        <Text>
                                            {new Date().toLocaleDateString(
                                                "vi-VN",
                                                {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                }
                                            )}
                                        </Text>
                                    </Col>
                                    {isUpdate && (
                                        <Col span={24} md={8}>
                                            <Text strong>Trạng thái: </Text>
                                            <Text>{dataUpdate?.status}</Text>
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        </Col>

                        {/* Customer & Shipping Information */}
                        <Col span={24} lg={12}>
                            <Card
                                title="Thông tin khách hàng"
                                style={{ height: "100%" }}
                            >
                                <Row gutter={[16, 16]}>
                                    {/* {!isUpdate && (
                                        <Col span={24}>
                                            <ProFormSelect
                                                label="Khách hàng"
                                                name="userId"
                                                options={users}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng chọn khách hàng",
                                                    },
                                                ]}
                                                placeholder="Chọn khách hàng"
                                            />
                                        </Col>
                                    )} */}

                                    <Col span={24}>
                                        <ProFormSelect
                                            label="Khách hàng"
                                            name="userId"
                                            fieldProps={{
                                                disabled: isUpdate, // Disabled nếu setDataUpdate?.id tồn tại
                                            }}
                                            options={users}
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng chọn khách hàng",
                                                },
                                            ]}
                                            placeholder="Chọn khách hàng"
                                        />
                                    </Col>

                                    <Col span={24}>
                                        <ProFormText
                                            label="Tên người nhận"
                                            name="fullName"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng không bỏ trống",
                                                },
                                            ]}
                                            placeholder="Nhập tên người nhận"
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <ProFormText
                                            label="Số điện thoại"
                                            name="phone"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng không bỏ trống",
                                                },
                                            ]}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <ProFormText
                                            label="Địa chỉ giao hàng"
                                            name="shippingAddress"
                                            rules={[
                                                {
                                                    required: true,
                                                    message:
                                                        "Vui lòng không bỏ trống",
                                                },
                                            ]}
                                            placeholder="Nhập địa chỉ giao hàng"
                                        />
                                    </Col>
                                    {isUpdate && (
                                        <Col span={24}>
                                            <ProFormSelect
                                                label="Trạng thái đơn hàng"
                                                name="status"
                                                options={[
                                                    {
                                                        label: "Chờ xác nhận",
                                                        value: EOrderStatus.PENDING,
                                                    },
                                                    {
                                                        label: "Đã xác nhận",
                                                        value: EOrderStatus.CONFIRMED,
                                                    },
                                                    {
                                                        label: "Đang giao hàng",
                                                        value: EOrderStatus.SHIPPING,
                                                    },
                                                    {
                                                        label: "Đã giao hàng",
                                                        value: EOrderStatus.DELIVERED,
                                                    },
                                                    {
                                                        label: "Đã hủy",
                                                        value: EOrderStatus.CANCELLED,
                                                    },
                                                ]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Vui lòng chọn trạng thái",
                                                    },
                                                ]}
                                                placeholder="Chọn trạng thái"
                                            />
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        </Col>

                        {/* Order Summary */}
                        <Col span={24} lg={12}>
                            <Card
                                title="Tổng kết đơn hàng"
                                style={{ height: "100%" }}
                            >
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Text>Tổng tiền sản phẩm:</Text>
                                        {/* <Text>${subtotal.toFixed(2)}</Text> */}
                                        <Text>
                                            {Number(subtotal).toLocaleString(
                                                "vi-VN"
                                            )}{" "}
                                            đ
                                        </Text>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Text>Phí vận chuyển:</Text>
                                        {/* <Text>${delivery.toFixed(2)}</Text> */}
                                        <Text>
                                            {Number(delivery).toLocaleString(
                                                "vi-VN"
                                            )}{" "}
                                            đ
                                        </Text>
                                    </div>
                                    {/* <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Text>Thuế (20%):</Text>
                                        <Text>${tax.toFixed(2)}</Text>
                                    </div> */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            borderTop: "1px solid #f0f0f0",
                                            paddingTop: "8px",
                                        }}
                                    >
                                        <Text
                                            strong
                                            style={{ fontSize: "16px" }}
                                        >
                                            Tổng cộng:
                                        </Text>
                                        <Text
                                            strong
                                            style={{
                                                fontSize: "16px",
                                                color: "#ee4d2d",
                                            }}
                                        >
                                            {/* ${total.toFixed(2)} */}
                                            {Number(total).toLocaleString(
                                                "vi-VN"
                                            )}{" "}
                                            đ
                                        </Text>
                                    </div>
                                </Space>
                            </Card>
                        </Col>

                        {/* Order Items */}
                        <Col span={24}>
                            <Card
                                title={
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span>Sản phẩm trong đơn hàng</span>
                                        {!isUpdate && (
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() =>
                                                    setIsAddItemModalVisible(
                                                        true
                                                    )
                                                }
                                            >
                                                Thêm sản phẩm
                                            </Button>
                                        )}
                                    </div>
                                }
                            >
                                <ProTable
                                    dataSource={orderItems}
                                    columns={orderItemColumns}
                                    pagination={false}
                                    search={false}
                                    toolBarRender={false}
                                    rowKey={(record, index) =>
                                        `${record.bookId}-${index}`
                                    }
                                />
                            </Card>
                        </Col>
                    </Row>
                </ProForm>
            </ConfigProvider>

            {/* Add Item Modal */}
            <Modal
                title="Thêm sản phẩm vào đơn hàng"
                open={isAddItemModalVisible}
                onOk={handleAddItem}
                onCancel={() => {
                    setIsAddItemModalVisible(false);
                    setSelectedBook(null);
                    setItemQuantity(1);
                }}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                        <Text>Chọn sản phẩm:</Text>
                        <Select
                            style={{ width: "100%", marginTop: "8px" }}
                            placeholder="Chọn sản phẩm"
                            value={selectedBook}
                            onChange={setSelectedBook}
                        >
                            {books.map((book) => (
                                <Option key={book.value} value={book.value}>
                                    {book.label} -{" "}
                                    {Number(book.price).toLocaleString("vi-VN")}
                                    {`  (-${book.discount}%)`}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Text>Số lượng:</Text>
                        <InputNumber
                            style={{ width: "100%", marginTop: "8px" }}
                            min={1}
                            max={101}
                            value={itemQuantity}
                            onChange={(value) => setItemQuantity(value || 1)}
                        />
                    </div>
                </Space>
            </Modal>
        </div>
    );
};

export default ViewUpsertOrder;
