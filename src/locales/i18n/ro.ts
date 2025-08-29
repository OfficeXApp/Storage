import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ro"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Istoric cumpărături",
      appstore: "Magazin de aplicații",
      folder: "Dosar",
      file: "Fișier",
      settings: "Setări",
    },
    default_disks: {
      browser_cache: {
        title: "Cache-ul browserului offline",
        public_note:
          "Cache-ul browserului local pentru acces offline. Fișierele sunt șterse dacă ștergeți istoricul browserului pentru acest site.",
      },
      free_cloud_filesharing: {
        title: "Partajare gratuită de fișiere în cloud",
        public_note:
          "Partajare publică gratuită de fișiere. Fișierele expiră în 24 de ore, zilnic la miezul nopții UTC.",
      },
      folders: {
        root: "Rădăcină",
        throwaway: "De aruncat",
        demo_gallery: "Galerie demo",
        tutorial_videos: "Videoclipuri tutoriale",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organizație offline",
        profile_name: "Anonim",
      },
      anon_org: {
        org_name: "Organizație anonimă",
        profile_name: "Anonim",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Căutați aplicații, agenți și servicii...",
        search_offers: "Filtrați ofertele...",
      },
      s3_offer: {
        id: "19",
        name: "Stocare cloud în vrac",
        subheading:
          "Adăugați spațiu de stocare la OfficeX cu carduri cadou pentru 1$ per 100GB/lună",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Card cadou de 100GB de stocare",
            images: [],
            description:
              "<p>Cumpărați un card cadou de 100GB pentru stocare în cloud sigură și scalabilă pe Amazon Cloud. Datele dvs. sunt protejate de durabilitatea și disponibilitatea lideră în industrie a AWS S3, asigurând fiabilitate și performanță ridicată. Acest card cadou adaugă fonduri în contul dvs. de stocare cu prețuri bazate pe utilizare.</p><p>Oferim stocare rapidă și accesibilă datorită AWS S3 Intelligent-Tiering, care mută automat datele la cel mai rentabil nivel de stocare fără a afecta performanța. Acest lucru oferă o disponibilitate ridicată la prețuri de en-gros.</p><ul><li>Fișiere accesate rar: Sunt mutate automat în stocare mai rece pentru doar 0,0054 $/GB pe lună.</li><li>Fișiere accesate frecvent: Sunt păstrate în stocarea standard pentru 0,03128 $/GB pe lună.</li></ul><p>Vă rugăm să rețineți că ieșirea de date (descărcarea datelor din cloud) este taxată cu 0,1224 $ per GB.</p><p>Extindeți capacitatea de stocare OfficeX cu acest card cadou de 100GB, asigurându-vă că toate documentele dvs. importante sunt stocate în siguranță în cloud.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "pe lună pentru stocare și procesare, min. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Cumpără card cadou",
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
                price_line: "$0,01/GB/lună",
                view_page_link: "#",
                call_to_action: "Cumpără card cadou",
                description:
                  "Extindeți capacitatea de stocare OfficeX cu acest card cadou de 100GB, asigurându-vă că toate documentele dvs. importante sunt stocate în siguranță în cloud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC pe Base",
                    note: "Pentru a inițializa furnizorul (Notă: Adresa de depozit reală și detaliile vor fi furnizate de backend după inițierea acestei opțiuni de plată)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Veți primi un card cadou pentru AWS S3",
                    vendor_disclaimer:
                      "Acces imediat. Cardul dvs. cadou de stocare va avea un sold crypto care plătește pentru stocare și lățimea de bandă. Îl puteți reîncărca oricând aveți nevoie de mai mult.",
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
