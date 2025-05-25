import { createUserAPI, fetchRoleAPI, updateUserAPI } from "@/services/api";
import { IRole, IUser } from "@/types/backend";
import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormSelect,
    ProFormText,
} from "@ant-design/pro-components";
import { Col, Form, message, notification, Row, Select } from "antd";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import queryString from "query-string";

interface IProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    dataInit?: IUser | null;
    setDataInit: (data: IUser | null) => void;
    reloadTable: () => void;
    roleList: { name: string; id: number }[];
}

export interface IRoleSelect {
    label: string;
    value: number;
    key?: number;
}

type FieldType = {
    fullName: string;
    password: string;
    phone: string;
    email: string;
    address: string;
    role: number;
};

const ModalUser = (props: IProps) => {
    const {
        openModal,
        setOpenModal,
        reloadTable,
        dataInit,
        setDataInit,
        roleList,
    } = props;

    const [roles, setRoles] = useState<IRoleSelect[]>([]);

    console.log(">>> check dataInit", dataInit);

    const [form] = Form.useForm<FieldType>();

    useEffect(() => {
        if (roleList) {
            const roleOptions = roleList.map((role) => ({
                label: role.name,
                value: role.id,
                key: role.id,
            }));
            setRoles(roleOptions);
        }
    }, [openModal]);

    // useEffect(() => {
    //     const fetchRoleList = async () => {
    //         const query = queryString.stringify({
    //             page: 1,
    //             size: 100,
    //         });
    //         const res = await fetchRoleAPI("page=1&size=100");
    //         console.log(">>> check res:", res);
    //         if (res.data) {
    //             const roleList = res.data.result.map((role: IRole) => {
    //                 return {
    //                     label: role.name,
    //                     value: role.id,
    //                     key: role.id,
    //                 };
    //             });

    //             setRoles(roleList);
    //         }
    //     };

    //     fetchRoleList();
    // }, []);

    // useEffect(() => {
    //     if (dataInit?.id) {
    //         if (dataInit.role) {
    //             setRoles([
    //                 {
    //                     label: dataInit.role?.name,
    //                     value: dataInit.role?.id,
    //                     key: dataInit.role?.id,
    //                 },
    //             ]);
    //         }
    //         form.setFieldsValue({
    //             ...dataInit,
    //             role: { label: dataInit.role?.name, value: dataInit.role?.id },
    //             // company: { label: dataInit.company?.name, value: dataInit.company?.id },
    //         });
    //     }
    // }, [dataInit]);

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        // setCompanies([]);
        // setRoles([]);
        setOpenModal(false);
    };

    const submitUser = async (valuesForm: FieldType) => {
        const { fullName, email, password, address, role, phone } = valuesForm;

        console.log(">>> check valuesForm:", valuesForm);
        if (dataInit?.id) {
            // update
            const res = await updateUserAPI(
                dataInit.id,
                fullName,
                email,
                address,
                phone,
                role,
                password
            );

            if (res.data) {
                message.success("Cập nhật user thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message,
                });
            }
        } else {
            // create

            const res = await createUserAPI(
                fullName,
                email,
                password,
                address,
                phone,
                role
            );
            if (res.data) {
                message.success("Thêm mới user thành công");
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

    return (
        <>
            <ModalForm<FieldType>
                title={<>{dataInit?.id ? "Cập nhật User" : "Tạo mới User"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => {
                        handleReset();
                    },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy",
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitUser}
                initialValues={
                    dataInit?.id
                        ? {
                              ...dataInit,
                              //   role: {
                              //       label: dataInit.role?.name,
                              //       value: dataInit.role?.id,
                              //   },
                              role: dataInit.role?.id,
                              // company: { label: dataInit.company?.name, value: dataInit.company?.id },
                          }
                        : {}
                }
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Email"
                            name="email"
                            disabled={dataInit?.id ? true : false}
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng không bỏ trống",
                                },
                                {
                                    type: "email",
                                    message: "Vui lòng nhập email hợp lệ",
                                },
                            ]}
                            placeholder="Nhập email"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText.Password
                            disabled={dataInit?.id ? true : false}
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: dataInit?.id ? false : true,
                                    message: "Vui lòng không bỏ trống",
                                },
                            ]}
                            placeholder="Nhập password"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Tên hiển thị"
                            name="fullName"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng không bỏ trống",
                                },
                            ]}
                            placeholder="Nhập tên hiển thị"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng không bỏ trống",
                                },
                            ]}
                            placeholder="Nhập số điện thoại"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            name="role"
                            label="Vai trò"
                            options={roles} // roles có định dạng { label: string, value: number }
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn vai trò!",
                                },
                            ]}
                            placeholder="Chọn vai trò"
                        />
                    </Col>
                    <Col span={24}>
                        <ProFormText
                            label="Địa chỉ"
                            name="address"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng không bỏ trống",
                                },
                            ]}
                            placeholder="Nhập địa chỉ"
                        />
                    </Col>
                </Row>
            </ModalForm>
        </>
    );
};

export default ModalUser;
