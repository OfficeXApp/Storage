import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ru"]: {
    helmet: {
      chat: "Чат | OfficeX",
      purchase_history: "История покупок",
      appstore: "Магазин приложений",
      folder: "Папка",
      file: "Файл",
      settings: "Настройки",
    },
    default_disks: {
      browser_cache: {
        title: "Офлайн-кэш браузера",
        public_note:
          "Локальный кэш браузера для офлайн-доступа. Файлы удаляются, если вы очистите историю браузера для этого сайта.",
      },
      free_cloud_filesharing: {
        title: "Бесплатный облачный файлообмен",
        public_note:
          "Бесплатный публичный файлообмен. Файлы истекают в течение 24 часов, ежедневно в полночь по UTC.",
      },
      folders: {
        root: "Корень",
        throwaway: "Временные",
        demo_gallery: "Демо-галерея",
        tutorial_videos: "Обучающие видео",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Офлайн-организация",
        profile_name: "Анон",
      },
      anon_org: {
        org_name: "Анонимная организация",
        profile_name: "Анон",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Поиск приложений, агентов и сервисов...",
        search_offers: "Фильтровать предложения...",
      },
      s3_offer: {
        id: "19",
        name: "Массовое облачное хранилище",
        subheading:
          "Добавьте хранилище в OfficeX с помощью подарочных карт за $1 за 100 ГБ/месяц",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Подарочная карта на 100 ГБ хранилища",
            images: [],
            description:
              "<p>Купите подарочную карту на 100 ГБ для безопасного и масштабируемого облачного хранилища на Amazon Cloud. Ваши данные защищены ведущей в отрасли надежностью и доступностью AWS S3, что обеспечивает высокую надежность и производительность. Эта подарочная карта добавляет средства на ваш счет хранилища с оплатой по факту использования.</p><p>Мы предлагаем быстрое и доступное хранилище благодаря AWS S3 Intelligent-Tiering, который автоматически перемещает данные на наиболее экономичный уровень хранения, не влияя на производительность. Это обеспечивает высокую доступность по оптовым ценам.</p><ul><li>Редко используемые файлы: Автоматически перемещаются в более холодное хранилище по цене от 0,0054 $/ГБ в месяц.</li><li>Часто используемые файлы: Хранятся в стандартном хранилище по цене 0,03128 $/ГБ в месяц.</li></ul><p>Обратите внимание, что исходящий трафик (загрузка данных из облака) взимается по цене 0,1224 $ за ГБ.</p><p>Расширьте свою емкость хранилища OfficeX с помощью этой удобной подарочной карты на 100 ГБ, гарантируя, что все ваши важные документы будут надежно храниться в облаке.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "в месяц за хранение и обработку, мин. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Купить подарочную карту",
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
                price_line: "0,01 $/ГБ/месяц",
                view_page_link: "#",
                call_to_action: "Купить подарочную карту",
                description:
                  "Расширьте свою емкость хранилища OfficeX с помощью этой удобной подарочной карты на 100 ГБ, гарантируя, что все ваши важные документы будут надежно храниться в облаке.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC на Base",
                    note: "Для инициализации поставщика (Примечание: Фактический адрес депозита и детали будут предоставлены бэкэндом после инициирования этого варианта оплаты)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Вы получите подарочную карту для AWS S3",
                    vendor_disclaimer:
                      "Немедленный доступ. Ваша подарочная карта хранилища будет иметь крипто-баланс, который оплачивает хранилище и пропускную способность. Вы можете пополнить его в любое время, когда вам потребуется больше.",
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
