
import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== "admin") {
        // If user is logged in but not admin, kick them to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
