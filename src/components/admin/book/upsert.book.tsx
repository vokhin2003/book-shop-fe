import {
  Breadcrumb,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Form,
  GetProp,
  Image,
  Row,
  Upload,
  UploadFile,
  UploadProps,
  message,
  notification,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FooterToolbar,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from "@ant-design/pro-components";
import styles from "styles/admin.module.scss";
import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  CheckSquareOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import enUS from "antd/lib/locale/en_US";
import dayjs from "dayjs";
import { IBook, IBookRequest, ICategory } from "@/types/backend";
import {
  createBookAPI,
  fetchBookByIdAPI,
  fetchCategoryAPI,
  updateBookAPI,
  uploadFileAPI,
} from "@/services/api";
import { UploadChangeParam } from "antd/es/upload";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { MAX_UPLOAD_IMAGE_SIZE } from "@/services/helper";
import { v4 as uuidv4 } from "uuid";

interface ICategorySelect {
  label: string;
  value: number;
  key?: number;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

type UserUploadType = "thumbnail" | "slider";

const ViewUpsertBook = (props: any) => {
  const [categories, setCategories] = useState<ICategorySelect[]>([]);

  const navigate = useNavigate();
  const [value, setValue] = useState<string>("");

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params?.get("id");
  const [dataUpdate, setDataUpdate] = useState<IBook | null>(null);
  const [form] = Form.useForm();

  const [loadingThumbnail, setLoadingThumbnail] = useState<boolean>(false);
  const [loadingSlider, setLoadingSlider] = useState<boolean>(false);

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const [fileListThumbnail, setFileListThumbnail] = useState<UploadFile[]>([]);
  const [fileListSlider, setFileListSlider] = useState<UploadFile[]>([]);

  useEffect(() => {
    const init = async () => {
      if (id) {
        const res = await fetchBookByIdAPI(parseInt(id));
        if (res && res.data) {
          setDataUpdate(res.data);
          if (res.data.description) {
            setValue(res.data.description);
          }

          const arrThumbnail = res.data.thumbnail
            ? [
                {
                  uid: uuidv4(),
                  name: res.data.thumbnail,
                  status: "done",
                  url: res.data.thumbnail,
                },
              ]
            : [];

          const arrSlider = res.data.slider.map((item) => ({
            uid: uuidv4(),
            name: item,
            status: "done",
            url: item,
          }));

          console.log(">>> arrThumbnail:", arrThumbnail);
          console.log(">>> arrSlider:", arrSlider);

          form.setFieldsValue({
            ...res.data,
            category: res.data.category?.id,
            // QUAN TRỌNG: Convert ISO string thành dayjs object
            publicationDate: res.data.publicationDate
              ? dayjs(res.data.publicationDate)
              : null,
            thumbnail: arrThumbnail,
            slider: arrSlider,
          });

          setFileListSlider(arrSlider as UploadFile[]);
          setFileListThumbnail(arrThumbnail as UploadFile[]);
        }
      }
    };
    init();
    return () => form.resetFields();
  }, [id]);

  useEffect(() => {
    const fetchCate = async () => {
      const res = await fetchCategoryAPI("page=1&size=100");
      if (res.data) {
        const temp: ICategorySelect[] = res.data?.result.map(
          (item: ICategory) => {
            return {
              label: item.name,
              value: item.id,
              key: item.id,
            };
          }
        );
        setCategories(temp);
      }
    };

    fetchCate();
  }, []);

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < MAX_UPLOAD_IMAGE_SIZE;
    if (!isLt2M) {
      message.error(`Image must smaller than ${MAX_UPLOAD_IMAGE_SIZE}MB!`);
    }
    return (isJpgOrPng && isLt2M) || Upload.LIST_IGNORE;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange = (info: UploadChangeParam, type: UserUploadType) => {
    if (info.file.status === "uploading") {
      if (type === "slider") {
        setLoadingSlider(true);
      } else {
        setLoadingThumbnail(true);
      }
      return;
    }

    if (info.file.status === "done") {
      // console.log(">>> file done");
      if (type === "slider") {
        setLoadingSlider(false);
      } else {
        setLoadingThumbnail(false);
      }
    }

    return;
  };

  const handleUploadFile = async (
    options: RcCustomRequestOptions,
    type: UserUploadType
  ) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;
    const res = await uploadFileAPI(file, "book");

    if (res.data) {
      const uploadedFile: any = {
        uid: file.uid,
        name: res.data.fileName,
        status: "done",
        url: res.data.url,
      };

      if (type === "thumbnail") {
        setFileListThumbnail([{ ...uploadedFile }]);
      } else {
        setFileListSlider((prev) => [...prev, { ...uploadedFile }]);
      }

      if (onSuccess) {
        onSuccess("oke");
      }
    } else {
      message.error(res.message);
    }
  };

  const handleRemove = async (file: UploadFile, type: UserUploadType) => {
    if (type === "thumbnail") {
      setFileListThumbnail([]);
    }

    if (type === "slider") {
      const newSlider = fileListSlider.filter((f) => f.uid !== file.uid);
      setFileListSlider(newSlider);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const onFinish = async (values: any) => {
    // console.log(">>> values:", values);

    console.log(">>> fileListThumbnail:", fileListThumbnail);
    console.log(">>> fileListSlider:", fileListSlider);

    const thumbnail = fileListThumbnail[0].url;
    const slider = fileListSlider.map((item) => item.url);

    const submitData: IBookRequest = {
      ...values,
      publicationDate: values.publicationDate
        ? dayjs(values.publicationDate).toISOString()
        : null,
      thumbnail,
      slider,
    };

    console.log(">>> submitData:", submitData);

    if (dataUpdate?.id) {
      //update

      const res = await updateBookAPI(dataUpdate.id, submitData);
      if (res.data) {
        message.success("Cập nhật book thành công");
        navigate("/admin/book");
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    } else {
      //create
      const res = await createBookAPI(submitData);
      if (res.data) {
        message.success("Tạo mới book thành công");
        navigate("/admin/book");
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  return (
    <div className={styles["upsert-book-container"]}>
      <div className={styles["title"]}>
        <Breadcrumb
          separator=">"
          items={[
            {
              title: <Link to="/admin/book">Quản lý sách</Link>,
            },
            {
              title: dataUpdate?.id ? "Cập nhật sách" : "Thêm sách",
            },
          ]}
        />
      </div>
      <div>
        <ConfigProvider locale={enUS}>
          <ProForm
            form={form}
            onFinish={onFinish}
            submitter={{
              searchConfig: {
                resetText: "Hủy",
                submitText: (
                  <>{dataUpdate?.id ? "Cập nhật Book" : "Tạo mới Book"}</>
                ),
              },
              onReset: () => navigate("/admin/book"),
              render: (_: any, dom: any) => (
                <FooterToolbar>{dom}</FooterToolbar>
              ),
              submitButtonProps: {
                icon: <CheckSquareOutlined />,
              },
            }}
          >
            <Row gutter={[20, 20]}>
              <Col span={24} md={12}>
                <ProFormText
                  label="Tên book"
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập tên book"
                />
              </Col>
              <Col span={24} md={6}>
                <ProFormText
                  label="Tên tác giả"
                  name="author"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập tên tác giả"
                />
              </Col>

              <Col span={24} md={6}>
                <ProFormSelect
                  name="category"
                  label="Thể loại"
                  options={categories}
                  placeholder="Please select a category"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn thể loại",
                    },
                  ]}
                />
              </Col>
              <Col span={24} md={6}>
                <ProFormDigit
                  label="Giá gốc"
                  name="price"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập giá"
                  fieldProps={{
                    addonAfter: "đ",
                    formatter: (value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    parser: (value) =>
                      +(value || "").replace(/\$\s?|(,*)/g, ""),
                  }}
                />
              </Col>

              <Col span={24} md={6}>
                <ProFormDigit
                  label="Giảm giá"
                  name="discount"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập phần trăm giảm giá"
                  fieldProps={{
                    addonAfter: "%",
                    // min: 0,
                    max: 100,
                  }}
                />
              </Col>

              <Col span={24} md={6}>
                <ProFormDigit
                  label="Số lượng"
                  name="quantity"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập số lượng"
                />
              </Col>

              <Col span={24} md={6}>
                <ProFormDigit
                  label="Đã bán"
                  name="sold"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập số lượng đã bán"
                />
              </Col>

              <Col span={24} md={12}>
                <ProFormText
                  label="Nhà xuất bản"
                  name="publisher"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập tên nhà xuất bản"
                />
              </Col>

              <Col span={24} md={6}>
                <ProFormDigit
                  label="Độ tuổi"
                  name="age"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập độ tuổi"
                  fieldProps={{
                    min: 1,
                  }}
                />
              </Col>

              {/* <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày xuất bản"
                                    name="publicationDate"
                                    normalize={(value) =>
                                        value && dayjs(value, "DD/MM/YYYY")
                                    }
                                    fieldProps={{
                                        format: "DD/MM/YYYY",
                                    }}
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng chọn ngày xuất bản",
                                        },
                                    ]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col> */}

              <Col span={24} md={6}>
                <Form.Item
                  label="Ngày xuất bản"
                  name="publicationDate"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ngày xuất bản",
                    },
                  ]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="dd/mm/yyyy"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col span={24} md={6}>
                <ProFormDigit
                  label="Số trang"
                  name="pageCount"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập số trang"
                />
              </Col>

              <Col span={24} md={6}>
                <ProFormText
                  label="Loại bìa"
                  name="coverType"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng không bỏ trống",
                    },
                  ]}
                  placeholder="Nhập tên loại bìa"
                />
              </Col>
              <Col span={24} md={12}></Col>

              <Col span={24} md={12}>
                <Form.Item
                  label="Ảnh thumbnail"
                  name="thumbnail"
                  labelCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng upload thumbnail!",
                    },
                  ]}
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    listType="picture-card"
                    className="avatar-uploader"
                    maxCount={1}
                    multiple={false}
                    customRequest={(options) =>
                      handleUploadFile(options, "thumbnail")
                    }
                    beforeUpload={beforeUpload}
                    onChange={(info) => handleChange(info, "thumbnail")}
                    onPreview={handlePreview}
                    onRemove={(file) => handleRemove(file, "thumbnail")}
                    fileList={fileListThumbnail}
                  >
                    <div>
                      {loadingThumbnail ? (
                        <LoadingOutlined />
                      ) : (
                        <PlusOutlined />
                      )}
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  label="Ảnh Slider"
                  name="slider"
                  labelCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng upload slider!",
                    },
                  ]}
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    multiple
                    name="slider"
                    listType="picture-card"
                    className="avatar-uploader"
                    customRequest={(options) =>
                      handleUploadFile(options, "slider")
                    }
                    beforeUpload={beforeUpload}
                    onChange={(info) => handleChange(info, "slider")}
                    onRemove={(file) => handleRemove(file, "slider")}
                    onPreview={handlePreview}
                    fileList={fileListSlider}
                  >
                    <div>
                      {loadingSlider ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[20, 20]}>
              <Col span={24}>
                <ProForm.Item
                  name="description"
                  label="Mô tả sách"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mô tả sách",
                    },
                  ]}
                >
                  <ReactQuill theme="snow" value={value} onChange={setValue} />
                </ProForm.Item>
              </Col>
            </Row>
            <Divider />
          </ProForm>
        </ConfigProvider>
      </div>

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
};

export default ViewUpsertBook;
