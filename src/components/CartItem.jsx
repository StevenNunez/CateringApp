
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../firebase';

function CartItem({ item, onRemove }) {
  const { user } = useContext(AuthContext);
  const { product, quantity } = item;
  const subtotal = product.price * quantity;

  const handleRemove = async () => {
    try {
      const response = await fetch(`${API_URL}/cart/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.ok) {
        onRemove(item.id); 
        alert('Producto eliminado del carrito');
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="flex items-center p-4 border-b">
      <img
        src={product.imageUrl || 'https://via.placeholder.com/100'}
        alt={product.name}
        className="w-16 h-16 object-cover rounded mr-4"
      />
      <div className="flex-1">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <p className="text-gray-600">Precio: ${product.price}</p>
        <p className="text-gray-600">Cantidad: {quantity}</p>
        <p className="text-gray-600">Subtotal: ${subtotal.toFixed(2)}</p>
      </div>
      <button
        onClick={handleRemove}
        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Eliminar
      </button>
    </div>
  );
}

export default CartItem;