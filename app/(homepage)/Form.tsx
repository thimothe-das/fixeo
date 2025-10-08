"use client";

import { getCategoryConfig, ServiceType } from "@/lib/utils";

interface FormProps {
  onCategoryClick: (category: string) => void;
}

export default function Form({ onCategoryClick }: FormProps) {
  return (
    <>
      {/* Category Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.values(ServiceType).map((service) => {
            const categoryConfig = getCategoryConfig(service, "h-7 w-7");
            return (
              <button
                key={service}
                onClick={() => onCategoryClick(service)}
                className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-fixeo-main-500 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white h-56"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={categoryConfig.defaultPhoto}
                    alt={categoryConfig.type}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-200" />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-5">
                  <h3 className="text-lg font-semibold text-white mb-0.5 text-left">
                    {categoryConfig.type}
                  </h3>
                  <p className="text-xs text-white/80 text-left">
                    Professionnel qualifié
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
