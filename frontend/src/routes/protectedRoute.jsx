import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated, loading} = useSelector((state) => state.auth);

  // WAIT if Redux is still loading login state
  if (loading) return null; // or a spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;