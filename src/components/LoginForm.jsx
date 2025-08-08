
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { LogIn } from 'lucide-react';

function LoginForm() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/');
    } catch (err) {
      console.error('Error logging in:', err);
      let errorMessage = 'Error al iniciar sesión';
      if (err.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground py-16">
      <div className="bg-background dark:bg-dark-background rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-8 h-8 text-primary dark:text-dark-primary mr-2" />
          <h2 className="text-3xl font-headline font-bold">Iniciar Sesión</h2>
        </div>
        <p className="text-center text-muted dark:text-dark-muted mb-8">
          Accede a tu cuenta para disfrutar de nuestro menú
        </p>
        {error && (
          <p className="text-red-500 dark:text-red-400 text-center mb-6">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted dark:text-dark-muted">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border border-secondary dark:border-dark-secondary rounded-md bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-primary dark:focus:ring-dark-primary focus:outline-none transition"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted dark:text-dark-muted">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border border-secondary dark:border-dark-secondary rounded-md bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-primary dark:focus:ring-dark-primary focus:outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full p-3 rounded-md font-medium text-foreground dark:text-dark-foreground transition transform hover:scale-105 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-foreground dark:text-dark-foreground" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                </svg>
                Cargando...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
        <p className="text-center text-muted dark:text-dark-muted mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary dark:text-dark-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;