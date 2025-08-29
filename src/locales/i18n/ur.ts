import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ur"]: {
    helmet: {
      chat: "چیٹ | OfficeX",
      purchase_history: "خریداری کی تاریخ",
      appstore: "ایپ اسٹور",
      folder: "فولڈر",
      file: "فائل",
      settings: "ترتیبات",
    },
    default_disks: {
      browser_cache: {
        title: "آف لائن براؤزر کیش",
        public_note:
          "آف لائن رسائی کے لیے مقامی براؤزر کیش۔ اگر آپ اس سائٹ کے لیے براؤزر کی ہسٹری صاف کرتے ہیں تو فائلیں حذف ہو جاتی ہیں۔",
      },
      free_cloud_filesharing: {
        title: "مفت کلاؤڈ فائل شیئرنگ",
        public_note:
          "مفت عوامی فائل شیئرنگ۔ فائلیں روزانہ UTC آدھی رات کو 24 گھنٹوں کے اندر میعاد ختم ہو جاتی ہیں۔",
      },
      folders: {
        root: "روٹ",
        throwaway: "عبرت",
        demo_gallery: "ڈیمو گیلری",
        tutorial_videos: "ٹیوٹوریل ویڈیوز",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "آف لائن تنظیم",
        profile_name: "گمنام",
      },
      anon_org: {
        org_name: "گمنام تنظیم",
        profile_name: "گمنام",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "ایپس، ایجنٹس اور خدمات تلاش کریں...",
        search_offers: "پیشکشیں فلٹر کریں...",
      },
      s3_offer: {
        id: "19",
        name: "بلک کلاؤڈ اسٹوریج",
        subheading:
          "OfficeX میں 100GB/ماہ کے لیے $1 میں گفٹ کارڈز کے ساتھ اسٹوریج شامل کریں",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB اسٹوریج گفٹ کارڈ",
            images: [],
            description:
              "<p>Amazon Cloud پر محفوظ، توسیع پذیر کلاؤڈ اسٹوریج کے لیے 100GB کا گفٹ کارڈ خریدیں۔ آپ کا ڈیٹا AWS S3 کی صنعت کے معروف استحکام اور دستیابی سے محفوظ ہے، جو اعلی وشوسنییتا اور کارکردگی کو یقینی بناتا ہے۔ یہ گفٹ کارڈ آپ کے اسٹوریج اکاؤنٹ میں استعمال پر مبنی قیمتوں کے ساتھ فنڈز کا اضافہ کرتا ہے۔</p><p>ہم AWS S3 Intelligent-Tiering کی بدولت تیز اور سستی اسٹوریج فراہم کرتے ہیں، جو کارکردگی کو متاثر کیے بغیر ڈیٹا کو خودکار طور پر سب سے زیادہ لاگت مؤثر اسٹوریج ٹیر میں منتقل کرتا ہے۔ یہ ہول سیل قیمت پر اعلی دستیابی فراہم کرتا ہے۔</p><ul><li>شاذ و نادر ہی رسائی کی گئی فائلیں: خودکار طور پر زیادہ ٹھنڈی اسٹوریج میں منتقل ہو جاتی ہیں جو کہ $0.0054/GB فی ماہ تک کم ہوتی ہیں۔</li><li>اکثر رسائی کی گئی فائلیں: معیاری اسٹوریج میں $0.03128/GB فی ماہ کے لیے رکھی جاتی ہیں۔</li></ul><p>براہ کرم نوٹ کریں کہ ڈیٹا ایگریس (کلاؤڈ سے ڈیٹا ڈاؤن لوڈ کرنا) فی GB $0.1224 پر چارج کیا جاتا ہے۔</p><p>اس آسان 100GB گفٹ کارڈ کے ساتھ اپنی OfficeX اسٹوریج کی گنجائش کو وسعت دیں، اس بات کو یقینی بناتے ہوئے کہ آپ کے تمام اہم دستاویزات کلاؤڈ میں محفوظ طریقے سے محفوظ ہیں۔</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "اسٹوریج اور پروسیسنگ کے لیے فی ماہ، کم از کم $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "گفٹ کارڈ خریدیں",
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
                    label: "فورم",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/ماہ",
                view_page_link: "#",
                call_to_action: "گفٹ کارڈ خریدیں",
                description:
                  "اس آسان 100GB گفٹ کارڈ کے ساتھ اپنی OfficeX اسٹوریج کی گنجائش کو وسعت دیں، اس بات کو یقینی بناتے ہوئے کہ آپ کے تمام اہم دستاویزات کلاؤڈ میں محفوظ طریقے سے محفوظ ہیں۔",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base پر USDC",
                    note: "وینڈر کو شروع کرنے کے لیے (نوٹ: اس چیک آؤٹ آپشن کو شروع کرنے کے بعد اصلی ڈپازٹ ایڈریس اور تفصیلات بیک اینڈ کے ذریعے فراہم کی جائیں گی)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "آپ کو AWS S3 کے لیے ایک گفٹ کارڈ ملے گا",
                    vendor_disclaimer:
                      "فوری رسائی۔ آپ کے اسٹوریج گفٹ کارڈ میں ایک کرپٹو بیلنس ہوگا جو اسٹوریج اور بینڈوتھ کی ادائیگی کرتا ہے۔ آپ کو مزید کی ضرورت پڑنے پر آپ اسے کسی بھی وقت ٹاپ اپ کر سکتے ہیں۔",
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
