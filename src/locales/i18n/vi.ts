import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["vi"]: {
    helmet: {
      chat: "Trò chuyện | OfficeX",
      purchase_history: "Lịch sử mua hàng",
      appstore: "Cửa hàng ứng dụng",
      folder: "Thư mục",
      file: "Tệp tin",
      settings: "Cài đặt",
    },
    default_disks: {
      browser_cache: {
        title: "Bộ nhớ đệm trình duyệt ngoại tuyến",
        public_note:
          "Bộ nhớ đệm trình duyệt cục bộ để truy cập ngoại tuyến. Các tệp sẽ bị xóa nếu bạn xóa lịch sử trình duyệt cho trang web này.",
      },
      free_cloud_filesharing: {
        title: "Chia sẻ tệp trên đám mây miễn phí",
        public_note:
          "Chia sẻ tệp công cộng miễn phí. Các tệp sẽ hết hạn trong vòng 24 giờ, vào nửa đêm UTC hàng ngày.",
      },
      folders: {
        root: "Thư mục gốc",
        throwaway: "Thư mục dùng một lần",
        demo_gallery: "Thư viện demo",
        tutorial_videos: "Video hướng dẫn",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Tổ chức ngoại tuyến",
        profile_name: "Ẩn danh",
      },
      anon_org: {
        org_name: "Tổ chức ẩn danh",
        profile_name: "Ẩn danh",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Tìm kiếm ứng dụng, tác nhân & dịch vụ...",
        search_offers: "Lọc ưu đãi...",
      },
      s3_offer: {
        id: "19",
        name: "Lưu trữ đám mây số lượng lớn",
        subheading:
          "Thêm dung lượng lưu trữ vào OfficeX với thẻ quà tặng với giá 1$ cho 100GB/tháng",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Thẻ quà tặng 100GB lưu trữ",
            images: [],
            description:
              "<p>Mua thẻ quà tặng 100GB để lưu trữ đám mây an toàn, có thể mở rộng trên Amazon Cloud. Dữ liệu của bạn được bảo vệ bởi độ bền và tính sẵn sàng hàng đầu trong ngành của AWS S3, đảm bảo độ tin cậy và hiệu suất cao. Thẻ quà tặng này sẽ thêm tiền vào tài khoản lưu trữ của bạn với giá dựa trên mức sử dụng.</p><p>Chúng tôi cung cấp dung lượng lưu trữ nhanh chóng và giá cả phải chăng nhờ AWS S3 Intelligent-Tiering, tự động di chuyển dữ liệu đến tầng lưu trữ hiệu quả nhất về chi phí mà không ảnh hưởng đến hiệu suất. Điều này mang lại tính sẵn sàng cao với giá bán buôn.</p><ul><li>Các tệp ít được truy cập: Tự động di chuyển đến kho lưu trữ lạnh hơn với giá thấp nhất là $0,0054/GB mỗi tháng.</li><li>Các tệp được truy cập thường xuyên: Được giữ trong kho lưu trữ tiêu chuẩn với giá $0,03128/GB mỗi tháng.</li></ul><p>Xin lưu ý rằng việc truy xuất dữ liệu (tải dữ liệu từ đám mây) sẽ bị tính phí $0,1224 cho mỗi GB.</p><p>Mở rộng dung lượng lưu trữ OfficeX của bạn với thẻ quà tặng 100GB tiện lợi này, đảm bảo tất cả các tài liệu quan trọng của bạn được lưu trữ an toàn trên đám mây.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "mỗi tháng cho việc lưu trữ và xử lý, tối thiểu 1$",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Mua thẻ quà tặng",
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
                    label: "Diễn đàn",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0,01/GB/tháng",
                view_page_link: "#",
                call_to_action: "Mua thẻ quà tặng",
                description:
                  "Mở rộng dung lượng lưu trữ OfficeX của bạn với thẻ quà tặng 100GB tiện lợi này, đảm bảo tất cả các tài liệu quan trọng của bạn được lưu trữ an toàn trên đám mây.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC trên Base",
                    note: "Để khởi tạo nhà cung cấp (Lưu ý: Địa chỉ và chi tiết tiền gửi thực tế sẽ được cung cấp bởi phần phụ trợ sau khi bắt đầu tùy chọn thanh toán này)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Bạn sẽ nhận được thẻ quà tặng cho AWS S3",
                    vendor_disclaimer:
                      "Truy cập ngay lập tức. Thẻ quà tặng lưu trữ của bạn sẽ có số dư tiền điện tử để thanh toán cho dung lượng lưu trữ và băng thông. Bạn có thể nạp tiền bất cứ lúc nào bạn cần thêm.",
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
