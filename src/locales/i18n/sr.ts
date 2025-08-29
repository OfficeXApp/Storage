import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["sr"]: {
    helmet: {
      chat: "Ћаскање | OfficeX",
      purchase_history: "Историја куповина",
      appstore: "Продавница апликација",
      folder: "Фасцикла",
      file: "Датотека",
      settings: "Подешавања",
    },
    default_disks: {
      browser_cache: {
        title: "Офлајн кеш прегледача",
        public_note:
          "Локални кеш прегледача за офлајн приступ. Датотеке се бришу ако обришете историју прегледача за ову страницу.",
      },
      free_cloud_filesharing: {
        title: "Бесплатно дељење датотека у облаку",
        public_note:
          "Бесплатно јавно дељење датотека. Датотеке истичу у року од 24 сата, свакодневно у поноћ УТЦ.",
      },
      folders: {
        root: "Корен",
        throwaway: "За одбацивање",
        demo_gallery: "Демо галерија",
        tutorial_videos: "Туторијал видео снимци",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Офлајн организација",
        profile_name: "Анон",
      },
      anon_org: {
        org_name: "Анонимна организација",
        profile_name: "Анон",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Претражите апликације, агенте и услуге...",
        search_offers: "Филтрирајте понуде...",
      },
      s3_offer: {
        id: "19",
        name: "Масовно складиштење у облаку",
        subheading:
          "Додајте складиште у OfficeX са поклон картицама за $1 по 100GB/месец",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Поклон картица за 100GB складиштења",
            images: [],
            description:
              "<p>Купите поклон картицу од 100GB за безбедно, скалабилно складиштење у облаку на Amazon Cloud. Ваши подаци су заштићени водећом у индустрији издржљивошћу и доступношћу AWS S3, обезбеђујући високу поузданост и перформансе. Ова поклон картица додаје средства на ваш рачун за складиштење са ценама заснованим на коришћењу.</p><p>Нудимо брзо и приступачно складиштење захваљујући AWS S3 Intelligent-Tiering, који аутоматски премешта податке у најисплативији слој складиштења без утицаја на перформансе. Ово пружа високу доступност по велепродајним ценама.</p><ul><li>Ретко приступане датотеке: Аутоматски се премештају у хладније складиште за само $0,0054/GB месечно.</li><li>Често приступане датотеке: Задржавају се у стандардном складишту за $0,03128/GB месечно.</li></ul><p>Имајте на уму да се излаз података (преузимање података из облака) наплаћује по цени од $0,1224 по GB.</p><p>Проширите свој OfficeX капацитет складиштења са овом практичном поклон картицом од 100GB, обезбеђујући да сви ваши важни документи буду безбедно сачувани у облаку.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "месечно за складиштење и обраду, мин. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Купи поклон картицу",
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
                price_line: "$0.01/GB/месечно",
                view_page_link: "#",
                call_to_action: "Купи поклон картицу",
                description:
                  "Проширите свој OfficeX капацитет складиштења са овом практичном поклон картицом од 100GB, обезбеђујући да сви ваши важни документи буду безбедно сачувани у облаку.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC на Base",
                    note: "Да бисте иницијализовали продавца (Напомена: Стварна адреса депозита и детаљи ће бити обезбеђени од стране бекенда након иницирања ове опције плаћања)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Добићете поклон картицу за AWS S3",
                    vendor_disclaimer:
                      "Непосредан приступ. Ваша поклон картица за складиштење ће имати крипто баланс који плаћа за складиштење и пропусни опсег. Можете је допунити кад год вам затреба више.",
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
