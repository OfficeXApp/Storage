import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["zh-Hant-TW"]: {
    helmet: {
      chat: "聊天 | OfficeX",
      purchase_history: "購買歷史記錄",
      appstore: "應用程式商店",
      folder: "資料夾",
      file: "檔案",
      settings: "設定",
    },
    default_disks: {
      browser_cache: {
        title: "離線瀏覽器快取",
        public_note:
          "用於離線存取的本地瀏覽器快取。如果您清除此網站的瀏覽器歷史記錄，檔案將會被刪除。",
      },
      free_cloud_filesharing: {
        title: "免費雲端檔案分享",
        public_note: "免費公開檔案分享。檔案會在每日 UTC 午夜 24 小時內到期。",
      },
      folders: {
        root: "根目錄",
        throwaway: "臨時",
        demo_gallery: "示範圖庫",
        tutorial_videos: "教學影片",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "離線組織",
        profile_name: "匿名",
      },
      anon_org: {
        org_name: "匿名組織",
        profile_name: "匿名",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "搜尋應用程式、代理與服務...",
        search_offers: "篩選優惠...",
      },
      s3_offer: {
        id: "19",
        name: "大量雲端儲存",
        subheading: "使用禮品卡為 OfficeX 新增儲存空間，每 100GB/月只需 1 美元",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB 儲存空間禮品卡",
            images: [],
            description:
              "<p>購買一張 100GB 禮品卡，用於在亞馬遜雲上進行安全、可擴展的雲端儲存。您的資料受到 AWS S3 業界領先的耐用性和可用性保護，確保高可靠性和效能。此禮品卡會為您的儲存帳戶增加資金，並採用按使用量付費的定價模式。</p><p>我們藉由 AWS S3 Intelligent-Tiering，自動將資料移至最具成本效益的儲存層，且不影響效能，因此提供快速且經濟實惠的儲存。這以批發價提供了高可用性。</p><ul><li>不常存取的檔案：自動移至冷儲存，每月低至 $0.0054/GB。</li><li>常存取的檔案：保留在標準儲存中，每月 $0.03128/GB。</li></ul><p>請注意，資料流出（從雲端下載資料）的費用為每 GB $0.1224。</p><p>使用這張便利的 100GB 禮品卡擴展您的 OfficeX 儲存容量，確保所有重要文件都安全地儲存在雲端中。</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "每月儲存和處理費用，最低 1 美元",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "購買禮品卡",
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
                    label: "論壇",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/月",
                view_page_link: "#",
                call_to_action: "購買禮品卡",
                description:
                  "使用這張便利的 100GB 禮品卡擴展您的 OfficeX 儲存容量，確保所有重要文件都安全地儲存在雲端中。",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base 上的 USDC",
                    note: "用於初始化供應商（注意：實際的存款地址和詳細資訊將在發起此結帳選項後由後端提供）",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "您將收到一張 AWS S3 禮品卡",
                    vendor_disclaimer:
                      "立即存取。您的儲存禮品卡將擁有加密餘額，用於支付儲存和頻寬費用。您可以隨時充值以獲得更多容量。",
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
