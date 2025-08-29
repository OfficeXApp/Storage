import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["nl"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Aankoopgeschiedenis",
      appstore: "App Store",
      folder: "Map",
      file: "Bestand",
      settings: "Instellingen",
    },
    default_disks: {
      browser_cache: {
        title: "Offline browsercache",
        public_note:
          "Lokale browsercache voor offline toegang. Bestanden worden verwijderd als u de browsergeschiedenis voor deze site wist.",
      },
      free_cloud_filesharing: {
        title: "Gratis cloudbestandendeling",
        public_note:
          "Gratis openbare bestandendeling. Bestanden verlopen binnen 24 uur, dagelijks om middernacht UTC.",
      },
      folders: {
        root: "Hoofdmap",
        throwaway: "Wegwerp",
        demo_gallery: "Demogalerij",
        tutorial_videos: "Tutorialvideo's",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline organisatie",
        profile_name: "Anoniem",
      },
      anon_org: {
        org_name: "Anonieme organisatie",
        profile_name: "Anoniem",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Zoeken naar apps, agents & services...",
        search_offers: "Aanbiedingen filteren...",
      },
      s3_offer: {
        id: "19",
        name: "Bulk cloudopslag",
        subheading:
          "Voeg opslag toe aan OfficeX met cadeaubonnen voor $1 per 100GB/maand",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB opslag cadeaubon",
            images: [],
            description:
              "<p>Koop een 100GB cadeaubon voor veilige, schaalbare cloudopslag op Amazon Cloud. Uw gegevens worden beschermd door de toonaangevende duurzaamheid en beschikbaarheid van AWS S3, wat zorgt voor hoge betrouwbaarheid en prestaties. Deze cadeaubon voegt fondsen toe aan uw opslagaccount met op gebruik gebaseerde prijzen.</p><p>Wij bieden snelle en betaalbare opslag dankzij AWS S3 Intelligent-Tiering, dat gegevens automatisch verplaatst naar de meest kosteneffectieve opslaglaag zonder de prestaties te beïnvloeden. Dit biedt een hoge beschikbaarheid tegen groothandelsprijzen.</p><ul><li>Zelden gebruikte bestanden: Worden automatisch verplaatst naar koudere opslag voor slechts $0,0054/GB per maand.</li><li>Vaak gebruikte bestanden: Blijven in standaardopslag voor $0,03128/GB per maand.</li></ul><p>Houd er rekening mee dat data-egress (het downloaden van gegevens uit de cloud) in rekening wordt gebracht tegen $0,1224 per GB.</p><p>Breid uw OfficeX-opslagcapaciteit uit met deze handige 100GB cadeaubon, zodat al uw belangrijke documenten veilig in de cloud worden opgeslagen.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "per maand voor opslag en verwerking, min. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Cadeaubon kopen",
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
                price_line: "$0,01/GB/maand",
                view_page_link: "#",
                call_to_action: "Cadeaubon kopen",
                description:
                  "Breid uw OfficeX-opslagcapaciteit uit met deze handige 100GB cadeaubon, zodat al uw belangrijke documenten veilig in de cloud worden opgeslagen.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC op Base",
                    note: "Om de leverancier te initialiseren (Opmerking: Het daadwerkelijke stortingsadres en de details worden door de backend verstrekt na het initiëren van deze betaaloptie)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "U ontvangt een cadeaubon voor AWS S3",
                    vendor_disclaimer:
                      "Onmiddellijke toegang. Uw opslagcadeaubon heeft een crypto-saldo dat betaalt voor opslag en bandbreedte. U kunt het op elk moment opwaarderen wanneer u meer nodig heeft.",
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
