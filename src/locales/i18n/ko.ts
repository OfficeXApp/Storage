import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ko"]: {
    helmet: {
      chat: "채팅 | OfficeX",
      purchase_history: "구매 내역",
      appstore: "앱 스토어",
      folder: "폴더",
      file: "파일",
      settings: "설정",
    },
    default_disks: {
      browser_cache: {
        title: "오프라인 브라우저 캐시",
        public_note:
          "오프라인 액세스를 위한 로컬 브라우저 캐시입니다. 이 사이트의 브라우저 기록을 지우면 파일이 삭제됩니다.",
      },
      free_cloud_filesharing: {
        title: "무료 클라우드 파일 공유",
        public_note:
          "무료 공개 파일 공유. 파일은 매일 UTC 자정 24시간 이내에 만료됩니다.",
      },
      folders: {
        root: "루트",
        throwaway: "임시",
        demo_gallery: "데모 갤러리",
        tutorial_videos: "튜토리얼 동영상",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "오프라인 조직",
        profile_name: "익명",
      },
      anon_org: {
        org_name: "익명 조직",
        profile_name: "익명",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "앱, 에이전트 및 서비스 검색...",
        search_offers: "제안 필터링...",
      },
      s3_offer: {
        id: "19",
        name: "대량 클라우드 스토리지",
        subheading:
          "100GB/월당 1달러의 기프트카드로 OfficeX에 스토리지를 추가하세요",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB 스토리지 기프트카드",
            images: [],
            description:
              "<p>안전하고 확장 가능한 클라우드 스토리지를 위해 아마존 클라우드에서 100GB 기프트카드를 구매하세요. 귀하의 데이터는 AWS S3의 업계 최고 수준의 내구성 및 가용성으로 보호되어 높은 신뢰성과 성능을 보장합니다. 이 기프트카드는 사용량 기반 가격으로 스토리지 계정에 자금을 추가합니다.</p><p>AWS S3 Intelligent-Tiering 덕분에 성능에 영향을 주지 않고 데이터를 가장 비용 효율적인 스토리지 계층으로 자동 이동하여 빠르고 저렴한 스토리지를 제공합니다. 이를 통해 도매 가격으로 높은 가용성을 제공합니다.</p><ul><li>자주 액세스하지 않는 파일: 월 $0.0054/GB의 낮은 가격으로 콜드 스토리지로 자동 이동됩니다.</li><li>자주 액세스하는 파일: 월 $0.03128/GB의 표준 스토리지에 보관됩니다.</li></ul><p>클라우드에서 데이터를 다운로드하는 데이터 송신은 GB당 $0.1224가 청구됩니다.</p><p>이 편리한 100GB 기프트카드로 OfficeX 스토리지 용량을 확장하고 모든 중요한 문서를 클라우드에 안전하게 저장하세요.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "스토리지 및 처리를 위한 월별, 최소 $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "기프트카드 구매",
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
                    label: "포럼",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/월",
                view_page_link: "#",
                call_to_action: "기프트카드 구매",
                description:
                  "이 편리한 100GB 기프트카드로 OfficeX 스토리지 용량을 확장하고 모든 중요한 문서를 클라우드에 안전하게 저장하세요.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base의 USDC",
                    note: "공급업체를 초기화하기 위함 (참고: 실제 입금 주소 및 세부 정보는 이 결제 옵션을 시작한 후 백엔드에서 제공됩니다)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "AWS S3용 기프트카드를 받게 됩니다",
                    vendor_disclaimer:
                      "즉시 액세스. 스토리지 기프트카드에는 스토리지 및 대역폭 비용을 지불하는 암호화폐 잔액이 포함됩니다. 더 필요할 때마다 언제든지 충전할 수 있습니다.",
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
