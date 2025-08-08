
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { toast } from 'react-toastify';
import CartModal from './CartModal';

function Navbar() {
  const { user, logout, getIdToken } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const API_URL = 'https://us-central1-catering-app-ls.cloudfunctions.net/api';

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user || user.role === 'admin') {
        setCartCount(0);
        return;
      }
      try {
        const token = await getIdToken();
        sessionStorage.setItem('token', token);
        const response = await fetch(`${API_URL}/cart`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          let message = 'No se pudo cargar el carrito';
          if (response.status === 404) message = 'Carrito no encontrado';
          throw new Error(message);
        }
        const data = await response.json();
        const count = data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        if (!error.message.includes('401')) {
          toast.error(error.message);
        }
      }
    };

    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user, getIdToken]);

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.removeItem('token');
      toast.success('Sesión cerrada');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión: ' + error.message);
    }
  };

  const openCart = () => {
    if (!user) {
      toast.error('Por favor, inicia sesión para ver el carrito.');
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      toast.error('Los administradores no pueden usar el carrito.');
      return;
    }
    setIsCartOpen(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuLinkClick = (action) => {
    if (action) action();
    toggleMenu();
  };

  return (
    <>
      <nav className="bg-background text-foreground p-4 border-b border-secondary shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold font-headline text-primary transition-transform duration-300 hover:scale-105"
            aria-label="Ir a la página principal"
          >
            Catering Apps
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <Link
                      to="/admin"
                      className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                      aria-label="Ir al panel de administración"
                    >
                      Panel de Administración
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-base font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
                      aria-label="Cerrar sesión"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                      aria-label="Ir a la página de inicio"
                    >
                      Inicio
                    </Link>
                    <Link
                      to="/products"
                      className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                      aria-label="Ir al menú"
                    >
                      Menú
                    </Link>
                    <Link
                      to="/orders"
                      className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                      aria-label="Ir a mis pedidos"
                    >
                      Pedidos
                    </Link>
                    <button
                      onClick={openCart}
                      className="relative flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                      aria-label={`Abrir carrito con ${cartCount} ítems`}
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {cartCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-base font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
                      aria-label="Cerrar sesión"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Iniciar sesión"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/signup" 
                  className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Registrarse"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden mt-4 bg-background border-t border-secondary animate-slide-in"
          >
            <div className="flex flex-col items-center gap-4 py-6">
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <>
                      <Link
                        to="/admin"
                        className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                        onClick={() => handleMenuLinkClick()}
                        aria-label="Ir al panel de administración"
                      >
                        Panel de Administración
                      </Link>
                      <button
                        onClick={() => handleMenuLinkClick(handleLogout)}
                        className="text-base font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
                        aria-label="Cerrar sesión"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/"
                        className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                        onClick={() => handleMenuLinkClick()}
                        aria-label="Ir a la página de inicio"
                      >
                        Inicio
                      </Link>
                      <Link
                        to="/products"
                        className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                        onClick={() => handleMenuLinkClick()}
                        aria-label="Ir al menú"
                      >
                        Menú
                      </Link>
                      <Link
                        to="/orders"
                        className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                        onClick={() => handleMenuLinkClick()}
                        aria-label="Ir a mis pedidos"
                      >
                        Pedidos
                      </Link>
                      <button
                        onClick={() => handleMenuLinkClick(openCart)}
                        className="flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                        aria-label={`Abrir carrito con ${cartCount} ítems`}
                      >
                        <ShoppingCart className="w-6 h-6" />
                        Carrito
                        {cartCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {cartCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleMenuLinkClick(handleLogout)}
                        className="text-base font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
                        aria-label="Cerrar sesión"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => handleMenuLinkClick()}
                    aria-label="Iniciar sesión"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/signup" 
                    className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => handleMenuLinkClick()}
                    aria-label="Registrarse"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default Navbar;