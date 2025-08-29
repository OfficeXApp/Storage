import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ja"]: {
    helmet: {
      chat: "チャット | OfficeX",
      purchase_history: "購入履歴",
      appstore: "アプリストア",
      folder: "フォルダ",
      file: "ファイル",
      settings: "設定",
    },
    default_disks: {
      browser_cache: {
        title: "オフライン ブラウザ キャッシュ",
        public_note:
          "オフライン アクセス用のローカル ブラウザ キャッシュ。このサイトのブラウザ履歴を消去すると、ファイルは削除されます。",
      },
      free_cloud_filesharing: {
        title: "無料クラウド ファイル共有",
        public_note:
          "無料の公開ファイル共有。ファイルは毎日 UTC の深夜 24 時間以内に期限切れになります。",
      },
      folders: {
        root: "ルート",
        throwaway: "一時",
        demo_gallery: "デモ ギャラリー",
        tutorial_videos: "チュートリアル ビデオ",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "オフライン組織",
        profile_name: "匿名",
      },
      anon_org: {
        org_name: "匿名組織",
        profile_name: "匿名",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "アプリ、エージェント、サービスを検索...",
        search_offers: "オファーを絞り込む...",
      },
      s3_offer: {
        id: "19",
        name: "一括クラウド ストレージ",
        subheading:
          "OfficeX にストレージを追加するには、100GB/月あたり 1 ドルのギフトカードを利用してください",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB ストレージ ギフトカード",
            images: [],
            description:
              "<p>Amazon Cloud で安全でスケーラブルなクラウド ストレージを利用できる 100GB ギフトカードを購入しましょう。データは AWS S3 の業界をリードする耐久性と可用性によって保護され、高い信頼性とパフォーマンスを確保します。このギフトカードは、使用量ベースの料金でストレージ アカウントに資金を追加します。</p><p>AWS S3 Intelligent-Tiering により、パフォーマンスに影響を与えることなく、データを最もコスト効率の高いストレージ層に自動的に移動するため、高速で手頃な価格のストレージを提供します。これにより、卸売価格で高い可用性が提供されます。</p><ul><li>アクセス頻度の低いファイル: 自動的にコールド ストレージに移動され、月額 1GB あたり $0.0054 という低価格になります。</li><li>アクセス頻度の高いファイル: 標準ストレージに保持され、月額 1GB あたり $0.03128 となります。</li></ul><p>データ エグレス (クラウドからデータをダウンロードすること) は、1GB あたり $0.1224 の料金がかかりますのでご注意ください。</p><p>この便利な 100GB ギフトカードで OfficeX のストレージ容量を拡張し、すべての重要なドキュメントをクラウドに安全に保存しましょう。</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "ストレージと処理の月額料金、最低 $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "ギフトカードを購入",
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
                    label: "フォーラム",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/月",
                view_page_link: "#",
                call_to_action: "ギフトカードを購入",
                description:
                  "この便利な 100GB ギフトカードで OfficeX のストレージ容量を拡張し、すべての重要なドキュメントをクラウドに安全に保存しましょう。",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base の USDC",
                    note: "ベンダーを初期化するため (注: 実際の入金アドレスと詳細は、このチェックアウト オプションを開始した後にバックエンドから提供されます)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "AWS S3 のギフトカードを受け取ります",
                    vendor_disclaimer:
                      "即時アクセス。ストレージ ギフトカードには、ストレージと帯域幅の料金を支払うための暗号通貨残高が含まれます。必要なときにいつでもチャージできます。",
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
