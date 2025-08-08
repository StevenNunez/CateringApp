
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

function RegisterForm() {
  const { register } = useContext(AuthContext); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  console.log('AuthContext en RegisterForm:', { register });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

   
    if (!register || typeof register !== 'function') {
      console.error('Error: register no está definido en AuthContext');
      setError('Error interno: Función de registro no disponible');
      toast.error('Error interno: Función de registro no disponible');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, name); 
      toast.success('¡Registro exitoso! Bienvenido(a).');
      navigate('/');
    } catch (err) {
      console.error('Error registering:', err);
      let errorMessage = 'Error al registrarse';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo ya está registrado';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else {
        errorMessage = `Error: ${err.message}`;
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
          <UserPlus className="w-8 h-8 text-primary dark:text-dark-primary mr-2" />
          <h2 className="text-3xl font-headline font-bold">Crear Cuenta</h2>
        </div>
        <p className="text-center text-muted dark:text-dark-muted mb-8">
          Únete para disfrutar de nuestro servicio de catering
        </p>
        {error && (
          <p className="text-red-500 dark:text-red-400 text-center mb-6">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted dark:text-dark-muted">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-3 border border-secondary dark:border-dark-secondary rounded-md bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground focus:ring-primary dark:focus:ring-dark-primary focus:outline-none transition"
              placeholder="Tu nombre"
              required
            />
          </div>
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
                Creando cuenta...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>
        <p className="text-center text-muted dark:text-dark-muted mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary dark:text-dark-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;