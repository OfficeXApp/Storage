import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["fr"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Historique des achats",
      appstore: "Boutique d'applications",
      folder: "Dossier",
      file: "Fichier",
      settings: "Paramètres",
    },
    default_disks: {
      browser_cache: {
        title: "Cache du navigateur hors ligne",
        public_note:
          "Cache du navigateur local pour un accès hors ligne. Les fichiers sont supprimés si vous effacez l'historique du navigateur pour ce site.",
      },
      free_cloud_filesharing: {
        title: "Partage de fichiers cloud gratuit",
        public_note:
          "Partage de fichiers public gratuit. Les fichiers expirent dans les 24 heures, chaque jour à minuit UTC.",
      },
      folders: {
        root: "Racine",
        throwaway: "Jetable",
        demo_gallery: "Galerie de démonstration",
        tutorial_videos: "Vidéos de tutoriel",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organisation hors ligne",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Organisation anonyme",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall:
          "Rechercher des applications, des agents et des services...",
        search_offers: "Filtrer les offres...",
      },
      s3_offer: {
        id: "19",
        name: "Stockage cloud en vrac",
        subheading:
          "Ajoutez du stockage à OfficeX avec des cartes-cadeaux pour 1 $ par 100 Go/mois",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Carte-cadeau de stockage 100 Go",
            images: [],
            description:
              "<p>Achetez une carte-cadeau de 100 Go pour un stockage cloud sécurisé et évolutif sur Amazon Cloud. Vos données sont protégées par la durabilité et la disponibilité de pointe d'AWS S3, garantissant une fiabilité et des performances élevées. Cette carte-cadeau ajoute des fonds à votre compte de stockage avec une tarification basée sur l'utilisation.</p><p>Nous offrons un stockage rapide et abordable grâce à AWS S3 Intelligent-Tiering, qui déplace automatiquement les données vers le niveau de stockage le plus rentable sans impacter les performances. Cela offre une haute disponibilité à des prix de gros.</p><ul><li>Fichiers rarement consultés: Déplacés automatiquement vers un stockage plus froid pour aussi peu que 0,0054 $/Go par mois.</li><li>Fichiers fréquemment consultés: Conservés en stockage standard pour 0,03128 $/Go par mois.</li></ul><p>Veuillez noter que la sortie de données (le téléchargement de données depuis le cloud) est facturée 0,1224 $ par Go.</p><p>Augmentez la capacité de stockage de votre OfficeX avec cette carte-cadeau pratique de 100 Go, en vous assurant que tous vos documents importants sont stockés en toute sécurité dans le cloud.</p>",
            price: 0.01,
            price_unit: "/Go",
            price_explanation:
              "par mois pour le stockage et le traitement, min 1 $",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Acheter une carte-cadeau",
            vendors: [
              {
                id: "vendorA",
                name: "Cloud Solutions Inc.",
                avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
                checkout_video:
                  "https://www.youtube.com/embed/ecv-19sYL3w?si=4jQ6W1YuYaK7Q4-k",
                uptime_score: 99.99,
                reviews_score: 4.8,
                community_links: [
                  {
                    label: "Forum",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "0,01 $/Go/mois",
                view_page_link: "#",
                call_to_action: "Acheter une carte-cadeau",
                description:
                  "Augmentez la capacité de stockage de votre OfficeX avec cette carte-cadeau pratique de 100 Go, en vous assurant que tous vos documents importants sont stockés en toute sécurité dans le cloud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC sur Base",
                    note: "Pour initialiser le fournisseur (Remarque : l'adresse de dépôt réelle et les détails seraient fournis par le backend après l'initialisation de cette option de paiement)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Vous recevrez une carte-cadeau pour AWS S3",
                    vendor_disclaimer:
                      "Accès immédiat. Votre carte-cadeau de stockage aura un solde crypto qui paie pour le stockage et la bande passante. Vous pouvez la recharger à tout moment si vous avez besoin de plus.",
                    terms_of_service_url: "https://google.com",
                    requires_email_for_init: true,
                    about_url: "https://vendor.com",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
};
export default LOCALE;
