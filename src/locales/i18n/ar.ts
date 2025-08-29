import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ar"]: {
    helmet: {
      chat: "دردشة | OfficeX",
      purchase_history: "سجل المشتريات",
      appstore: "متجر التطبيقات",
      folder: "مجلد",
      file: "ملف",
      settings: "الإعدادات",
    },
    default_disks: {
      browser_cache: {
        title: "ذاكرة التخزين المؤقت للمتصفح دون اتصال",
        public_note:
          "ذاكرة التخزين المؤقت للمتصفح المحلي للوصول دون اتصال. يتم حذف الملفات إذا قمت بمسح سجل المتصفح لهذا الموقع.",
      },
      free_cloud_filesharing: {
        title: "مشاركة مجانية للملفات عبر السحابة",
        public_note:
          "مشاركة عامة مجانية للملفات. تنتهي صلاحية الملفات في غضون 24 ساعة، في منتصف الليل بالتوقيت العالمي المنسق (UTC) يوميًا.",
      },
      folders: {
        root: "الجذر",
        throwaway: "مؤقت",
        demo_gallery: "معرض تجريبي",
        tutorial_videos: "مقاطع الفيديو التعليمية",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "منظمة دون اتصال",
        profile_name: "مجهول",
      },
      anon_org: {
        org_name: "منظمة مجهولة",
        profile_name: "مجهول",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "البحث عن التطبيقات والوكلاء والخدمات...",
        search_offers: "تصفية العروض...",
      },
      s3_offer: {
        id: "19",
        name: "تخزين سحابي بالجملة",
        subheading:
          "أضف مساحة تخزين إلى OfficeX باستخدام بطاقات الهدايا بقيمة 1 دولار لكل 100 جيجابايت/شهر",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "بطاقة هدية تخزين 100 جيجابايت",
            images: [],
            description:
              "<p>اشترِ بطاقة هدية 100 جيجابايت لتخزين سحابي آمن وقابل للتوسع على سحابة أمازون. يتم حماية بياناتك بفضل المتانة والتوافر الرائدين في الصناعة لـ AWS S3، مما يضمن موثوقية وأداءً عاليين. تضيف بطاقة الهدايا هذه أموالًا إلى حساب التخزين الخاص بك مع تسعير قائم على الاستخدام.</p><p>نحن نقدم تخزينًا سريعًا وبأسعار معقولة بفضل AWS S3 Intelligent-Tiering، الذي ينقل البيانات تلقائيًا إلى طبقة التخزين الأكثر فعالية من حيث التكلفة دون التأثير على الأداء. وهذا يوفر توافرًا عاليًا بأسعار الجملة.</p><ul><li>الملفات التي يتم الوصول إليها بشكل غير متكرر: يتم نقلها تلقائيًا إلى التخزين البارد مقابل 0.0054 دولارًا أمريكيًا/جيجابايت شهريًا.</li><li>الملفات التي يتم الوصول إليها بشكل متكرر: يتم الاحتفاظ بها في التخزين القياسي مقابل 0.03128 دولارًا أمريكيًا/جيجابايت شهريًا.</li></ul><p>يرجى ملاحظة أن استخراج البيانات (تنزيل البيانات من السحابة) يتم تحميله بمبلغ 0.1224 دولارًا أمريكيًا لكل جيجابايت.</p><p>قم بتوسيع سعة تخزين OfficeX الخاصة بك باستخدام بطاقة الهدايا المريحة هذه بسعة 100 جيجابايت، مما يضمن تخزين جميع مستنداتك المهمة بأمان في السحابة.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "شهريًا للتخزين والمعالجة، بحد أدنى 1 دولار",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "شراء بطاقة هدية",
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
                    label: "منتدى",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/شهريًا",
                view_page_link: "#",
                call_to_action: "شراء بطاقة هدية",
                description:
                  "قم بتوسيع سعة تخزين OfficeX الخاصة بك باستخدام بطاقة الهدايا المريحة هذه بسعة 100 جيجابايت، مما يضمن تخزين جميع مستنداتك المهمة بأمان في السحابة.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC على Base",
                    note: "لتهيئة البائع (ملاحظة: سيتم توفير عنوان الإيداع الفعلي والتفاصيل بواسطة الواجهة الخلفية بعد بدء خيار الدفع هذا)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "ستتلقى بطاقة هدية لـ AWS S3",
                    vendor_disclaimer:
                      "وصول فوري. سيكون لدى بطاقة هدية التخزين الخاصة بك رصيد عملة مشفرة يدفع مقابل التخزين وعرض النطاق الترددي. يمكنك إعادة شحنها في أي وقت تحتاج فيه إلى المزيد.",
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
