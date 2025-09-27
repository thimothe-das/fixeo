"use client";

export default function Title() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
        Votre bricoleur,
        <span className="inline-block text-fixeo-main-500 ml-2">
          à porter de clic
        </span>
      </h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl">
        Fixéo connecte automatiquement votre demande au premier artisan
        disponible près de chez vous.
      </p>
    </>
  );
}
