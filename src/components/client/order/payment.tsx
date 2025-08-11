import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { clearCart } from "@/redux/slice/cartSlice";
import {
  createAddressAPI,
  createPaymentUrlAPI,
  fetchMyAddressesAPI,
  placeOrderAPI,
  updateAddressAPI,
} from "@/services/api";
import { IAddress, ICreateOrderRequest, TAddressType } from "@/types/backend";
import { DeleteTwoTone, LoadingOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
  FormProps,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Select,
  Tag,
  Checkbox,
  Tooltip,
  message,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

type UserMethod = "COD" | "VNPAY";
// helper type removed; using inline types in Select handlers

type FieldType = {
  paymentMethod: UserMethod;
};

// no TextArea usage in this component

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

  // Address state
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  // committed selection used outside modal and for placing orders
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const selectedAddress: IAddress | undefined = addresses.find(
    (a) => a.id === selectedAddressId
  );
  // temp selection inside modal
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState<
    number | null
  >(null);
  const [openAddressModal, setOpenAddressModal] = useState<boolean>(false);

  // Add/Edit address modal state
  const [openUpsertModal, setOpenUpsertModal] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
  const [upsertForm] = Form.useForm();
  const [provinceOptions, setProvinceOptions] = useState<
    { idProvince: string; name: string }[]
  >([]);
  const [communeOptions, setCommuneOptions] = useState<
    { idProvince: string; idCommune: string; name: string }[]
  >([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (carts?.length > 0) {
      let sum = 0;
      carts.map((item) => {
        sum +=
          item.quantity * (item.book.price * (1 - item.book.discount / 100));
      });
      setTotalPrice(sum);
    } else {
      setTotalPrice(0);
    }
  }, [carts]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        paymentMethod: "COD",
      });
    }
  }, [user, form]);

  // Load provinces/communes for upsert address modal
  useEffect(() => {
    const loadProvinceData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/province.json`
        );
        const json = await res.json();
        setProvinceOptions(json.province || []);
        setCommuneOptions(json.commune || []);
      } catch {
        // ignore
      }
    };
    loadProvinceData();
  }, []);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const res = await fetchMyAddressesAPI();
      const list = res.data || [];
      setAddresses(list);
      const defaultAddr = list.find((a) => a.is_default);
      const first = list[0];
      const chosen = defaultAddr || first;
      setSelectedAddressId((prev) =>
        prev == null ? (chosen ? chosen.id : null) : prev
      );
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleRemoveBook = (id?: number) => {
    void id; // keep signature compatible and avoid unused-var lint
    // const cartStorage = localStorage.getItem("carts");
    // if (cartStorage) {
    //     const carts = JSON.parse(cartStorage) as ICart[];
    //     const newCarts = carts.filter((item) => item._id !== _id);
    //     localStorage.setItem("carts", JSON.stringify(newCarts));
    //     setCarts(newCarts);
    // }
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    console.log(">>> values:", values);
    if (!selectedAddress) {
      message.error("Vui lòng chọn địa chỉ nhận hàng");
      return;
    }
    const items = carts.map((item) => ({
      bookId: item.book.id,
      quantity: item.quantity,
    }));

    const submitData: ICreateOrderRequest = {
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phoneNumber,
      shippingAddress: `${selectedAddress.addressDetail}, ${selectedAddress.ward}, ${selectedAddress.province}`,
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
        dispatch(clearCart());
        // Với VNPay, gọi API lấy paymentUrl
        const paymentData = {
          orderId: order.id,
          amount: Number(order.totalAmount.toFixed(2)), // Đảm bảo 99000.00
          paymentMethod: "VNPAY",
        };
        const paymentRes = await createPaymentUrlAPI(paymentData);
        if (!paymentRes.data) {
          throw new Error(paymentRes.message || "Failed to create payment URL");
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
    } catch (error: unknown) {
      const messageText =
        error instanceof Error ? error.message : "Unknown error";
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: messageText,
      });
    } finally {
      setIsSubmit(false);
    }
  };

  // Handlers for address modal
  const openEditAddress = (addr: IAddress) => {
    setEditingAddress(addr);
    // prefill form
    const foundProvince = provinceOptions.find((p) =>
      addr.province?.includes(p.name)
    );
    const provinceId = foundProvince?.idProvince || null;
    setSelectedProvinceId(provinceId);
    upsertForm.setFieldsValue({
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber,
      province: foundProvince?.name || addr.province,
      ward: addr.ward,
      addressDetail: addr.addressDetail,
      addressType: addr.addressType,
      is_default: addr.is_default,
    });
    setOpenUpsertModal(true);
  };

  const openCreateAddress = () => {
    setEditingAddress(null);
    setSelectedProvinceId(null);
    upsertForm.resetFields();
    setOpenUpsertModal(true);
  };

  const submitUpsertAddress = async () => {
    const values = await upsertForm.validateFields();
    const payload = { ...values, is_default: !!values.is_default } as {
      fullName: string;
      phoneNumber: string;
      province: string;
      ward: string;
      addressDetail: string;
      addressType: TAddressType;
      is_default: boolean;
    };
    if (editingAddress) {
      await updateAddressAPI(editingAddress.id, payload);
      message.success("Đã cập nhật địa chỉ");
    } else {
      const res = await createAddressAPI(payload);
      message.success("Đã thêm địa chỉ");
      if (res.data) setTempSelectedAddressId(res.data.id);
    }
    setOpenUpsertModal(false);
    await fetchAddresses();
  };

  const wardSelectOptions = (
    selectedProvinceId
      ? communeOptions
          .filter((c) => c.idProvince === selectedProvinceId)
          .map((c) => ({ label: c.name, value: c.name }))
      : []
  ) as { label: string; value: string }[];

  return (
    <>
      {/* Address section */}
      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 8,
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            color: "#ff4d4f",
            marginBottom: 8,
          }}
        >
          Địa Chỉ Nhận Hàng
        </div>
        {selectedAddress ? (
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {selectedAddress.fullName} (+84) {selectedAddress.phoneNumber}
            </div>
            <div style={{ flex: 1 }}>
              {`${selectedAddress.addressDetail}, ${selectedAddress.ward}, ${selectedAddress.province}`}
              {selectedAddress.is_default && (
                <Tag
                  color="red"
                  style={{ borderRadius: 4, marginLeft: "16px" }}
                >
                  Mặc định
                </Tag>
              )}
            </div>

            <Button
              type="link"
              onClick={() => {
                setTempSelectedAddressId(selectedAddressId);
                setOpenAddressModal(true);
              }}
            >
              Thay Đổi
            </Button>
          </div>
        ) : (
          <div>
            Chưa có địa chỉ.{" "}
            <Button type="link" onClick={openCreateAddress}>
              Thêm địa chỉ
            </Button>
          </div>
        )}
      </div>

      <Row gutter={20}>
        <Col md={16} xs={24}>
          {carts?.map((item, index) => {
            const currentBookPrice =
              item.book.price * (1 - item.book.discount / 100);

            // const currentBookPrice =
            // item.book.price * (1 - item.book.discount / 100);
            // const originalPrice = item.book.price;
            // const hasDiscount = item.book.discount > 0;
            return (
              <div
                className="order-book"
                key={`index-${index}`}
                style={isMobile ? { flexDirection: "column" } : {}}
              >
                {!isMobile ? (
                  <>
                    <div className="book-image">
                      <img src={item.book.thumbnail} alt={item.book.title} />
                    </div>
                    <div className="book-info">
                      <div className="book-title">{item.book.title}</div>
                      <div className="book-category">
                        Thể loại: {item.book.category?.name || "Không xác định"}
                      </div>
                      {/* <div className="book-stock">
                                    {item.book.quantity > 0
                                        ? `Còn ${item.book.quantity} sản phẩm`
                                        : "Hết hàng"}
                                </div> */}
                    </div>

                    <div className="book-price">
                      {/* {hasDiscount && (
                                            <span className="original-price">
                                                {new Intl.NumberFormat(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                ).format(originalPrice)}
                                            </span>
                                        )} */}

                      <span className="current-price">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(currentBookPrice)}
                      </span>
                    </div>

                    <div className="book-quantity">
                      <div className="quantity">Số lượng: {item.quantity}</div>
                    </div>

                    <div className="book-actions">
                      <DeleteTwoTone
                        style={{
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                        onClick={() => handleRemoveBook(item.book.id)}
                        twoToneColor="#ff4d4f"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>{item.book.title}</div>
                    <div className="book-content" style={{ width: "100%" }}>
                      <img src={item.book.thumbnail} />
                      <div className="action">
                        <div className="quantity">
                          Số lượng: {item.quantity}
                        </div>
                        <DeleteTwoTone
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => handleRemoveBook(item.id)}
                          twoToneColor="#eb2f96"
                        />
                      </div>
                    </div>
                    <div className="sum">
                      Tổng:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(currentBookPrice * item.quantity)}
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {/* Back link now shown in page header next to breadcrumb */}
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
                      <Radio value={"COD"}>Thanh toán khi nhận hàng</Radio>
                      <Radio value={"VNPAY"}>Thanh toán qua VNPAY</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
                {/* Recipient info is now selected via address above */}
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
                <button onClick={() => form.submit()} disabled={isSubmit}>
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

      {/* Address select modal */}
      <Modal
        title="Địa Chỉ Của Tôi"
        open={openAddressModal}
        onCancel={() => {
          // reset temp selection when closing without confirm
          setTempSelectedAddressId(selectedAddressId);
          setOpenAddressModal(false);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setTempSelectedAddressId(selectedAddressId);
              setOpenAddressModal(false);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              setSelectedAddressId(tempSelectedAddressId);
              setOpenAddressModal(false);
            }}
          >
            Xác nhận
          </Button>,
        ]}
        width={720}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: 12,
                border: "1px solid #f0f0f0",
                borderRadius: 6,
              }}
            >
              <Radio
                checked={tempSelectedAddressId === addr.id}
                onChange={() => setTempSelectedAddressId(addr.id)}
                style={{ marginTop: 4 }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{addr.fullName}</span>
                  <span style={{ color: "#999" }}>
                    {" "}
                    (+84) {addr.phoneNumber}
                  </span>
                  {addr.is_default && (
                    <Tag color="red" style={{ marginLeft: 8 }}>
                      Mặc định
                    </Tag>
                  )}
                  <Button
                    type="link"
                    style={{ marginLeft: "auto" }}
                    onClick={() => openEditAddress(addr)}
                  >
                    Cập nhật
                  </Button>
                </div>
                <div style={{ color: "#555" }}>
                  {`${addr.addressDetail}, ${addr.ward}, ${addr.province}`}
                </div>
              </div>
            </div>
          ))}

          <Button onClick={openCreateAddress} icon={undefined}>
            + Thêm Địa Chỉ Mới
          </Button>
        </Space>
      </Modal>

      {/* Upsert address modal */}
      <Modal
        title={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
        open={openUpsertModal}
        onCancel={() => {
          setOpenUpsertModal(false);
          setEditingAddress(null);
          setSelectedProvinceId(null);
          upsertForm.resetFields();
        }}
        onOk={submitUpsertAddress}
        okText={editingAddress ? "Cập nhật" : "Thêm"}
        width={640}
      >
        <Form layout="vertical" form={upsertForm}>
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ tên",
                },
              ]}
              style={{ width: "50%" }}
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
              ]}
              style={{ width: "50%" }}
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>
          </Space.Compact>

          <Form.Item
            label="Tỉnh/Thành phố, Phường/Xã"
            required
            style={{ marginBottom: 0 }}
          >
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item
                name="province"
                rules={[
                  {
                    required: true,
                    message: "Chọn tỉnh/thành phố",
                  },
                ]}
                style={{ width: "40%" }}
              >
                <Select
                  showSearch
                  placeholder="Tỉnh/Thành phố"
                  optionFilterProp="label"
                  options={provinceOptions.map((p) => ({
                    label: p.name,
                    value: p.name,
                    id: p.idProvince,
                  }))}
                  onChange={(value) => {
                    const found = provinceOptions.find((p) => p.name === value);
                    setSelectedProvinceId(found?.idProvince || null);
                    // reset ward when province changes
                    upsertForm.setFieldValue("ward", undefined);
                  }}
                  filterSort={(a, b) =>
                    (a?.label ?? "")
                      .toLowerCase()
                      .localeCompare((b?.label ?? "").toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item
                name="ward"
                rules={[
                  {
                    required: true,
                    message: "Chọn phường/xã",
                  },
                ]}
                style={{ width: "60%" }}
              >
                <Select
                  showSearch
                  placeholder={
                    selectedProvinceId
                      ? "Phường/Xã"
                      : "Chọn tỉnh/thành phố trước"
                  }
                  disabled={!selectedProvinceId}
                  optionFilterProp="label"
                  options={wardSelectOptions}
                  filterSort={(a, b) =>
                    (a?.label ?? "")
                      .toLowerCase()
                      .localeCompare((b?.label ?? "").toLowerCase())
                  }
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label="Địa chỉ cụ thể"
            name="addressDetail"
            rules={[{ required: true, message: "Nhập địa chỉ cụ thể" }]}
          >
            <Input.TextArea placeholder="Số nhà, tên đường..." rows={3} />
          </Form.Item>

          <Form.Item
            label="Loại địa chỉ"
            name="addressType"
            initialValue={"HOME" as TAddressType}
          >
            <Radio.Group>
              <Radio.Button value="HOME">Nhà Riêng</Radio.Button>
              <Radio.Button value="OFFICE">Văn Phòng</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="is_default" valuePropName="checked">
            <Checkbox disabled={!!editingAddress?.is_default}>
              {editingAddress?.is_default ? (
                <Tooltip title="Bạn không thể xoá nhãn Địa chỉ mặc định. Hãy đặt địa chỉ khác làm Địa chỉ mặc định của bạn nhé.">
                  <span>Đặt làm địa chỉ mặc định</span>
                </Tooltip>
              ) : (
                <span>Đặt làm địa chỉ mặc định</span>
              )}
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Payment;
