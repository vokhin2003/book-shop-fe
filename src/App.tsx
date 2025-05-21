import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <>Layout Client</>,
            children: [{ index: true, element: <>Index client</> }],
        },
        {
            path: "/admin",
            element: <>Layout admin</>,
            children: [
                {
                    path: "user",
                    element: <>User Admin</>,
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
