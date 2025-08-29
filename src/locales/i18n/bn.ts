import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["bn"]: {
    helmet: {
      chat: "চ্যাট | OfficeX",
      purchase_history: "ক্রয়ের ইতিহাস",
      appstore: "অ্যাপ স্টোর",
      folder: "ফোল্ডার",
      file: "ফাইল",
      settings: "সেটিংস",
    },
    default_disks: {
      browser_cache: {
        title: "অফলাইন ব্রাউজার ক্যাশে",
        public_note:
          "অফলাইন অ্যাক্সেসের জন্য স্থানীয় ব্রাউজার ক্যাশে। এই সাইটের জন্য ব্রাউজার ইতিহাস পরিষ্কার করলে ফাইলগুলি মুছে যায়।",
      },
      free_cloud_filesharing: {
        title: "বিনামূল্যে ক্লাউড ফাইল শেয়ারিং",
        public_note:
          "বিনামূল্যে পাবলিক ফাইল শেয়ারিং। ফাইলগুলি প্রতিদিন UTC মধ্যরাতে 24 ঘন্টার মধ্যে মেয়াদ উত্তীর্ণ হয়।",
      },
      folders: {
        root: "রুট",
        throwaway: "ফেলে দেওয়া",
        demo_gallery: "ডেমো গ্যালারি",
        tutorial_videos: "টিউটোরিয়াল ভিডিও",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "অফলাইন সংস্থা",
        profile_name: "অজ্ঞাত",
      },
      anon_org: {
        org_name: "অজ্ঞাত সংস্থা",
        profile_name: "অজ্ঞাত",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "অ্যাপস, এজেন্ট এবং পরিষেবাগুলি খুঁজুন...",
        search_offers: "অফারগুলি ফিল্টার করুন...",
      },
      s3_offer: {
        id: "19",
        name: "বাল্ক ক্লাউড স্টোরেজ",
        subheading:
          "OfficeX-এ $1 প্রতি 100GB/মাসে উপহার কার্ড সহ স্টোরেজ যোগ করুন",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB স্টোরেজ উপহার কার্ড",
            images: [],
            description:
              "<p>Amazon Cloud-এ নিরাপদ, স্কেলেবল ক্লাউড স্টোরেজের জন্য একটি 100GB উপহার কার্ড কিনুন। আপনার ডেটা AWS S3-এর শিল্প-নেতৃস্থানীয় স্থায়িত্ব এবং প্রাপ্যতা দ্বারা সুরক্ষিত, যা উচ্চ নির্ভরযোগ্যতা এবং কার্যকারিতা নিশ্চিত করে। এই উপহার কার্ডটি ব্যবহার-ভিত্তিক মূল্য নির্ধারণ সহ আপনার স্টোরেজ অ্যাকাউন্টে তহবিল যোগ করে।</p><p>আমরা AWS S3 Intelligent-Tiering-এর জন্য দ্রুত এবং সাশ্রয়ী স্টোরেজ অফার করি, যা কার্যকারিতাকে প্রভাবিত না করে স্বয়ংক্রিয়ভাবে ডেটাকে সবচেয়ে সাশ্রয়ী স্টোরেজ স্তরে সরিয়ে দেয়। এটি পাইকারি মূল্যে উচ্চ প্রাপ্যতা সরবরাহ করে।</p><ul><li>কদাচিৎ অ্যাক্সেস করা ফাইলগুলি: প্রতি মাসে $0.0054/GB-এর মতো কম দামে স্বয়ংক্রিয়ভাবে ঠান্ডা স্টোরেজে সরানো হয়।</li><li>ঘন ঘন অ্যাক্সেস করা ফাইলগুলি: প্রতি মাসে $0.03128/GB-এর জন্য স্ট্যান্ডার্ড স্টোরেজে রাখা হয়।</li></ul><p>দয়া করে মনে রাখবেন যে ডেটা ইগ্রেস (ক্লাউড থেকে ডেটা ডাউনলোড করা) প্রতি GB $0.1224 চার্জ করা হয়।</p><p>এই সুবিধাজনক 100GB উপহার কার্ড দিয়ে আপনার OfficeX স্টোরেজ ক্ষমতা বাড়ান, নিশ্চিত করে যে আপনার সমস্ত গুরুত্বপূর্ণ নথি ক্লাউডে নিরাপদে সংরক্ষণ করা হয়েছে।</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "স্টোরেজ এবং প্রক্রিয়াকরণের জন্য প্রতি মাসে, সর্বনিম্ন $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "উপহার কার্ড কিনুন",
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
                    label: "ফোরাম",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/মাস",
                view_page_link: "#",
                call_to_action: "উপহার কার্ড কিনুন",
                description:
                  "এই সুবিধাজনক 100GB উপহার কার্ড দিয়ে আপনার OfficeX স্টোরেজ ক্ষমতা বাড়ান, নিশ্চিত করে যে আপনার সমস্ত গুরুত্বপূর্ণ নথি ক্লাউডে নিরাপদে সংরক্ষণ করা হয়েছে।",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base-এ USDC",
                    note: "বিক্রেতাকে শুরু করতে (দ্রষ্টব্য: এই চেকআউট বিকল্পটি শুরু করার পরে ব্যাকএন্ড দ্বারা আসল আমানত ঠিকানা এবং বিবরণ সরবরাহ করা হবে)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "আপনি AWS S3-এর জন্য একটি উপহার কার্ড পাবেন",
                    vendor_disclaimer:
                      "তাৎক্ষণিক অ্যাক্সেস। আপনার স্টোরেজ উপহার কার্ডে একটি ক্রিপ্টো ব্যালেন্স থাকবে যা স্টোরেজ এবং ব্যান্ডউইথের জন্য অর্থ প্রদান করে। আপনার আরও প্রয়োজন হলে আপনি এটি যে কোনো সময় টপ আপ করতে পারেন।",
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
