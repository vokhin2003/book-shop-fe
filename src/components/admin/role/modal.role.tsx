import { useAppDispatch } from "@/redux/hook";
import { IPermission, IRole } from "@/types/backend";
import { CheckSquareOutlined } from "@ant-design/icons";
import {
  FooterToolbar,
  ModalForm,
  ProCard,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { Col, Form, message, notification, Row } from "antd";
import { isMobile } from "react-device-detect";
import ModuleApi from "./module.api";
import { createRoleAPI, updateRoleAPI } from "@/services/api";

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  reloadTable: () => void;
  listPermissions: {
    module: string;
    permissions: IPermission[];
  }[];
  singleRole: IRole | null;
  setSingleRole: (v: any) => void;
}

const ModalRole = (props: IProps) => {
  const {
    openModal,
    setOpenModal,
    reloadTable,
    listPermissions,
    singleRole,
    setSingleRole,
  } = props;
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const submitRole = async (valuesForm: any) => {
    const { description, name, permissions } = valuesForm;
    const checkedPermissions: number[] = [];

    // console.log(">>> valuesForm:", valuesForm);

    if (permissions) {
      for (const key in permissions) {
        if (key.match(/^[1-9][0-9]*$/) && permissions[key] === true) {
          checkedPermissions.push(+key);
        }
      }
    }

    // console.log(">>> checkedPermissions:", checkedPermissions);

    if (singleRole?.id) {
      //update
      // const role = {
      //     name, description, permissions: checkedPermissions
      // }
      const res = await updateRoleAPI(
        singleRole.id,
        name,
        description,
        checkedPermissions
      );
      if (res.data) {
        message.success("Cập nhật role thành công");
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
      // const role = {
      //     name, description, permissions: checkedPermissions
      // }
      const res = await createRoleAPI(name, description, checkedPermissions);
      if (res.data) {
        message.success("Thêm mới role thành công");
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
    setOpenModal(false);
    setSingleRole(null);
  };

  return (
    <>
      <ModalForm
        title={<>{singleRole?.id ? "Cập nhật Role" : "Tạo mới Role"}</>}
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
        }}
        scrollToFirstError={true}
        preserve={false}
        form={form}
        onFinish={submitRole}
        submitter={{
          render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
          submitButtonProps: {
            icon: <CheckSquareOutlined />,
          },
          searchConfig: {
            resetText: "Hủy",
            submitText: <>{singleRole?.id ? "Cập nhật" : "Tạo mới"}</>,
          },
        }}
      >
        <Row gutter={16}>
          <Col lg={24} md={24} sm={24} xs={24}>
            <ProFormText
              label="Tên Role"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng không bỏ trống",
                },
              ]}
              placeholder="Nhập name"
            />
          </Col>

          <Col span={24}>
            <ProFormTextArea
              label="Miêu tả"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Vui lòng không bỏ trống",
                },
              ]}
              placeholder="Nhập miêu tả role"
              fieldProps={{
                autoSize: { minRows: 2 },
              }}
            />
          </Col>
          <Col span={24}>
            <ProCard
              title="Quyền hạn"
              subTitle="Các quyền hạn được phép cho vai trò này"
              headStyle={{ color: "#d81921" }}
              style={{ marginBottom: 20 }}
              headerBordered
              size="small"
              bordered
            >
              <ModuleApi
                form={form}
                listPermissions={listPermissions}
                singleRole={singleRole}
                openModal={openModal}
              />
            </ProCard>
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default ModalRole;
