
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';

export function useProducts(limit = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          imageUrl: doc.data().imageUrl && doc.data().imageUrl.startsWith('http')
            ? doc.data().imageUrl
            : 'https://placehold.co/400x300?text=Producto',
        }));
        setProducts(limit ? productsData.slice(0, limit) : productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error al cargar los productos');
        toast.error('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [limit]);

  return { products, loading, error };
}