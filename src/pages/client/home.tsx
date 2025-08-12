import { fetchBookAPI, fetchCategoryAPI } from "@/services/api";
import { IBook } from "@/types/backend";
import { convertSlug } from "@/utils";
import { FilterTwoTone, ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  FormProps,
  InputNumber,
  Pagination,
  Rate,
  Row,
  Spin,
  Tabs,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "styles/client.home.scss";

type FieldType = {
  category?: string[];
  range: {
    from?: number;
    to?: number;
  };
};

type OutletContextType = {
  searchTerm: string;
  filter: string;
  setFilter: (val: string) => void;
  setSearchTerm: (val: string) => void;
  current: number;
  setCurrent: (val: number) => void;
};

const HomePage = () => {
  const { searchTerm, filter, setFilter, setSearchTerm, current, setCurrent } =
    useOutletContext<OutletContextType>();

  const [, setShowMobileFilter] = useState<boolean>(false);

  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [listCategory, setListCategory] = useState<
    { label: string; value: number }[]
  >([]);

  const [listBook, setListBook] = useState<IBook[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortQuery, setSortQuery] = useState<string>("sort=sold,desc");

  const items = [
    {
      key: "&sort=sold,desc",
      label: "Phổ Biến",
      children: <></>,
    },
    {
      key: "&sort=updatedAt,desc",
      label: "Hàng Mới",
      children: <></>,
    },
    {
      key: "&sort=actualPrice,asc",
      label: "Giá Thấp Đến Cao",
      children: <></>,
    },
    {
      key: "&sort=actualPrice,desc",
      label: "Giá Cao Đến thấp",
      children: <></>,
    },
  ];

  useEffect(() => {
    // Reset form and filter if entering /shop without category query from elsewhere
    const paramsOnEnter = new URLSearchParams(window.location.search);
    const cateOnEnter = paramsOnEnter.get("category");
    if (!cateOnEnter) {
      form.resetFields();
      setFilter("");
      setCurrent(1);
    }

    const fetchCategory = async () => {
      const res = await fetchCategoryAPI("page=1&size=100");
      if (res.data) {
        const categories = res.data.result.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        setListCategory(categories);
        // preselect category from query string if present
        const params = new URLSearchParams(window.location.search);
        const cateId = params.get("category");
        if (cateId) {
          form.setFieldsValue({ category: [Number(cateId)] });
          setFilter(`(category.id:'${cateId}')`);
        } else {
          setFilter("");
        }
      }
    };

    fetchCategory();
  }, []);

  const fetchBook = async () => {
    setIsLoading(true);
    let query = `page=${current}&size=${pageSize}`;

    if (filter) {
      query += `&filter=${filter}`;
    }

    if (sortQuery) {
      query += `&${sortQuery}`;
    }

    // if (searchTerm) {
    //     query += `&title=/${searchTerm}/i`;
    // }

    const res = await fetchBookAPI(query);
    if (res.data) {
      setListBook(res.data.result);
      setTotal(res.data.meta.total);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBook();
  }, [current, pageSize, filter, sortQuery]);

  const handleOnchangePage = (pagination: {
    current: number;
    pageSize: number;
  }) => {
    // console.log(">>> check pagination:", pagination);
    // console.log(">>> check current:", current);
    // console.log(">>> check pageSize:", pageSize);
    if (pagination?.current !== current) {
      setCurrent(pagination.current);
    }

    if (pagination?.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
      setCurrent(1);
    }
  };

  const handleChangeFilter = (
    changedValues: Partial<FieldType>,
    values: FieldType
  ) => {
    // console.log(">>> check handleChangeFilter:", changedValues, values);
    // if (
    //     changedValues?.category === undefined &&
    //     changedValues?.brand === undefined
    // )
    //     return;

    if (changedValues?.category === undefined) return;

    let q = "";
    const cate = values.category ?? [];

    if (cate.length > 0) {
      cate.map((item, index) => {
        q += `category.id:'${item}'`;
        if (index !== cate.length - 1) {
          q += " or ";
        }
      });
    }

    let priceQuery = "";
    const fromVal = values.range?.from;
    const toVal = values.range?.to;
    if (typeof fromVal === "number" && fromVal > 0) {
      priceQuery += `actualPrice>:${fromVal}`;
    }

    if (typeof toVal === "number" && toVal > 0) {
      if (priceQuery) {
        priceQuery += ` and actualPrice<:${toVal}`;
      } else {
        priceQuery += `actualPrice<:${toVal}`;
      }
    }

    let finalQuery = "";

    if (priceQuery) {
      if (q) {
        // setFilterQuery(`${filterCheckbox} and (${priceQuery})`);
        finalQuery += `(${q}) and (${priceQuery})`;
      } else {
        // setFilterQuery(`${priceQuery}`);
        finalQuery += `(${priceQuery})`;
      }
    } else {
      // setFilterQuery(`${filterCheckbox}`);
      if (q) {
        finalQuery += `(${q})`;
      }
    }

    if (searchTerm) {
      if (finalQuery) {
        finalQuery += ` and (title~~'${searchTerm}')`;
      } else {
        finalQuery += `(title~~'${searchTerm}')`;
      }
    }

    console.log(">>> search query:", searchTerm);

    setFilter(finalQuery);
  };

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);

    let query = "";

    if (values.range.from && values.range.from > 0) {
      // query += `price>=${values.range.from}`;
      query += `actualPrice>:${values.range.from}`;
    }

    if (values.range.to && values.range.to > 0) {
      if (query) {
        // query += `&price<=${values.range.to}`;
        query += ` and actualPrice<:${values.range.to}`;
      } else {
        // query += `price<=${values.range.to}`;
        query += `actualPrice<:${values.range.to}`;
      }
    }

    if (query) {
      query = `(${query})`;
      if (values.category?.length && values.category?.length > 0) {
        let q = "";
        const cate = values.category;
        cate.map((item, index) => {
          q += `category.id:'${item}'`;
          if (index !== cate.length - 1) {
            q += " or ";
          }
        });

        if (query) {
          query += ` and (${q})`;
        } else {
          query += `(${q})`;
        }
      }

      if (searchTerm) {
        setFilter(`${query} and (title~~'${searchTerm}')`);
      } else {
        setFilter(query);
      }
    }
  };

  const handleViewDetailBook = (book: IBook) => {
    const slug = convertSlug(book.title);
    navigate(`/book/${slug}?id=${book.id}`);
  };

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);

  return (
    <>
      <div style={{ background: "#efefef", padding: "20px 0" }}>
        <div
          className="homepage-container"
          style={{ maxWidth: 1200, margin: "0 auto" }}
        >
          <Row gutter={20}>
            <Col md={5} sm={0} xs={0}>
              <div
                className="filter-card"
                style={{
                  padding: "14px",
                  background: "#fff",
                  borderRadius: 5,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    {" "}
                    <FilterTwoTone />
                    <span style={{ fontWeight: 500 }}> Bộ lọc tìm kiếm</span>
                  </span>
                  <ReloadOutlined
                    title="Reset"
                    onClick={() => {
                      form.resetFields();
                      setFilter("");
                      setSearchTerm("");
                      setCurrent(1);
                    }}
                  />
                </div>
                <Divider />
                <Form
                  form={form}
                  onFinish={onFinish}
                  onValuesChange={(changedValues, values) =>
                    handleChangeFilter(changedValues, values)
                  }
                >
                  <Form.Item<FieldType>
                    name="category"
                    label="Danh mục sản phẩm"
                    labelCol={{ span: 24 }}
                  >
                    <Checkbox.Group>
                      <Row>
                        {listCategory?.map((item, index) => (
                          <Col
                            span={24}
                            key={`index-${index}`}
                            style={{
                              padding: "7px 0",
                            }}
                          >
                            <Checkbox value={item.value}>{item.label}</Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                  <Divider />
                  <Form.Item<FieldType>
                    label="Khoảng giá"
                    labelCol={{ span: 24 }}
                  >
                    <Row gutter={10}>
                      <Col xl={11} md={24}>
                        <Form.Item name={["range", "from"]}>
                          <InputNumber
                            name="from"
                            min={0}
                            placeholder="đ TỪ"
                            className="small-input"
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            style={{
                              width: "100%",
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col xl={2} md={0}>
                        <div> - </div>
                      </Col>
                      <Col xl={11} md={24}>
                        {" "}
                        <Form.Item name={["range", "to"]}>
                          <InputNumber
                            name="to"
                            min={0}
                            placeholder="đ ĐẾN"
                            className="small-input"
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            style={{
                              width: "100%",
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <div>
                      <Button
                        onClick={() => form.submit()}
                        style={{ width: "100%" }}
                        type="primary"
                      >
                        Áp dụng
                      </Button>
                    </div>
                  </Form.Item>
                  <Divider />
                  <Form.Item label="Đánh giá" labelCol={{ span: 24 }}>
                    <div className="rating-row">
                      <Rate
                        value={5}
                        disabled
                        style={{
                          color: "#ffce3d",
                          fontSize: 15,
                        }}
                      />
                      <span className="ant-rate-text"></span>
                    </div>
                    <div className="rating-row">
                      <Rate
                        value={4}
                        disabled
                        style={{
                          color: "#ffce3d",
                          fontSize: 15,
                        }}
                      />
                      <span className="ant-rate-text">trở lên</span>
                    </div>
                    <div className="rating-row">
                      <Rate
                        value={3}
                        disabled
                        style={{
                          color: "#ffce3d",
                          fontSize: 15,
                        }}
                      />
                      <span className="ant-rate-text">trở lên</span>
                    </div>
                    <div className="rating-row">
                      <Rate
                        value={2}
                        disabled
                        style={{
                          color: "#ffce3d",
                          fontSize: 15,
                        }}
                      />
                      <span className="ant-rate-text">trở lên</span>
                    </div>
                    <div className="rating-row">
                      <Rate
                        value={1}
                        disabled
                        style={{
                          color: "#ffce3d",
                          fontSize: 15,
                        }}
                      />
                      <span className="ant-rate-text">trở lên</span>
                    </div>
                  </Form.Item>
                </Form>
              </div>
            </Col>
            <Col md={19} xs={24}>
              <Spin spinning={isLoading} tip="Loading...">
                <div
                  style={{
                    padding: "20px",
                    background: "#fff",
                    borderRadius: 5,
                  }}
                >
                  <Row>
                    <Tabs
                      defaultActiveKey={sortQuery}
                      items={items}
                      onChange={(key) => setSortQuery(key)}
                      style={{ overflowX: "auto" }}
                    />
                    <Col xs={24} md={0}>
                      <div style={{ marginBottom: 20 }}>
                        <span onClick={() => setShowMobileFilter(true)}>
                          <FilterTwoTone />
                          <span
                            style={{
                              fontWeight: 500,
                            }}
                          >
                            Lọc
                          </span>
                        </span>
                      </div>
                    </Col>
                  </Row>
                  <Row className="customize-row">
                    {listBook?.map((item: IBook, index: number) => {
                      return (
                        <div
                          className="column"
                          key={`book-${index}`}
                          // onClick={() =>
                          //     navigate(
                          //         `/book/${item.id}`
                          //     )
                          // }
                          onClick={() => handleViewDetailBook(item)}
                        >
                          <div className="wrapper">
                            {item.discount > 0 && (
                              <span className="discount-badge">
                                -{item.discount}%
                              </span>
                            )}
                            <div className="thumbnail">
                              <img src={item.thumbnail} alt="thumbnail book" />
                            </div>
                            <div className="text" title={item.title}>
                              {item.title}
                            </div>
                            <div className="price">
                              {(() => {
                                const price = item?.price || 0;
                                const discount = item?.discount || 0;
                                const finalPrice = Math.round(
                                  price * (1 - discount / 100)
                                );
                                return (
                                  <>
                                    <span className="final-price">
                                      {formatCurrency(finalPrice)}
                                    </span>
                                    {discount > 0 && (
                                      <span className="old-price">
                                        {formatCurrency(price)}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            <div className="rating">
                              <Rate
                                value={5}
                                disabled
                                style={{
                                  color: "#ffce3d",
                                  fontSize: 10,
                                }}
                              />
                              <span className="sold">Đã bán {item.sold}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </Row>
                  <div style={{ marginTop: 30 }}></div>
                  <Row
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Pagination
                      current={current}
                      total={total}
                      pageSize={pageSize}
                      responsive
                      onChange={(p, s) =>
                        handleOnchangePage({
                          current: p,
                          pageSize: s,
                        })
                      }
                    />
                  </Row>
                </div>
              </Spin>
            </Col>
          </Row>
        </div>
      </div>
      {/* <MobileFilter
                isOpen={showMobileFilter}
                setIsOpen={setShowMobileFilter}
                listCategory={listCategory}
                handleChangeFilter={handleChangeFilter}
                onFinish={onFinish}
            /> */}
    </>
  );
};

export default HomePage;
