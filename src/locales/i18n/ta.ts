import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ta"]: {
    helmet: {
      chat: "அரட்டை | OfficeX",
      purchase_history: "கொள்முதல் வரலாறு",
      appstore: "பயன்பாட்டு அங்காடி",
      folder: "கோப்புறை",
      file: "கோப்பு",
      settings: "அமைப்புகள்",
    },
    default_disks: {
      browser_cache: {
        title: "ஆஃப்லைன் உலாவர் தற்காலிக நினைவகம்",
        public_note:
          "ஆஃப்லைன் அணுகலுக்கான உள்ளூர் உலாவர் தற்காலிக நினைவகம். இந்த தளத்திற்கான உலாவர் வரலாற்றை நீங்கள் அழித்தால் கோப்புகள் நீக்கப்படும்.",
      },
      free_cloud_filesharing: {
        title: "இலவச கிளவுட் கோப்பு பகிர்வு",
        public_note:
          "இலவச பொது கோப்பு பகிர்வு. கோப்புகள் 24 மணி நேரத்திற்குள், தினமும் UTC நள்ளிரவில் காலாவதியாகிவிடும்.",
      },
      folders: {
        root: "ரூட்",
        throwaway: "தூக்கி எறியக்கூடியது",
        demo_gallery: "டெமோ கேலரி",
        tutorial_videos: "பயிற்சி வீடியோக்கள்",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "ஆஃப்லைன் நிறுவனம்",
        profile_name: "அனான்",
      },
      anon_org: {
        org_name: "அநாமதேய நிறுவனம்",
        profile_name: "அனான்",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "பயன்பாடுகள், முகவர்கள் & சேவைகளைத் தேடுங்கள்...",
        search_offers: "சலுகைகளை வடிகட்டுங்கள்...",
      },
      s3_offer: {
        id: "19",
        name: "மொத்த கிளவுட் சேமிப்பு",
        subheading:
          "100GB/மாதத்திற்கு $1 க்கு பரிசு அட்டைகளுடன் OfficeX இல் சேமிப்பைச் சேர்க்கவும்",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB சேமிப்பு பரிசு அட்டை",
            images: [],
            description:
              "<p>அமேசான் கிளவுடில் பாதுகாப்பான, அளவிடக்கூடிய கிளவுட் சேமிப்பிற்காக 100GB பரிசு அட்டையை வாங்கவும். உங்கள் தரவு AWS S3 இன் தொழில்துறை-முன்னணி ஆயுள் மற்றும் கிடைக்கும் தன்மையால் பாதுகாக்கப்படுகிறது, இது அதிக நம்பகத்தன்மை மற்றும் செயல்திறனை உறுதி செய்கிறது. இந்த பரிசு அட்டை உங்கள் சேமிப்பு கணக்கில் பயன்பாடு சார்ந்த விலையுடன் நிதியைச் சேர்க்கிறது.</p><p>AWS S3 இன்டெலிஜென்ட்-டைரிங் (Intelligent-Tiering) க்கு நன்றி, செயல்திறனை பாதிக்காமல் தரவை தானாகவே மிகவும் செலவு குறைந்த சேமிப்பு நிலைக்கு மாற்றும், இது விரைவான மற்றும் மலிவு விலையில் சேமிப்பை வழங்குகிறோம். இது மொத்த விலையில் அதிக கிடைக்கும் தன்மையை வழங்குகிறது.</p><ul><li>அரிதாக அணுகப்படும் கோப்புகள்: மாதத்திற்கு $0.0054/GB க்கு குறைவாக குளிர்ந்த சேமிப்புக்கு தானாகவே மாற்றப்படும்.</li><li>அடிக்கடி அணுகப்படும் கோப்புகள்: மாதத்திற்கு $0.03128/GB க்கு நிலையான சேமிப்பில் வைக்கப்படும்.</li></ul><p>கிளவுடிலிருந்து தரவை வெளியேற்றுவதற்கு (தரவைப் பதிவிறக்குதல்) ஒரு GB க்கு $0.1224 வசூலிக்கப்படும் என்பதை நினைவில் கொள்ளவும்.</p><p>இந்த வசதியான 100GB பரிசு அட்டை மூலம் உங்கள் OfficeX சேமிப்பு திறனை விரிவாக்குங்கள், உங்கள் முக்கியமான ஆவணங்கள் அனைத்தும் கிளவுடில் பாதுகாப்பாக சேமிக்கப்படுவதை உறுதி செய்யுங்கள்.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "மாதத்திற்கு சேமிப்பு மற்றும் செயலாக்கத்திற்கு, குறைந்தபட்சம் $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "பரிசு அட்டை வாங்கவும்",
            vendors: [
              {
                id: "vendorA",
                name: "கிளவுட் சொல்யூஷன்ஸ் இன்க்.",
                avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
                checkout_video:
                  "https://www.youtube.com/embed/ecv-19sYL3w?si=4jQ6W1YuYaK7Q4-k",
                uptime_score: 99.99,
                reviews_score: 4.8,
                community_links: [
                  {
                    label: "மன்றம்",
                    url: "#",
                  },
                  {
                    label: "டிஸ்கார்ட்",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/மாதம்",
                view_page_link: "#",
                call_to_action: "பரிசு அட்டை வாங்கவும்",
                description:
                  "இந்த வசதியான 100GB பரிசு அட்டை மூலம் உங்கள் OfficeX சேமிப்பு திறனை விரிவாக்குங்கள், உங்கள் முக்கியமான ஆவணங்கள் அனைத்தும் கிளவுடில் பாதுகாப்பாக சேமிக்கப்படுவதை உறுதி செய்யுங்கள்.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "பேஸ் (Base) இல் USDC",
                    note: "விற்பனையாளரைத் தொடங்க (குறிப்பு: இந்த செக் அவுட் விருப்பத்தைத் தொடங்கிய பிறகு உண்மையான வைப்பு முகவரி மற்றும் விவரங்கள் பின்தளத்தில் வழங்கப்படும்)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "நீங்கள் AWS S3 க்கான ஒரு பரிசு அட்டையைப் பெறுவீர்கள்",
                    vendor_disclaimer:
                      "உடனடி அணுகல். உங்கள் சேமிப்பு பரிசு அட்டை சேமிப்பு மற்றும் அலைவரிசைக்கு பணம் செலுத்தும் ஒரு கிரிப்டோ இருப்பைக் கொண்டிருக்கும். உங்களுக்கு மேலும் தேவைப்படும்போது நீங்கள் அதை எப்போது வேண்டுமானாலும் டாப் அப் செய்யலாம்.",
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
