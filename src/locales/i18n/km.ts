import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["km"]: {
    helmet: {
      chat: "ជជែក | OfficeX",
      purchase_history: "ប្រវត្តិទិញ",
      appstore: "ហាងកម្មវិធី",
      folder: "ថតឯកសារ",
      file: "ឯកសារ",
      settings: "ការកំណត់",
    },
    default_disks: {
      browser_cache: {
        title: "ឃ្លាំងសម្ងាត់កម្មវិធីរុករកក្រៅបណ្តាញ",
        public_note:
          "ឃ្លាំងសម្ងាត់កម្មវិធីរុករកក្នុងតំបន់សម្រាប់ការចូលប្រើក្រៅបណ្តាញ។ ឯកសារនឹងត្រូវលុប ប្រសិនបើអ្នកលុបប្រវត្តិកម្មវិធីរុករកសម្រាប់គេហទំព័រនេះ។",
      },
      free_cloud_filesharing: {
        title: "ការចែករំលែកឯកសារពពកឥតគិតថ្លៃ",
        public_note:
          "ការចែករំលែកឯកសារសាធារណៈឥតគិតថ្លៃ។ ឯកសារផុតកំណត់ក្នុងរយៈពេល 24 ម៉ោង រៀងរាល់ថ្ងៃនៅពាក់កណ្តាលអធ្រាត្រ UTC។",
      },
      folders: {
        root: "ឫស",
        throwaway: "បោះចោល",
        demo_gallery: "វិចិត្រសាលសាកល្បង",
        tutorial_videos: "វីដេអូណែនាំ",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "អង្គការក្រៅបណ្តាញ",
        profile_name: "អនាមិក",
      },
      anon_org: {
        org_name: "អង្គការអនាមិក",
        profile_name: "អនាមិក",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "ស្វែងរកកម្មវិធី ភ្នាក់ងារ & សេវាកម្ម...",
        search_offers: "ត្រងការផ្តល់ជូន...",
      },
      s3_offer: {
        id: "19",
        name: "ទំហំផ្ទុកពពកច្រើន",
        subheading:
          "បន្ថែមទំហំផ្ទុកទៅ OfficeX ជាមួយប័ណ្ណអំណោយក្នុងតម្លៃ $1 ក្នុង 100GB/ខែ",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "ប័ណ្ណអំណោយទំហំផ្ទុក 100GB",
            images: [],
            description:
              "<p>ទិញប័ណ្ណអំណោយ 100GB សម្រាប់ទំហំផ្ទុកពពកដែលធានាសុវត្ថិភាព និងអាចធ្វើមាត្រដ្ឋានបាននៅលើ Amazon Cloud។ ទិន្នន័យរបស់អ្នកត្រូវបានការពារដោយភាពធន់ និងភាពអាចរកបានឈានមុខគេក្នុងឧស្សាហកម្មរបស់ AWS S3 ដែលធានានូវភាពជឿជាក់ និងដំណើរការខ្ពស់។ ប័ណ្ណអំណោយនេះបន្ថែមមូលនិធិទៅក្នុងគណនីផ្ទុករបស់អ្នកជាមួយនឹងតម្លៃផ្អែកលើការប្រើប្រាស់។</p><p>យើងផ្តល់ជូននូវទំហំផ្ទុកលឿន និងមានតម្លៃសមរម្យអរគុណដល់ AWS S3 Intelligent-Tiering ដែលផ្លាស់ទីទិន្នន័យដោយស្វ័យប្រវត្តិទៅកាន់កម្រិតផ្ទុកដែលមានប្រសិទ្ធភាពបំផុតដោយមិនប៉ះពាល់ដល់ដំណើរការ។ នេះផ្តល់នូវភាពអាចរកបានខ្ពស់ក្នុងតម្លៃលក់ដុំ។</p><ul><li>ឯកសារដែលចូលប្រើម្តងម្កាល៖ ផ្លាស់ទីដោយស្វ័យប្រវត្តិទៅទំហំផ្ទុកត្រជាក់ជាងក្នុងតម្លៃទាបបំផុតត្រឹម $0.0054/GB ក្នុងមួយខែ។</li><li>ឯកសារដែលចូលប្រើញឹកញាប់៖ ទុកនៅក្នុងទំហំផ្ទុកស្តង់ដារក្នុងតម្លៃ $0.03128/GB ក្នុងមួយខែ។</li></ul><p>សូមចំណាំថា ការចេញទិន្នន័យ (ការទាញយកទិន្នន័យពីពពក) ត្រូវបានគិតថ្លៃ $0.1224 ក្នុងមួយ GB។</p><p>ពង្រីកសមត្ថភាពផ្ទុក OfficeX របស់អ្នកជាមួយនឹងប័ណ្ណអំណោយ 100GB ដ៏ងាយស្រួលនេះ ធានាថាឯកសារសំខាន់ៗទាំងអស់របស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាពនៅក្នុងពពក។</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "ក្នុងមួយខែសម្រាប់ការផ្ទុក និងដំណើរការ, អប្បបរមា $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "ទិញប័ណ្ណអំណោយ",
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
                    label: "វេទិកា",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/ខែ",
                view_page_link: "#",
                call_to_action: "ទិញប័ណ្ណអំណោយ",
                description:
                  "ពង្រីកសមត្ថភាពផ្ទុក OfficeX របស់អ្នកជាមួយនឹងប័ណ្ណអំណោយ 100GB ដ៏ងាយស្រួលនេះ ធានាថាឯកសារសំខាន់ៗទាំងអស់របស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាពនៅក្នុងពពក។",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC នៅលើមូលដ្ឋាន",
                    note: "ដើម្បីចាប់ផ្តើមអ្នកលក់ (ចំណាំ៖ អាសយដ្ឋានដាក់ប្រាក់ និងព័ត៌មានលម្អិតជាក់ស្តែងនឹងត្រូវបានផ្តល់ដោយផ្នែកខាងក្រោយបន្ទាប់ពីការចាប់ផ្តើមជម្រើសបង់ប្រាក់នេះ)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "អ្នកនឹងទទួលបានប័ណ្ណអំណោយសម្រាប់ AWS S3",
                    vendor_disclaimer:
                      "ការចូលប្រើភ្លាមៗ។ ប័ណ្ណអំណោយផ្ទុករបស់អ្នកនឹងមានសមតុល្យគ្រីបតូដែលបង់ថ្លៃផ្ទុក និងកម្រិតបញ្ជូន។ អ្នកអាចបញ្ចូលទឹកប្រាក់បានគ្រប់ពេលដែលអ្នកត្រូវការបន្ថែមទៀត។",
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
