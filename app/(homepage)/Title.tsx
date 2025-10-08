"use client";

import { CheckCircle2, Clock, Search, Users } from "lucide-react";

interface TitleProps {
  onCtaClick: () => void;
}

export default function Title({ onCtaClick }: TitleProps) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl mb-4">
        Trouvez votre artisan
        <span className="block text-fixeo-main-500 mt-2">en moins de 24h</span>
      </h1>

      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Des professionnels qualifiés pour tous vos travaux de bricolage et
        rénovation
      </p>

      {/* CTA Button */}
      <div className="mb-10 flex justify-center">
        <button
          onClick={onCtaClick}
          className="bg-fixeo-main-500 hover:bg-fixeo-main-600 text-white font-medium px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex justify-center"
        >
          <Search className="h-5 w-5 mr-2" />
          Je cherche un artisan
        </button>
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-wrap justify-center items-center gap-8 text-gray-700">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-fixeo-main-500" />
          <span className="text-sm font-medium">500+ artisans qualifiés</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-fixeo-main-500" />
          <span className="text-sm font-medium">Réponse garantie en 24h</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-fixeo-main-500" />
          <span className="text-sm font-medium">Disponible 7j/7</span>
        </div>
      </div>
    </div>
  );
}
