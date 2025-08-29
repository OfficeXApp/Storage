import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["fa"]: {
    helmet: {
      chat: "چت | OfficeX",
      purchase_history: "تاریخچه خرید",
      appstore: "فروشگاه برنامه",
      folder: "پوشه",
      file: "فایل",
      settings: "تنظیمات",
    },
    default_disks: {
      browser_cache: {
        title: "کش مرورگر آفلاین",
        public_note:
          "کش مرورگر محلی برای دسترسی آفلاین. اگر تاریخچه مرورگر خود را برای این سایت پاک کنید، فایل‌ها حذف می‌شوند.",
      },
      free_cloud_filesharing: {
        title: "اشتراک‌گذاری رایگان فایل ابری",
        public_note:
          "اشتراک‌گذاری عمومی رایگان فایل. فایل‌ها ظرف ۲۴ ساعت، روزانه در نیمه‌شب UTC منقضی می‌شوند.",
      },
      folders: {
        root: "ریشه",
        throwaway: "موقت",
        demo_gallery: "گالری نمایشی",
        tutorial_videos: "ویدیوهای آموزشی",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "سازمان آفلاین",
        profile_name: "ناشناس",
      },
      anon_org: {
        org_name: "سازمان ناشناس",
        profile_name: "ناشناس",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "جستجوی برنامه‌ها، عامل‌ها و خدمات...",
        search_offers: "فیلتر کردن پیشنهادها...",
      },
      s3_offer: {
        id: "19",
        name: "ذخیره‌سازی ابری حجیم",
        subheading:
          "با کارت‌های هدیه به قیمت ۱ دلار برای هر ۱۰۰ گیگابایت در ماه، فضای ذخیره‌سازی را به OfficeX اضافه کنید",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "کارت هدیه ذخیره‌سازی ۱۰۰ گیگابایتی",
            images: [],
            description:
              "<p>یک کارت هدیه ۱۰۰ گیگابایتی برای ذخیره‌سازی ابری ایمن و مقیاس‌پذیر در Amazon Cloud خریداری کنید. داده‌های شما توسط دوام و در دسترس بودن پیشرو در صنعت AWS S3 محافظت می‌شوند و از قابلیت اطمینان و عملکرد بالا اطمینان حاصل می‌کنند. این کارت هدیه با قیمت‌گذاری مبتنی بر استفاده، وجوهی را به حساب ذخیره‌سازی شما اضافه می‌کند.</p><p>ما به لطف AWS S3 Intelligent-Tiering، فضای ذخیره‌سازی سریع و مقرون‌به‌صرفه ارائه می‌دهیم که به طور خودکار داده‌ها را به مقرون‌به‌صرفه‌ترین لایه ذخیره‌سازی بدون تأثیر بر عملکرد منتقل می‌کند. این امر دسترسی بالا را با قیمت عمده‌فروشی فراهم می‌کند.</p><ul><li>فایل‌های با دسترسی نادر: به طور خودکار به فضای ذخیره‌سازی سردتر با هزینه کمتر از ۰.۰۰۵۴ دلار در هر گیگابایت در ماه منتقل می‌شوند.</li><li>فایل‌های با دسترسی مکرر: در فضای ذخیره‌سازی استاندارد با قیمت ۰.۰۳۱۲۸ دلار در هر گیگابایت در ماه نگهداری می‌شوند.</li></ul><p>لطفاً توجه داشته باشید که خروج داده (دانلود داده از فضای ابری) با قیمت ۰.۱۲۲۴ دلار در هر گیگابایت شارژ می‌شود.</p><p>با این کارت هدیه راحت ۱۰۰ گیگابایتی، ظرفیت ذخیره‌سازی OfficeX خود را افزایش دهید و اطمینان حاصل کنید که تمام اسناد مهم شما به طور ایمن در فضای ابری ذخیره می‌شوند.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "ماهانه برای ذخیره‌سازی و پردازش، حداقل ۱ دلار",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "خرید کارت هدیه",
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
                    label: "انجمن",
                    url: "#",
                  },
                  {
                    label: "دیسکورد",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/ماه",
                view_page_link: "#",
                call_to_action: "خرید کارت هدیه",
                description:
                  "با این کارت هدیه راحت ۱۰۰ گیگابایتی، ظرفیت ذخیره‌سازی OfficeX خود را افزایش دهید و اطمینان حاصل کنید که تمام اسناد مهم شما به طور ایمن در فضای ابری ذخیره می‌شوند.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC در Base",
                    note: "برای راه‌اندازی فروشنده (توجه: آدرس سپرده واقعی و جزئیات پس از شروع این گزینه پرداخت توسط باطن ارائه خواهد شد)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "شما یک کارت هدیه برای AWS S3 دریافت خواهید کرد",
                    vendor_disclaimer:
                      "دسترسی فوری. کارت هدیه ذخیره‌سازی شما دارای یک موجودی رمزنگاری شده است که هزینه ذخیره‌سازی و پهنای باند را پرداخت می‌کند. هر زمان که به فضای بیشتری نیاز داشتید، می‌توانید آن را شارژ کنید.",
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
