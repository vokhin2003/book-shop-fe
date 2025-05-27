import { createCategoryAPI, updateCategoryAPI } from "@/services/api";
import { ICategory } from "@/types/backend";
import {
    ModalForm,
    ProFormText,
    ProFormTextArea,
} from "@ant-design/pro-components";
import { Col, Form, message, notification, Row } from "antd";
import { isMobile } from "react-device-detect";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: ICategory | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalCategory = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } =
        props;
    const [form] = Form.useForm();

    const submitCategory = async (valuesForm: any) => {
        const { name, description } = valuesForm;
        if (dataInit?.id) {
            //update
            const res = await updateCategoryAPI(dataInit.id, name, description);
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
            const res = await createCategoryAPI(name, description);
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
    };

    return (
        <>
            <ModalForm
                title={
                    <>
                        {dataInit?.id
                            ? "Cập nhật Category"
                            : "Tạo mới Category"}
                    </>
                }
                open={openModal}
                modalProps={{
                    onCancel: () => {
                        handleReset();
                    },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 600,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy",
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitCategory}
                initialValues={dataInit?.id ? dataInit : {}}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <ProFormText
                            label="Tên category"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng không bỏ trống",
                                },
                            ]}
                            placeholder="Nhập tên category"
                        />
                    </Col>

                    <Col span={24}>
                        <ProFormTextArea
                            label="Mô tả"
                            name="description"
                            placeholder="Nhập mô tả cho category"
                            fieldProps={{
                                autoSize: {
                                    minRows: 3,
                                    maxRows: 7,
                                },
                            }}
                        />
                    </Col>
                </Row>
            </ModalForm>
        </>
    );
};

export default ModalCategory;
