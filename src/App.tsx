import {
    createBrowserRouter,
    Outlet,
    RouterProvider,
    useLocation,
} from "react-router-dom";
import LoginPage from "pages/auth/login";
import RegisterPage from "pages/auth/register";
import { useAppDispatch } from "./redux/hook";
import { useEffect, useRef, useState } from "react";
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

function App() {
    const dispatch = useAppDispatch();

    // ...existing code...
    // useEffect(() => {
    //     if (
    //         window.location.pathname === "/login" ||
    //         window.location.pathname === "/register"
    //     )
    //         return;

    //     const fetchAccount = async () => {
    //         const res = getAccountAPI();
    //         console.log(res);
    //     };

    //     fetchAccount();

    //     // dispatch(fetchAccount()); // <-- Sửa ở đây
    // }, []);
    // ...existing code...

    useEffect(() => {
        console.log("useEffect triggered");
        if (
            window.location.pathname === "/login" ||
            window.location.pathname === "/register"
        ) {
            console.log("Skipping fetchAccount due to login/register page");
            return;
        }
        // if (localStorage.getItem('access_token')) {
        //     console.log('Dispatching fetchAccount');
        //     dispatch(fetchAccount());
        // } else {
        //     console.log('No access token, skipping fetchAccount');
        // }

        dispatch(fetchAccount());
    }, [dispatch]);

    const router = createBrowserRouter([
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
    ]);

    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

export default App;
