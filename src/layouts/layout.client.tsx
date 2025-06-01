import Header from "components/client/header.client";
import Footer from "components/client/footer.client";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "styles/app.module.scss";

const LayoutClient = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const location = useLocation();
    const rootRef = useRef<HTMLDivElement>(null);
    const [filter, setFilter] = useState<string>("");
    const [current, setCurrent] = useState<number>(1);

    useEffect(() => {
        if (rootRef && rootRef.current) {
            rootRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [location]);

    return (
        <div className="layout-app" ref={rootRef}>
            <Header
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filter={filter}
                setFilter={setFilter}
                current={current}
                setCurrent={setCurrent}
            />
            <div className={styles["content-app"]}>
                <Outlet
                    context={{
                        searchTerm,
                        setSearchTerm,
                        filter,
                        setFilter,
                        current,
                        setCurrent,
                    }}
                />
            </div>
            <Footer />
        </div>
    );
};

export default LayoutClient;
