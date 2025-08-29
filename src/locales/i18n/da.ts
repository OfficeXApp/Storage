import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["da"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Købshistorik",
      appstore: "App Store",
      folder: "Mappe",
      file: "Fil",
      settings: "Indstillinger",
    },
    default_disks: {
      browser_cache: {
        title: "Offline browsercache",
        public_note:
          "Lokal browsercache til offlineadgang. Filer slettes, hvis du rydder browserhistorikken for dette websted.",
      },
      free_cloud_filesharing: {
        title: "Gratis fildeling i skyen",
        public_note:
          "Gratis offentlig fildeling. Filer udløber inden for 24 timer, dagligt ved midnat UTC.",
      },
      folders: {
        root: "Rod",
        throwaway: "Kaste",
        demo_gallery: "Demo galleri",
        tutorial_videos: "Tutorial-videoer",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline organisation",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonym organisation",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Søg efter apps, agenter og tjenester...",
        search_offers: "Filtrer tilbud...",
      },
      s3_offer: {
        id: "19",
        name: "Bulk cloud-lager",
        subheading:
          "Tilføj lagerplads til OfficeX med gavekort for 1$ pr. 100GB/måned",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB gavekort til lagerplads",
            images: [],
            description:
              "<p>Køb et 100GB gavekort til sikker, skalerbar cloud-lagerplads på Amazon Cloud. Dine data er beskyttet af AWS S3's brancheførende holdbarhed og tilgængelighed, hvilket sikrer høj pålidelighed og ydeevne. Dette gavekort tilføjer midler til din lagerkonto med brugsbaseret prissætning.</p><p>Vi tilbyder hurtig og overkommelig lagerplads takket være AWS S3 Intelligent-Tiering, som automatisk flytter data til det mest omkostningseffektive lagerlag uden at påvirke ydeevnen. Dette giver høj tilgængelighed til engrospriser.</p><ul><li>Sjældent tilgåede filer: Flyttes automatisk til koldere lager for så lidt som 0,0054 $/GB om måneden.</li><li>Ofte tilgåede filer: Opbevares i standardlager for 0,03128 $/GB om måneden.</li></ul><p>Bemærk venligst, at dataudgang (download af data fra skyen) opkræves til 0,1224 $ per GB.</p><p>Udvid din OfficeX-lagerkapacitet med dette praktiske 100GB gavekort, der sikrer, at alle dine vigtige dokumenter opbevares sikkert i skyen.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "pr. måned for lager og behandling, min. 1 $",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Køb gavekort",
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
                price_line: "$0,01/GB/måned",
                view_page_link: "#",
                call_to_action: "Køb gavekort",
                description:
                  "Udvid din OfficeX-lagerkapacitet med dette praktiske 100GB gavekort, der sikrer, at alle dine vigtige dokumenter opbevares sikkert i skyen.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC på Base",
                    note: "For at initialisere leverandøren (Bemærk: Den faktiske indbetalingsadresse og detaljer vil blive leveret af backend efter at have indledt denne checkout-mulighed)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Du vil modtage et gavekort til AWS S3",
                    vendor_disclaimer:
                      "Øjeblikkelig adgang. Dit lagergavekort vil have en kryptosaldo, der betaler for lager og båndbredde. Du kan fylde det op, når du har brug for mere.",
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
