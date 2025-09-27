"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  CheckCircle,
  CreditCard,
  Phone,
  Shield,
  Smartphone,
  Star,
} from "lucide-react";

export default function Presentation() {
  return (
    <>
      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600">
              Soumettez votre demande et laissez les artisans venir à vous
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-fixeo-main-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Envoyez votre demande
              </h3>
              <p className="text-gray-600">
                Décrivez vos travaux, ajoutez des photos, indiquez l'adresse et
                votre budget. Votre demande est diffusée aux artisans de votre
                secteur.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-fixeo-main-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Un artisan accepte
              </h3>
              <p className="text-gray-600">
                Le premier artisan disponible et qualifié accepte votre demande.
                Vous recevez ses coordonnées instantanément.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-fixeo-main-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Travaux réalisés
              </h3>
              <p className="text-gray-600">
                L'artisan intervient selon les modalités convenues. Payez
                directement via l'app une fois les travaux terminés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Votre sécurité, notre priorité
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Artisans vérifiés
                    </h3>
                    <p className="text-gray-600">
                      Tous nos professionnels sont contrôlés et certifiés. Vos
                      photos les aident à mieux évaluer le travail.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Paiement sécurisé
                    </h3>
                    <p className="text-gray-600">
                      Transactions protégées et garantie satisfait ou remboursé.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Support 7j/7
                    </h3>
                    <p className="text-gray-600">
                      Notre équipe est là pour vous accompagner à tout moment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Garantie qualité
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Satisfaction garantie sur toutes nos interventions ou nous
                      trouvons une solution.
                    </p>
                    <div className="flex justify-center space-x-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Plus de 15,000 avis clients
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* For Artisans */}
      <section className="py-16 bg-fixeo-main-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Vous êtes artisan ?</h2>
              <p className="text-xl text-fixeo-main-100 mb-8">
                Recevez des demandes de travaux automatiquement selon vos
                spécialités
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg">
                    Recevez des demandes en temps réel
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg">
                    Acceptez seulement les missions qui vous conviennent
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg">
                    Paiements automatiques après intervention
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-lg">
                    Zéro prospection, concentrez-vous sur votre métier
                  </span>
                </div>
              </div>

              <Button className="bg-white text-fixeo-main-600 hover:bg-gray-100 font-semibold px-8 py-3">
                Devenir partenaire
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      +40%
                    </div>
                    <div className="text-blue-100 text-sm">
                      de revenus en moyenne
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      150+
                    </div>
                    <div className="text-blue-100 text-sm">
                      nouveaux clients/mois
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      4.9★
                    </div>
                    <div className="text-blue-100 text-sm">
                      satisfaction artisans
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      24h
                    </div>
                    <div className="text-blue-100 text-sm">paiement moyen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Téléchargez l'app Fixéo
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Gérez vos demandes, suivez vos artisans et payez en toute
                sécurité depuis votre smartphone.
              </p>

              <div className="flex items-center space-x-4 mb-8">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">4.8</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">
                  Plus de 25,000 téléchargements
                </span>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" className="h-14 px-6">
                  <Smartphone className="mr-3 h-6 w-6" />
                  <div className="text-left">
                    <div className="text-xs text-gray-600">Télécharger sur</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-14 px-6">
                  <Smartphone className="mr-3 h-6 w-6" />
                  <div className="text-left">
                    <div className="text-xs text-gray-600">Disponible sur</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 text-center">
              <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-3xl shadow-2xl">
                <Smartphone className="h-32 w-32 text-white mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
