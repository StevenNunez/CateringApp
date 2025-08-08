
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, UtensilsCrossed, PartyPopper } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

function Home() {
  const { products, loading, error } = useProducts(3);

  useEffect(() => {
    if (error) {
      console.error('Error in Home:', error);
    }
  }, [error]);

  const formatPrice = (price) => {
    return price || price === 0
      ? `$${Number(price).toLocaleString('es-CL')}`
      : 'No disponible';
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
      <main className="flex-1">

        <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center">
          <img
            src="/public/ceviche-peruano.jpg"
            alt="Delicious catered food spread"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => (e.target.src = 'https://placehold.co/1200x800?text=Catering')}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
          <div className="relative z-10 p-4 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tight">
              Catering Apps
            </h1>
            <p className="text-white mt-4 max-w-2xl mx-auto text-lg md:text-xl">
              Catering deliciosamente elaborado para tus eventos especiales.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-block px-8 py-4 bg-primary text-foreground rounded-lg text-lg font-medium transition transform hover:scale-105 shadow-md"
              aria-label="Ver nuestro menú"
            >
              Ver Nuestro Menú
            </Link>
          </div>
        </section>


        <section className="py-16 md:py-24 bg-secondary text-foreground">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center mb-12 animate-fade-in">
              ¿Por Qué Elegirnos?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                {
                  icon: ChefHat,
                  title: 'Sabores Exquisitos',
                  description:
                    'Nuestros chefs utilizan solo los ingredientes más frescos para crear platos inolvidables.',
                },
                {
                  icon: UtensilsCrossed,
                  title: 'Menús Personalizables',
                  description:
                    'Adapta el menú de tu evento a tu gusto, tema y necesidades dietéticas.',
                },
                {
                  icon: PartyPopper,
                  title: 'Perfecto para Cualquier Evento',
                  description:
                    'Desde almuerzos corporativos hasta bodas elegantes, atendemos todas las ocasiones.',
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center p-6 bg-background rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                  role="region"
                  aria-label={feature.title}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold text-center mb-12 animate-fade-in">
              De Nuestra Cocina
            </h2>
            {error && (
              <div
                className="p-4 bg-red-100 text-red-500 rounded-lg text-center mb-6 animate-fade-in"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-background rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="w-full h-56 bg-secondary animate-pulse" />
                    <div className="p-6 space-y-3">
                      <div className="h-7 w-3/4 bg-secondary rounded animate-pulse" />
                      <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-secondary rounded animate-pulse" />
                      <div className="mt-4 flex justify-between items-center">
                        <div className="h-6 w-1/4 bg-secondary rounded animate-pulse" />
                        <div className="h-9 w-1/3 bg-secondary rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-background rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                    role="region"
                    aria-label={`Producto ${product.name}`}
                  >
                    <img
                      src={
                        product.imageUrl && product.imageUrl.startsWith('http')
                          ? product.imageUrl
                          : 'https://placehold.co/400x300?text=Producto'
                      }
                      alt={product.name}
                      className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="p-6 space-y-2">
                      <h3 className="text-xl font-headline font-bold text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-muted line-clamp-2">{product.description}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-lg font-semibold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        <Link
                          to="/products"
                          className="text-primary hover:underline font-medium"
                          aria-label={`Ver ${product.name} en el menú`}
                        >
                          Pedir Ahora →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="text-center mt-12 animate-fade-in">
              <Link
                to="/products"
                className="px-8 py-4 bg-primary text-foreground rounded-lg text-lg font-medium hover:bg-primary/90 transition transform hover:scale-105 shadow-md"
                aria-label="Explorar menú completo"
              >
                Explorar Menú Completo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;