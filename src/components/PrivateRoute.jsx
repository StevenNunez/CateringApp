
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ShoppingCart } from 'lucide-react';

function PrivateRoute({ adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
        <div className="text-center text-muted dark:text-dark-muted animate-pulse">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;