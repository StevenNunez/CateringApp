
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Calendar, Clock, MapPin, Users } from 'lucide-react';

function Orders() {
  const { user, getIdToken, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = 'https://us-central1-catering-app-ls.cloudfunctions.net/api';

  useEffect(() => {
    if (authLoading) return; 
    if (!user) {
      toast.error('Por favor, inicia sesión para ver tus pedidos.');
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      toast.error('Los administradores deben ver los pedidos en el panel de administración.');
      navigate('/admin');
      return;
    }
    fetchOrders();
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    if (!user || user.role === 'admin') return;
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/users/${user.uid}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || `Error ${response.status}: No se pudieron cargar los pedidos`
        );
      }
      const data = await response.json();
      const sortedOrders = Array.isArray(data)
        ? data.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return dateB - dateA;
          })
        : [];
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar los pedidos: ' + err.message);
      toast.error('Error al cargar los pedidos: ' + err.message);
      if (err.message.includes('401')) {
        toast.info('Sesión expirada, por favor inicia sesión nuevamente.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price || price === 0
      ? `$${Number(price).toLocaleString('es-CL')}`
      : 'No disponible';
  };

  const formatDate = (date) => {
    try {
      if (!date) {
        return 'Sin fecha';
      }
      if (date._seconds !== undefined && date._nanoseconds !== undefined) {
        const jsDate = new Date(date._seconds * 1000 + date._nanoseconds / 1000000);
        return jsDate.toLocaleDateString('es-CL');
      }
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('es-CL');
      }
      if (typeof date.toDate === 'function') {
        const jsDate = date.toDate();
        return jsDate.toLocaleDateString('es-CL');
      }
      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString('es-CL');
        }
      }
      return 'Sin fecha';
    } catch (error) {
      console.error('Error al formatear fecha:', error, date);
      return 'Sin fecha';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Desconocido';
    switch (status) {
      case 'Pending':
        return 'Pendiente';
      case 'Confirmed':
        return 'Confirmado';
      case 'InProgress':
        return 'En preparación';
      case 'Shipped':
        return 'En camino';
      case 'Delivered':
        return 'Entregado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500';
    switch (status) {
      case 'Pending':
        return 'bg-orange-500';
      case 'Confirmed':
        return 'bg-blue-500';
      case 'InProgress':
        return 'bg-yellow-500';
      case 'Shipped':
        return 'bg-purple-500';
      case 'Delivered':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
        <div className="text-center text-muted dark:text-dark-muted animate-pulse">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 font-sans bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground">
      <h2 className="text-4xl font-headline font-bold text-center mb-12">Mis Pedidos</h2>
      {error && (
        <div
          className="mb-8 p-4 bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 rounded-lg text-center animate-fade-in"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-background dark:bg-dark-background rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="h-6 w-1/3 bg-secondary dark:bg-dark-secondary rounded mb-4"></div>
              <div className="h-4 w-2/3 bg-secondary dark:bg-dark-secondary rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-secondary dark:bg-dark-secondary rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-secondary dark:bg-dark-secondary rounded mb-6"></div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-secondary dark:bg-dark-secondary rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 w-1/2 bg-secondary dark:bg-dark-secondary rounded mb-1"></div>
                  <div className="h-3 w-1/3 bg-secondary dark:bg-dark-secondary rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <ShoppingBag className="w-16 h-16 text-muted dark:text-dark-muted mb-4" />
          <p className="text-2xl font-headline font-semibold text-foreground dark:text-dark-foreground mb-2">
            No tienes pedidos
          </p>
          <p className="text-muted dark:text-dark-muted mb-6">
            Explora nuestro menú y haz tu primer pedido.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-primary text-foreground dark:bg-dark-primary dark:text-dark-foreground rounded-lg hover:bg-primary/90 dark:hover:bg-dark-primary/90 transition-shadow duration-300 shadow-md"
            aria-label="Ver menú de productos"
          >
            Ver Menú
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="relative bg-background dark:bg-dark-background rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              role="region"
              aria-label={`Pedido ${index + 1}`}
            >
              <span
                className={`absolute top-4 right-4 px-3 py-1 text-sm font-medium text-white rounded-full shadow-sm ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </span>
              <h3 className="text-xl font-headline font-bold mb-4">Pedido #{index + 1}</h3>
              <div className="space-y-2 mb-6">
                <p className="flex items-center gap-2 text-muted dark:text-dark-muted">
                  <Calendar className="w-5 h-5" />
                  Fecha: {formatDate(order.eventDate)}
                </p>
                <p className="flex items-center gap-2 text-muted dark:text-dark-muted">
                  <Clock className="w-5 h-5" />
                  Hora: {order.deliveryTime || 'Sin hora'}
                </p>
                <p className="flex items-center gap-2 text-muted dark:text-dark-muted">
                  <MapPin className="w-5 h-5" />
                  Dirección: {order.address || 'Sin dirección'}
                </p>
                <p className="flex items-center gap-2 text-muted dark:text-dark-muted">
                  <Users className="w-5 h-5" />
                  Personas: {order.peopleCount || 'N/A'}
                </p>
                <p className="font-semibold text-foreground dark:text-dark-foreground">
                  Total: {formatPrice(order.total)}
                </p>
              </div>
              <div>
                <p className="font-medium mb-2">Productos:</p>
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  <ul className="space-y-3">
                    {order.items.map((item, itemIndex) => (
                      <li
                        key={item.id || itemIndex}
                        className="flex items-center gap-3"
                        aria-label={`Producto ${item.name || 'Sin nombre'}`}
                      >
                        <img
                          src={
                            item.imageUrl && item.imageUrl.startsWith('http')
                              ? item.imageUrl
                              : 'https://placehold.co/48x48?text=Producto'
                          }
                          alt={item.name || 'Producto'}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-foreground dark:text-dark-foreground">{item.name || 'Sin nombre'}</p>
                          <p className="text-sm text-muted dark:text-dark-muted">
                            {formatPrice(item.price)} x {item.quantity || 1}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted dark:text-dark-muted">No hay productos en este pedido.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;