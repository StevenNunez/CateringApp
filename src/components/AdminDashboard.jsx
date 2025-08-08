
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ShoppingCart, X, Check, Trash2 } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function AdminDashboard() {
  const { user, getIdToken } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    imageUrl: '',
    category: 'Breakfast',
    isVegetarian: false,
    isCombo: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Desserts', 'Combos'];
  const statuses = ['Pending', 'Confirmed', 'InProgress', 'Shipped', 'Delivered'];
  const API_URL = 'https://us-central1-catering-app-ls.cloudfunctions.net/api';

  useEffect(() => {
    if (!user || user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();


      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);

     
      const ordersResponse = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!ordersResponse.ok) {
        const data = await ordersResponse.json().catch(() => ({}));
        throw new Error(data.message || `Error ${ordersResponse.status}: No se pudieron cargar los pedidos`);
      }
      const ordersData = await ordersResponse.json();
      const sortedOrders = Array.isArray(ordersData)
        ? ordersData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return dateB - dateA;
          })
        : [];
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar datos: ' + error.message);
      toast.error('Error al cargar datos: ' + error.message);
      if (error.message.includes('401') || error.message.includes('403')) {
        toast.info('No tienes permiso o la sesión expiró. Inicia sesión nuevamente.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return form.imageUrl || null;
    setUploading(true);
    try {
      const reader = new FileReader();
      const imageBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: imageBase64 }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al subir la imagen');
      }
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error al subir la imagen: ' + error.message);
      toast.error('Error al subir la imagen');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    let imageUrl = form.imageUrl;

    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) return;
    }

    const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const token = await getIdToken();
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price) || 0,
          description: form.description,
          stock: parseInt(form.stock) || 0,
          imageUrl: imageUrl || 'https://placehold.co/400x300?text=Producto',
          category: form.category || 'Sin categoría',
          isVegetarian: form.isVegetarian,
          isCombo: form.isCombo,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar el producto');
      }
      setForm({
        name: '',
        price: '',
        description: '',
        stock: '',
        imageUrl: '',
        category: 'Breakfast',
        isVegetarian: false,
        isCombo: false,
      });
      setImageFile(null);
      setEditingId(null);
      fetchData();
      toast.success(editingId ? 'Producto actualizado' : 'Producto creado');
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Error al guardar el producto: ' + error.message);
      toast.error('Error al guardar el producto');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || '',
      price: product.price.toString() || '',
      description: product.description || '',
      stock: product.stock.toString() || '',
      imageUrl: product.imageUrl || '',
      category: product.category || 'Breakfast',
      isVegetarian: product.isVegetarian || false,
      isCombo: product.isCombo || false,
    });
    setEditingId(product.id);
    setImageFile(null);
    setError(null);
  };

  const handleDelete = async (productId) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar el producto');
      }
      fetchData();
      toast.success('Producto eliminado');
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error al eliminar el producto');
      toast.error('Error al eliminar el producto');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el estado');
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Estado actualizado a ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado: ' + error.message);
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

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
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

  const normalizeDate = (date) => {
    try {
      if (!date) {
        return null;
      }
      let jsDate;
      if (date._seconds !== undefined && date._nanoseconds !== undefined) {
        jsDate = new Date(date._seconds * 1000 + date._nanoseconds / 1000000);
      } else if (typeof date.toDate === 'function') {
        jsDate = date.toDate();
      } else if (date instanceof Date && !isNaN(date.getTime())) {
        jsDate = date;
      } else if (typeof date === 'string') {
        jsDate = new Date(date);
        if (isNaN(jsDate.getTime())) {
          return null;
        }
      } else {
        return null;
      }
      return new Date(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
    } catch (error) {
      console.error('Error al normalizar fecha:', error, date);
      return null;
    }
  };

  const filteredOrders = selectedDate
    ? orders.filter((order) => {
        const orderDate = normalizeDate(order.eventDate);
        if (!orderDate) {
          return false;
        }
        const selected = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        return (
          orderDate.getFullYear() === selected.getFullYear() &&
          orderDate.getMonth() === selected.getMonth() &&
          orderDate.getDate() === selected.getDate()
        );
      })
    : orders;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
        <div className="text-center text-muted dark:text-dark-muted animate-pulse">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-dark-background">
        <p className="text-2xl font-headline font-bold text-foreground dark:text-dark-foreground mb-4">
          Acceso Restringido
        </p>
        <p className="text-muted dark:text-dark-muted mb-6">
          Debes ser administrador para acceder a este panel.
        </p>
        <Link
          to="/login"
          className="px-6 py-3 bg-primary text-foreground dark:bg-dark-primary dark:text-dark-foreground rounded-lg hover:bg-primary/90 dark:hover:bg-dark-primary/90 transition-shadow duration-300 shadow-md"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 font-sans bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground">
      <h1 className="text-4xl font-headline font-bold text-center mb-12">Panel de Administración</h1>
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 rounded-lg text-center animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md ${
            activeTab === 'products'
              ? 'bg-primary text-foreground dark:bg-dark-primary dark:text-dark-foreground'
              : 'bg-secondary text-foreground dark:bg-dark-secondary dark:text-dark-foreground hover:bg-primary/80 dark:hover:bg-dark-primary/80'
          }`}
          aria-label="Ver productos"
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md ${
            activeTab === 'orders'
              ? 'bg-primary text-foreground dark:bg-dark-primary dark:text-dark-foreground'
              : 'bg-secondary text-foreground dark:bg-dark-secondary dark:text-dark-foreground hover:bg-primary/80 dark:hover:bg-dark-primary/80'
          }`}
          aria-label="Ver pedidos"
        >
          Pedidos
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="animate-fade-in">
          <div className="bg-background dark:bg-dark-background rounded-lg shadow-lg p-6 mb-12">
            <h2 className="text-2xl font-headline font-bold mb-6">
              {editingId ? 'Editar Producto' : 'Crear Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  placeholder=""
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 border border-secondary dark:border-dark-secondary rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary peer"
                  required
                />
                <label
                  htmlFor="name"
                  className="absolute left-3 -top-2.5 text-sm text-muted dark:text-dark-muted bg-background dark:bg-dark-background px-1 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm"
                >
                  Nombre
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  placeholder="Precio (CLP)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full p-3 border border-secondary dark:border-dark-secondary rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary peer"
                  required
                  min="0"
                  step="1"
                />
                <label
                  htmlFor="price"
                  className="absolute left-3 -top-2.5 text-sm text-muted dark:text-dark-muted bg-background dark:bg-dark-background px-1 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm"
                >
                  Precio (CLP)
                </label>
              </div>
              <div className="relative col-span-full">
                <textarea
                  id="description"
                  placeholder=""
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 border border-secondary dark:border-dark-secondary rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary peer"
                  rows="4"
                />
                <label
                  htmlFor="description"
                  className="absolute left-3 -top-2.5 text-sm text-muted dark:text-dark-muted bg-background dark:bg-dark-background px-1 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm"
                >
                  Descripción
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="stock"
                  placeholder=""
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full p-3 border border-secondary dark:border-dark-secondary rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary peer"
                  required
                  min="0"
                />
                <label
                  htmlFor="stock"
                  className="absolute left-3 -top-2.5 text-sm text-muted dark:text-dark-muted bg-background dark:bg-dark-background px-1 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm"
                >
                  Stock
                </label>
              </div>
              <div className="relative">
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-3 border border-secondary dark:border-dark-secondary rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="category"
                  className="absolute left-3 -top-2.5 text-sm text-muted dark:text-dark-muted bg-background dark:bg-dark-background px-1"
                >
                  Categoría
                </label>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isVegetarian}
                  onChange={(e) => setForm({ ...form, isVegetarian: e.target.checked })}
                  className="h-5 w-5 text-primary focus:ring-primary dark:text-dark-primary dark:focus:ring-dark-primary"
                />
                <span className="text-muted dark:text-dark-muted">Opción Vegetariana</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isCombo}
                  onChange={(e) => setForm({ ...form, isCombo: e.target.checked })}
                  className="h-5 w-5 text-primary focus:ring-primary dark:text-dark-primary dark:focus:ring-dark-primary"
                />
                <span className="text-muted dark:text-dark-muted">Combo para Eventos</span>
              </label>
              <div className="relative col-span-full">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-secondary dark:border-dark-secondary rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground"
                />
                <label
                  htmlFor="image"
                  className="absolute left-3 -top-2.5 text-sm text-muted dark:text-dark-muted bg-background dark:bg-dark-background px-1"
                >
                  Imagen del producto
                </label>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background dark:bg-dark-background bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary dark:border-dark-primary"></div>
                  </div>
                )}
              </div>
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Vista previa"
                  className="w-32 h-32 object-cover rounded-lg mt-2 col-span-full"
                />
              )}
              <div className="flex gap-4 col-span-full">
                <button
                  type="submit"
                  className={`flex-1 p-3 rounded-lg text-foreground dark:text-dark-foreground font-medium transition-all duration-300 shadow-md ${
                    uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90'
                  }`}
                  disabled={uploading}
                  aria-label={editingId ? 'Actualizar producto' : 'Crear producto'}
                >
                  {uploading ? 'Subiendo...' : editingId ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        name: '',
                        price: '',
                        description: '',
                        stock: '',
                        imageUrl: '',
                        category: 'Breakfast',
                        isVegetarian: false,
                        isCombo: false,
                      });
                      setEditingId(null);
                      setImageFile(null);
                    }}
                    className="flex-1 p-3 rounded-lg bg-secondary text-foreground dark:bg-dark-secondary dark:text-dark-foreground hover:bg-secondary/90 dark:hover:bg-dark-secondary/90 transition-all duration-300 shadow-md"
                    aria-label="Cancelar edición"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <h2 className="text-2xl font-headline font-bold mb-6">Productos</h2>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
              <ShoppingCart className="w-16 h-16 text-muted dark:text-dark-muted mb-4" />
              <p className="text-lg font-semibold text-foreground dark:text-dark-foreground">
                No hay productos
              </p>
              <p className="text-muted dark:text-dark-muted">
                Agrega productos desde el formulario de arriba.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-background dark:bg-dark-background rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={product.imageUrl || 'https://placehold.co/400x300?text=Producto'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-headline font-semibold mb-2">{product.name}</h3>
                  <p className="text-muted dark:text-dark-muted">{formatPrice(product.price)}</p>
                  <p className="text-muted dark:text-dark-muted">Stock: {product.stock}</p>
                  <p className="text-muted dark:text-dark-muted">Categoría: {product.category}</p>
                  {product.isVegetarian && (
                    <p className="text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Vegetariano
                    </p>
                  )}
                  {product.isCombo && (
                    <p className="text-primary dark:text-dark-primary flex items-center gap-1">
                      <Check className="w-4 h-4" /> Combo para Eventos
                    </p>
                  )}
                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-primary text-foreground dark:bg-dark-primary dark:text-dark-foreground px-4 py-2 rounded-lg hover:bg-primary/90 dark:hover:bg-dark-primary/90 transition-all duration-300 shadow-md"
                      aria-label={`Editar ${product.name}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(product.id)}
                      className="flex-1 bg-red-500 text-foreground dark:bg-red-600 dark:text-dark-foreground px-4 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 shadow-md"
                      aria-label={`Eliminar ${product.name}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-headline font-bold mb-6">Pedidos</h2>
          <div className="mb-8 bg-background dark:bg-dark-background rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-6 h-6 text-primary dark:text-dark-primary" />
              <h3 className="text-lg font-headline font-semibold">Filtrar por Fecha</h3>
            </div>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="rounded-lg shadow-md bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground border-none"
            />
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 px-6 py-3 bg-primary text-foreground dark:bg-dark-primary dark:text-dark-foreground rounded-lg hover:bg-primary/90 dark:hover:bg-dark-primary/90 transition-all duration-300 shadow-md"
              aria-label="Mostrar todos los pedidos"
            >
              Mostrar Todos los Pedidos
            </button>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted dark:text-dark-muted mb-4" />
              <p className="text-lg font-semibold text-foreground dark:text-dark-foreground">
                No hay pedidos
              </p>
              <p className="text-muted dark:text-dark-muted">
                {selectedDate
                  ? 'No hay pedidos para esta fecha.'
                  : 'No hay pedidos registrados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-background dark:bg-dark-background rounded-lg shadow-lg p-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary dark:bg-dark-secondary">
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Pedido #</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Cliente</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Email</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Fecha</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Hora</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Dirección</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Personas</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Total</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Estado</th>
                      <th className="p-3 text-left text-muted dark:text-dark-muted font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-secondary dark:border-dark-secondary hover:bg-secondary/50 dark:hover:bg-dark-secondary/50 transition-colors"
                      >
                        <td className="p-3">{order.id}</td>
                        <td className="p-3">{order.userName || 'Sin nombre'}</td>
                        <td className="p-3">{order.userEmail || 'Sin email'}</td>
                        <td className="p-3">{formatDate(order.eventDate)}</td>
                        <td className="p-3">{order.deliveryTime || 'Sin hora'}</td>
                        <td className="p-3">{order.address || 'Sin dirección'}</td>
                        <td className="p-3">{order.peopleCount || 'N/A'}</td>
                        <td className="p-3">{formatPrice(order.total)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={order.status || 'Pending'}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="p-2 border border-secondary dark:border-dark-secondary rounded-lg bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
                            aria-label={`Actualizar estado del pedido ${order.id}`}
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {getStatusText(status)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-background dark:bg-dark-background rounded-lg shadow-md p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-headline font-semibold mb-2">
                        Pedido #{order.id}
                      </h3>
                      <p className="text-muted dark:text-dark-muted">
                        <span className="font-medium">Cliente:</span> {order.userName || 'Sin nombre'}
                      </p>
                      <p className="text-muted dark:text-dark-muted">
                        <span className="font-medium">Email:</span> {order.userEmail || 'Sin email'}
                      </p>
                      <p className="text-muted dark:text-dark-muted">
                        <span className="font-medium">Fecha:</span> {formatDate(order.eventDate)}
                      </p>
                      <p className="text-muted dark:text-dark-muted">
                        <span className="font-medium">Hora de entrega:</span> {order.deliveryTime || 'Sin hora'}
                      </p>
                      <p className="text-muted dark:text-dark-muted">
                        <span className="font-medium">Dirección:</span> {order.address || 'Sin dirección'}
                      </p>
                      <p className="text-muted dark:text-dark-muted">
                        <span className="font-medium">Personas:</span> {order.peopleCount || 'No especificado'}
                      </p>
                      <p className="text-muted dark:text-dark-muted">
                        <span className="font-medium">Estado:</span>{' '}
                        <span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </p>
                      <p className="font-semibold mt-2">
                        Total: {formatPrice(order.total)}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Productos:</p>
                      <ul className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
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
                                <p className="text-foreground dark:text-dark-foreground">{item.name}</p>
                                <p className="text-sm text-muted dark:text-dark-muted">
                                  {formatPrice(item.price)} x {item.quantity}
                                </p>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="text-muted dark:text-dark-muted">Sin productos</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background dark:bg-dark-background rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-headline font-bold mb-4">Confirmar Eliminación</h3>
            <p className="text-muted dark:text-dark-muted mb-6">
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500 text-foreground dark:bg-red-600 dark:text-dark-foreground px-4 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300 shadow-md"
                aria-label="Confirmar eliminación"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-secondary text-foreground dark:bg-dark-secondary dark:text-dark-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 dark:hover:bg-dark-secondary/90 transition-all duration-300 shadow-md"
                aria-label="Cancelar eliminación"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;