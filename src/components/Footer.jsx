
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Mail, Phone, Twitter, Instagram, Linkedin } from 'lucide-react';

function Footer() {
  const { user } = useContext(AuthContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-t from-primary/10 to-background text-foreground py-12 font-sans border-t border-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
    
          <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-4">Contáctanos</h3>
            <p className="text-muted mb-4">
              Estamos aquí para ayudarte a planificar tu próximo evento con el mejor catering.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <a
                  href="mailto:soporte@cateringapps.com"
                  className="text-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Enviar correo a soporte"
                >
                  soporte@cateringapps.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <a
                  href="tel:+56912345678"
                  className="text-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Llamar al soporte"
                >
                  +56 9 1234 5678
                </a>
              </li>
            </ul>
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                alert('¡Gracias por suscribirte!'); 
              }}
            >
              <label htmlFor="newsletter" className="sr-only">
                Suscríbete a nuestro newsletter
              </label>
              <div className="flex gap-2">
                <input
                  id="newsletter"
                  type="email"
                  placeholder="Ingresa tu correo"
                  className="p-3 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary w-full transition"
                  aria-label="Correo para newsletter"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-primary text-foreground rounded-lg hover:bg-primary/90 transition-shadow duration-300 shadow-md"
                  aria-label="Suscribirse al newsletter"
                >
                  Suscribir
                </button>
              </div>
            </form>
          </div>

  
          <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-4">Navegación</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Ir a la página de inicio"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Ir al menú"
                >
                  Menú
                </Link>
              </li>
              {user && user.role !== 'admin' && (
                <li>
                  <Link
                    to="/orders"
                    className="text-foreground hover:text-primary transition-colors duration-200"
                    aria-label="Ir a mis pedidos"
                  >
                    Pedidos
                  </Link>
                </li>
              )}
              {user && user.role === 'admin' && (
                <li>
                  <Link
                    to="/admin"
                    className="text-foreground hover:text-primary transition-colors duration-200"
                    aria-label="Ir al panel de administración"
                  >
                    Panel de Administración
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/contact"
                  className="text-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Ir a la página de contacto"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

       
          <div>
            <h3 className="text-xl font-headline font-bold text-primary mb-4">Síguenos</h3>
            <p className="text-muted mb-4">Conéctate con nosotros en las redes sociales.</p>
            <div className="flex gap-4">
              <a
                href="https://x.com/cateringapps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
                aria-label="Visitar nuestro perfil en X"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com/cateringapps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
                aria-label="Visitar nuestro perfil en Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com/company/cateringapps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-transform duration-200 hover:scale-110"
                aria-label="Visitar nuestro perfil en LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-secondary text-center text-muted">
          <p>
            &copy; {currentYear} Catering Apps. Todos los derechos reservados. {' '}
            <a
              href="https://github.com/StevenNunez?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              aria-label="Visitar el perfil del creador en X"
            >
              Steven Nuñez
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;