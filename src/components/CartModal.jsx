
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingCart, Minus, Plus, Trash2, X, Calendar, Clock, MapPin, Users } from 'lucide-react';

function CartModal({ isOpen, onClose }) {
  const { user, getIdToken, loading: authLoading } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [address, setAddress] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const navigate = useNavigate();
  const firstInputRef = useRef(null);
  const API_URL = 'https://us-central1-catering-app-ls.cloudfunctions.net/api';

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus(); 
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user || user.role === 'admin' || !isOpen) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = await getIdToken();
        const response = await fetch(`${API_URL}/cart`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || `Error ${response.status}: No se pudo cargar el carrito`);
        }
        const data = await response.json();
        const filteredItems = data
          .filter((item) => item.product)
          .map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name || 'Sin nombre',
            price:
              typeof item.product.price === 'number'
                ? item.product.price
                : parseFloat(item.product.price) || 0,
            imageUrl:
              item.product.imageUrl && item.product.imageUrl.startsWith('http')
                ? item.product.imageUrl
                : 'https://placehold.co/48x48?text=Producto',
            quantity: item.quantity || 1,
          }));
        setCartItems(filteredItems);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        toast.error('Error al cargar el carrito: ' + error.message);
        if (error.message.includes('401')) {
          toast.info('Sesión expirada, por favor inicia sesión nuevamente.');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [user, isOpen, navigate]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!eventDate || user?.role === 'admin') {
        setAvailableTimes([]);
        setDeliveryTime('');
        return;
      }
      setLoadingTimes(true);
      try {
        const date = new Date(eventDate);
        if (isNaN(date.getTime())) {
          throw new Error('Fecha inválida');
        }
        const token = await getIdToken();
        const response = await fetch(
          `${API_URL}/available-times?date=${encodeURIComponent(eventDate)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.ok) {
          const text = await response.text();
          console.error('Response error from available-times:', { status: response.status, text });
          throw new Error(`Error ${response.status}: No se pudo obtener horarios disponibles`);
        }
        const data = await response.json();
        setAvailableTimes(Array.isArray(data) ? data : []);
        setDeliveryTime(data[0] || '');
      } catch (error) {
        console.error('Error fetching available times:', error);
        toast.error('Error al cargar horarios: ' + error.message);
        setAvailableTimes([]);
        setDeliveryTime('');
      } finally {
        setLoadingTimes(false);
      }
    };
    fetchAvailableTimes();
  }, [eventDate, user, navigate]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: cartItemId, quantity: newQuantity }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Error ${response.status}: No se pudo actualizar la cantidad`);
      }
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Cantidad actualizada');
      window.dispatchEvent(new Event('cartUpdated')); // Actualizar navbar
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error al actualizar la cantidad: ' + error.message);
      if (error.message.includes('401')) {
        toast.info('Sesión expirada, por favor inicia sesión nuevamente.');
        navigate('/login');
      }
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Error ${response.status}: No se pudo eliminar del carrito`);
      }
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      toast.success('Producto eliminado del carrito');
      window.dispatchEvent(new Event('cartUpdated')); // Actualizar navbar
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error al eliminar el producto: ' + error.message);
      if (error.message.includes('401')) {
        toast.info('Sesión expirada, por favor inicia sesión nuevamente.');
        navigate('/login');
      }
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Por favor, inicia sesión para realizar el pedido.');
      navigate('/login');
      return;
    }
    if (!eventDate || !deliveryTime || !address || !peopleCount || cartItems.length === 0) {
      toast.error('Por favor, completa todos los campos de agendamiento y añade productos.');
      return;
    }
    const date = new Date(eventDate);
    if (isNaN(date.getTime())) {
      toast.error('La fecha del evento es inválida.');
      return;
    }
    const people = parseInt(peopleCount, 10);
    if (isNaN(people) || people < 1) {
      toast.error('El número de personas debe ser mayor a 0.');
      return;
    }
    try {
      const token = await getIdToken();
      const formattedDate = date.toISOString().split('T')[0]; // Ejemplo: "2025-08-08"
      const orderData = {
        eventDate: formattedDate,
        deliveryTime,
        address,
        peopleCount: people,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        total: cartTotal,
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Usuario',
        status: 'Pending',
      };
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      const text = await response.text();
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: No se pudo realizar el pedido`;
        try {
          const data = JSON.parse(text);
          errorMessage = data.message || errorMessage;
        } catch (e) {
          // No es JSON válido
        }
        throw new Error(errorMessage);
      }
      setCartItems([]);
      setEventDate('');
      setDeliveryTime('');
      setAddress('');
      setPeopleCount('');
      toast.success('¡Tu pedido ha sido confirmado con éxito!');
      navigate('/orders');
      onClose();
    } catch (error) {
      console.error('Error al realizar el pedido:', error);
      toast.error('Error al realizar el pedido: ' + error.message);
      if (error.message.includes('401')) {
        toast.info('Sesión expirada, por favor inicia sesión nuevamente.');
        navigate('/login');
      }
    }
  };

  const formatPrice = (price) => {
    return price || price === 0
      ? `$${Number(price).toLocaleString('es-CL')}`
      : 'No disponible';
  };

  if (!isOpen || !user || user.role === 'admin' || authLoading) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-sans transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
    >
      <div
        className="bg-background dark:bg-dark-background rounded-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh] shadow-xl animate-slide-in"
      >
        <div className="p-6 border-b border-secondary dark:border-dark-secondary">
          <h2 className="text-2xl font-headline font-bold text-foreground dark:text-dark-foreground">
            Tu Carrito
          </h2>
          <p className="text-sm text-muted dark:text-dark-muted">
            Revisa tus productos y agenda tu evento
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary transition-colors duration-200"
            aria-label="Cerrar carrito"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
        {loading ? (
          <div className="p-6 text-center text-muted dark:text-dark-muted animate-pulse">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg">Cargando carrito...</p>
          </div>
        ) : cartItems.length > 0 ? (
          <>
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 pb-4 border-b border-secondary dark:border-dark-secondary"
                    aria-label={`Producto ${item.name}`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-foreground dark:text-dark-foreground">{item.name}</p>
                      <p className="text-sm text-muted dark:text-dark-muted">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 bg-secondary dark:bg-dark-secondary text-foreground dark:text-dark-foreground rounded-md hover:bg-primary dark:hover:bg-dark-primary hover:text-foreground dark:hover:text-dark-foreground transition-colors duration-200"
                          aria-label={`Reducir cantidad de ${item.name}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 bg-secondary dark:bg-dark-secondary text-foreground dark:text-dark-foreground rounded-md hover:bg-primary dark:hover:bg-dark-primary hover:text-foreground dark:hover:text-dark-foreground transition-colors duration-200"
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted dark:text-dark-muted hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                      aria-label={`Eliminar ${item.name} del carrito`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-headline font-semibold text-foreground dark:text-dark-foreground mb-4">
                  Detalles del Evento
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label
                      htmlFor="eventDate"
                      className="block text-sm font-medium text-muted dark:text-dark-muted mb-1"
                    >
                      Fecha del Evento
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-dark-muted" />
                      <input
                        id="eventDate"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`pl-10 p-3 border rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary w-full transition ${
                          !eventDate && cartItems.length > 0 ? 'border-red-500 dark:border-red-400' : 'border-secondary dark:border-dark-secondary'
                        }`}
                        required
                        ref={firstInputRef}
                        aria-required="true"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="deliveryTime"
                      className="block text-sm font-medium text-muted dark:text-dark-muted mb-1"
                    >
                      Hora de Entrega
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-dark-muted" />
                      {loadingTimes ? (
                        <div className="p-3 text-muted dark:text-dark-muted animate-pulse">
                          Cargando horarios...
                        </div>
                      ) : (
                        <select
                          id="deliveryTime"
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className={`pl-10 p-3 border rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary w-full transition ${
                            !deliveryTime && cartItems.length > 0 ? 'border-red-500 dark:border-red-400' : 'border-secondary dark:border-dark-secondary'
                          }`}
                          required
                          aria-required="true"
                        >
                          <option value="">Selecciona una hora</option>
                          {availableTimes.length === 0 ? (
                            <option value="" disabled>No hay horarios disponibles</option>
                          ) : (
                            availableTimes.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))
                          )}
                        </select>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-muted dark:text-dark-muted mb-1"
                    >
                      Dirección del Evento
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-dark-muted" />
                      <input
                        id="address"
                        type="text"
                        placeholder="Ingresa la dirección"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`pl-10 p-3 border rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary w-full transition ${
                          !address && cartItems.length > 0 ? 'border-red-500 dark:border-red-400' : 'border-secondary dark:border-dark-secondary'
                        }`}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="peopleCount"
                      className="block text-sm font-medium text-muted dark:text-dark-muted mb-1"
                    >
                      Número de Personas
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-dark-muted" />
                      <input
                        id="peopleCount"
                        type="number"
                        placeholder="Ingresa el número de personas"
                        value={peopleCount}
                        onChange={(e) => setPeopleCount(e.target.value)}
                        min="1"
                        className={`pl-10 p-3 border rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary w-full transition ${
                          !peopleCount && cartItems.length > 0 ? 'border-red-500 dark:border-red-400' : 'border-secondary dark:border-dark-secondary'
                        }`}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-secondary dark:border-dark-secondary">
              <div className="flex justify-between items-center font-semibold text-lg mb-4 text-foreground dark:text-dark-foreground">
                <span>Total ({cartCount} ítems)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-foreground dark:bg-dark-primary dark:text-dark-foreground px-4 py-3 rounded-lg hover:bg-primary/90 dark:hover:bg-dark-primary/90 transition-shadow duration-300 shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={loading || loadingTimes || cartItems.length === 0}
                aria-label="Realizar pedido"
              >
                Realizar Pedido
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow p-6 text-center animate-fade-in">
            <ShoppingCart className="w-16 h-16 text-muted dark:text-dark-muted mb-4" />
            <p className="text-xl font-headline font-semibold text-foreground dark:text-dark-foreground mb-2">
              Tu carrito está vacío
            </p>
            <p className="text-muted dark:text-dark-muted mb-6">
              Añade productos desde el menú para comenzar.
            </p>
            <Link
              to="/products"
              className="px-6 py-3 bg-primary text-foreground dark:bg-dark-primary dark:text-dark-foreground rounded-lg hover:bg-primary/90 dark:hover:bg-dark-primary/90 transition-shadow duration-300 shadow-md"
              onClick={onClose}
              aria-label="Explorar menú"
            >
              Explorar Menú
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;