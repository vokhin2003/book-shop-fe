import styles from "@/styles/footer.module.scss";
import {
    FacebookFilled,
    YoutubeFilled,
    GithubOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <span className={styles.logoMark}>R</span>
                            <span>ober Bookshop</span>
                        </div>
                        <p className={styles.slogan}>
                            Nơi khởi nguồn đam mê đọc. Giao nhanh, chính hãng, ưu đãi mỗi ngày.
                        </p>
                        <div className={styles.socials}>
                            <a href="#" aria-label="Facebook"><FacebookFilled /></a>
                            <a href="#" aria-label="YouTube"><YoutubeFilled /></a>
                            <a href="#" aria-label="Github"><GithubOutlined /></a>
                        </div>
                    </div>

                    <div className={styles.col}>
                        <h4>Chính sách</h4>
                        <ul>
                            <li><Link to="#" className={styles.link}>Vận chuyển</Link></li>
                            <li><Link to="#" className={styles.link}>Thanh toán</Link></li>
                            <li><Link to="#" className={styles.link}>Đổi trả</Link></li>
                            <li><Link to="#" className={styles.link}>Bảo mật</Link></li>
                        </ul>
                    </div>

                    <div className={styles.col}>
                        <h4>Hỗ trợ</h4>
                        <ul>
                            <li><Link to="#" className={styles.link}>Hướng dẫn mua hàng</Link></li>
                            <li><Link to="#" className={styles.link}>Câu hỏi thường gặp</Link></li>
                            <li><Link to="/order" className={styles.link}>Xem giỏ hàng</Link></li>
                            <li><Link to="/history" className={styles.link}>Lịch sử đơn hàng</Link></li>
                        </ul>
                    </div>

                    <div className={styles.col}>
                        <h4>Liên hệ</h4>
                        <ul className={styles.contacts}>
                            <li><EnvironmentOutlined /> 123 Đường Sách, Quận 1, TP.HCM</li>
                            <li><PhoneOutlined /> 0123 456 789</li>
                            <li><MailOutlined /> support@roberbookshop.vn</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <span>© {new Date().getFullYear()} Rober Bookshop. All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
