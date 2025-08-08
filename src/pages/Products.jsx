
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import CartModal from '../components/CartModal';
import { useProducts } from '../hooks/useProducts';
import { Leaf, Package, X } from 'lucide-react';

function Products() {
  const { user, getIdToken } = useContext(AuthContext);
  const { products, loading, error } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isCombo, setIsCombo] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const API_URL = 'https://us-central1-catering-app-ls.cloudfunctions.net/api';

  useEffect(() => {
    const uniqueCategories = ['All', ...new Set(products.map((product) => product.category))];
    setCategories(uniqueCategories);
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }
    if (isVegetarian) {
      filtered = filtered.filter((product) => product.isVegetarian);
    }
    if (isCombo) {
      filtered = filtered.filter((product) => product.isCombo);
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, isVegetarian, isCombo, products]);

  const addToCart = async (productId) => {
    if (!user) {
      toast.error('Por favor, inicia sesión para añadir al carrito.');
      return;
    }
    if (user.role === 'admin') {
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
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al añadir al carrito');
      }
      toast.success('Producto añadido al carrito');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al añadir al carrito: ' + error.message);
    }
  };

  const formatPrice = (price) => {
    return price || price === 0
      ? `$${Number(price).toLocaleString('es-CL')}`
      : 'No disponible';
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setIsVegetarian(false);
    setIsCombo(false);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };


  const ProductDetailModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${product.name}`}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        tabIndex={-1}
      >
        <div
          className="bg-background rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-foreground hover:text-primary transition"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={
              product.imageUrl && product.imageUrl.startsWith('http')
                ? product.imageUrl
                : 'https://placehold.co/400x300?text=Producto'
            }
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <h3 className="text-2xl font-headline font-bold text-foreground mb-2">
            {product.name}
          </h3>
          <p className="text-muted mb-4">{product.description}</p>
          <p className="text-foreground mb-2">
            <span className="font-semibold">Precio:</span> {formatPrice(product.price)}
          </p>
          <p className="text-foreground mb-2">
            <span className="font-semibold">Categoría:</span> {product.category}
          </p>
          <p className="text-foreground mb-2">
            <span className="font-semibold">Stock:</span> {product.stock}
          </p>
          <div className="flex gap-2 mb-4">
            {product.isVegetarian && (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <Leaf className="w-4 h-4" />
                Vegetariano
              </span>
            )}
            {product.isCombo && (
              <span className="flex items-center gap-1 text-primary text-sm">
                <Package className="w-4 h-4" />
                Combo
              </span>
            )}
          </div>
          {user && user.role !== 'admin' && (
            <button
              onClick={() => {
                addToCart(product.id);
                onClose();
              }}
              className={`w-full p-3 rounded-lg font-medium text-foreground transition transform hover:scale-105 shadow-md ${
                product.stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={product.stock === 0}
              aria-label={`Añadir ${product.name} al carrito`}
            >
              {product.stock === 0 ? 'Sin stock' : 'Añadir al Carrito'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16 font-sans bg-background text-foreground">
      <h2 className="text-4xl font-headline font-bold text-center mb-12 animate-fade-in">
        Nuestro Menú
      </h2>
      {error && (
        <div
          className="mb-8 p-4 bg-red-100 text-red-500 rounded-lg text-center animate-fade-in"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-colors duration-300 ${
              selectedCategory === category
                ? 'bg-primary text-foreground shadow-md'
                : 'bg-secondary text-foreground hover:bg-primary/80'
            }`}
            aria-label={`Filtrar por categoría ${category}`}
            aria-pressed={selectedCategory === category}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-8 mb-10">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isVegetarian}
            onChange={(e) => setIsVegetarian(e.target.checked)}
            className="h-5 w-5 text-primary focus:ring-2 focus:ring-primary rounded appearance-none border-2 border-secondary checked:bg-primary checked:border-transparent transition-transform duration-200"
            aria-label="Filtrar por opciones vegetarianas"
          />
          <span className="text-muted flex items-center gap-1">
            <Leaf className="w-4 h-4 text-green-600" />
            Opciones Vegetarianas
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isCombo}
            onChange={(e) => setIsCombo(e.target.checked)}
            className="h-5 w-5 text-primary focus:ring-2 focus:ring-primary rounded appearance-none border-2 border-secondary checked:bg-primary checked:border-transparent transition-transform duration-200"
            aria-label="Filtrar por combos para eventos"
          />
          <span className="text-muted flex items-center gap-1">
            <Package className="w-4 h-4 text-primary" />
            Combos para Eventos
          </span>
        </label>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
        key={`${selectedCategory}-${isVegetarian}-${isCombo}`}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-background rounded-xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="w-full h-56 bg-secondary" />
              <div className="p-6 space-y-3">
                <div className="h-7 w-3/4 bg-secondary rounded" />
                <div className="h-4 w-full bg-secondary rounded" />
                <div className="h-4 w-1/2 bg-secondary rounded" />
                <div className="mt-4 flex justify-between items-center">
                  <div className="h-6 w-1/4 bg-secondary rounded" />
                  <div className="h-9 w-1/3 bg-secondary rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <p className="text-xl font-headline font-semibold text-foreground mb-4">
              No hay productos que coincidan con los filtros seleccionados
            </p>
            <p className="text-muted mb-6">
              Intenta cambiar los filtros o explora todas las categorías.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-primary text-foreground rounded-lg hover:bg-primary/90 transition-shadow duration-300 shadow-md"
              aria-label="Restablecer filtros"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-background rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              role="region"
              aria-label={`Producto ${product.name}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={
                    product.imageUrl && product.imageUrl.startsWith('http')
                      ? product.imageUrl
                      : 'https://placehold.co/400x300?text=Producto'
                  }
                  alt={product.name}
                  className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => openProductModal(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openProductModal(product)}
                />
                {product.stock === 0 && (
                  <span className="absolute top-2 right-2 px-3 py-1 text-sm font-medium text-white bg-gray-500 rounded-full">
                    Sin stock
                  </span>
                )}
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-headline font-bold text-foreground">
                  {product.name}
                </h3>
                <p className="text-muted line-clamp-2">{product.description}</p>
                <div className="flex gap-2">
                  {product.isVegetarian && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <Leaf className="w-4 h-4" />
                      Vegetariano
                    </span>
                  )}
                  {product.isCombo && (
                    <span className="flex items-center gap-1 text-primary text-sm">
                      <Package className="w-4 h-4" />
                      Combo
                    </span>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openProductModal(product)}
                      className="px-4 py-2 rounded-lg font-medium text-foreground bg-secondary hover:bg-secondary/90 transition-shadow duration-300 shadow-sm"
                      aria-label={`Ver detalles de ${product.name}`}
                    >
                      Ver Detalles
                    </button>
                    {user && user.role !== 'admin' && (
                      <button
                        onClick={() => addToCart(product.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-foreground transition-colors duration-300 ${
                          product.stock === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 shadow-md'
                        }`}
                        disabled={product.stock === 0}
                        aria-label={`Añadir ${product.name} al carrito`}
                      >
                        {product.stock === 0 ? 'Sin stock' : 'Añadir'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {isProductModalOpen && (
        <ProductDetailModal product={selectedProduct} onClose={closeProductModal} />
      )}
    </div>
  );
}

export default Products;