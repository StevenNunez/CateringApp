
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AdminDashboard from '../components/AdminDashboard';

function Admin() {
  const { user, userData, loading } = useContext(AuthContext);

  if (loading) return <div>Cargando...</div>;
  if (!user || userData?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="container mx-auto p-4">
      <AdminDashboard />
    </div>
  );
}

export default Admin;