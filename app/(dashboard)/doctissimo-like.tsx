import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Search,
  MapPin,
  Wrench,
  Shield,
  Users,
  Star,
  Smartphone,
  UserCheck,
  TrendingUp,
  Trophy,
  Clock,
} from "lucide-react";

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Trouvez votre
                <span className="block text-blue-600">artisan en un clic</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Réservez rapidement un professionnel qualifié pour tous vos
                travaux de bricolage, maintenance et aménagement. Des milliers
                d'artisans à votre service.
              </p>

              {/* Search Form */}
              <div className="mt-8 sm:max-w-lg sm:mx-auto lg:mx-0">
                <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
                  <div className="relative">
                    <Wrench className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Nom, entreprise, spécialité"
                      className="pl-11 h-12 text-lg"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input placeholder="Où" className="pl-11 h-12 text-lg" />
                    <Button
                      variant="ghost"
                      className="absolute right-2 top-1 h-10 text-sm text-blue-600"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Autour de moi
                    </Button>
                  </div>
                  <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                    <Search className="mr-2 h-5 w-5" />
                    Rechercher
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="bg-white rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Fixéo
                  </h3>
                  <p className="text-gray-600">
                    Votre réseau d'artisans de confiance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-8">
                Votre partenaire bricolage au quotidien
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Trouvez l'artisan parfait facilement
                  </h3>
                  <p className="text-gray-600">
                    Réservez des interventions à domicile ou en atelier, et
                    recevez des rappels pour ne jamais les manquer.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bénéficiez de services personnalisés
                  </h3>
                  <p className="text-gray-600">
                    Échangez avec vos artisans par message, obtenez des devis
                    personnalisés et des conseils d'experts.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Gérez vos projets
                  </h3>
                  <p className="text-gray-600">
                    Centralisez tous vos travaux, suivez l'avancement et
                    conservez l'historique de vos interventions.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Intervention rapide
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Artisans vérifiés
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Qualité garantie
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg text-center">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Support client
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fixéo en chiffres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                50 000+
              </div>
              <p className="text-gray-600">clients satisfaits</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                5 000+
              </div>
              <p className="text-gray-600">artisans partenaires</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                100 000+
              </div>
              <p className="text-gray-600">interventions réalisées</p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Security Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Vos données. Notre priorité.
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                La confidentialité de vos informations personnelles est une
                priorité absolue pour Fixéo et guide notre action au quotidien.
              </p>
              <Button variant="outline" className="rounded-full">
                Découvrir nos engagements
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-50 p-8 rounded-lg">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                  Données sécurisées
                </h3>
                <p className="text-center text-gray-600">
                  Chiffrement de bout en bout et conformité RGPD
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Des milliers de personnes utilisent l'application Fixéo
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Fixéo rend l'accès aux services d'artisans rapide et facile.
                C'est pourquoi des milliers de personnes l'utilisent chaque mois
                pour leurs projets de bricolage.
              </p>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">4.8</span>
                <span className="text-gray-600">Plus de 10 000 avis</span>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" className="rounded-lg">
                  <Smartphone className="mr-2 h-5 w-5" />
                  App Store
                </Button>
                <Button variant="outline" className="rounded-lg">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Google Play
                </Button>
              </div>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <Smartphone className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                  Application mobile
                </h3>
                <p className="text-center text-gray-600">
                  Gérez vos demandes où que vous soyez
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Vous êtes artisan ?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Découvrez Fixéo pour les professionnels et développez votre
                activité
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <UserCheck className="h-5 w-5 text-green-600 mr-3" />
                  <span>Trouvez de nouveaux clients près de chez vous</span>
                </li>
                <li className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                  <span>Augmentez les revenus de votre activité</span>
                </li>
                <li className="flex items-center">
                  <Trophy className="h-5 w-5 text-green-600 mr-3" />
                  <span>Rejoignez plus de 5 000 artisans partenaires</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-3" />
                  <span>Gérez vos plannings efficacement</span>
                </li>
              </ul>
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700">
                En savoir plus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 lg:mt-0">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-8 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">+40% de revenus</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">+150 clients/mois</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Fixéo recrute</h2>
          <p className="text-xl text-gray-300 mb-8">
            Ensemble, construisons l'avenir du service à domicile.
          </p>
          <Button
            variant="outline"
            className="rounded-full border-white text-white hover:bg-white hover:text-gray-900"
          >
            VOIR LES OFFRES D'EMPLOI
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </main>
  );
}
