import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["uk"]: {
    helmet: {
      chat: "Чат | OfficeX",
      purchase_history: "Історія покупок",
      appstore: "Магазин додатків",
      folder: "Папка",
      file: "Файл",
      settings: "Налаштування",
    },
    default_disks: {
      browser_cache: {
        title: "Офлайн-кеш браузера",
        public_note:
          "Локальний кеш браузера для офлайн-доступу. Файли видаляються, якщо ви очищаєте історію браузера для цього сайту.",
      },
      free_cloud_filesharing: {
        title: "Безкоштовний спільний доступ до файлів у хмарі",
        public_note:
          "Безкоштовний спільний доступ до публічних файлів. Файли закінчуються протягом 24 годин, щодня опівночі за UTC.",
      },
      folders: {
        root: "Корінь",
        throwaway: "Викинути",
        demo_gallery: "Демо-галерея",
        tutorial_videos: "Відеоуроки",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Офлайн-організація",
        profile_name: "Анон",
      },
      anon_org: {
        org_name: "Анонімна організація",
        profile_name: "Анон",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Шукати програми, агенти та послуги...",
        search_offers: "Фільтрувати пропозиції...",
      },
      s3_offer: {
        id: "19",
        name: "Масове хмарне сховище",
        subheading:
          "Додайте сховище до OfficeX за допомогою подарункових карт за 1 долар за 100 ГБ/місяць",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Подарункова карта на 100 ГБ сховища",
            images: [],
            description:
              "<p>Придбайте подарункову карту на 100 ГБ для безпечного, масштабованого хмарного сховища на Amazon Cloud. Ваші дані захищені провідною в галузі довговічністю та доступністю AWS S3, що забезпечує високу надійність і продуктивність. Ця подарункова карта додає кошти на ваш обліковий запис сховища з ціноутворенням на основі використання.</p><p>Ми пропонуємо швидке та доступне сховище завдяки AWS S3 Intelligent-Tiering, який автоматично переміщує дані до найекономічнішого рівня сховища, не впливаючи на продуктивність. Це забезпечує високу доступність за оптовими цінами.</p><ul><li>Файли з рідким доступом: Автоматично переміщуються до холоднішого сховища за ціною всього 0,0054 $/ГБ на місяць.</li><li>Файли з частим доступом: Зберігаються в стандартному сховищі за 0,03128 $/ГБ на місяць.</li></ul><p>Зверніть увагу, що за вихід даних (завантаження даних з хмари) стягується плата в розмірі 0,1224 $ за ГБ.</p><p>Розширте свою ємність сховища OfficeX за допомогою цієї зручної подарункової карти на 100 ГБ, забезпечуючи надійне зберігання всіх ваших важливих документів у хмарі.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "за місяць для зберігання та обробки, мін. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Купити подарункову карту",
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
                price_line: "$0,01/ГБ/місяць",
                view_page_link: "#",
                call_to_action: "Купити подарункову карту",
                description:
                  "Розширте свою ємність сховища OfficeX за допомогою цієї зручної подарункової карти на 100 ГБ, забезпечуючи надійне зберігання всіх ваших важливих документів у хмарі.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC на Base",
                    note: "Для ініціалізації постачальника (Примітка: Фактична адреса депозиту та деталі будуть надані бекендом після ініціювання цієї опції оплати)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Ви отримаєте подарункову карту для AWS S3",
                    vendor_disclaimer:
                      "Миттєвий доступ. Ваша подарункова карта сховища матиме крипто-баланс, який оплачує зберігання та пропускну здатність. Ви можете поповнити його в будь-який час, коли вам потрібно більше.",
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
