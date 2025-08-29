import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["af"]: {
    helmet: {
      chat: "Gesels | OfficeX",
      purchase_history: "Aankoopgeskiedenis",
      appstore: "App-winkel",
      folder: "Lêergids",
      file: "Lêer",
      settings: "Instellings",
    },
    default_disks: {
      browser_cache: {
        title: "Vanlyn blaaierkas",
        public_note:
          "Plaaslike blaaierkas vir vanlyn toegang. Lêers word uitgevee as jy blaaiergeskiedenis vir hierdie webwerf uitvee.",
      },
      free_cloud_filesharing: {
        title: "Gratis lêerdeling in die wolk",
        public_note:
          "Gratis publieke lêerdeling. Lêers verval binne 24 uur, daagliks om middernag UTC.",
      },
      folders: {
        root: "Wortel",
        throwaway: "Weggooi",
        demo_gallery: "Demo-galery",
        tutorial_videos: "Tutorial-video's",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Vanlyn organisasie",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonieme organisasie",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Soek vir programme, agente en dienste...",
        search_offers: "Filtreer aanbiedinge...",
      },
      s3_offer: {
        id: "19",
        name: "Grootmaat wolkopberging",
        subheading:
          "Voeg stoorplek by OfficeX met geskenkkaarte vir $1 per 100GB/maand",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB geskenkkaart vir stoorplek",
            images: [],
            description:
              "<p>Koop 'n 100GB geskenkkaart vir veilige, skaalbare wolkopberging op Amazon Cloud. Jou data word beskerm deur AWS S3 se toonaangewende duursaamheid en beskikbaarheid, wat hoë betroubaarheid en prestasie verseker. Hierdie geskenkkaart voeg fondse by jou stoorrekening met pryse gebaseer op gebruik.</p><p>Ons bied vinnige en bekostigbare stoorplek danksy AWS S3 Intelligent-Tiering, wat data outomaties skuif na die mees koste-effektiewe stoorvlak sonder om prestasie te beïnvloed. Dit bied hoë beskikbaarheid teen groothandelpryse.</p><ul><li>Lêers waartoe selde toegang verkry word: Word outomaties na kouer stoorplek geskuif vir so min as $0.0054/GB per maand.</li><li>Lêers waartoe gereeld toegang verkry word: Word in standaard stoorplek gehou vir $0.03128/GB per maand.</li></ul><p>Let asseblief daarop dat data-uitgang (aflaai van data uit die wolk) teen $0.1224 per GB gehef word.</p><p>Vergroot jou OfficeX stoorplek-kapasiteit met hierdie gerieflike 100GB geskenkkaart, wat verseker dat al jou belangrike dokumente veilig in die wolk gestoor word.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "per maand vir stoor en verwerking, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Koop geskenkkaart",
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
                price_line: "$0.01/GB/maand",
                view_page_link: "#",
                call_to_action: "Koop geskenkkaart",
                description:
                  "Vergroot jou OfficeX stoorplek-kapasiteit met hierdie gerieflike 100GB geskenkkaart, wat verseker dat al jou belangrike dokumente veilig in die wolk gestoor word.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC op Base",
                    note: "Om die verskaffer te inisialiseer (Let wel: Werklike deposito-adres en -besonderhede sal deur die agterkant verskaf word na die inisialisasie van hierdie betaalopsie)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Jy sal 'n geskenkkaart vir AWS S3 ontvang",
                    vendor_disclaimer:
                      "Onmiddellike toegang. Jou stoor-geskenkkaart sal 'n kripto-saldo hê wat betaal vir stoorplek en bandwydte. Jy kan dit enige tyd aanvul wanneer jy meer benodig.",
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
