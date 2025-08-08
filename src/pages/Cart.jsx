
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../firebase';
import CartItem from '../components/CartItem';

function Cart() {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCart(data);
        } else {
          setError('Error al obtener el carrito');
        }
      } catch (error) {
        setError('Error: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCart();
  }, [user]);

  const handleRemove = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.ok) {
        alert('Compra realizada con éxito');
        setCart([]);
      } else {
        const error = await response.json();
        setError('Error: ' + error.message);
      }
    } catch (error) {
      setError('Error: ' + error.message);
    }
  };

  if (!user) {
    return <div className="container mx-auto p-4">Por favor, inicia sesión para ver tu carrito.</div>;
  }

  if (loading) {
    return <div className="container mx-auto p-4">Cargando carrito...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Tu Carrito</h2>
      {cart.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md">
            {cart.map((item) => (
              <CartItem key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold">Total: ${total.toFixed(2)}</h3>
            <button
              onClick={handleCheckout}
              className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Realizar Compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;