
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../firebase';

function ProductCard({ product }) {
  const { user } = useContext(AuthContext);

  const addToCart = async () => {
    if (!user) {
      alert('Por favor, inicia sesión para agregar productos al carrito.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (response.ok) {
        alert('Producto agregado al carrito');
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name || 'Producto'} className="w-full h-48 object-cover rounded mb-4" />
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
          <span className="text-gray-500">Sin imagen</span>
        </div>
      )}
      <h3 className="text-lg font-bold">{product.name || 'Sin nombre'}</h3>
      <p className="text-gray-600">${product.price || 0}</p>
      <p className="text-gray-500 line-clamp-2">{product.description || 'Sin descripción'}</p>
      <p className="text-gray-500">Stock: {product.stock || 0}</p>
      <button
        onClick={addToCart}
        className={`mt-4 w-full p-2 rounded text-white ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Sin stock' : 'Agregar al Carrito'}
      </button>
    </div>
  );
}

export default ProductCard;