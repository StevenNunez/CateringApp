
import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-4 text-center text-red-500">
          <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
          <p>{this.state.error?.message || 'Ocurrió un error inesperado.'}</p>
          <Link
            to="/products"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Ver Productos
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;