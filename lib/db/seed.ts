import { UserRole } from "@/lib/auth/roles";
import { hashPassword } from "@/lib/auth/session";
import { ServiceType, Urgency } from "@/lib/utils";
import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import {
  billingEstimates,
  BillingEstimateStatus,
  clientProfiles,
  conversations,
  MessageSenderType,
  professionalProfiles,
  serviceRequests,
  ServiceRequestStatus,
  serviceRequestStatusHistory,
  teamMembers,
  teams,
  users,
} from "./schema";

async function createStripeProducts() {
  console.log("Creating Stripe products and prices...");

  const baseProduct = await stripe.products.create({
    name: "Base",
    description: "Base subscription plan",
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: "Plus",
    description: "Plus subscription plan",
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  console.log("Stripe products and prices created successfully.");
}

async function seed() {
  const passwordHash = await hashPassword("admin123");

  console.log("Creating users...");

  // Admin user
  const [adminUser] = await db
    .insert(users)
    .values({
      email: "test@test.com",
      passwordHash: passwordHash,
      role: UserRole.ADMIN,
      name: "Admin Fixeo",
    })
    .returning();

  // Client users
  const [client1] = await db
    .insert(users)
    .values({
      email: "marie.dubois@email.fr",
      passwordHash: passwordHash,
      role: UserRole.CLIENT,
      name: "Marie Dubois",
    })
    .returning();

  const [client2] = await db
    .insert(users)
    .values({
      email: "pierre.martin@email.fr",
      passwordHash: passwordHash,
      role: UserRole.CLIENT,
      name: "Pierre Martin",
    })
    .returning();

  const [client3] = await db
    .insert(users)
    .values({
      email: "sophie.bernard@email.fr",
      passwordHash: passwordHash,
      role: UserRole.CLIENT,
      name: "Sophie Bernard",
    })
    .returning();

  const [client4] = await db
    .insert(users)
    .values({
      email: "lucas.petit@email.fr",
      passwordHash: passwordHash,
      role: UserRole.CLIENT,
      name: "Lucas Petit",
    })
    .returning();

  const [client5] = await db
    .insert(users)
    .values({
      email: "julie.rousseau@email.fr",
      passwordHash: passwordHash,
      role: UserRole.CLIENT,
      name: "Julie Rousseau",
    })
    .returning();

  // Artisan users
  const [artisan1] = await db
    .insert(users)
    .values({
      email: "jean.plombier@artisan.fr",
      passwordHash: passwordHash,
      role: UserRole.PROFESSIONAL,
      name: "Jean Lecomte",
    })
    .returning();

  const [artisan2] = await db
    .insert(users)
    .values({
      email: "marc.electricien@artisan.fr",
      passwordHash: passwordHash,
      role: UserRole.PROFESSIONAL,
      name: "Marc Fournier",
    })
    .returning();

  const [artisan3] = await db
    .insert(users)
    .values({
      email: "paul.peintre@artisan.fr",
      passwordHash: passwordHash,
      role: UserRole.PROFESSIONAL,
      name: "Paul Moreau",
    })
    .returning();

  const [artisan4] = await db
    .insert(users)
    .values({
      email: "thomas.menuisier@artisan.fr",
      passwordHash: passwordHash,
      role: UserRole.PROFESSIONAL,
      name: "Thomas Simon",
    })
    .returning();

  const [artisan5] = await db
    .insert(users)
    .values({
      email: "antoine.renovation@artisan.fr",
      passwordHash: passwordHash,
      role: UserRole.PROFESSIONAL,
      name: "Antoine Laurent",
    })
    .returning();

  console.log("Users created. Creating profiles...");

  // Client profiles
  await db.insert(clientProfiles).values([
    {
      userId: client1.id,
      firstName: "Marie",
      lastName: "Dubois",
      phone: "06 12 34 56 78",
      address: "15 Rue de Rivoli 75004 Paris",
      addressHousenumber: "15",
      addressStreet: "Rue de Rivoli",
      addressPostcode: "75004",
      addressCity: "Paris",
      addressCitycode: "75104",
      addressCoordinates: "2.357712,48.855906",
    },
    {
      userId: client2.id,
      firstName: "Pierre",
      lastName: "Martin",
      phone: "06 23 45 67 89",
      address: "42 Cours Richard Vitton 69003 Lyon",
      addressHousenumber: "42",
      addressStreet: "Cours Richard Vitton",
      addressPostcode: "69003",
      addressCity: "Lyon",
      addressCitycode: "69383",
      addressCoordinates: "4.889686,45.753592",
    },
    {
      userId: client3.id,
      firstName: "Sophie",
      lastName: "Bernard",
      phone: "06 34 56 78 90",
      address: "8 Rue paradis 13001 Marseille",
      addressHousenumber: "8",
      addressStreet: "Rue paradis",
      addressPostcode: "13001",
      addressCity: "Marseille",
      addressCitycode: "13201",
      addressCoordinates: "5.37633,43.294297",
    },
    {
      userId: client4.id,
      firstName: "Lucas",
      lastName: "Petit",
      phone: "06 45 67 89 01",
      address: "23 Allées Jean Jaurès 31000 Toulouse",
      addressHousenumber: "23",
      addressStreet: "Allées Jean Jaurès",
      addressPostcode: "31000",
      addressCity: "Toulouse",
      addressCitycode: "31555",
      addressCoordinates: "1.449283,43.606492",
    },
    {
      userId: client5.id,
      firstName: "Julie",
      lastName: "Rousseau",
      phone: "06 56 78 90 12",
      address: "10 Avenue Jean Médecin 06000 Nice",
      addressHousenumber: "10",
      addressStreet: "Avenue Jean Médecin",
      addressPostcode: "06000",
      addressCity: "Nice",
      addressCitycode: "06088",
      addressCoordinates: "7.268911,43.699415",
    },
  ]);

  // Professional profiles
  await db.insert(professionalProfiles).values([
    {
      userId: artisan1.id,
      firstName: "Jean",
      lastName: "Lecomte",
      phone: "06 11 22 33 44",
      serviceArea: "Paris et Île-de-France",
      serviceAreaCity: "Paris",
      serviceAreaPostcode: "75004",
      serviceAreaCoordinates: "2.357712,48.855906",
      siret: "12345678901234",
      experience: "10+",
      specialties: JSON.stringify([
        ServiceType.PLOMBERIE,
        ServiceType.DEPANNAGE,
      ]),
      description:
        "Plombier expérimenté spécialisé dans les dépannages d'urgence et les installations sanitaires. Intervention rapide 7j/7.",
      isVerified: true,
    },
    {
      userId: artisan2.id,
      firstName: "Marc",
      lastName: "Fournier",
      phone: "06 22 33 44 55",
      serviceArea: "Lyon et agglomération",
      serviceAreaCity: "Lyon",
      serviceAreaPostcode: "69003",
      serviceAreaCoordinates: "4.889686,45.753592",
      siret: "23456789012345",
      experience: "5-10",
      specialties: JSON.stringify([
        ServiceType.ELECTRICITE,
        ServiceType.DEPANNAGE,
      ]),
      description:
        "Électricien qualifié pour tous vos travaux électriques : installation, rénovation, mise aux normes. Certifié RGE.",
      isVerified: true,
    },
    {
      userId: artisan3.id,
      firstName: "Paul",
      lastName: "Moreau",
      phone: "06 33 44 55 66",
      serviceArea: "Marseille et région PACA",
      serviceAreaCity: "Marseille",
      serviceAreaPostcode: "13001",
      serviceAreaCoordinates: "5.37633,43.294297",
      siret: "34567890123456",
      experience: "5-10",
      specialties: JSON.stringify([
        ServiceType.PEINTURE,
        ServiceType.RENOVATION,
      ]),
      description:
        "Peintre professionnel spécialisé dans la décoration intérieure et extérieure. Devis gratuit et conseils personnalisés.",
      isVerified: true,
    },
    {
      userId: artisan4.id,
      firstName: "Thomas",
      lastName: "Simon",
      phone: "06 44 55 66 77",
      serviceArea: "Toulouse et Haute-Garonne",
      serviceAreaCity: "Toulouse",
      serviceAreaPostcode: "31000",
      serviceAreaCoordinates: "1.449283,43.606492",
      siret: "45678901234567",
      experience: "3-5",
      specialties: JSON.stringify([
        ServiceType.MENUISERIE,
        ServiceType.RENOVATION,
      ]),
      description:
        "Menuisier expérimenté pour la pose de fenêtres, portes, placards sur mesure et tous travaux de menuiserie.",
      isVerified: true,
    },
    {
      userId: artisan5.id,
      firstName: "Antoine",
      lastName: "Laurent",
      phone: "06 55 66 77 88",
      serviceArea: "Nice et Côte d'Azur",
      serviceAreaCity: "Nice",
      serviceAreaPostcode: "06000",
      serviceAreaCoordinates: "7.268911,43.699415",
      siret: "56789012345678",
      experience: "10+",
      specialties: JSON.stringify([
        ServiceType.RENOVATION,
        ServiceType.PLOMBERIE,
        ServiceType.ELECTRICITE,
      ]),
      description:
        "Entreprise de rénovation complète : gros œuvre, second œuvre, coordination de tous les corps de métier. Plus de 15 ans d'expérience.",
      isVerified: true,
    },
  ]);

  console.log("Profiles created. Creating team...");

  const [team] = await db
    .insert(teams)
    .values({
      name: "Test Team",
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: adminUser.id,
    role: "owner",
  });

  console.log("Team created. Creating service requests...");

  // Helper to create dates in the past
  const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  // Service Requests covering all statuses and types
  const requests = await db
    .insert(serviceRequests)
    .values([
      // 1. AWAITING_ESTIMATE - Plomberie
      {
        title: "Fuite d'eau urgente sous l'évier",
        serviceType: ServiceType.PLOMBERIE,
        urgency: Urgency.URGENT,
        description:
          "Bonjour, j'ai une fuite d'eau importante sous mon évier de cuisine. L'eau coule continuellement et j'ai dû couper l'arrivée d'eau. J'ai besoin d'une intervention rapide pour réparer cette fuite avant que cela ne cause plus de dégâts. Le robinet semble être en bon état mais c'est le tuyau d'évacuation qui fuit.",
        location: "15 Rue de Rivoli 75004 Paris",
        locationHousenumber: "15",
        locationStreet: "Rue de Rivoli",
        locationPostcode: "75004",
        locationCity: "Paris",
        locationCitycode: "75104",
        locationCoordinates: "2.357712,48.855906",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client1.email,
        userId: client1.id,
        status: ServiceRequestStatus.AWAITING_ESTIMATE,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      // 2. AWAITING_ESTIMATE - Électricité
      {
        title: "Panne électrique partielle dans l'appartement",
        serviceType: ServiceType.ELECTRICITE,
        urgency: Urgency.URGENT,
        description:
          "Plusieurs prises électriques ne fonctionnent plus dans mon salon et ma chambre depuis ce matin. Le disjoncteur principal n'a pas sauté mais certains circuits semblent ne plus être alimentés. J'ai vérifié les fusibles mais tout semble normal. J'ai besoin d'un électricien qualifié pour diagnostiquer et réparer le problème rapidement.",
        location: "42 Cours Richard Vitton 69003 Lyon",
        locationHousenumber: "42",
        locationStreet: "Cours Richard Vitton",
        locationPostcode: "69003",
        locationCity: "Lyon",
        locationCitycode: "69383",
        locationCoordinates: "4.889686,45.753592",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client2.email,
        userId: client2.id,
        status: ServiceRequestStatus.AWAITING_ESTIMATE,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
      // 3. AWAITING_ESTIMATE_ACCEPTATION - Peinture
      {
        title: "Repeindre appartement 3 pièces",
        serviceType: ServiceType.PEINTURE,
        urgency: Urgency.FLEXIBLE,
        description:
          "Je souhaite faire repeindre mon appartement de 3 pièces (environ 70m²). Les murs sont actuellement en bon état mais la peinture est ancienne et ternie. Je voudrais une peinture blanche pour toutes les pièces avec des finitions soignées. Les plafonds sont également à repeindre. Je suis flexible sur les dates et peux m'adapter au planning de l'artisan.",
        location: "8 Rue paradis 13001 Marseille",
        locationHousenumber: "8",
        locationStreet: "Rue paradis",
        locationPostcode: "13001",
        locationCity: "Marseille",
        locationCitycode: "13201",
        locationCoordinates: "5.37633,43.294297",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client3.email,
        userId: client3.id,
        status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(3),
      },
      // 4. AWAITING_ESTIMATE_ACCEPTATION - Menuiserie
      {
        title: "Installation de placards sur mesure",
        serviceType: ServiceType.MENUISERIE,
        urgency: Urgency.WEEK,
        description:
          "Je recherche un menuisier pour la conception et l'installation de placards sur mesure dans ma chambre. L'espace disponible fait 3 mètres de long sur 2,5 mètres de hauteur. Je souhaite un système de portes coulissantes avec des étagères et penderies à l'intérieur. Possibilité de fournir un plan détaillé si nécessaire.",
        location: "23 Allées Jean Jaurès 31000 Toulouse",
        locationHousenumber: "23",
        locationStreet: "Allées Jean Jaurès",
        locationPostcode: "31000",
        locationCity: "Toulouse",
        locationCitycode: "31555",
        locationCoordinates: "1.449283,43.606492",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client4.email,
        userId: client4.id,
        status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
        createdAt: daysAgo(8),
        updatedAt: daysAgo(2),
      },
      // 5. AWAITING_ASSIGNATION - Plomberie
      {
        title: "Remplacement chauffe-eau électrique",
        serviceType: ServiceType.PLOMBERIE,
        urgency: Urgency.WEEK,
        description:
          "Mon chauffe-eau électrique de 200 litres ne fonctionne plus correctement. Il a plus de 15 ans et commence à fuir légèrement par le bas. Je souhaite le remplacer par un modèle récent et plus économique. L'installation actuelle est dans la salle de bain, fixée au mur. J'aimerais que les travaux soient réalisés dans la semaine si possible.",
        location: "10 Avenue Jean Médecin 06000 Nice",
        locationHousenumber: "10",
        locationStreet: "Avenue Jean Médecin",
        locationPostcode: "06000",
        locationCity: "Nice",
        locationCitycode: "06088",
        locationCoordinates: "7.268911,43.699415",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client5.email,
        userId: client5.id,
        status: ServiceRequestStatus.AWAITING_ASSIGNATION,
        downPaymentPaid: true,
        createdAt: daysAgo(15),
        updatedAt: daysAgo(1),
      },
      // 6. AWAITING_ASSIGNATION - Électricité
      {
        title: "Mise aux normes tableau électrique",
        serviceType: ServiceType.ELECTRICITE,
        urgency: Urgency.FLEXIBLE,
        description:
          "Je viens d'acheter un appartement ancien et le tableau électrique n'est pas aux normes actuelles. Il n'y a pas de disjoncteur différentiel et certains circuits ne sont pas protégés correctement. Je souhaite faire une mise aux normes complète du tableau électrique pour sécuriser l'installation avant d'emménager. Je peux organiser l'accès facilement.",
        location: "25 Rue des Martyrs 75009 Paris",
        locationHousenumber: "25",
        locationStreet: "Rue des Martyrs",
        locationPostcode: "75009",
        locationCity: "Paris",
        locationCitycode: "75109",
        locationCoordinates: "2.339595,48.878463",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client1.email,
        userId: client1.id,
        status: ServiceRequestStatus.AWAITING_ASSIGNATION,
        downPaymentPaid: true,
        createdAt: daysAgo(20),
        updatedAt: daysAgo(5),
      },
      // 7. IN_PROGRESS - Rénovation
      {
        title: "Rénovation complète salle de bain",
        serviceType: ServiceType.RENOVATION,
        urgency: Urgency.WEEK,
        description:
          "Je souhaite rénover entièrement ma salle de bain (environ 6m²). Les travaux incluent : démolition de l'ancienne installation, pose de nouveau carrelage sol et mur, installation d'une douche italienne, remplacement des sanitaires (lavabo, WC), pose d'un meuble vasque moderne, et refaire toute la plomberie et l'électricité. Je recherche une entreprise capable de coordonner tous les corps de métier.",
        location: "18 Rue de la République 69002 Lyon",
        locationHousenumber: "18",
        locationStreet: "Rue de la République",
        locationPostcode: "69002",
        locationCity: "Lyon",
        locationCitycode: "69382",
        locationCoordinates: "4.835687,45.764038",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client2.email,
        userId: client2.id,
        status: ServiceRequestStatus.IN_PROGRESS,
        assignedArtisanId: artisan5.id,
        estimatedPrice: 850000, // €8,500
        downPaymentPaid: true,
        createdAt: daysAgo(30),
        updatedAt: daysAgo(1),
      },
      // 8. IN_PROGRESS - Peinture
      {
        title: "Peinture extérieure façade maison",
        serviceType: ServiceType.PEINTURE,
        urgency: Urgency.FLEXIBLE,
        description:
          "Ma maison individuelle a besoin d'un ravalement de façade. La peinture actuelle est écaillée et ternie par le temps. La surface à peindre fait environ 120m². Je souhaite une peinture de qualité adaptée aux conditions extérieures et résistante aux intempéries. Un nettoyage préalable de la façade sera nécessaire. Les travaux peuvent être planifiés sur plusieurs jours selon vos disponibilités.",
        location: "35 Rue saint ferreol 13001 Marseille",
        locationHousenumber: "35",
        locationStreet: "Rue saint ferreol",
        locationPostcode: "13001",
        locationCity: "Marseille",
        locationCitycode: "13201",
        locationCoordinates: "5.378162,43.293936",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client3.email,
        userId: client3.id,
        status: ServiceRequestStatus.IN_PROGRESS,
        assignedArtisanId: artisan3.id,
        estimatedPrice: 320000, // €3,200
        downPaymentPaid: true,
        createdAt: daysAgo(25),
        updatedAt: daysAgo(2),
      },
      // 9. CLIENT_VALIDATED - Dépannage
      {
        title: "Réparation porte d'entrée bloquée",
        serviceType: ServiceType.DEPANNAGE,
        urgency: Urgency.URGENT,
        description:
          "Ma porte d'entrée est très difficile à ouvrir et fermer depuis quelques jours. La serrure semble coincée et je dois forcer pour tourner la clé. J'ai peur de rester bloqué dehors ou que la clé se casse dans la serrure. J'ai besoin d'une intervention rapide pour réparer ou remplacer le mécanisme de fermeture. C'est une porte blindée avec serrure 3 points.",
        location: "15 Rue d'Alsace Lorraine 31000 Toulouse",
        locationHousenumber: "15",
        locationStreet: "Rue d'Alsace Lorraine",
        locationPostcode: "31000",
        locationCity: "Toulouse",
        locationCitycode: "31555",
        locationCoordinates: "1.445566,43.600994",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client4.email,
        userId: client4.id,
        status: ServiceRequestStatus.CLIENT_VALIDATED,
        assignedArtisanId: artisan4.id,
        estimatedPrice: 18000, // €180
        downPaymentPaid: true,
        createdAt: daysAgo(35),
        updatedAt: daysAgo(1),
      },
      // 10. ARTISAN_VALIDATED - Plomberie
      {
        title: "Installation nouvelle cuisine - plomberie",
        serviceType: ServiceType.PLOMBERIE,
        urgency: Urgency.WEEK,
        description:
          "Je vais installer une nouvelle cuisine et j'ai besoin d'un plombier pour adapter toute la plomberie. Il faut déplacer l'arrivée d'eau, installer de nouvelles évacuations pour l'évier et le lave-vaisselle, et connecter le lave-linge. La cuisine actuelle est complètement à refaire donc il y a beaucoup de flexibilité sur l'emplacement des équipements.",
        location: "5 Rue Masséna 06000 Nice",
        locationHousenumber: "5",
        locationStreet: "Rue Masséna",
        locationPostcode: "06000",
        locationCity: "Nice",
        locationCitycode: "06088",
        locationCoordinates: "7.268639,43.697749",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client5.email,
        userId: client5.id,
        status: ServiceRequestStatus.ARTISAN_VALIDATED,
        assignedArtisanId: artisan1.id,
        estimatedPrice: 125000, // €1,250
        downPaymentPaid: true,
        createdAt: daysAgo(40),
        updatedAt: daysAgo(1),
      },
      // 11. AWAITING_PAYMENT - Électricité
      {
        title: "Installation prises électriques supplémentaires",
        serviceType: ServiceType.ELECTRICITE,
        urgency: Urgency.FLEXIBLE,
        description:
          "J'aimerais ajouter plusieurs prises électriques dans différentes pièces de mon appartement. Dans le salon, j'ai besoin de 4 prises supplémentaires pour brancher mes équipements multimédias. Dans la chambre, 2 prises de chaque côté du lit. Et dans le bureau, 3 prises pour l'ordinateur et les périphériques. Total : environ 9 prises à installer avec un raccordement aux circuits existants.",
        location: "12 Rue Saint-Antoine 75004 Paris",
        locationHousenumber: "12",
        locationStreet: "Rue Saint-Antoine",
        locationPostcode: "75004",
        locationCity: "Paris",
        locationCitycode: "75104",
        locationCoordinates: "2.366625,48.853607",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client1.email,
        userId: client1.id,
        status: ServiceRequestStatus.AWAITING_PAYMENT,
        assignedArtisanId: artisan2.id,
        estimatedPrice: 75000, // €750
        downPaymentPaid: true,
        createdAt: daysAgo(45),
        updatedAt: daysAgo(2),
      },
      // 12. COMPLETED - Menuiserie
      {
        title: "Pose de fenêtres double vitrage",
        serviceType: ServiceType.MENUISERIE,
        urgency: Urgency.WEEK,
        description:
          "Je souhaite remplacer 5 fenêtres anciennes par des fenêtres double vitrage PVC pour améliorer l'isolation thermique et phonique de mon appartement. Les dimensions sont standards : 3 fenêtres de 120x140cm et 2 fenêtres de 80x120cm. Je souhaite des fenêtres blanches avec ouverture oscillo-battante. Le retrait des anciennes fenêtres et l'évacuation des gravats doivent être inclus.",
        location: "55 Rue de la Charité 69002 Lyon",
        locationHousenumber: "55",
        locationStreet: "Rue de la Charité",
        locationPostcode: "69002",
        locationCity: "Lyon",
        locationCitycode: "69382",
        locationCoordinates: "4.830273,45.750225",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1545147986-a9d6f2ab03b5?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client2.email,
        userId: client2.id,
        status: ServiceRequestStatus.COMPLETED,
        assignedArtisanId: artisan4.id,
        estimatedPrice: 485000, // €4,850
        downPaymentPaid: true,
        createdAt: daysAgo(60),
        updatedAt: daysAgo(10),
      },
      // 13. COMPLETED - Peinture
      {
        title: "Peinture chambre enfant avec décoration",
        serviceType: ServiceType.PEINTURE,
        urgency: Urgency.FLEXIBLE,
        description:
          "Je veux faire repeindre la chambre de mon enfant (environ 12m²) avec des couleurs douces et gaies. Un mur d'accent bleu ciel, les autres murs en blanc cassé, et si possible quelques décorations peintes simples (nuages, étoiles). Le plafond est à repeindre en blanc. La chambre est actuellement vide donc l'accès est facile. Je cherche un peintre qui a l'habitude des chambres d'enfants.",
        location: "14 Rue sainte 13001 Marseille",
        locationHousenumber: "14",
        locationStreet: "Rue sainte",
        locationPostcode: "13001",
        locationCity: "Marseille",
        locationCitycode: "13201",
        locationCoordinates: "5.375861,43.292692",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client3.email,
        userId: client3.id,
        status: ServiceRequestStatus.COMPLETED,
        assignedArtisanId: artisan3.id,
        estimatedPrice: 65000, // €650
        downPaymentPaid: true,
        createdAt: daysAgo(50),
        updatedAt: daysAgo(15),
      },
      // 14. DISPUTED_BY_CLIENT - Plomberie
      {
        title: "Débouchage canalisation salle de bain",
        serviceType: ServiceType.PLOMBERIE,
        urgency: Urgency.URGENT,
        description:
          "Ma baignoire et mon lavabo ne s'écoulent plus correctement. L'eau stagne et met beaucoup de temps à partir. J'ai déjà essayé les produits déboucheurs du commerce sans succès. Il semble y avoir un bouchon dans la canalisation principale. J'ai besoin d'un plombier équipé pour déboucher efficacement les canalisations, peut-être avec un furet électrique ou un nettoyeur haute pression.",
        location: "8 Rue de Metz 31000 Toulouse",
        locationHousenumber: "8",
        locationStreet: "Rue de Metz",
        locationPostcode: "31000",
        locationCity: "Toulouse",
        locationCitycode: "31555",
        locationCoordinates: "1.441681,43.599798",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client4.email,
        userId: client4.id,
        status: ServiceRequestStatus.DISPUTED_BY_CLIENT,
        assignedArtisanId: artisan1.id,
        estimatedPrice: 15000, // €150
        downPaymentPaid: true,
        createdAt: daysAgo(20),
        updatedAt: daysAgo(3),
      },
      // 15. DISPUTED_BY_ARTISAN - Rénovation
      {
        title: "Rénovation parquet ancien",
        serviceType: ServiceType.RENOVATION,
        urgency: Urgency.FLEXIBLE,
        description:
          "J'ai un parquet ancien en chêne massif dans mon salon (environ 30m²) qui a besoin d'être rénové. Le bois est en bon état mais très rayé et terni. Je souhaite un ponçage complet suivi de l'application d'un vitrificateur mat ou satiné. Il y a quelques lames légèrement décollées qui devront être refixées. Le parquet date des années 1950 et je veux lui redonner son éclat d'origine.",
        location: "12 Rue de France 06000 Nice",
        locationHousenumber: "12",
        locationStreet: "Rue de France",
        locationPostcode: "06000",
        locationCity: "Nice",
        locationCitycode: "06088",
        locationCoordinates: "7.26372,43.696533",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client5.email,
        userId: client5.id,
        status: ServiceRequestStatus.DISPUTED_BY_ARTISAN,
        assignedArtisanId: artisan5.id,
        estimatedPrice: 195000, // €1,950
        downPaymentPaid: true,
        createdAt: daysAgo(55),
        updatedAt: daysAgo(5),
      },
      // 16. RESOLVED - Électricité
      {
        title: "Installation luminaires et spots LED",
        serviceType: ServiceType.ELECTRICITE,
        urgency: Urgency.WEEK,
        description:
          "Je viens de recevoir de nouveaux luminaires et spots LED encastrables pour mon appartement. J'ai besoin d'un électricien pour installer : 3 suspensions au plafond, 8 spots LED encastrables dans le faux plafond de la cuisine, et 2 appliques murales dans le couloir. Tous les câblages existent déjà mais les connexions et la pose des luminaires nécessitent un professionnel.",
        location: "7 Rue du Faubourg Saint-Antoine 75011 Paris",
        locationHousenumber: "7",
        locationStreet: "Rue du Faubourg Saint-Antoine",
        locationPostcode: "75011",
        locationCity: "Paris",
        locationCitycode: "75111",
        locationCoordinates: "2.370804,48.853104",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client1.email,
        userId: client1.id,
        status: ServiceRequestStatus.RESOLVED,
        assignedArtisanId: artisan2.id,
        estimatedPrice: 42000, // €420
        downPaymentPaid: true,
        createdAt: daysAgo(70),
        updatedAt: daysAgo(20),
      },
      // 17. CANCELLED - Menuiserie
      {
        title: "Fabrication bibliothèque sur mesure",
        serviceType: ServiceType.MENUISERIE,
        urgency: Urgency.FLEXIBLE,
        description:
          "Je recherche un menuisier pour créer une bibliothèque sur mesure dans mon salon. L'espace disponible fait 3 mètres de largeur sur toute la hauteur du mur (2,6m). Je souhaite des étagères réglables en bois massif (chêne ou hêtre), avec quelques compartiments fermés en bas. Le design doit être moderne et épuré. Je peux fournir des croquis et dimensions précises lors de la visite.",
        location: "42 Cours Richard Vitton 69003 Lyon",
        locationHousenumber: "42",
        locationStreet: "Cours Richard Vitton",
        locationPostcode: "69003",
        locationCity: "Lyon",
        locationCitycode: "69383",
        locationCoordinates: "4.889686,45.753592",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client2.email,
        userId: client2.id,
        status: ServiceRequestStatus.CANCELLED,
        createdAt: daysAgo(65),
        updatedAt: daysAgo(60),
      },
      // 18. AWAITING_ESTIMATE - Dépannage
      {
        title: "Volet roulant électrique en panne",
        serviceType: ServiceType.DEPANNAGE,
        urgency: Urgency.WEEK,
        description:
          "Mon volet roulant électrique de la chambre ne fonctionne plus. Il est bloqué en position basse et ne répond plus à la télécommande. J'ai changé les piles de la télécommande mais rien ne change. Le moteur ne fait aucun bruit quand j'appuie sur les boutons. Il faudra probablement remplacer le moteur ou réparer le mécanisme. Le volet fait 120cm de large et le coffre est accessible depuis l'intérieur.",
        location: "8 Rue paradis 13001 Marseille",
        locationHousenumber: "8",
        locationStreet: "Rue paradis",
        locationPostcode: "13001",
        locationCity: "Marseille",
        locationCitycode: "13201",
        locationCoordinates: "5.37633,43.294297",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client3.email,
        userId: client3.id,
        status: ServiceRequestStatus.AWAITING_ESTIMATE,
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },
      // 19. IN_PROGRESS - Électricité
      {
        title: "Installation borne de recharge voiture électrique",
        serviceType: ServiceType.ELECTRICITE,
        urgency: Urgency.FLEXIBLE,
        description:
          "Je viens d'acheter une voiture électrique et j'ai besoin d'installer une borne de recharge dans mon garage. Je possède déjà la borne (Wallbox 7,4kW monophasé) et j'ai besoin d'un électricien qualifié IRVE pour l'installation. Il faudra tirer une ligne dédiée depuis le tableau électrique qui se trouve à environ 15 mètres du garage. Le tableau est récent et dispose de place pour un disjoncteur supplémentaire.",
        location: "33 Boulevard Lazare Carnot 31000 Toulouse",
        locationHousenumber: "33",
        locationStreet: "Boulevard Lazare Carnot",
        locationPostcode: "31000",
        locationCity: "Toulouse",
        locationCitycode: "31555",
        locationCoordinates: "1.451516,43.602486",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client4.email,
        userId: client4.id,
        status: ServiceRequestStatus.IN_PROGRESS,
        assignedArtisanId: artisan2.id,
        estimatedPrice: 125000, // €1,250
        downPaymentPaid: true,
        createdAt: daysAgo(18),
        updatedAt: daysAgo(1),
      },
      // 20. COMPLETED - Rénovation
      {
        title: "Rénovation cuisine : carrelage et peinture",
        serviceType: ServiceType.RENOVATION,
        urgency: Urgency.WEEK,
        description:
          "Ma cuisine a besoin d'un coup de neuf. Je souhaite faire poser un nouveau carrelage au sol (environ 15m²) en grès cérame imitation parquet, et repeindre tous les murs avec une peinture lessivable adaptée aux cuisines. Il faudra retirer l'ancien carrelage au préalable. La cuisine reste équipée donc il faudra travailler autour des meubles. Je fournirai le carrelage et la peinture choisis.",
        location: "18 Rue Pastorelli 06000 Nice",
        locationHousenumber: "18",
        locationStreet: "Rue Pastorelli",
        locationPostcode: "06000",
        locationCity: "Nice",
        locationCitycode: "06088",
        locationCoordinates: "7.272993,43.701628",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client5.email,
        userId: client5.id,
        status: ServiceRequestStatus.COMPLETED,
        assignedArtisanId: artisan5.id,
        estimatedPrice: 235000, // €2,350
        downPaymentPaid: true,
        createdAt: daysAgo(80),
        updatedAt: daysAgo(30),
      },
      // 21. AWAITING_PAYMENT - Plomberie
      {
        title: "Installation robinetterie thermostatique douche",
        serviceType: ServiceType.PLOMBERIE,
        urgency: Urgency.FLEXIBLE,
        description:
          "Je souhaite remplacer mon ancien mitigeur de douche par une robinetterie thermostatique moderne. J'ai déjà acheté le matériel (colonne de douche avec mitigeur thermostatique) et j'ai besoin d'un plombier pour l'installation. L'arrivée d'eau actuelle est standard avec entraxe de 15cm. Il faudra déposer l'ancien mitigeur et installer le nouveau système proprement sans abîmer le carrelage.",
        location: "30 Rue de Belleville 75020 Paris",
        locationHousenumber: "30",
        locationStreet: "Rue de Belleville",
        locationPostcode: "75020",
        locationCity: "Paris",
        locationCitycode: "75120",
        locationCoordinates: "2.379629,48.872717",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client1.email,
        userId: client1.id,
        status: ServiceRequestStatus.AWAITING_PAYMENT,
        assignedArtisanId: artisan1.id,
        estimatedPrice: 8500, // €85
        downPaymentPaid: true,
        createdAt: daysAgo(28),
        updatedAt: daysAgo(1),
      },
      // 22. AWAITING_ESTIMATE_ACCEPTATION - Rénovation
      {
        title: "Isolation combles perdus",
        serviceType: ServiceType.RENOVATION,
        urgency: Urgency.FLEXIBLE,
        description:
          "Je souhaite faire isoler mes combles perdus pour améliorer les performances énergétiques de ma maison. La surface des combles est d'environ 60m². Les combles sont accessibles par une trappe et il n'y a actuellement aucune isolation. Je souhaite une isolation en laine de roche ou laine de verre avec une résistance thermique minimale de R=7. Je cherche une entreprise RGE pour bénéficier des aides de l'État.",
        location: "18 Rue de la République 69002 Lyon",
        locationHousenumber: "18",
        locationStreet: "Rue de la République",
        locationPostcode: "69002",
        locationCity: "Lyon",
        locationCitycode: "69382",
        locationCoordinates: "4.835687,45.764038",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client2.email,
        userId: client2.id,
        status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
        createdAt: daysAgo(12),
        updatedAt: daysAgo(4),
      },
      // 23. COMPLETED - Dépannage
      {
        title: "Réparation VMC salle de bain",
        serviceType: ServiceType.DEPANNAGE,
        urgency: Urgency.URGENT,
        description:
          "La ventilation mécanique contrôlée (VMC) de ma salle de bain ne fonctionne plus depuis quelques jours. Le moteur ne tourne plus et l'humidité s'accumule dans la pièce créant de la condensation sur les murs et le miroir. La VMC est située dans le faux plafond et est accessible facilement. Il faut probablement remplacer le moteur ou vérifier les connexions électriques. C'est urgent car la moisissure commence à apparaître.",
        location: "35 Rue saint ferreol 13001 Marseille",
        locationHousenumber: "35",
        locationStreet: "Rue saint ferreol",
        locationPostcode: "13001",
        locationCity: "Marseille",
        locationCitycode: "13201",
        locationCoordinates: "5.378162,43.293936",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client3.email,
        userId: client3.id,
        status: ServiceRequestStatus.COMPLETED,
        assignedArtisanId: artisan2.id,
        estimatedPrice: 1500, // €1,500
        downPaymentPaid: true,
        createdAt: daysAgo(42),
        updatedAt: daysAgo(35),
      },
      // 24. IN_PROGRESS - Menuiserie
      {
        title: "Pose de porte intérieure et chambranle",
        serviceType: ServiceType.MENUISERIE,
        urgency: Urgency.WEEK,
        description:
          "Je dois faire installer une nouvelle porte intérieure dans ma maison suite à des travaux d'aménagement. L'ouverture existe déjà (dimensions standard 83cm de passage) mais il n'y a ni porte ni chambranle actuellement. Je souhaite une porte isoplane blanche à peindre avec chambranle et toutes les finitions (poignée, serrure à condamnation). La porte devra s'ouvrir vers la droite en poussant.",
        location: "23 Allées Jean Jaurès 31000 Toulouse",
        locationHousenumber: "23",
        locationStreet: "Allées Jean Jaurès",
        locationPostcode: "31000",
        locationCity: "Toulouse",
        locationCitycode: "31555",
        locationCoordinates: "1.449283,43.606492",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client4.email,
        userId: client4.id,
        status: ServiceRequestStatus.IN_PROGRESS,
        assignedArtisanId: artisan4.id,
        estimatedPrice: 55000, // €550
        downPaymentPaid: true,
        createdAt: daysAgo(22),
        updatedAt: daysAgo(1),
      },
      // 25. AWAITING_ASSIGNATION - Peinture
      {
        title: "Peinture cage d'escalier immeuble",
        serviceType: ServiceType.PEINTURE,
        urgency: Urgency.FLEXIBLE,
        description:
          "Je suis syndic de copropriété et nous devons faire repeindre la cage d'escalier de notre immeuble de 4 étages. Les murs et plafonds sont à repeindre en blanc, soit environ 180m² de surface. L'escalier est en bois et ne nécessite pas de peinture. Quelques petites réparations d'enduit seront nécessaires avant la peinture. Les travaux doivent être réalisés en journée pour ne pas déranger les résidents. Accès facile et parking disponible.",
        location: "10 Avenue Jean Médecin 06000 Nice",
        locationHousenumber: "10",
        locationStreet: "Avenue Jean Médecin",
        locationPostcode: "06000",
        locationCity: "Nice",
        locationCitycode: "06088",
        locationCoordinates: "7.268911,43.699415",
        photos: JSON.stringify([
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop",
        ]),
        clientEmail: client5.email,
        userId: client5.id,
        status: ServiceRequestStatus.AWAITING_ASSIGNATION,
        downPaymentPaid: true,
        createdAt: daysAgo(16),
        updatedAt: daysAgo(3),
      },
    ])
    .returning();

  console.log(`Created ${requests.length} service requests.`);

  console.log("Creating billing estimates...");

  // Billing estimates for requests with appropriate statuses
  const estimates = await db
    .insert(billingEstimates)
    .values([
      // Estimate for request 3 (AWAITING_ESTIMATE_ACCEPTATION - Peinture)
      {
        serviceRequestId: requests[2].id,
        adminId: adminUser.id,
        estimatedPrice: 185000, // €1,850
        description:
          "Devis pour la peinture complète de votre appartement 3 pièces (70m²). Prestation incluant la protection des sols et meubles, préparation des surfaces, 2 couches de peinture acrylique blanche mate qualité professionnelle sur murs et plafonds.",
        breakdown: JSON.stringify([
          {
            item: "Préparation et protection",
            quantity: "70 m²",
            unitPrice: 500,
            total: 5000,
          },
          {
            item: "Peinture murs",
            quantity: "200 m²",
            unitPrice: 15,
            total: 30000,
          },
          {
            item: "Peinture plafonds",
            quantity: "70 m²",
            unitPrice: 18,
            total: 12600,
          },
          {
            item: "Fournitures (peinture, rouleaux, etc.)",
            quantity: "1",
            unitPrice: 45000,
            total: 45000,
          },
          {
            item: "Main d'œuvre",
            quantity: "4 jours",
            unitPrice: 35000,
            total: 140000,
          },
        ]),
        status: BillingEstimateStatus.PENDING,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
      // Estimate for request 4 (AWAITING_ESTIMATE_ACCEPTATION - Menuiserie)
      {
        serviceRequestId: requests[3].id,
        adminId: adminUser.id,
        estimatedPrice: 275000, // €2,750
        description:
          "Devis pour la conception et installation de placards sur mesure. Portes coulissantes en mélaminé blanc, intérieur avec étagères réglables et penderies. Dimensions: 3m de long x 2,5m de hauteur. Pose comprise avec finitions soignées.",
        breakdown: JSON.stringify([
          {
            item: "Fabrication placards sur mesure",
            quantity: "7.5 m²",
            unitPrice: 25000,
            total: 187500,
          },
          {
            item: "Portes coulissantes",
            quantity: "2",
            unitPrice: 30000,
            total: 60000,
          },
          {
            item: "Accessoires et quincaillerie",
            quantity: "1",
            unitPrice: 12500,
            total: 12500,
          },
          {
            item: "Installation et finitions",
            quantity: "2 jours",
            unitPrice: 7500,
            total: 15000,
          },
        ]),
        status: BillingEstimateStatus.PENDING,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      // Estimate for request 5 (AWAITING_ASSIGNATION - Plomberie) - ACCEPTED
      {
        serviceRequestId: requests[4].id,
        adminId: adminUser.id,
        estimatedPrice: 145000, // €1,450
        description:
          "Devis pour le remplacement complet de votre chauffe-eau électrique 200L. Fourniture d'un chauffe-eau Atlantic Lineo 200L dernière génération, dépose de l'ancien, installation du nouveau avec mise en conformité et test de fonctionnement.",
        breakdown: JSON.stringify([
          {
            item: "Chauffe-eau Atlantic 200L",
            quantity: "1",
            unitPrice: 85000,
            total: 85000,
          },
          {
            item: "Dépose ancien chauffe-eau",
            quantity: "1",
            unitPrice: 15000,
            total: 15000,
          },
          {
            item: "Installation et raccordements",
            quantity: "1",
            unitPrice: 35000,
            total: 35000,
          },
          {
            item: "Petites fournitures",
            quantity: "1",
            unitPrice: 10000,
            total: 10000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "Devis accepté, merci de procéder à l'installation dès que possible.",
        createdAt: daysAgo(14),
        updatedAt: daysAgo(1),
      },
      // Estimate for request 6 (AWAITING_ASSIGNATION - Électricité) - ACCEPTED
      {
        serviceRequestId: requests[5].id,
        adminId: adminUser.id,
        estimatedPrice: 95000, // €950
        description:
          "Devis pour la mise aux normes complète de votre tableau électrique. Remplacement du tableau existant par un modèle 3 rangées avec disjoncteur différentiel 30mA, réorganisation des circuits, étiquetage conforme.",
        breakdown: JSON.stringify([
          {
            item: "Tableau électrique 3 rangées",
            quantity: "1",
            unitPrice: 25000,
            total: 25000,
          },
          {
            item: "Disjoncteurs et différentiels",
            quantity: "1 lot",
            unitPrice: 30000,
            total: 30000,
          },
          {
            item: "Main d'œuvre et mise en service",
            quantity: "1 jour",
            unitPrice: 40000,
            total: 40000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "Parfait, j'accepte ce devis. Contactez-moi pour planifier l'intervention.",
        createdAt: daysAgo(19),
        updatedAt: daysAgo(5),
      },
      // Estimate for request 7 (IN_PROGRESS - Rénovation) - ACCEPTED
      {
        serviceRequestId: requests[6].id,
        adminId: adminUser.id,
        estimatedPrice: 850000, // €8,500
        description:
          "Devis pour la rénovation complète de votre salle de bain 6m². Démolition, évacuation, carrelage sol et mur (jusqu'à 2,20m), douche italienne avec receveur extra-plat, sanitaires haut de gamme, meuble vasque 80cm, plomberie et électricité complètes.",
        breakdown: JSON.stringify([
          {
            item: "Démolition et évacuation",
            quantity: "1",
            unitPrice: 45000,
            total: 45000,
          },
          {
            item: "Carrelage sol",
            quantity: "6 m²",
            unitPrice: 8000,
            total: 48000,
          },
          {
            item: "Carrelage mural",
            quantity: "25 m²",
            unitPrice: 6500,
            total: 162500,
          },
          {
            item: "Douche italienne complète",
            quantity: "1",
            unitPrice: 180000,
            total: 180000,
          },
          {
            item: "Sanitaires (WC, lavabo)",
            quantity: "1 lot",
            unitPrice: 85000,
            total: 85000,
          },
          {
            item: "Meuble vasque 80cm",
            quantity: "1",
            unitPrice: 65000,
            total: 65000,
          },
          {
            item: "Plomberie complète",
            quantity: "1",
            unitPrice: 120000,
            total: 120000,
          },
          {
            item: "Électricité et VMC",
            quantity: "1",
            unitPrice: 75000,
            total: 75000,
          },
          {
            item: "Main d'œuvre (10 jours)",
            quantity: "10",
            unitPrice: 7000,
            total: 70000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "Devis accepté. Merci de me confirmer la date de début des travaux.",
        createdAt: daysAgo(29),
        updatedAt: daysAgo(25),
      },
      // Estimate for request 8 (IN_PROGRESS - Peinture) - ACCEPTED
      {
        serviceRequestId: requests[7].id,
        adminId: adminUser.id,
        estimatedPrice: 320000, // €3,200
        description:
          "Devis pour le ravalement de façade de votre maison (120m²). Nettoyage haute pression, traitement anti-mousse, rebouchage fissures, application de 2 couches de peinture acrylique spéciale façade garantie 10 ans. Échafaudage compris.",
        breakdown: JSON.stringify([
          {
            item: "Échafaudage (montage/démontage)",
            quantity: "1",
            unitPrice: 45000,
            total: 45000,
          },
          {
            item: "Nettoyage haute pression",
            quantity: "120 m²",
            unitPrice: 800,
            total: 96000,
          },
          {
            item: "Préparation et rebouchage",
            quantity: "120 m²",
            unitPrice: 500,
            total: 60000,
          },
          {
            item: "Peinture façade (2 couches)",
            quantity: "120 m²",
            unitPrice: 1000,
            total: 120000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "D'accord pour ce devis, on peut commencer la semaine prochaine.",
        createdAt: daysAgo(24),
        updatedAt: daysAgo(20),
      },
      // Estimate for request 22 (AWAITING_ESTIMATE_ACCEPTATION - Rénovation)
      {
        serviceRequestId: requests[21].id,
        adminId: adminUser.id,
        estimatedPrice: 225000, // €2,250
        description:
          "Devis pour l'isolation de vos combles perdus (60m²) avec laine de roche soufflée épaisseur 32cm (R=7). Entreprise RGE, éligible aux aides de l'État. Prestation incluant la pose de piges de repérage et la protection des zones à ne pas isoler.",
        breakdown: JSON.stringify([
          {
            item: "Laine de roche 32cm R=7",
            quantity: "60 m²",
            unitPrice: 2500,
            total: 150000,
          },
          {
            item: "Protection trappes et boîtiers",
            quantity: "1",
            unitPrice: 15000,
            total: 15000,
          },
          {
            item: "Main d'œuvre et soufflage",
            quantity: "1 jour",
            unitPrice: 60000,
            total: 60000,
          },
        ]),
        status: BillingEstimateStatus.PENDING,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },
      // Estimate for request 25 (AWAITING_ASSIGNATION - Peinture) - ACCEPTED
      {
        serviceRequestId: requests[24].id,
        adminId: adminUser.id,
        estimatedPrice: 395000, // €3,950
        description:
          "Devis pour la peinture de la cage d'escalier de votre immeuble (180m²). Préparation des surfaces avec rebouchage des fissures et trous, application de 2 couches de peinture acrylique blanche mate sur murs et plafonds. Travaux en journée uniquement.",
        breakdown: JSON.stringify([
          {
            item: "Échelle et matériel hauteur",
            quantity: "1",
            unitPrice: 35000,
            total: 35000,
          },
          {
            item: "Préparation surfaces",
            quantity: "180 m²",
            unitPrice: 800,
            total: 144000,
          },
          {
            item: "Peinture murs et plafonds",
            quantity: "180 m²",
            unitPrice: 1200,
            total: 216000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "Le conseil syndical accepte ce devis. Merci de nous proposer des dates.",
        createdAt: daysAgo(15),
        updatedAt: daysAgo(3),
      },
      // Estimate for request 9 (CLIENT_VALIDATED - Dépannage) - ACCEPTED
      {
        serviceRequestId: requests[8].id,
        adminId: adminUser.id,
        estimatedPrice: 18000, // €180
        description:
          "Devis pour la réparation de votre serrure 3 points. Remplacement du cylindre de sécurité usé, fourniture de 3 nouvelles clés et test complet du mécanisme de fermeture.",
        breakdown: JSON.stringify([
          {
            item: "Cylindre de sécurité 3 points",
            quantity: "1",
            unitPrice: 8500,
            total: 8500,
          },
          {
            item: "Main d'œuvre intervention",
            quantity: "1h",
            unitPrice: 9500,
            total: 9500,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse: "Devis accepté, merci d'intervenir au plus vite.",
        createdAt: daysAgo(36),
        updatedAt: daysAgo(35),
      },
      // Estimate for request 10 (ARTISAN_VALIDATED - Plomberie) - ACCEPTED
      {
        serviceRequestId: requests[9].id,
        adminId: adminUser.id,
        estimatedPrice: 125000, // €1,250
        description:
          "Devis pour l'adaptation complète de la plomberie de votre nouvelle cuisine. Déplacement de l'arrivée d'eau, installation des évacuations pour évier et lave-vaisselle, raccordement lave-linge. Matériel et main d'œuvre compris.",
        breakdown: JSON.stringify([
          {
            item: "Tuyauterie et raccords",
            quantity: "1 lot",
            unitPrice: 45000,
            total: 45000,
          },
          {
            item: "Évacuations (évier, lave-vaisselle)",
            quantity: "2",
            unitPrice: 15000,
            total: 30000,
          },
          {
            item: "Raccordement lave-linge",
            quantity: "1",
            unitPrice: 12000,
            total: 12000,
          },
          {
            item: "Main d'œuvre",
            quantity: "2 jours",
            unitPrice: 19000,
            total: 38000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "Parfait, j'accepte le devis. Merci de me recontacter pour planifier.",
        createdAt: daysAgo(41),
        updatedAt: daysAgo(40),
      },
      // Estimate for request 11 (AWAITING_PAYMENT - Électricité) - ACCEPTED
      {
        serviceRequestId: requests[10].id,
        adminId: adminUser.id,
        estimatedPrice: 75000, // €750
        description:
          "Devis pour l'installation de 9 prises électriques supplémentaires dans votre appartement. Fourniture des prises, raccordement aux circuits existants, saignées et rebouchage si nécessaire, finitions soignées.",
        breakdown: JSON.stringify([
          {
            item: "Prises électriques",
            quantity: "9",
            unitPrice: 2500,
            total: 22500,
          },
          {
            item: "Câblage et raccordements",
            quantity: "9",
            unitPrice: 3000,
            total: 27000,
          },
          {
            item: "Main d'œuvre et finitions",
            quantity: "1 jour",
            unitPrice: 25500,
            total: 25500,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse: "C'est bon pour moi, allons-y !",
        createdAt: daysAgo(46),
        updatedAt: daysAgo(45),
      },
      // Estimate for request 12 (COMPLETED - Menuiserie) - ACCEPTED
      {
        serviceRequestId: requests[11].id,
        adminId: adminUser.id,
        estimatedPrice: 485000, // €4,850
        description:
          "Devis pour le remplacement de 5 fenêtres par du double vitrage PVC. Fourniture des fenêtres sur mesure avec ouverture oscillo-battante, dépose des anciennes fenêtres, pose et étanchéité complète, évacuation des gravats.",
        breakdown: JSON.stringify([
          {
            item: "Fenêtres 120x140cm PVC",
            quantity: "3",
            unitPrice: 85000,
            total: 255000,
          },
          {
            item: "Fenêtres 80x120cm PVC",
            quantity: "2",
            unitPrice: 65000,
            total: 130000,
          },
          {
            item: "Dépose anciennes fenêtres",
            quantity: "5",
            unitPrice: 5000,
            total: 25000,
          },
          {
            item: "Pose et finitions",
            quantity: "2 jours",
            unitPrice: 37500,
            total: 75000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse: "Très bien, je valide ce devis. À bientôt.",
        createdAt: daysAgo(59),
        updatedAt: daysAgo(58),
      },
      // Estimate for request 13 (COMPLETED - Peinture) - ACCEPTED
      {
        serviceRequestId: requests[12].id,
        adminId: adminUser.id,
        estimatedPrice: 65000, // €650
        description:
          "Devis pour la peinture de la chambre d'enfant avec décoration. Peinture des murs (1 mur bleu ciel, 3 murs blanc cassé), plafond blanc, et décorations peintes (nuages et étoiles). Peinture écologique sans COV.",
        breakdown: JSON.stringify([
          {
            item: "Peinture murs",
            quantity: "40 m²",
            unitPrice: 12,
            total: 4800,
          },
          {
            item: "Peinture plafond",
            quantity: "12 m²",
            unitPrice: 15,
            total: 1800,
          },
          {
            item: "Décoration peinte",
            quantity: "1",
            unitPrice: 15000,
            total: 15000,
          },
          {
            item: "Fournitures peinture écologique",
            quantity: "1",
            unitPrice: 18400,
            total: 18400,
          },
          {
            item: "Main d'œuvre",
            quantity: "2 jours",
            unitPrice: 12500,
            total: 25000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse: "Super ! Mon enfant va adorer. J'accepte le devis.",
        createdAt: daysAgo(51),
        updatedAt: daysAgo(50),
      },
      // Estimate for request 14 (DISPUTED_BY_CLIENT - Plomberie) - ACCEPTED
      {
        serviceRequestId: requests[13].id,
        adminId: adminUser.id,
        estimatedPrice: 15000, // €150
        description:
          "Devis pour le débouchage de vos canalisations de salle de bain. Intervention avec furet électrique professionnel, nettoyage complet des canalisations baignoire et lavabo, test de bon fonctionnement.",
        breakdown: JSON.stringify([
          {
            item: "Débouchage avec furet électrique",
            quantity: "2 canalisations",
            unitPrice: 5500,
            total: 11000,
          },
          {
            item: "Main d'œuvre",
            quantity: "1h",
            unitPrice: 4000,
            total: 4000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse: "Ok, merci de venir déboucher mes canalisations.",
        createdAt: daysAgo(21),
        updatedAt: daysAgo(20),
      },
      // Estimate for request 15 (DISPUTED_BY_ARTISAN - Rénovation) - ACCEPTED
      {
        serviceRequestId: requests[14].id,
        adminId: adminUser.id,
        estimatedPrice: 195000, // €1,950
        description:
          "Devis pour la rénovation de votre parquet ancien en chêne massif (30m²). Ponçage complet en 3 passes, refixation des lames décollées, application de 2 couches de vitrificateur satiné haut de gamme.",
        breakdown: JSON.stringify([
          {
            item: "Ponçage parquet 3 passes",
            quantity: "30 m²",
            unitPrice: 3500,
            total: 105000,
          },
          {
            item: "Refixation lames",
            quantity: "5 lames",
            unitPrice: 2000,
            total: 10000,
          },
          {
            item: "Vitrificateur satiné haut de gamme",
            quantity: "30 m²",
            unitPrice: 1500,
            total: 45000,
          },
          {
            item: "Main d'œuvre",
            quantity: "3 jours",
            unitPrice: 11667,
            total: 35000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "Très bien, j'accepte votre devis pour la rénovation du parquet.",
        createdAt: daysAgo(56),
        updatedAt: daysAgo(55),
      },
      // Estimate for request 16 (RESOLVED - Électricité) - ACCEPTED
      {
        serviceRequestId: requests[15].id,
        adminId: adminUser.id,
        estimatedPrice: 42000, // €420
        description:
          "Devis pour l'installation de vos luminaires et spots LED. Pose de 3 suspensions, 8 spots encastrables dans faux plafond cuisine, et 2 appliques murales couloir. Connexions électriques et mise en service.",
        breakdown: JSON.stringify([
          {
            item: "Installation suspensions",
            quantity: "3",
            unitPrice: 4500,
            total: 13500,
          },
          {
            item: "Installation spots LED encastrables",
            quantity: "8",
            unitPrice: 2500,
            total: 20000,
          },
          {
            item: "Installation appliques murales",
            quantity: "2",
            unitPrice: 4250,
            total: 8500,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "Parfait, je valide l'installation de tous les luminaires.",
        createdAt: daysAgo(71),
        updatedAt: daysAgo(70),
      },
      // Estimate for request 19 (IN_PROGRESS - Électricité) - ACCEPTED
      {
        serviceRequestId: requests[18].id,
        adminId: adminUser.id,
        estimatedPrice: 125000, // €1,250
        description:
          "Devis pour l'installation de votre borne de recharge voiture électrique. Tirage de ligne dédiée 10mm² depuis le tableau sur 15m, installation disjoncteur 40A, pose et raccordement de la Wallbox 7,4kW, mise en conformité et tests.",
        breakdown: JSON.stringify([
          {
            item: "Câble 10mm² et gaine",
            quantity: "15m",
            unitPrice: 1500,
            total: 22500,
          },
          {
            item: "Disjoncteur 40A",
            quantity: "1",
            unitPrice: 8500,
            total: 8500,
          },
          {
            item: "Installation et raccordement Wallbox",
            quantity: "1",
            unitPrice: 35000,
            total: 35000,
          },
          {
            item: "Main d'œuvre qualifiée IRVE",
            quantity: "1 jour",
            unitPrice: 59000,
            total: 59000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse:
          "Génial, j'accepte ! Hâte de pouvoir recharger ma voiture.",
        createdAt: daysAgo(19),
        updatedAt: daysAgo(18),
      },
      // Estimate for request 20 (COMPLETED - Rénovation) - ACCEPTED
      {
        serviceRequestId: requests[19].id,
        adminId: adminUser.id,
        estimatedPrice: 235000, // €2,350
        description:
          "Devis pour la rénovation de votre cuisine. Dépose ancien carrelage, pose nouveau carrelage grès cérame 15m², peinture murale lessivable adaptée cuisine. Travaux autour des meubles existants.",
        breakdown: JSON.stringify([
          {
            item: "Dépose ancien carrelage",
            quantity: "15 m²",
            unitPrice: 2000,
            total: 30000,
          },
          {
            item: "Pose carrelage grès cérame",
            quantity: "15 m²",
            unitPrice: 6500,
            total: 97500,
          },
          {
            item: "Peinture murs lessivable",
            quantity: "35 m²",
            unitPrice: 1500,
            total: 52500,
          },
          {
            item: "Main d'œuvre",
            quantity: "3 jours",
            unitPrice: 18333,
            total: 55000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse: "Devis accepté, ma cuisine va être magnifique !",
        createdAt: daysAgo(79),
        updatedAt: daysAgo(78),
      },
      // Estimate for request 21 (AWAITING_PAYMENT - Plomberie) - ACCEPTED
      {
        serviceRequestId: requests[20].id,
        adminId: adminUser.id,
        estimatedPrice: 8500, // €85
        description:
          "Devis pour l'installation de votre robinetterie thermostatique de douche. Dépose de l'ancien mitigeur, installation du nouveau système avec colonne de douche, raccordements et test d'étanchéité.",
        breakdown: JSON.stringify([
          {
            item: "Dépose ancien mitigeur",
            quantity: "1",
            unitPrice: 2500,
            total: 2500,
          },
          {
            item: "Installation robinetterie thermostatique",
            quantity: "1",
            unitPrice: 6000,
            total: 6000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse: "Très bien, merci de faire l'installation.",
        createdAt: daysAgo(29),
        updatedAt: daysAgo(28),
      },
      // Estimate for request 24 (IN_PROGRESS - Menuiserie) - ACCEPTED
      {
        serviceRequestId: requests[23].id,
        adminId: adminUser.id,
        estimatedPrice: 55000, // €550
        description:
          "Devis pour la pose d'une porte intérieure avec chambranle. Fourniture porte isoplane blanche 83cm, chambranle complet, poignée et serrure à condamnation, pose et finitions.",
        breakdown: JSON.stringify([
          {
            item: "Porte isoplane blanche 83cm",
            quantity: "1",
            unitPrice: 18000,
            total: 18000,
          },
          {
            item: "Chambranle et finitions",
            quantity: "1",
            unitPrice: 12000,
            total: 12000,
          },
          {
            item: "Poignée et serrure",
            quantity: "1",
            unitPrice: 8000,
            total: 8000,
          },
          {
            item: "Pose et ajustements",
            quantity: "0.5 jour",
            unitPrice: 17000,
            total: 17000,
          },
        ]),
        status: BillingEstimateStatus.ACCEPTED,
        clientResponse: "C'est bon pour moi, je valide ce devis.",
        createdAt: daysAgo(23),
        updatedAt: daysAgo(22),
      },
    ])
    .returning();

  console.log(`Created ${estimates.length} billing estimates.`);

  console.log("Creating status history...");

  // Create status history for some requests to show progression
  await db.insert(serviceRequestStatusHistory).values([
    // Request 7 - Rénovation salle de bain progression
    {
      serviceRequestId: requests[6].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE,
      changedAt: daysAgo(30),
    },
    {
      serviceRequestId: requests[6].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
      changedAt: daysAgo(29),
    },
    {
      serviceRequestId: requests[6].id,
      status: ServiceRequestStatus.AWAITING_ASSIGNATION,
      changedAt: daysAgo(25),
    },
    {
      serviceRequestId: requests[6].id,
      status: ServiceRequestStatus.IN_PROGRESS,
      changedAt: daysAgo(15),
    },
    // Request 12 - Fenêtres double vitrage - completed
    {
      serviceRequestId: requests[11].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE,
      changedAt: daysAgo(60),
    },
    {
      serviceRequestId: requests[11].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
      changedAt: daysAgo(58),
    },
    {
      serviceRequestId: requests[11].id,
      status: ServiceRequestStatus.AWAITING_ASSIGNATION,
      changedAt: daysAgo(55),
    },
    {
      serviceRequestId: requests[11].id,
      status: ServiceRequestStatus.IN_PROGRESS,
      changedAt: daysAgo(45),
    },
    {
      serviceRequestId: requests[11].id,
      status: ServiceRequestStatus.CLIENT_VALIDATED,
      changedAt: daysAgo(35),
    },
    {
      serviceRequestId: requests[11].id,
      status: ServiceRequestStatus.ARTISAN_VALIDATED,
      changedAt: daysAgo(33),
    },
    {
      serviceRequestId: requests[11].id,
      status: ServiceRequestStatus.AWAITING_PAYMENT,
      changedAt: daysAgo(32),
    },
    {
      serviceRequestId: requests[11].id,
      status: ServiceRequestStatus.COMPLETED,
      changedAt: daysAgo(10),
    },
    // Request 13 - Peinture chambre enfant - completed
    {
      serviceRequestId: requests[12].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE,
      changedAt: daysAgo(50),
    },
    {
      serviceRequestId: requests[12].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
      changedAt: daysAgo(48),
    },
    {
      serviceRequestId: requests[12].id,
      status: ServiceRequestStatus.AWAITING_ASSIGNATION,
      changedAt: daysAgo(45),
    },
    {
      serviceRequestId: requests[12].id,
      status: ServiceRequestStatus.IN_PROGRESS,
      changedAt: daysAgo(35),
    },
    {
      serviceRequestId: requests[12].id,
      status: ServiceRequestStatus.COMPLETED,
      changedAt: daysAgo(15),
    },
    // Request 20 - Menuiserie bois - completed
    {
      serviceRequestId: requests[19].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE,
      changedAt: daysAgo(80),
    },
    {
      serviceRequestId: requests[19].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
      changedAt: daysAgo(78),
    },
    {
      serviceRequestId: requests[19].id,
      status: ServiceRequestStatus.AWAITING_ASSIGNATION,
      changedAt: daysAgo(75),
    },
    {
      serviceRequestId: requests[19].id,
      status: ServiceRequestStatus.IN_PROGRESS,
      changedAt: daysAgo(60),
    },
    {
      serviceRequestId: requests[19].id,
      status: ServiceRequestStatus.COMPLETED,
      changedAt: daysAgo(30),
    },
    // Request 23 - Réparation VMC - completed
    {
      serviceRequestId: requests[22].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE,
      changedAt: daysAgo(42),
    },
    {
      serviceRequestId: requests[22].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
      changedAt: daysAgo(40),
    },
    {
      serviceRequestId: requests[22].id,
      status: ServiceRequestStatus.AWAITING_ASSIGNATION,
      changedAt: daysAgo(38),
    },
    {
      serviceRequestId: requests[22].id,
      status: ServiceRequestStatus.IN_PROGRESS,
      changedAt: daysAgo(37),
    },
    {
      serviceRequestId: requests[22].id,
      status: ServiceRequestStatus.COMPLETED,
      changedAt: daysAgo(35),
    },
    // Request 14 - Disputed
    {
      serviceRequestId: requests[13].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE,
      changedAt: daysAgo(20),
    },
    {
      serviceRequestId: requests[13].id,
      status: ServiceRequestStatus.AWAITING_ESTIMATE_ACCEPTATION,
      changedAt: daysAgo(18),
    },
    {
      serviceRequestId: requests[13].id,
      status: ServiceRequestStatus.AWAITING_ASSIGNATION,
      changedAt: daysAgo(15),
    },
    {
      serviceRequestId: requests[13].id,
      status: ServiceRequestStatus.IN_PROGRESS,
      changedAt: daysAgo(10),
    },
    {
      serviceRequestId: requests[13].id,
      status: ServiceRequestStatus.DISPUTED_BY_CLIENT,
      changedAt: daysAgo(3),
    },
  ]);

  console.log("Status history created.");

  console.log("Creating conversations...");

  // Conversations between users
  await db.insert(conversations).values([
    // Conversation for request 7 (Rénovation salle de bain)
    {
      serviceRequestId: requests[6].id,
      senderId: artisan5.id,
      senderType: MessageSenderType.PROFESSIONAL,
      message:
        "Bonjour, j'ai bien pris connaissance de votre demande de rénovation. Je peux commencer les travaux dès la semaine prochaine. Les travaux devraient durer environ 10 jours ouvrés.",
      createdAt: daysAgo(14),
      readAt: daysAgo(14),
    },
    {
      serviceRequestId: requests[6].id,
      senderId: client2.id,
      senderType: MessageSenderType.CLIENT,
      message:
        "Parfait ! Pouvez-vous me confirmer la date exacte de début ? Et est-ce que je dois prévoir quelque chose de particulier avant votre arrivée ?",
      createdAt: daysAgo(13),
      readAt: daysAgo(13),
    },
    {
      serviceRequestId: requests[6].id,
      senderId: artisan5.id,
      senderType: MessageSenderType.PROFESSIONAL,
      message:
        "Je confirme le début des travaux pour lundi prochain à 8h. Merci de vider complètement la salle de bain et de protéger les objets fragiles à proximité. L'eau sera coupée pendant les travaux.",
      createdAt: daysAgo(13),
      readAt: daysAgo(12),
    },
    // Conversation for request 8 (Peinture façade)
    {
      serviceRequestId: requests[7].id,
      senderId: client3.id,
      senderType: MessageSenderType.CLIENT,
      message:
        "Bonjour, les travaux avancent bien ? J'ai vu que l'échafaudage est monté. Combien de temps estimez-vous pour finir ?",
      createdAt: daysAgo(5),
      readAt: daysAgo(4),
    },
    {
      serviceRequestId: requests[7].id,
      senderId: artisan3.id,
      senderType: MessageSenderType.PROFESSIONAL,
      message:
        "Bonjour ! Oui tout se passe bien. Le nettoyage et la préparation sont terminés. Je commence la première couche de peinture aujourd'hui. Il me reste environ 3-4 jours de travail.",
      createdAt: daysAgo(4),
      readAt: daysAgo(4),
    },
    // Conversation for request 9 (Dépannage porte - CLIENT_VALIDATED)
    {
      serviceRequestId: requests[8].id,
      senderId: artisan4.id,
      senderType: MessageSenderType.PROFESSIONAL,
      message:
        "Intervention terminée. J'ai remplacé le cylindre de la serrure qui était usé. La porte fonctionne maintenant parfaitement. Je vous ai laissé 3 clés neuves. Bonne journée !",
      createdAt: daysAgo(2),
      readAt: daysAgo(1),
    },
    {
      serviceRequestId: requests[8].id,
      senderId: client4.id,
      senderType: MessageSenderType.CLIENT,
      message:
        "Merci beaucoup ! C'est parfait, tout fonctionne très bien maintenant. Travail rapide et soigné.",
      createdAt: daysAgo(1),
      readAt: daysAgo(1),
    },
    // Conversation for request 14 (Disputed - Débouchage)
    {
      serviceRequestId: requests[13].id,
      senderId: artisan1.id,
      senderType: MessageSenderType.PROFESSIONAL,
      message:
        "Intervention effectuée ce matin. Le bouchon dans la canalisation a été retiré. Les évacuations fonctionnent normalement maintenant.",
      createdAt: daysAgo(5),
      readAt: daysAgo(5),
    },
    {
      serviceRequestId: requests[13].id,
      senderId: client4.id,
      senderType: MessageSenderType.CLIENT,
      message:
        "Le problème n'est pas résolu ! L'eau s'écoule toujours très lentement dans la baignoire. Ce n'est pas mieux qu'avant votre intervention.",
      createdAt: daysAgo(4),
      readAt: daysAgo(3),
    },
    {
      serviceRequestId: requests[13].id,
      senderId: artisan1.id,
      senderType: MessageSenderType.PROFESSIONAL,
      message:
        "Je suis surpris. J'ai bien nettoyé les canalisations et testé l'écoulement avant de partir. Je peux repasser pour vérifier si nécessaire.",
      createdAt: daysAgo(3),
      readAt: daysAgo(3),
    },
    {
      serviceRequestId: requests[13].id,
      senderId: adminUser.id,
      senderType: MessageSenderType.ADMIN,
      message:
        "Bonjour à tous les deux. Je vois qu'il y a un désaccord sur la qualité de l'intervention. Je propose qu'on organise une contre-visite pour évaluer objectivement la situation. Qu'en pensez-vous ?",
      createdAt: daysAgo(3),
    },
    // Conversation for request 19 (Borne recharge - IN_PROGRESS)
    {
      serviceRequestId: requests[18].id,
      senderId: artisan2.id,
      senderType: MessageSenderType.PROFESSIONAL,
      message:
        "Bonjour, j'ai fait les vérifications préalables. Le tableau électrique est effectivement compatible. Je vais tirer une ligne en 10mm² avec un disjoncteur 40A. Installation prévue jeudi prochain.",
      createdAt: daysAgo(3),
      readAt: daysAgo(2),
    },
    {
      serviceRequestId: requests[18].id,
      senderId: client4.id,
      senderType: MessageSenderType.CLIENT,
      message:
        "Super, merci pour la réactivité ! Je serai sur place jeudi toute la journée. Le garage sera accessible sans problème.",
      createdAt: daysAgo(2),
      readAt: daysAgo(2),
    },
    // Conversation for request 24 (Menuiserie porte - IN_PROGRESS)
    {
      serviceRequestId: requests[23].id,
      senderId: client4.id,
      senderType: MessageSenderType.CLIENT,
      message:
        "Bonjour, vous avez reçu les dimensions que je vous ai envoyées par mail ?",
      createdAt: daysAgo(4),
      readAt: daysAgo(3),
    },
    {
      serviceRequestId: requests[23].id,
      senderId: artisan4.id,
      senderType: MessageSenderType.PROFESSIONAL,
      message:
        "Oui, tout est noté. J'ai commandé la porte selon vos dimensions. Elle devrait arriver en fin de semaine. Je vous recontacte pour planifier la pose.",
      createdAt: daysAgo(3),
      readAt: daysAgo(3),
    },
  ]);

  console.log("Conversations created.");

  await createStripeProducts();

  console.log("✅ Seed data created successfully!");
  console.log("\n📊 Summary:");
  console.log(`- 1 Admin user`);
  console.log(`- 5 Client users with profiles`);
  console.log(`- 5 Artisan users with professional profiles`);
  console.log(`- ${requests.length} Service requests (all types and statuses)`);
  console.log(
    `- ${estimates.length} Billing estimates (all assigned requests have accepted estimates)`
  );
  console.log(`- Status history entries created`);
  console.log(`- 15 Conversation messages`);
  console.log("\n🔑 Login credentials:");
  console.log("Admin: test@test.com / admin123");
  console.log("Client: marie.dubois@email.fr / admin123");
  console.log("Artisan: jean.plombier@artisan.fr / admin123");
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
