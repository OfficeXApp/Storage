import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["pa"]: {
    helmet: {
      chat: "ਗੱਲਬਾਤ | OfficeX",
      purchase_history: "ਖਰੀਦ ਦਾ ਇਤਿਹਾਸ",
      appstore: "ਐਪ ਸਟੋਰ",
      folder: "ਫੋਲਡਰ",
      file: "ਫਾਈਲ",
      settings: "ਸੈਟਿੰਗਾਂ",
    },
    default_disks: {
      browser_cache: {
        title: "ਆਫਲਾਈਨ ਬ੍ਰਾਊਜ਼ਰ ਕੈਸ਼",
        public_note:
          "ਆਫਲਾਈਨ ਪਹੁੰਚ ਲਈ ਸਥਾਨਕ ਬ੍ਰਾਊਜ਼ਰ ਕੈਸ਼। ਜੇਕਰ ਤੁਸੀਂ ਇਸ ਸਾਈਟ ਲਈ ਬ੍ਰਾਊਜ਼ਰ ਇਤਿਹਾਸ ਨੂੰ ਸਾਫ਼ ਕਰਦੇ ਹੋ ਤਾਂ ਫਾਈਲਾਂ ਮਿਟਾ ਦਿੱਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ।",
      },
      free_cloud_filesharing: {
        title: "ਮੁਫਤ ਕਲਾਊਡ ਫਾਈਲਸ਼ੇਅਰਿੰਗ",
        public_note:
          "ਮੁਫਤ ਜਨਤਕ ਫਾਈਲਸ਼ੇਅਰਿੰਗ। ਫਾਈਲਾਂ 24 ਘੰਟਿਆਂ ਦੇ ਅੰਦਰ, ਰੋਜ਼ਾਨਾ UTC ਅੱਧੀ ਰਾਤ ਨੂੰ ਮਿਆਦ ਪੁੱਗ ਜਾਂਦੀਆਂ ਹਨ।",
      },
      folders: {
        root: "ਰੂਟ",
        throwaway: "ਸੁੱਟਣਯੋਗ",
        demo_gallery: "ਡੈਮੋ ਗੈਲਰੀ",
        tutorial_videos: "ਟਿਊਟੋਰਿਅਲ ਵੀਡੀਓ",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "ਆਫਲਾਈਨ ਸੰਗਠਨ",
        profile_name: "ਅਗਿਆਤ",
      },
      anon_org: {
        org_name: "ਗੁਮਨਾਮ ਸੰਗਠਨ",
        profile_name: "ਅਗਿਆਤ",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "ਐਪਸ, ਏਜੰਟ ਅਤੇ ਸੇਵਾਵਾਂ ਦੀ ਖੋਜ ਕਰੋ...",
        search_offers: "ਪੇਸ਼ਕਸ਼ਾਂ ਨੂੰ ਫਿਲਟਰ ਕਰੋ...",
      },
      s3_offer: {
        id: "19",
        name: "ਬਲਕ ਕਲਾਊਡ ਸਟੋਰੇਜ",
        subheading:
          "100GB/ਮਹੀਨੇ ਲਈ $1 ਵਿੱਚ ਤੋਹਫ਼ੇ ਕਾਰਡਾਂ ਨਾਲ OfficeX ਵਿੱਚ ਸਟੋਰੇਜ ਸ਼ਾਮਲ ਕਰੋ",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB ਸਟੋਰੇਜ ਗਿਫਟਕਾਰਡ",
            images: [],
            description:
              "<p>Amazon Cloud 'ਤੇ ਸੁਰੱਖਿਅਤ, ਸਕੇਲੇਬਲ ਕਲਾਉਡ ਸਟੋਰੇਜ ਲਈ 100GB ਦਾ ਤੋਹਫ਼ਾ ਕਾਰਡ ਖਰੀਦੋ। ਤੁਹਾਡੇ ਡੇਟਾ ਨੂੰ AWS S3 ਦੀ ਉਦਯੋਗ-ਮੋਹਰੀ ਟਿਕਾਊਤਾ ਅਤੇ ਉਪਲਬਧਤਾ ਦੁਆਰਾ ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਉੱਚ ਭਰੋਸੇਯੋਗਤਾ ਅਤੇ ਕਾਰਗੁਜ਼ਾਰੀ ਨੂੰ ਯਕੀਨੀ ਬਣਾਉਂਦਾ ਹੈ। ਇਹ ਤੋਹਫ਼ਾ ਕਾਰਡ ਤੁਹਾਡੇ ਸਟੋਰੇਜ ਖਾਤੇ ਵਿੱਚ ਵਰਤੋਂ ਅਧਾਰਤ ਕੀਮਤ ਦੇ ਨਾਲ ਫੰਡ ਜੋੜਦਾ ਹੈ।</p><p>ਅਸੀਂ AWS S3 Intelligent-Tiering ਦੇ ਕਾਰਨ ਤੇਜ਼ ਅਤੇ ਕਿਫਾਇਤੀ ਸਟੋਰੇਜ ਦੀ ਪੇਸ਼ਕਸ਼ ਕਰਦੇ ਹਾਂ, ਜੋ ਕਾਰਗੁਜ਼ਾਰੀ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕੀਤੇ ਬਿਨਾਂ ਡੇਟਾ ਨੂੰ ਸਭ ਤੋਂ ਵੱਧ ਲਾਗਤ-ਪ੍ਰਭਾਵੀ ਸਟੋਰੇਜ ਟੀਅਰ ਵਿੱਚ ਆਟੋਮੈਟਿਕਲੀ ਲਿਜਾਉਂਦਾ ਹੈ। ਇਹ ਥੋਕ ਕੀਮਤ 'ਤੇ ਉੱਚ ਉਪਲਬਧਤਾ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ।</p><ul><li>ਅਕਸਰ ਪਹੁੰਚ ਕੀਤੇ ਗਏ ਫਾਈਲ: ਆਪਣੇ ਆਪ ਹੀ ਠੰਡੇ ਸਟੋਰੇਜ ਵਿੱਚ ਭੇਜੇ ਜਾਂਦੇ ਹਨ ਜਿਵੇਂ ਕਿ $0.0054/GB ਪ੍ਰਤੀ ਮਹੀਨਾ।</li><li>ਅਕਸਰ ਪਹੁੰਚ ਕੀਤੇ ਗਏ ਫਾਈਲ: ਸਟੈਂਡਰਡ ਸਟੋਰੇਜ ਵਿੱਚ $0.03128/GB ਪ੍ਰਤੀ ਮਹੀਨਾ ਲਈ ਰੱਖੇ ਜਾਂਦੇ ਹਨ।</li></ul><p>ਕਿਰਪਾ ਕਰਕੇ ਨੋਟ ਕਰੋ ਕਿ ਡੇਟਾ ਨਿਕਾਸ (ਕਲਾਊਡ ਤੋਂ ਡੇਟਾ ਡਾਊਨਲੋਡ ਕਰਨਾ) 'ਤੇ $0.1224 ਪ੍ਰਤੀ GB ਚਾਰਜ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।</p><p>ਇਸ ਸੁਵਿਧਾਜਨਕ 100GB ਤੋਹਫ਼ੇ ਕਾਰਡ ਨਾਲ ਆਪਣੀ OfficeX ਸਟੋਰੇਜ ਸਮਰੱਥਾ ਦਾ ਵਿਸਤਾਰ ਕਰੋ, ਇਹ ਯਕੀਨੀ ਬਣਾਉਂਦੇ ਹੋਏ ਕਿ ਤੁਹਾਡੇ ਸਾਰੇ ਮਹੱਤਵਪੂਰਨ ਦਸਤਾਵੇਜ਼ ਕਲਾਊਡ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਟੋਰ ਕੀਤੇ ਗਏ ਹਨ।</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "ਸਟੋਰੇਜ ਅਤੇ ਪ੍ਰੋਸੈਸਿੰਗ ਲਈ ਪ੍ਰਤੀ ਮਹੀਨਾ, ਘੱਟੋ-ਘੱਟ $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "ਗਿਫਟਕਾਰਡ ਖਰੀਦੋ",
            vendors: [
              {
                id: "vendorA",
                name: "ਕਲਾਊਡ ਸਲਿਊਸ਼ਨ ਇੰਕ.",
                avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
                checkout_video:
                  "https://www.youtube.com/embed/ecv-19sYL3w?si=4jQ6W1YuYaK7Q4-k",
                uptime_score: 99.99,
                reviews_score: 4.8,
                community_links: [
                  {
                    label: "ਫੋਰਮ",
                    url: "#",
                  },
                  {
                    label: "ਡਿਸਕਾਰਡ",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/ਮਹੀਨਾ",
                view_page_link: "#",
                call_to_action: "ਗਿਫਟਕਾਰਡ ਖਰੀਦੋ",
                description:
                  "ਇਸ ਸੁਵਿਧਾਜਨਕ 100GB ਤੋਹਫ਼ੇ ਕਾਰਡ ਨਾਲ ਆਪਣੀ OfficeX ਸਟੋਰੇਜ ਸਮਰੱਥਾ ਦਾ ਵਿਸਤਾਰ ਕਰੋ, ਇਹ ਯਕੀਨੀ ਬਣਾਉਂਦੇ ਹੋਏ ਕਿ ਤੁਹਾਡੇ ਸਾਰੇ ਮਹੱਤਵਪੂਰਨ ਦਸਤਾਵੇਜ਼ ਕਲਾਊਡ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਟੋਰ ਕੀਤੇ ਗਏ ਹਨ।",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "ਬੇਸ ਉੱਤੇ USDC",
                    note: "ਵਿਕਰੇਤਾ ਨੂੰ ਸ਼ੁਰੂ ਕਰਨ ਲਈ (ਨੋਟ: ਅਸਲ ਜਮ੍ਹਾਂ ਪਤਾ ਅਤੇ ਵੇਰਵੇ ਇਸ ਚੈੱਕਆਉਟ ਵਿਕਲਪ ਨੂੰ ਸ਼ੁਰੂ ਕਰਨ ਤੋਂ ਬਾਅਦ ਬੈਕਐਂਡ ਦੁਆਰਾ ਪ੍ਰਦਾਨ ਕੀਤੇ ਜਾਣਗੇ)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "ਤੁਹਾਨੂੰ AWS S3 ਲਈ ਇੱਕ ਤੋਹਫ਼ਾ ਕਾਰਡ ਮਿਲੇਗਾ",
                    vendor_disclaimer:
                      "ਤੁਰੰਤ ਪਹੁੰਚ। ਤੁਹਾਡੇ ਸਟੋਰੇਜ ਗਿਫਟਕਾਰਡ ਵਿੱਚ ਇੱਕ ਕ੍ਰਿਪਟੋ ਬਕਾਇਆ ਹੋਵੇਗਾ ਜੋ ਸਟੋਰੇਜ ਅਤੇ ਬੈਂਡਵਿਡਥ ਲਈ ਭੁਗਤਾਨ ਕਰਦਾ ਹੈ। ਜਦੋਂ ਵੀ ਤੁਹਾਨੂੰ ਹੋਰ ਦੀ ਲੋੜ ਹੋਵੇ ਤਾਂ ਤੁਸੀਂ ਇਸਨੂੰ ਕਿਸੇ ਵੀ ਸਮੇਂ ਟੌਪ ਅੱਪ ਕਰ ਸਕਦੇ ਹੋ।",
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
