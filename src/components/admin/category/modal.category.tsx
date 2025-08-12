import {
  createCategoryAPI,
  updateCategoryAPI,
  uploadFileAPI,
} from "@/services/api";
import { MAX_UPLOAD_IMAGE_SIZE } from "@/services/helper";
import { ICategory } from "@/types/backend";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Col,
  Divider,
  Form,
  GetProp,
  Image,
  Input,
  message,
  Modal,
  notification,
  Row,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";

import { UploadChangeParam } from "antd/es/upload";
import { FormProps } from "antd/lib";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: ICategory | null;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

type FieldType = {
  name: string;
  thumbnail?: string;
  description?: string;
};

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const { TextArea } = Input;

const ModalCategory = (props: IProps) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [form] = Form.useForm();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const [loadingThumbnail, setLoadingThumbnail] = useState<boolean>(false);
  const [fileListThumbnail, setFileListThumbnail] = useState<UploadFile[]>([]);

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

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === "uploading") {
      setLoadingThumbnail(true);
      return;
    }

    if (info.file.status === "done") {
      setLoadingThumbnail(false);
    }

    return;
  };

  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;
    const res = await uploadFileAPI(file, "category");

    if (res.data) {
      const uploadedFile: any = {
        uid: file.uid,
        name: res.data.fileName,
        status: "done",
        url: res.data.url,
      };

      setFileListThumbnail([{ ...uploadedFile }]);

      if (onSuccess) {
        onSuccess("oke");
      }
    } else {
      message.error(res.message);
    }
  };

  const handleRemove = async (file: UploadFile) => {
    setFileListThumbnail([]);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  useEffect(() => {
    if (dataInit) {
      const arrThumbnail = dataInit?.thumbnail
        ? [
            {
              uid: uuidv4(),
              name: dataInit.thumbnail,
              status: "done",
              url: dataInit.thumbnail,
            },
          ]
        : [];

      form.setFieldsValue({
        name: dataInit.name,
        description: dataInit.description,
        thumbnail: arrThumbnail,
      });

      setFileListThumbnail(arrThumbnail as UploadFile[]);
    }
  }, [dataInit, form]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { name, description } = values;
    console.log(">>> check values:", values);
    console.log(">>> check file list:", fileListThumbnail[0]);
    const thumbnail = fileListThumbnail[0].url;

    if (dataInit?.id) {
      //update
      const res = await updateCategoryAPI(
        dataInit.id,
        name,
        thumbnail,
        description
      );
      if (res.data) {
        message.success("Cập nhật category thành công");
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    } else {
      //create
      const res = await createCategoryAPI(name, thumbnail, description);
      if (res.data) {
        message.success("Thêm mới category thành công");
        handleReset();
        reloadTable();
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message,
        });
      }
    }
  };

  const handleReset = async () => {
    form.resetFields();
    setDataInit(null);
    setOpenModal(false);
    setFileListThumbnail([]);
  };

  return (
    <>
      <Modal
        title={<>{dataInit?.id ? "Cập nhật Category" : "Tạo mới Category"}</>}
        open={openModal}
        okText={dataInit?.id ? "Cập nhật" : "Tạo mới"}
        cancelText={"Hủy"}
        onCancel={() => {
          handleReset();
        }}
        maskClosable={false}
        onOk={() => {
          form.submit();
        }}
        style={{ top: 50 }}
      >
        <Divider />
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 24,
          }}
          // style={{
          //     maxWidth: 600,
          // }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={15}>
            <Col span={24}>
              <Form.Item<FieldType>
                label="Tên category"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng không bỏ trống",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item<FieldType>
                label="Mô tả"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tác giả!",
                  },
                ]}
              >
                <TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<FieldType>
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
                  customRequest={handleUploadFile}
                  beforeUpload={beforeUpload}
                  onChange={handleChange}
                  onPreview={handlePreview}
                  onRemove={handleRemove}
                  fileList={fileListThumbnail}
                >
                  <div>
                    {loadingThumbnail ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
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
      </Modal>
    </>
  );
};

export default ModalCategory;
