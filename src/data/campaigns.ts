export const CAMPAIGNS = [
  {
    id: 'ecole-sahel',
    category: 'Éducation',
    title: 'École pour 500 enfants au Sahel',
    subtitle: "Une école construite, c'est une génération entière qui change de trajectoire.",
    heroImg: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=1800&auto=format&fit=crop',
    raised: 38400, goal: 55000, donors: 412, daysLeft: 18,
    ngoName: 'Lumières du Sahel', ngoCountry: "Burkina Faso, Afrique de l'Ouest",
    description: [
      "Dans la région du Sahel, plus de 60% des enfants n'ont pas accès à une éducation de qualité faute d'infrastructures adaptées.",
      "Ce projet vise à construire une école primaire de 8 classes pour accueillir 500 élèves dans le village de Dori.",
      "Grâce à votre soutien, nous pourrons financer 3 années de salaire pour des enseignants qualifiés.",
    ],
    quote: "Chaque enfant qui entre dans cette école porte avec lui l'espoir d'un village entier.",
    quoteAuthor: "Aminata Coulibaly, Directrice — Lumières du Sahel",
    breakdown: [
      { label: 'Construction & matériaux', pct: 55 },
      { label: 'Salaires enseignants (3 ans)', pct: 25 },
      { label: 'Fournitures scolaires', pct: 12 },
      { label: 'Frais opérationnels Qrowd', pct: 8 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=600&auto=format&fit=crop',
    ],
  },
  {
    id: 'clinique-mobile',
    category: 'Santé',
    title: 'Clinique mobile pour les zones rurales',
    subtitle: "Des soins de santé accessibles à ceux que la géographie oublie.",
    heroImg: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1800&auto=format&fit=crop',
    raised: 21700, goal: 40000, donors: 287, daysLeft: 31,
    ngoName: 'MédicoMonde', ngoCountry: "Sénégal, Afrique de l'Ouest",
    description: [
      "Des milliers de villages africains n'ont accès à aucune structure médicale dans un rayon de 80 km.",
      "Une clinique mobile équipée parcourra 12 villages chaque mois, apportant consultations et vaccinations.",
    ],
    quote: "La santé ne devrait pas être un privilège géographique.",
    quoteAuthor: "Dr. Ousmane Diallo, Fondateur — MédicoMonde",
    breakdown: [
      { label: 'Achat du véhicule médicalisé', pct: 48 },
      { label: 'Équipements & médicaments', pct: 30 },
      { label: 'Carburant & logistique (1 an)', pct: 14 },
      { label: 'Frais opérationnels Qrowd', pct: 8 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?q=80&w=600&auto=format&fit=crop',
    ],
  },
  {
    id: 'reboisement',
    category: 'Environnement',
    title: 'Reboisement de 10 000 hectares',
    subtitle: "Replanter la forêt, c'est redonner vie à tout un écosystème.",
    heroImg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1800&auto=format&fit=crop',
    raised: 62000, goal: 80000, donors: 891, daysLeft: 9,
    ngoName: 'Forêts Vivantes', ngoCountry: 'Madagascar',
    description: [
      "Madagascar a perdu 90% de sa forêt primaire. La déforestation détruit la biodiversité unique de l'île.",
      "Avec votre aide, nous planterons 2 millions d'arbres sur 10 000 hectares et créerons 200 emplois verts.",
    ],
    quote: "Planter un arbre, c'est écrire une lettre d'amour aux générations futures.",
    quoteAuthor: "Nirina Rakotoarisoa, Coordinatrice — Forêts Vivantes",
    breakdown: [
      { label: "Achat & plantation d'arbres", pct: 60 },
      { label: 'Formation agriculteurs', pct: 20 },
      { label: 'Surveillance & entretien', pct: 12 },
      { label: 'Frais opérationnels Qrowd', pct: 8 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop',
    ],
  },
  {
    id: 'eau-potable',
    category: 'Eau & Assainissement',
    title: "Accès à l'eau potable pour 3 villages",
    subtitle: "L'eau, c'est la vie. Aidez-nous à la rendre accessible à tous.",
    heroImg: 'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?q=80&w=1800&auto=format&fit=crop',
    raised: 14200, goal: 25000, donors: 189, daysLeft: 42,
    ngoName: 'Eau Pour Tous', ngoCountry: 'Mali',
    description: [
      "3 villages au Mali parcourent plus de 8 km chaque jour pour trouver de l'eau.",
      "Nous allons creuser 3 puits équipés de pompes solaires pour garantir l'accès à l'eau potable.",
    ],
    quote: "Quand les femmes n'ont plus à marcher des heures pour l'eau, elles peuvent enfin aller à l'école.",
    quoteAuthor: "Fatoumata Traoré, Coordinatrice — Eau Pour Tous",
    breakdown: [
      { label: 'Forage et installation des puits', pct: 58 },
      { label: 'Pompes solaires', pct: 24 },
      { label: 'Formation et maintenance locale', pct: 10 },
      { label: 'Frais opérationnels Qrowd', pct: 8 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=600&auto=format&fit=crop',
    ],
  },
  {
    id: 'femmes-entrepreneures',
    category: 'Économie Solidaire',
    title: "Financer 200 femmes entrepreneures",
    subtitle: "Quand une femme réussit, c'est toute une communauté qui s'élève.",
    heroImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1800&auto=format&fit=crop',
    raised: 31500, goal: 45000, donors: 543, daysLeft: 24,
    ngoName: 'Femmes d\'Avenir', ngoCountry: "Côte d'Ivoire",
    description: [
      "200 femmes issues de quartiers défavorisés d'Abidjan veulent créer leur propre activité.",
      "Grâce à des micro-crédits et un programme de formation de 6 mois, elles deviendront autonomes.",
    ],
    quote: "Ce n'est pas une aide, c'est un investissement dans l'avenir de nos familles.",
    quoteAuthor: "Mariam Koné, Bénéficiaire — Promotion 2024",
    breakdown: [
      { label: 'Micro-crédits directs', pct: 52 },
      { label: 'Formation & accompagnement', pct: 28 },
      { label: 'Outils & matériel de démarrage', pct: 12 },
      { label: 'Frais opérationnels Qrowd', pct: 8 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    ],
  },
  {
    id: 'refugies-formation',
    category: 'Réfugiés & Urgence',
    title: "Formation professionnelle pour réfugiés",
    subtitle: "Transformer le drame de l'exil en opportunité de reconstruction.",
    heroImg: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1800&auto=format&fit=crop',
    raised: 9800, goal: 30000, donors: 134, daysLeft: 55,
    ngoName: 'Horizons Ouverts', ngoCountry: 'Liban',
    description: [
      "Plus de 1,5 million de réfugiés syriens au Liban survivent dans des conditions précaires.",
      "Notre programme offre des formations en plomberie, électricité et couture pour 500 personnes.",
    ],
    quote: "Apprendre un métier, c'est retrouver sa dignité quand tout le reste a été perdu.",
    quoteAuthor: "Ahmad Al-Hassan, Directeur — Horizons Ouverts",
    breakdown: [
      { label: 'Coûts de formation', pct: 50 },
      { label: 'Matériel pédagogique', pct: 22 },
      { label: 'Allocations & transport', pct: 20 },
      { label: 'Frais opérationnels Qrowd', pct: 8 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=600&auto=format&fit=crop',
    ],
  },
  {
    id: 'nutrition-enfants',
    category: 'Alimentation',
    title: "Nutrition : 1 000 enfants sauvés de la malnutrition",
    subtitle: "Un enfant bien nourri apprend mieux, grandit mieux, rêve mieux.",
    heroImg: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1800&auto=format&fit=crop',
    raised: 52000, goal: 60000, donors: 729, daysLeft: 7,
    ngoName: 'Enfants en Vie', ngoCountry: 'Niger',
    description: [
      "Le Niger affiche l'un des taux de malnutrition infantile les plus élevés au monde.",
      "Notre programme de nutrition thérapeutique cible 1 000 enfants de moins de 5 ans.",
    ],
    quote: "Chaque sachet de pâte nutritionnelle distribué, c'est une vie qui reprend.",
    quoteAuthor: "Dr. Hadiza Moussa, Médecin-Chef — Enfants en Vie",
    breakdown: [
      { label: 'Achats de pâtes nutritionnelles', pct: 55 },
      { label: 'Personnel médical', pct: 25 },
      { label: 'Logistique & distribution', pct: 12 },
      { label: 'Frais opérationnels Qrowd', pct: 8 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop',
    ],
  },
  {
    id: 'energie-solaire',
    category: 'Énergie & Climat',
    title: "Électrifier 50 écoles avec l'énergie solaire",
    subtitle: "Quand le soleil fait étudier les enfants, tout le monde gagne.",
    heroImg: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1800&auto=format&fit=crop',
    raised: 44300, goal: 70000, donors: 612, daysLeft: 28,
    ngoName: 'SolarAfrica', ngoCountry: 'Éthiopie',
    description: [
      "En Éthiopie, 70% des écoles rurales n'ont pas d'électricité, interrompant les cours dès la tombée du jour.",
      "50 installations solaires permettront à 15 000 élèves d'étudier le soir et aux centres de santé locaux de fonctionner.",
    ],
    quote: "La lumière du soleil transformée en lumière du savoir — c'est le miracle que nous construisons.",
    quoteAuthor: "Tigist Bekele, Fondatrice — SolarAfrica",
    breakdown: [
      { label: 'Panneaux & équipements solaires', pct: 62 },
      { label: 'Installation & câblage', pct: 18 },
      { label: 'Formation des techniciens locaux', pct: 12 },
      { label: 'Frais opérationnels Qrowd', pct: 8 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=600&auto=format&fit=crop',
    ],
  },
];

export interface Campaign {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  heroImg: string;
  raised: number;
  goal: number;
  donors: number;
  daysLeft: number;
  ngoName: string;
  ngoCountry: string;
  description: string[];
  quote: string;
  quoteAuthor: string;
  breakdown: { label: string; pct: number }[];
  gallery: string[];
  ngoLogo?: string | null;
}
