import { Navigate } from "react-router-dom";
import { authService } from "../services/store.js";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && currentUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
