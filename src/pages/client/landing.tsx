import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Typography,
  Rate,
  Tag,
  Space,
  Carousel,
  Statistic,
  Spin,
  Form,
  Input,
  message,
} from "antd";
import { fetchBookAPI, fetchCategoryAPI } from "@/services/api";
import { IBook, ICategory } from "@/types/backend";
import { useNavigate } from "react-router-dom";
import styles from "@/styles/landing.module.scss";
import {
  CheckCircleTwoTone,
  RocketTwoTone,
  SafetyOutlined,
  ThunderboltTwoTone,
} from "@ant-design/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import {
  BookOutlined,
  ReadOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  SmileOutlined,
  BulbOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

// Lưu ý: Ở môi trường dev với StrictMode, useEffect sẽ chạy 2 lần khi F5.
// Ở đây ưu tiên việc khi quay lại landing sẽ fetch lại dữ liệu → chấp nhận gọi 2 lần khi F5 (dev-only).

const LandingPage = () => {
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState<IBook[]>([]);
  const [newArrivals, setNewArrivals] = useState<IBook[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const testimonials: { quote: string; author: string }[] = [
    {
      quote: "Sách mới, đóng gói kỹ, giao siêu nhanh!",
      author: "Anh Minh – Hà Nội",
    },
    {
      quote: "Giá hợp lý, nhiều mã giảm. Sẽ ủng hộ dài dài!",
      author: "Chị Linh – TP.HCM",
    },
    {
      quote: "CSKH phản hồi nhanh, xử lý đổi trả rất ổn.",
      author: "Bạn Khánh – Đà Nẵng",
    },
    {
      quote: "Danh mục đa dạng, dễ tìm sách yêu thích.",
      author: "Bạn Hương – Hải Phòng",
    },
    {
      quote: "Thanh toán VNPAY tiện, nhận hàng đúng hẹn.",
      author: "Anh Nam – Cần Thơ",
    },
    {
      quote: "Sách chính hãng, mực in rõ, giấy dày đẹp.",
      author: "Chị Vy – Bình Dương",
    },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    (async () => {
      try {
        const [bookRes, cateRes] = await Promise.all([
          fetchBookAPI("page=1&size=10&sort=sold,desc"),
          fetchCategoryAPI("page=1&size=6&sort=updatedAt,desc"),
        ]);
        if (isMounted && bookRes?.data?.result)
          setBestSellers(bookRes.data.result);
        if (isMounted && cateRes?.data?.result)
          setCategories(cateRes.data.result);
        const newRes = await fetchBookAPI("page=1&size=8&sort=updatedAt,desc");
        if (isMounted && newRes?.data?.result)
          setNewArrivals(newRes.data.result);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles["landing-root"]}>
      <section className={styles.hero}>
        <div className={styles["hero-inner"]}>
          <Title className={styles["hero-title"]}>
            Khám phá kho tàng sách cho mọi đam mê
          </Title>
          <Paragraph className={styles["hero-subtitle"]}>
            Từ sách kỹ năng, văn học, thiếu nhi đến học thuật. Giao hàng nhanh,
            thanh toán an toàn, ưu đãi mỗi ngày.
          </Paragraph>
          <Space size="middle" wrap>
            <Button
              size="large"
              type="primary"
              onClick={() => navigate("/shop")}
            >
              Bắt đầu mua sắm
            </Button>
            <Button
              size="large"
              onClick={() =>
                document
                  .getElementById("section-bestseller")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Xem sách nổi bật
            </Button>
          </Space>
        </div>
        <div className={styles["hero-wave"]} />
      </section>

      <section className={styles.features}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <div className={styles["feature-item"]}>
              <RocketTwoTone
                twoToneColor="#1677ff"
                className={styles["feature-icon"]}
              />
              <Title level={4}>Giao hàng nhanh</Title>
              <Paragraph>
                Nhận hàng trong 24-48h tại nội thành. Theo dõi đơn hàng thời
                gian thực.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className={styles["feature-item"]}>
              <SafetyOutlined className={styles["feature-icon"]} />
              <Title level={4}>Thanh toán an toàn</Title>
              <Paragraph>
                Hỗ trợ VNPAY và nhiều phương thức. Mã hóa và xác thực bảo mật.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className={styles["feature-item"]}>
              <ThunderboltTwoTone
                twoToneColor="#faad14"
                className={styles["feature-icon"]}
              />
              <Title level={4}>Ưu đãi mỗi ngày</Title>
              <Paragraph>
                Flash sale, mã giảm giá và quà tặng thành viên thân thiết.
              </Paragraph>
            </div>
          </Col>
        </Row>
      </section>

      <section className={styles.categories}>
        <div className={styles["section-head"]}>
          <Title level={3}>Danh mục nổi bật</Title>
          <Paragraph>Khám phá nhanh những chủ đề bạn quan tâm</Paragraph>
        </div>
        <Row gutter={[16, 16]}>
          {categories.map((c, idx) => {
            const gradients = [
              styles.g1,
              styles.g2,
              styles.g3,
              styles.g4,
              styles.g5,
              styles.g6,
            ];
            const g = gradients[idx % gradients.length];
            const lower = (c.name || "").toLowerCase();
            const Icon = lower.includes("khoa học")
              ? ExperimentOutlined
              : lower.includes("thiếu nhi")
              ? SmileOutlined
              : lower.includes("kỹ năng")
              ? BulbOutlined
              : lower.includes("văn học")
              ? ReadOutlined
              : lower.includes("truyện")
              ? ThunderboltOutlined
              : BookOutlined;
            return (
              <Col xs={12} sm={8} md={6} lg={4} key={c.id}>
                <Card
                  hoverable
                  className={styles["cate-card"]}
                  onClick={() => navigate(`/shop?category=${c.id}`)}
                >
                  <div className={styles["cate-thumb-wrap"]}>
                    {c.thumbnail ? (
                      <img
                        src={c.thumbnail}
                        alt={c.name}
                        className={styles["cate-thumb"]}
                      />
                    ) : (
                      <div className={`${styles["cate-icon"]} ${g}`}>
                        <Icon />
                      </div>
                    )}
                  </div>
                  <div className={styles["cate-badge"]}>
                    <Tag color="processing">Mới</Tag>
                  </div>
                  <div className={styles["cate-body"]}>
                    <Title level={5} className={styles["cate-title"]}>
                      {c.name}
                    </Title>
                    {c.description && (
                      <Paragraph className={styles["cate-desc"]}>
                        {c.description}
                      </Paragraph>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </section>

      <section id="section-bestseller" className={styles.bestseller}>
        <div className={styles["section-head"]}>
          <Title level={3}>Bán chạy nhất</Title>
          <Paragraph>
            Những tựa sách được yêu thích nhất bởi cộng đồng độc giả
          </Paragraph>
        </div>
        <Spin spinning={loading}>
          {!loading && bestSellers.length > 0 && (
            <div className={styles.coverflow}>
              <Swiper
                key={`best-${bestSellers.length}`}
                modules={[EffectCoverflow, Autoplay, Pagination]}
                effect="coverflow"
                grabCursor
                centeredSlides
                loop
                observer
                observeParents
                watchOverflow
                initialSlide={Math.max(0, Math.floor(bestSellers.length / 2))}
                slidesPerView={1}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 120,
                  modifier: 2,
                  slideShadows: false,
                }}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                onSwiper={(swiper) => swiper?.autoplay?.start?.()}
                breakpoints={{
                  576: { slidesPerView: 2 },
                  992: { slidesPerView: 3 },
                }}
              >
                {bestSellers.map((b) => (
                  <SwiperSlide key={b.id}>
                    <Card
                      hoverable
                      className={styles["book-card"]}
                      cover={
                        <img
                          alt={b.title}
                          src={b.thumbnail}
                          className={styles["book-thumb"]}
                        />
                      }
                      onClick={() =>
                        navigate(
                          `/book/${encodeURIComponent(b.title)}?id=${b.id}`
                        )
                      }
                    >
                      <Title level={5} className={styles["book-title"]}>
                        {b.title}
                      </Title>
                      <div className={styles["book-meta"]}>
                        <Rate disabled value={5} style={{ fontSize: 12 }} />
                        <Text type="secondary">Đã bán {b.sold}</Text>
                      </div>
                      <Text strong>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(b.price ?? 0)}
                      </Text>
                    </Card>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </Spin>
      </section>

      <section className={styles.newarrivals}>
        <div className={styles["section-head"]}>
          <Title level={3}>Hàng mới về</Title>
          <Paragraph>Cập nhật những đầu sách vừa ra mắt</Paragraph>
        </div>
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            {newArrivals.map((b) => (
              <Col xs={12} sm={8} md={6} lg={6} key={b.id}>
                <Card
                  hoverable
                  className={styles["book-card"]}
                  onClick={() =>
                    navigate(`/book/${encodeURIComponent(b.title)}?id=${b.id}`)
                  }
                >
                  <div className={styles["thumb-wrap"]}>
                    <img
                      alt={b.title}
                      src={b.thumbnail}
                      className={styles["book-thumb"]}
                    />
                  </div>
                  <div className={styles["book-body"]}>
                    <Title level={5} className={styles["book-title"]}>
                      {b.title}
                    </Title>
                    <Text strong>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(b.price ?? 0)}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Spin>
      </section>

      <section className={styles.stats}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={12} md={6}>
            <Statistic title="Đầu sách" value={12000} suffix="+" />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="Người dùng" value={50000} suffix="+" />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="Đánh giá 5 sao" value={15000} suffix="+" />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="Đối tác" value={200} suffix="+" />
          </Col>
        </Row>
      </section>

      <section className={styles.trust}>
        <Carousel autoplay dots className={styles["testi-carousel"]}>
          {testimonials.map((t, idx) => (
            <div key={idx} className={styles["testi-item"]}>
              <CheckCircleTwoTone twoToneColor="#52c41a" />
              <Paragraph>“{t.quote}”</Paragraph>
              <Text strong>— {t.author}</Text>
            </div>
          ))}
        </Carousel>
      </section>

      <section className={styles.partners}>
        <div className={styles["section-head"]}>
          <Title level={4}>Đối tác</Title>
        </div>
        {(() => {
          const partnerLogos: { src: string; alt: string }[] = [
            { src: "/partners/fahasa.jpg", alt: "Fahasa" },
            { src: "/partners/phuongnam.png", alt: "Phuong Nam" },
            {
              src: "/partners/nguyenvancu.png",
              alt: "Nguyễn Văn Cừ",
            },
            { src: "/partners/haian.jpg", alt: "Hải An" },
            { src: "/partners/bachdang.png", alt: "Hải An" },
            { src: "/partners/tanviet.jpg", alt: "Hải An" },
            { src: "/partners/thaophuong.jpg", alt: "Hải An" },
            { src: "/partners/tientho.jpg", alt: "Hải An" },
          ];
          return (
            <div className={styles["logo-swiper"]}>
              <Swiper
                modules={[Autoplay]}
                loop
                speed={1000}
                autoplay={{
                  delay: 1500,
                  disableOnInteraction: false,
                }}
                slidesPerView={2}
                spaceBetween={16}
                breakpoints={{
                  576: { slidesPerView: 3 },
                  768: { slidesPerView: 4 },
                  992: { slidesPerView: 5 },
                  1200: { slidesPerView: 6 },
                }}
              >
                {partnerLogos.map((logo) => (
                  <SwiperSlide key={logo.src} className={styles["logo-slide"]}>
                    <img src={logo.src} alt={logo.alt} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          );
        })()}
      </section>

      <section className={styles.newsletter}>
        <div className={styles["newsletter-inner"]}>
          <Title level={3}>Nhận thông tin ưu đãi sớm nhất</Title>
          <Paragraph>
            Đăng ký email để không bỏ lỡ các đợt giảm giá hấp dẫn
          </Paragraph>
          <Form
            layout="inline"
            onFinish={() => message.success("Đã đăng ký nhận tin. Cảm ơn bạn!")}
            className={styles["newsletter-form"]}
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}
            >
              <Input size="large" placeholder="Nhập email của bạn" />
            </Form.Item>
            <Form.Item>
              <Button size="large" type="primary" htmlType="submit">
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>

      <section className={styles.cta}>
        <Title level={3}>Sẵn sàng bắt đầu hành trình đọc?</Title>
        <Paragraph>
          Khám phá ngay hàng ngàn cuốn sách với giá tốt nhất hôm nay.
        </Paragraph>
        <Button size="large" type="primary" onClick={() => navigate("/shop")}>
          Khám phá cửa hàng
        </Button>
      </section>
    </div>
  );
};

export default LandingPage;
