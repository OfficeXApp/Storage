import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["az"]: {
    helmet: {
      chat: "Söhbət | OfficeX",
      purchase_history: "Alış-veriş tarixi",
      appstore: "Tətbiq mağazası",
      folder: "Qovluq",
      file: "Fayl",
      settings: "Ayarlar",
    },
    default_disks: {
      browser_cache: {
        title: "Oflayn brauzer önbelleği",
        public_note:
          "Oflayn giriş üçün yerli brauzer önbelleği. Bu sayt üçün brauzer tarixçəsini təmizləsəniz, fayllar silinir.",
      },
      free_cloud_filesharing: {
        title: "Pulsuz bulud fayl paylaşımı",
        public_note:
          "Pulsuz ictimai fayl paylaşımı. Fayllar 24 saat ərzində, hər gün UTC gecə yarısı bitir.",
      },
      folders: {
        root: "Kök",
        throwaway: "Atılacaq",
        demo_gallery: "Demo qalereya",
        tutorial_videos: "Təlim videoları",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Oflayn təşkilat",
        profile_name: "Anonim",
      },
      anon_org: {
        org_name: "Anonim təşkilat",
        profile_name: "Anonim",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Tətbiqləri, agentləri və xidmətləri axtarın...",
        search_offers: "Təklifləri süzün...",
      },
      s3_offer: {
        id: "19",
        name: "Toplu bulud anbarı",
        subheading:
          "OfficeX-ə 100GB/ay üçün $1-a hədiyyə kartları ilə anbar əlavə edin",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB anbar hədiyyə kartı",
            images: [],
            description:
              "<p>Amazon Cloud-da təhlükəsiz, genişlənə bilən bulud anbarı üçün 100GB hədiyyə kartı alın. Məlumatlarınız AWS S3-ün sənaye lideri davamlılığı və mövcudluğu ilə qorunur, yüksək etibarlılığı və performansını təmin edir. Bu hədiyyə kartı istifadəyə əsaslanan qiymətlərlə anbar hesabınıza vəsait əlavə edir.</p><p>Biz AWS S3 Intelligent-Tiering sayəsində sürətli və münasib anbar təklif edirik, bu da performansa təsir etmədən məlumatları avtomatik olaraq ən sərfəli anbar səviyyəsinə köçürür. Bu, topdansatış qiymətlərinə yüksək mövcudluq təmin edir.</p><ul><li>Nadir hallarda istifadə olunan fayllar: Ayda $0.0054/GB-dan aşağı qiymətə avtomatik olaraq daha soyuq anbarda saxlanılır.</li><li>Tez-tez istifadə olunan fayllar: Ayda $0.03128/GB qiymətinə standart anbarda saxlanılır.</li></ul><p>Zəhmət olmasa qeyd edin ki, məlumat çıxışı (buluddan məlumat yükləmək) hər GB üçün $0.1224 haqqı alınır.</p><p>OfficeX anbar qabiliyyətinizi bu rahat 100GB hədiyyə kartı ilə genişləndirin, bütün vacib sənədlərinizin buludda təhlükəsiz saxlandığını təmin edin.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "ayda anbar və emal üçün, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Hədiyyə kartı alın",
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
                price_line: "$0.01/GB/ay",
                view_page_link: "#",
                call_to_action: "Hədiyyə kartı alın",
                description:
                  "OfficeX anbar qabiliyyətinizi bu rahat 100GB hədiyyə kartı ilə genişləndirin, bütün vacib sənədlərinizin buludda təhlükəsiz saxlandığını təmin edin.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC Base-də",
                    note: "Satıcını başlatmaq üçün (Qeyd: Əsl depozit ünvanı və detallar bu ödəniş seçimi başlatıldıqdan sonra backend tərəfindən veriləcək)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Siz AWS S3 üçün hədiyyə kartı alacaqsınız",
                    vendor_disclaimer:
                      "Ani giriş. Anbar hədiyyə kartınız anbar və bant genişliyi üçün ödəyən kripto balansına sahib olacaq. Siz daha çox ehtiyac duyduğunuz zaman onu istənilən vaxt doldura bilərsiniz.",
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
