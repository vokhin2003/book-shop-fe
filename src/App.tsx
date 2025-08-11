import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "pages/auth/login";
import RegisterPage from "pages/auth/register";
import { useAppDispatch, useAppSelector } from "./redux/hook";
import { useEffect } from "react";
import { fetchAccount, setAuthInitialized } from "./redux/slice/accountSlice";
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
import LandingPage from "./pages/client/landing";
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
import GuestRoute from "./components/share/guest-route";
import ForgotPasswordPage from "@/pages/auth/forgot";
import ForgotReturnPage from "@/pages/auth/forgot.return";
import AddressPage from "@/pages/client/address";

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.account);

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("access_token"));
    if (hasToken) {
      dispatch(fetchAccount());
    } else {
      // Không có token → đánh dấu đã init để tránh treo loading
      dispatch(setAuthInitialized());
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
        { index: true, element: <LandingPage /> },
        { path: "shop", element: <HomePage /> },
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
          path: "addresses",
          element: (
            <ProtectedRoute>
              <AddressPage />
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
            <ProtectedRoute allowedRoles={["ADMIN"]}>
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
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <BookTab />
                </ProtectedRoute>
              ),
            },
            {
              path: "upsert",
              element: (
                <ProtectedRoute allowedRoles={["ADMIN"]}>
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
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <OrderManagePage />
                </ProtectedRoute>
              ),
            },
            {
              path: "upsert",
              element: (
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ViewUpsertOrder />
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "user",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "role",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <RolePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "permission",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PermissionPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/login",
      element: (
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      ),
    },
    {
      path: "/register",
      element: (
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      ),
    },
    {
      path: "/verify/return",
      element: <VerifyReturn />,
    },
    {
      path: "/authenticate",
      element: <AuthenticatePage />,
    },
    { path: "/forgot", element: <ForgotPasswordPage /> },
    { path: "/forgot/return", element: <ForgotReturnPage /> },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
