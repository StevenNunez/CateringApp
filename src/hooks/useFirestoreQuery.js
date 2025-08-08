import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function useFirestoreQuery(query) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await query.get();
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(results);
      } catch (err) {
        console.error('Error en consulta Firestore:', err);
        setError('Error al cargar los datos');
        toast.error('Error al cargar los datos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  return { data, loading, error };
}

export default useFirestoreQuery;