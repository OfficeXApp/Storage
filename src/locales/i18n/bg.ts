import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["bg"]: {
    helmet: {
      chat: "Чат | OfficeX",
      purchase_history: "История на покупките",
      appstore: "Магазин за приложения",
      folder: "Папка",
      file: "Файл",
      settings: "Настройки",
    },
    default_disks: {
      browser_cache: {
        title: "Офлайн кеш на браузъра",
        public_note:
          "Локален кеш на браузъра за офлайн достъп. Файловете се изтриват, ако изчистите историята на браузъра за този сайт.",
      },
      free_cloud_filesharing: {
        title: "Безплатно споделяне на файлове в облак",
        public_note:
          "Безплатно публично споделяне на файлове. Файловете изтичат в рамките на 24 часа, ежедневно в полунощ по UTC.",
      },
      folders: {
        root: "Корен",
        throwaway: "За изхвърляне",
        demo_gallery: "Демо галерия",
        tutorial_videos: "Обучителни видеа",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Офлайн организация",
        profile_name: "Анонимен",
      },
      anon_org: {
        org_name: "Анонимна организация",
        profile_name: "Анонимен",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Търсене на приложения, агенти и услуги...",
        search_offers: "Филтриране на оферти...",
      },
      s3_offer: {
        id: "19",
        name: "Масово облачно хранилище",
        subheading:
          "Добавете хранилище към OfficeX с карти за подарък за 1$ за 100GB/месец",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Карта за подарък за 100GB хранилище",
            images: [],
            description:
              "<p>Купете карта за подарък от 100GB за сигурно, мащабируемо облачно хранилище на Amazon Cloud. Вашите данни са защитени от водещата в индустрията издръжливост и наличност на AWS S3, осигурявайки висока надеждност и производителност. Тази карта за подарък добавя средства към вашия акаунт за съхранение с цени, базирани на използването.</p><p>Ние предлагаме бързо и достъпно хранилище благодарение на AWS S3 Intelligent-Tiering, което автоматично премества данните в най-рентабилния слой за съхранение, без да влияе на производителността. Това осигурява висока наличност на цени на едро.</p><ul><li>Рядко достъпвани файлове: Автоматично се преместват в по-студено хранилище за едва 0,0054 $/GB на месец.</li><li>Често достъпвани файлове: Се съхраняват в стандартно хранилище за 0,03128 $/GB на месец.</li></ul><p>Моля, обърнете внимание, че изходящият трафик на данни (изтегляне на данни от облака) се таксува с 0,1224 $ на GB.</p><p>Разширете капацитета си за съхранение в OfficeX с тази удобна карта за подарък от 100GB, като гарантирате, че всичките ви важни документи се съхраняват сигурно в облака.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "на месец за съхранение и обработка, мин. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Купи карта за подарък",
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
                    label: "Форум",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0,01/GB/месец",
                view_page_link: "#",
                call_to_action: "Купи карта за подарък",
                description:
                  "Разширете капацитета си за съхранение в OfficeX с тази удобна карта за подарък от 100GB, като гарантирате, че всичките ви важни документи се съхраняват сигурно в облака.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC на Base",
                    note: "За да инициализирате доставчика (Забележка: Действителният адрес за депозит и детайлите ще бъдат предоставени от бекенда след инициирането на тази опция за плащане)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Ще получите карта за подарък за AWS S3",
                    vendor_disclaimer:
                      "Незабавен достъп. Вашата карта за подарък за съхранение ще има крипто баланс, който плаща за съхранение и честотна лента. Можете да я заредите по всяко време, когато имате нужда от повече.",
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
