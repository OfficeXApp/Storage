import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["tr"]: {
    helmet: {
      chat: "Sohbet | OfficeX",
      purchase_history: "Satın alma geçmişi",
      appstore: "Uygulama Mağazası",
      folder: "Klasör",
      file: "Dosya",
      settings: "Ayarlar",
    },
    default_disks: {
      browser_cache: {
        title: "Çevrimdışı Tarayıcı Önbelleği",
        public_note:
          "Çevrimdışı erişim için yerel tarayıcı önbelleği. Bu site için tarayıcı geçmişini temizlerseniz dosyalar silinir.",
      },
      free_cloud_filesharing: {
        title: "Ücretsiz Bulut Dosya Paylaşımı",
        public_note:
          "Ücretsiz herkese açık dosya paylaşımı. Dosyaların süresi her gün UTC gece yarısı 24 saat içinde dolar.",
      },
      folders: {
        root: "Kök",
        throwaway: "Atılacak",
        demo_gallery: "Demo Galerisi",
        tutorial_videos: "Eğitim Videoları",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Çevrimdışı Organizasyon",
        profile_name: "Anonim",
      },
      anon_org: {
        org_name: "Anonim Organizasyon",
        profile_name: "Anonim",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Uygulamaları, aracıları ve hizmetleri ara...",
        search_offers: "Teklifleri filtrele...",
      },
      s3_offer: {
        id: "19",
        name: "Toplu Bulut Depolama",
        subheading:
          "OfficeX'e 100GB/ay için 1$ karşılığında hediye kartları ile depolama ekleyin",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB Depolama Hediye Kartı",
            images: [],
            description:
              "<p>Amazon Cloud'da güvenli, ölçeklenebilir bulut depolama için 100GB'lık bir hediye kartı satın alın. Verileriniz, yüksek güvenilirlik ve performans sağlayan AWS S3'ün sektör lideri dayanıklılığı ve kullanılabilirliği ile korunmaktadır. Bu hediye kartı, kullanım bazlı fiyatlandırma ile depolama hesabınıza fon ekler.</p><p>Performansı etkilemeden verileri otomatik olarak en uygun maliyetli depolama katmanına taşıyan AWS S3 Intelligent-Tiering sayesinde hızlı ve uygun fiyatlı depolama sunuyoruz. Bu, toptan fiyatlandırmayla yüksek kullanılabilirlik sağlar.</p><ul><li>Seyrek erişilen dosyalar: Ayda 0,0054$/GB gibi düşük bir fiyata otomatik olarak daha soğuk depolamaya taşınır.</li><li>Sık erişilen dosyalar: Ayda 0,03128$/GB karşılığında standart depolamada tutulur.</li></ul><p>Veri çıkışının (buluttan veri indirme) GB başına 0,1224$ olarak ücretlendirildiğini lütfen unutmayın.</p><p>Tüm önemli belgelerinizin bulutta güvenli bir şekilde saklandığından emin olmak için bu kullanışlı 100GB hediye kartıyla OfficeX depolama kapasitenizi genişletin.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "depolama ve işleme için aylık, min. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Hediye Kartı Satın Al",
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
                price_line: "0,01$/GB/ay",
                view_page_link: "#",
                call_to_action: "Hediye Kartı Satın Al",
                description:
                  "Tüm önemli belgelerinizin bulutta güvenli bir şekilde saklandığından emin olmak için bu kullanışlı 100GB hediye kartıyla OfficeX depolama kapasitenizi genişletin.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base'de USDC",
                    note: "Satıcıyı başlatmak için (Not: Gerçek para yatırma adresi ve detaylar, bu ödeme seçeneğini başlattıktan sonra arka uç tarafından sağlanacaktır)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "AWS S3 için bir hediye kartı alacaksınız",
                    vendor_disclaimer:
                      "Anında erişim. Depolama hediye kartınız, depolama ve bant genişliği için ödeme yapan bir kripto bakiyesine sahip olacaktır. Daha fazlasına ihtiyacınız olduğunda istediğiniz zaman yükleme yapabilirsiniz.",
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
