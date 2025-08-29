import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["sq"]: {
    helmet: {
      chat: "Bisedë | OfficeX",
      purchase_history: "Historia e blerjeve",
      appstore: "Dyqani i aplikacioneve",
      folder: "Dosje",
      file: "Skedar",
      settings: "Cilësimet",
    },
    default_disks: {
      browser_cache: {
        title: "Cache i shfletuesit offline",
        public_note:
          "Cache i shfletuesit lokal për akses offline. Skedarët fshihen nëse pastroni historinë e shfletuesit për këtë faqe.",
      },
      free_cloud_filesharing: {
        title: "Ndarja falas e skedarëve në cloud",
        public_note:
          "Ndarja publike falas e skedarëve. Skedarët skadojnë brenda 24 orëve, çdo ditë në mesnatë UTC.",
      },
      folders: {
        root: "Rrënjë",
        throwaway: "Për t'u hedhur",
        demo_gallery: "Galeria demo",
        tutorial_videos: "Video-tutoriale",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organizata offline",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Organizata anonime",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Kërkoni për aplikacione, agjentë dhe shërbime...",
        search_offers: "Filtro ofertat...",
      },
      s3_offer: {
        id: "19",
        name: "Ruajtja në cloud me shumicë",
        subheading:
          "Shtoni ruajtje në OfficeX me kartat e dhuratave për $1 për 100GB/muaj",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Kartë dhuratë për ruajtje 100GB",
            images: [],
            description:
              "<p>Bleni një kartë dhuratë 100GB për ruajtje të sigurt, të shkallëzuar në cloud në Amazon Cloud. Të dhënat tuaja janë të mbrojtura nga qëndrueshmëria dhe disponueshmëria udhëheqëse e industrisë së AWS S3, duke siguruar besueshmëri dhe performancë të lartë. Kjo kartë dhuratë shton fonde në llogarinë tuaj të ruajtjes me çmime të bazuara në përdorim.</p><p>Ne ofrojmë ruajtje të shpejtë dhe të përballueshme falë AWS S3 Intelligent-Tiering, i cili zhvendos automatikisht të dhënat në nivelin e ruajtjes më efikas nga pikëpamja e kostos pa ndikuar në performancë. Kjo ofron disponueshmëri të lartë me çmime me shumicë.</p><ul><li>Skedarët e përdorur rrallë: Zhvendosen automatikisht në ruajtje më të ftohtë për vetëm $0.0054/GB në muaj.</li><li>Skedarët e përdorur shpesh: Ruhen në ruajtje standarde për $0.03128/GB në muaj.</li></ul><p>Ju lutemi vini re se dalja e të dhënave (shkarkimi i të dhënave nga cloud) ngarkohet me $0.1224 për GB.</p><p>Zgjeroni kapacitetin tuaj të ruajtjes OfficeX me këtë kartë dhuratë të përshtatshme 100GB, duke siguruar që të gjitha dokumentet tuaja të rëndësishme të ruhen në mënyrë të sigurt në cloud.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "në muaj për ruajtje dhe përpunim, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Blej kartë dhuratë",
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
                price_line: "$0.01/GB/muaj",
                view_page_link: "#",
                call_to_action: "Blej kartë dhuratë",
                description:
                  "Zgjeroni kapacitetin tuaj të ruajtjes OfficeX me këtë kartë dhuratë të përshtatshme 100GB, duke siguruar që të gjitha dokumentet tuaja të rëndësishme të ruhen në mënyrë të sigurt në cloud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC në Base",
                    note: "Për të inicializuar shitësin (Shënim: Adresa aktuale e depozitës dhe detajet do të sigurohen nga backend pasi të iniciohet ky opsion i blerjes)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "Ju do të merrni një kartë dhuratë për AWS S3",
                    vendor_disclaimer:
                      "Akses i menjëhershëm. Karta juaj e dhuratës për ruajtje do të ketë një bilanc kripto që paguan për ruajtje dhe gjerësinë e bandës. Ju mund ta rimbushni atë sa herë që keni nevojë për më shumë.",
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
