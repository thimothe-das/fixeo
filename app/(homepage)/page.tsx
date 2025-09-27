"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getCategoryConfig, ServiceType } from "@/lib/utils";
import Form from "./Form";
import Payment from "./Payment";
import Presentation from "./Presentation";
import Title from "./Title";

export default function FixeoHomePage() {
  return (
    <main className="bg-white">
      <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 py-8 lg:py-12 min-h-[calc(100vh-80px)] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Title />
          <Form />
          <Payment />
        </div>
      </section>
      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tous types de travaux acceptés
            </h2>
            <p className="text-lg text-gray-600">
              Soumettez votre demande, nos artisans spécialisés y répondront
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.values(ServiceType).map((service, index) => {
              const categoryConfig = getCategoryConfig(service, "h-10 w-10");
              return (
                <Card
                  key={index}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-105 bg-gradient-to-b from-white to-gray-50"
                >
                  <CardContent className="p-5 text-center">
                    <div
                      className={`w-14 h-14 ${categoryConfig.colors.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm`}
                    >
                      {categoryConfig.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {categoryConfig.type}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Spécialistes disponibles
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      {/* How it Works */}
      <Presentation />
    </main>
  );
}
