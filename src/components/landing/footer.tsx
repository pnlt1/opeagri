import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="OpeAgri Logo" width={100} height={32} className="h-8 w-auto object-contain" />
          </div>
          
          {/* Liens */}
          <div className="flex gap-8 text-sm font-medium">
            <Link href="#fonctionnalites" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#tarifs" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Tarifs
            </Link>
            <Link href="/connexion" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Connexion
            </Link>
          </div>

          {/* Contact Icons */}
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Mail className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Phone className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MapPin className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2026 OpeAgri. Tous droits réservés.</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full font-medium">
            Fait avec fierté en Afrique <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400 fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
}
