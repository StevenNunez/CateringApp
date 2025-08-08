
import { Mail, Phone } from 'lucide-react';

function Contact() {
  return (
    <div className="container mx-auto px-4 py-16 font-sans bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground">
      <h2 className="text-4xl font-headline font-bold text-center mb-12">Contáctanos</h2>
      <div className="max-w-lg mx-auto text-center">
        <p className="text-muted dark:text-dark-muted mb-6">
          Si necesitas ayuda con tu pedido o tienes alguna pregunta, no dudes en contactarnos.
        </p>
        <div className="space-y-4">
          <p className="flex items-center justify-center gap-2 text-foreground dark:text-dark-foreground">
            <Mail className="w-5 h-5" />
            <a href="mailto:soporte@tuapp.com" className="hover:underline">
              soporte@tuapp.com
            </a>
          </p>
          <p className="flex items-center justify-center gap-2 text-foreground dark:text-dark-foreground">
            <Phone className="w-5 h-5" />
            <a href="tel:+56912345678" className="hover:underline">
              +56 9 1234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;