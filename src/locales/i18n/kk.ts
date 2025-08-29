import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["kk"]: {
    helmet: {
      chat: "Чат | OfficeX",
      purchase_history: "Сатып алу тарихы",
      appstore: "Қолданбалар дүкені",
      folder: "Қапшық",
      file: "Файл",
      settings: "Параметрлер",
    },
    default_disks: {
      browser_cache: {
        title: "Офлайн браузер кэші",
        public_note:
          "Офлайн қол жеткізуге арналған жергілікті браузер кэші. Егер сіз осы сайт үшін браузер тарихын тазаласаңыз, файлдар жойылады.",
      },
      free_cloud_filesharing: {
        title: "Тегін бұлттық файлдарды бөлісу",
        public_note:
          "Тегін көпшілікке арналған файлдарды бөлісу. Файлдар 24 сағат ішінде, күн сайын UTC түн ортасында жарамдылық мерзімі аяқталады.",
      },
      folders: {
        root: "Түбір",
        throwaway: "Тастайтын",
        demo_gallery: "Демо галерея",
        tutorial_videos: "Оқу бейнелері",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Офлайн ұйым",
        profile_name: "Анон",
      },
      anon_org: {
        org_name: "Анонимді ұйым",
        profile_name: "Анон",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Қолданбаларды, агенттерді және қызметтерді іздеу...",
        search_offers: "Ұсыныстарды сүзу...",
      },
      s3_offer: {
        id: "19",
        name: "Жаппай бұлттық сақтау",
        subheading:
          "OfficeX-ке 100 ГБ/ай үшін $1-ға сыйлық карталарымен сақтауды қосу",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100 ГБ сақтау сыйлық картасы",
            images: [],
            description:
              "<p>Amazon Cloud-та қауіпсіз, масштабталатын бұлттық сақтау үшін 100 ГБ сыйлық картасын сатып алыңыз. Сіздің деректеріңіз AWS S3-тың саладағы жетекші төзімділігімен және қолжетімділігімен қорғалған, бұл жоғары сенімділік пен өнімділікті қамтамасыз етеді. Бұл сыйлық картасы сақтау шотыңызға пайдалануға негізделген бағамен қаражат қосады.</p><p>Біз өнімділікке әсер етпей, деректерді ең үнемді сақтау деңгейіне автоматты түрде жылжытатын AWS S3 Intelligent-Tiering арқасында жылдам және қолжетімді сақтауды ұсынамыз. Бұл көтерме бағамен жоғары қолжетімділікті қамтамасыз етеді.</p><ul><li>Сирек қол жеткізілетін файлдар: Ай сайын $0.0054/ГБ сияқты аз ақшаға суық сақтауға автоматты түрде жылжытылады.</li><li>Жиі қол жеткізілетін файлдар: Ай сайын $0.03128/ГБ үшін стандартты сақтауда сақталады.</li></ul><p>Ескерту: деректердің шығуы (бұлттан деректерді жүктеп алу) ГБ үшін $0.1224 тұрады.</p><p>Осы ыңғайлы 100 ГБ сыйлық картасымен OfficeX сақтау сыйымдылығын кеңейтіңіз, бұл сіздің барлық маңызды құжаттарыңыздың бұлтта қауіпсіз сақталғанына кепілдік береді.</p>",
            price: 0.01,
            price_unit: "/ГБ",
            price_explanation: "сақтау және өңдеу үшін айына, мин $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Сыйлық картасын сатып алу",
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
                price_line: "$0.01/ГБ/ай",
                view_page_link: "#",
                call_to_action: "Сыйлық картасын сатып алу",
                description:
                  "Осы ыңғайлы 100 ГБ сыйлық картасымен OfficeX сақтау сыйымдылығын кеңейтіңіз, бұл сіздің барлық маңызды құжаттарыңыздың бұлтта қауіпсіз сақталғанына кепілдік береді.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base-дағы USDC",
                    note: "Сатушыны бастапқыға келтіру үшін (Ескерту: Нақты депозит адресі мен мәліметтер осы төлем опциясын бастағаннан кейін backend арқылы беріледі)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Сіз AWS S3 үшін сыйлық картасын аласыз",
                    vendor_disclaimer:
                      "Бірден қол жеткізу. Сіздің сақтау сыйлық картаңызда сақтау және өткізу қабілеті үшін төлейтін крипто балансы болады. Қосымша қажет болған кезде оны кез келген уақытта толтыра аласыз.",
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
