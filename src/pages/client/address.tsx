import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Modal,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Checkbox,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { IAddress, TAddressType } from "@/types/backend";
import {
  createAddressAPI,
  deleteAddressAPI,
  fetchMyAddressesAPI,
  setDefaultAddressAPI,
  updateAddressAPI,
} from "@/services/api";
import styles from "@/styles/client.address.module.scss";

const AddressPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IAddress[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IAddress | null>(null);
  const [form] = Form.useForm();
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(
    null
  );
  const [provinces, setProvinces] = useState<
    { idProvince: string; name: string }[]
  >([]);
  const [communes, setCommunes] = useState<
    { idProvince: string; idCommune: string; name: string }[]
  >([]);
  useEffect(() => {
    // load province/commune data from public
    const load = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}data/province.json`
        );
        const json = await res.json();
        setProvinces(json.province || []);
        setCommunes(json.commune || []);
      } catch {
        // no-op
      }
    };
    load();
  }, []);
  const wardOptions = useMemo(() => {
    if (!selectedProvinceId) return [] as { label: string; value: string }[];
    return communes
      .filter((c) => c.idProvince === selectedProvinceId)
      .map((c) => ({ label: c.name, value: c.name }));
  }, [selectedProvinceId, communes]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchMyAddressesAPI();
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnsType<IAddress> = useMemo(
    () => [
      {
        title: "Họ và tên",
        dataIndex: "fullName",
        width: 220,
      },
      {
        title: "Số điện thoại",
        dataIndex: "phoneNumber",
      },
      {
        title: "Địa chỉ",
        width: 420,
        render: (_, r) => (
          <span>
            {r.addressDetail}, {r.ward ? `${r.ward}, ` : ""}
            {r.province}
          </span>
        ),
      },
      {
        title: "Loại",
        dataIndex: "addressType",
        render: (t) =>
          t === "HOME" ? (
            <Tag color="blue">Nhà riêng</Tag>
          ) : (
            <Tag color="purple">Văn phòng</Tag>
          ),
      },
      {
        title: "Mặc định",
        render: (_, r) =>
          r.is_default ? <Tag color="red">Mặc định</Tag> : null,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (_, r) => (
          <Space>
            {!r.is_default && (
              <Button size="small" onClick={() => handleSetDefault(r.id)}>
                Thiết lập mặc định
              </Button>
            )}
            <Button size="small" onClick={() => onEdit(r)}>
              Cập nhật
            </Button>
            {!r.is_default && (
              <Popconfirm
                title="Xoá địa chỉ này?"
                onConfirm={() => onDelete(r.id)}
              >
                <Button size="small" danger>
                  Xoá
                </Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ],
    [data]
  );

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onEdit = (record: IAddress) => {
    setEditing(record);
    const foundProvince = provinces.find((p) =>
      record.province?.includes(p.name)
    );
    const provinceId = foundProvince?.idProvince || null;
    setSelectedProvinceId(provinceId);
    form.setFieldsValue({
      fullName: record.fullName,
      phoneNumber: record.phoneNumber,
      province: foundProvince?.name || record.province,
      ward: record.ward,
      addressDetail: record.addressDetail,
      addressType: record.addressType,
      is_default: record.is_default,
    });
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    await deleteAddressAPI(id);
    message.success("Đã xoá địa chỉ");
    fetchData();
  };

  const handleSetDefault = async (id: number) => {
    await setDefaultAddressAPI(id);
    message.success("Đã đặt làm mặc định");
    fetchData();
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload = { ...values, is_default: !!values.is_default };
    if (editing) {
      await updateAddressAPI(editing.id, payload);
      message.success("Đã cập nhật địa chỉ");
    } else {
      await createAddressAPI(payload);
      message.success("Đã thêm địa chỉ");
    }
    setOpen(false);
    fetchData();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Địa chỉ của tôi
          </Typography.Title>
          <Button type="primary" onClick={onAdd}>
            + Thêm địa chỉ mới
          </Button>
        </div>

        <Table<IAddress>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          locale={{
            emptyText: <Empty description="Chưa có địa chỉ" />,
          }}
        />
      </div>

      <Modal
        open={open}
        title={editing ? "Cập nhật địa chỉ" : "Địa chỉ mới"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Hoàn thành"
        cancelText="Trở lại"
        destroyOnClose
        maskClosable={false}
      >
        <Form layout="vertical" form={form}>
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
                  options={provinces.map((p) => ({
                    label: p.name,
                    value: p.name,
                    id: p.idProvince,
                  }))}
                  onChange={(value) => {
                    const found = provinces.find((p) => p.name === value);
                    setSelectedProvinceId(found?.idProvince || null);
                    // reset ward when province changes
                    form.setFieldValue("ward", undefined);
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
                  options={wardOptions}
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
            <Checkbox disabled={!!editing?.is_default}>
              {editing?.is_default ? (
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
    </div>
  );
};

export default AddressPage;
