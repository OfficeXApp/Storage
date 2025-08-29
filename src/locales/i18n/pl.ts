import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["pl"]: {
    helmet: {
      chat: "Czat | OfficeX",
      purchase_history: "Historia zakupów",
      appstore: "Sklep z aplikacjami",
      folder: "Folder",
      file: "Plik",
      settings: "Ustawienia",
    },
    default_disks: {
      browser_cache: {
        title: "Pamięć podręczna przeglądarki offline",
        public_note:
          "Lokalna pamięć podręczna przeglądarki do dostępu offline. Pliki zostaną usunięte, jeśli wyczyścisz historię przeglądarki dla tej witryny.",
      },
      free_cloud_filesharing: {
        title: "Darmowe udostępnianie plików w chmurze",
        public_note:
          "Darmowe publiczne udostępnianie plików. Pliki wygasają w ciągu 24 godzin, codziennie o północy UTC.",
      },
      folders: {
        root: "Korzeń",
        throwaway: "Do wyrzucenia",
        demo_gallery: "Galeria demonstracyjna",
        tutorial_videos: "Filmy instruktażowe",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organizacja offline",
        profile_name: "Anonim",
      },
      anon_org: {
        org_name: "Organizacja anonimowa",
        profile_name: "Anonim",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Szukaj aplikacji, agentów i usług...",
        search_offers: "Filtruj oferty...",
      },
      s3_offer: {
        id: "19",
        name: "Masowe przechowywanie w chmurze",
        subheading:
          "Dodaj pamięć masową do OfficeX za pomocą kart podarunkowych za 1 USD za 100 GB/miesiąc",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Karta podarunkowa na 100 GB pamięci masowej",
            images: [],
            description:
              "<p>Kup kartę podarunkową 100 GB na bezpieczne, skalowalne przechowywanie w chmurze Amazon Cloud. Twoje dane są chronione przez wiodącą w branży trwałość i dostępność AWS S3, co zapewnia wysoką niezawodność i wydajność. Ta karta podarunkowa dodaje fundusze do Twojego konta pamięci masowej z cenami opartymi na użyciu.</p><p>Oferujemy szybkie i niedrogie przechowywanie dzięki AWS S3 Intelligent-Tiering, który automatycznie przenosi dane do najbardziej opłacalnej warstwy pamięci masowej bez wpływu na wydajność. Zapewnia to wysoką dostępność po cenach hurtowych.</p><ul><li>Rzadko używane pliki: Automatycznie przenoszone do chłodniejszej pamięci masowej za jedyne 0,0054 USD/GB miesięcznie.</li><li>Często używane pliki: Przechowywane w standardowej pamięci masowej za 0,03128 USD/GB miesięcznie.</li></ul><p>Należy pamiętać, że pobieranie danych z chmury jest płatne 0,1224 USD za GB.</p><p>Rozszerz swoją pojemność pamięci masowej OfficeX za pomocą tej wygodnej karty podarunkowej 100 GB, zapewniając, że wszystkie ważne dokumenty są bezpiecznie przechowywane w chmurze.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "miesięcznie za przechowywanie i przetwarzanie, min. 1 USD",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Kup kartę podarunkową",
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
                price_line: "0,01 USD/GB/miesiąc",
                view_page_link: "#",
                call_to_action: "Kup kartę podarunkową",
                description:
                  "Rozszerz swoją pojemność pamięci masowej OfficeX za pomocą tej wygodnej karty podarunkowej 100 GB, zapewniając, że wszystkie ważne dokumenty są bezpiecznie przechowywane w chmurze.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC na Base",
                    note: "Aby zainicjować dostawcę (Uwaga: Rzeczywisty adres depozytu i szczegóły zostaną dostarczone przez backend po zainicjowaniu tej opcji płatności)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Otrzymasz kartę podarunkową na AWS S3",
                    vendor_disclaimer:
                      "Natychmiastowy dostęp. Twoja karta podarunkowa pamięci masowej będzie miała saldo kryptowalutowe, które płaci za przechowywanie i przepustowość. Możesz ją doładować w dowolnym momencie, gdy potrzebujesz więcej.",
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
