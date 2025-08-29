import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  "zh-Hans-CN": {
    helmet: {
      chat: "聊天 | OfficeX",
      purchase_history: "购买历史",
      appstore: "应用商店",
      folder: "文件夹",
      file: "文件",
      settings: "设置",
    },
    default_disks: {
      browser_cache: {
        title: "离线浏览器缓存",
        public_note:
          "用于离线访问的本地浏览器缓存。如果您清除本网站的浏览器历史记录，文件将被删除。",
      },
      free_cloud_filesharing: {
        title: "免费云文件共享",
        public_note: "免费公共文件共享。文件在每天UTC午夜24小时内到期。",
      },
      folders: {
        root: "根目录",
        throwaway: "临时",
        demo_gallery: "演示图库",
        tutorial_videos: "教程视频",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "离线组织",
        profile_name: "匿名",
      },
      anon_org: {
        org_name: "匿名组织",
        profile_name: "匿名",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "搜索应用、代理和服务...",
        search_offers: "筛选优惠...",
      },
      s3_offer: {
        id: "19",
        name: "批量云存储",
        subheading: "使用礼品卡向 OfficeX 添加存储，每100GB/月只需1美元",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB存储礼品卡",
            images: [],
            description:
              "<p>购买100GB礼品卡，用于在亚马逊云上进行安全、可扩展的云存储。您的数据受到AWS S3行业领先的耐用性和可用性的保护，确保高可靠性和性能。此礼品卡以按使用量定价的方式为您的存储账户充值。</p><p>我们提供快速且经济实惠的存储，这得益于AWS S3 Intelligent-Tiering，它会自动将数据移动到最具成本效益的存储层，而不会影响性能。这以批发价格提供了高可用性。</p><ul><li>不常访问的文件：自动移动到更冷的存储，每月低至$0.0054/GB。</li><li>常访问的文件：保留在标准存储中，每月$0.03128/GB。</li></ul><p>请注意，数据流出（从云端下载数据）收费为每GB$0.1224。</p><p>使用这张方便的100GB礼品卡扩展您的OfficeX存储容量，确保您所有重要的文档都安全地存储在云端。</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "每月存储和处理费用，最低$1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "购买礼品卡",
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
                    label: "论坛",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/月",
                view_page_link: "#",
                call_to_action: "购买礼品卡",
                description:
                  "使用这张方便的100GB礼品卡扩展您的OfficeX存储容量，确保您所有重要的文档都安全地存储在云端。",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base 上的 USDC",
                    note: "用于初始化供应商（注意：实际的存款地址和详细信息将在发起此结账选项后由后端提供）",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "您将收到一张AWS S3的礼品卡",
                    vendor_disclaimer:
                      "立即访问。您的存储礼品卡将拥有一个加密余额，用于支付存储和带宽费用。您可以随时需要时进行充值。",
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
