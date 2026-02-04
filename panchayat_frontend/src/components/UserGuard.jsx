
import { Navigate } from "react-router-dom";

export default function UserGuard({ children }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role === "admin") {
        // If user is admin, they shouldn't be here. Redirect to admin panel.
        return <Navigate to="/admin" replace />;
    }

    return children;
}
