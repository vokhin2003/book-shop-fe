import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "pages/auth/login";
import RegisterPage from "pages/auth/register";
import { useAppDispatch, useAppSelector } from "./redux/hook";
import { useEffect } from "react";
import { fetchAccount } from "./redux/slice/accountSlice";
import LayoutApp from "components/share/layout.app";
import NotFound from "components/share/notfound";
import LayoutAdmin from "components/admin/layout.admin";
import DashboardPage from "pages/admin/dashboard";
import UserPage from "pages/admin/user";
import ProtectedRoute from "./components/share/protected-route";
import RolePage from "./pages/admin/role";
import PermissionPage from "./pages/admin/permission";
import BookTab from "./pages/admin/book/book.tab";
import ViewUpsertBook from "./components/admin/book/upsert.book";
import HomePage from "./pages/client/home";
import LayoutClient from "./layouts/layout.client";
import BookPage from "./pages/client/book";
import { fetchCart } from "./redux/slice/cartSlice";
import OrderPage from "./pages/client/order";
import PaymentReturn from "./components/client/order/PaymentReturn";
import HistoryPage from "./pages/client/history";
import OrderDetailPage from "./pages/client/order.detail";
import ViewUpsertOrder from "./components/admin/order/upsert.order";
import OrderManagePage from "./pages/admin/order/order";
import VerifyReturn from "./pages/auth/verify.return";
import {
  generateToken,
  messaging,
  setupForegroundNotification,
} from "@/notifications/firebase";
import AuthenticatePage from "@/pages/auth/authenticate";

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.account);

  useEffect(() => {
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register" &&
      localStorage.getItem("access_token")
    ) {
      dispatch(fetchAccount());
    }
  }, [dispatch]);

  useEffect(() => {
    // Nếu user được xác thực, lưu deviceToken và thiết lập foreground notification
    if (isAuthenticated && user.id) {
      generateToken(user.id).then((token) => {
        if (token) {
          setupForegroundNotification(messaging);
        }
      });
    }
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    // Gọi fetchCart khi user được xác thực
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const router = createBrowserRouter([
    // {
    //     path: "/payment/return",
    //     element: <PaymentReturn />,
    // },
    {
      path: "/",
      element: (
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>
      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "book/:slug", element: <BookPage /> },
        {
          path: "/order",
          element: (
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "payment/return/:transactionId",
          element: <PaymentReturn />,
        },
        {
          path: "history",
          element: (
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/order/detail/:orderId",
          element: (
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/admin",
      element: (
        <LayoutApp>
          <LayoutAdmin />
        </LayoutApp>
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "book",
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <BookTab />
                </ProtectedRoute>
              ),
            },
            {
              path: "upsert",
              element: (
                <ProtectedRoute>
                  <ViewUpsertBook />
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "order",
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <OrderManagePage />
                </ProtectedRoute>
              ),
            },
            {
              path: "upsert",
              element: (
                <ProtectedRoute>
                  <ViewUpsertOrder />
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "user",
          element: (
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "role",
          element: (
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "permission",
          element: (
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/verify/return",
      element: <VerifyReturn />,
    },
    {
      path: "/authenticate",
      element: <AuthenticatePage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
