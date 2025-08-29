import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["hi"]: {
    helmet: {
      chat: "चैट | OfficeX",
      purchase_history: "खरीद इतिहास",
      appstore: "ऐप स्टोर",
      folder: "फ़ोल्डर",
      file: "फ़ाइल",
      settings: "सेटिंग्स",
    },
    default_disks: {
      browser_cache: {
        title: "ऑफ़लाइन ब्राउज़र कैश",
        public_note:
          "ऑफ़लाइन पहुंच के लिए स्थानीय ब्राउज़र कैश। यदि आप इस साइट के लिए ब्राउज़र इतिहास साफ़ करते हैं तो फ़ाइलें हटा दी जाती हैं।",
      },
      free_cloud_filesharing: {
        title: "मुफ़्त क्लाउड फ़ाइल साझाकरण",
        public_note:
          "मुफ़्त सार्वजनिक फ़ाइल साझाकरण। फ़ाइलें 24 घंटे के भीतर, रोज़ाना यूटीसी आधी रात को समाप्त हो जाती हैं।",
      },
      folders: {
        root: "रूट",
        throwaway: "फेंकने योग्य",
        demo_gallery: "डेमो गैलरी",
        tutorial_videos: "ट्यूटोरियल वीडियो",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "ऑफ़लाइन संगठन",
        profile_name: "अनाम",
      },
      anon_org: {
        org_name: "अनाम संगठन",
        profile_name: "अनाम",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "ऐप्स, एजेंट और सेवाओं की खोज करें...",
        search_offers: "ऑफ़र फ़िल्टर करें...",
      },
      s3_offer: {
        id: "19",
        name: "थोक क्लाउड स्टोरेज",
        subheading:
          "OfficeX में $1 प्रति 100GB/माह के लिए उपहार कार्ड के साथ स्टोरेज जोड़ें",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB स्टोरेज उपहार कार्ड",
            images: [],
            description:
              "<p>Amazon Cloud पर सुरक्षित, स्केलेबल क्लाउड स्टोरेज के लिए 100GB का उपहार कार्ड खरीदें। आपका डेटा AWS S3 की उद्योग-अग्रणी स्थायित्व और उपलब्धता द्वारा संरक्षित है, जो उच्च विश्वसनीयता और प्रदर्शन सुनिश्चित करता है। यह उपहार कार्ड आपके स्टोरेज खाते में उपयोग-आधारित मूल्य निर्धारण के साथ धन जोड़ता है।</p><p>हम AWS S3 इंटेलिजेंट-टियरिंग के लिए त्वरित और किफायती स्टोरेज प्रदान करते हैं, जो प्रदर्शन को प्रभावित किए बिना डेटा को स्वचालित रूप से सबसे अधिक लागत प्रभावी स्टोरेज टियर में स्थानांतरित करता है। यह थोक मूल्य पर उच्च उपलब्धता प्रदान करता है।</p><ul><li>शायद ही कभी एक्सेस की गई फ़ाइलें: स्वचालित रूप से प्रति माह $0.0054/GB के रूप में कम के लिए ठंडे स्टोरेज में स्थानांतरित हो जाती हैं।</li><li>अक्सर एक्सेस की गई फ़ाइलें: प्रति माह $0.03128/GB के लिए मानक स्टोरेज में रखी जाती हैं।</li></ul><p>कृपया ध्यान दें कि डेटा इग्रेस (क्लाउड से डेटा डाउनलोड करना) प्रति GB $0.1224 पर चार्ज किया जाता है।</p><p>इस सुविधाजनक 100GB उपहार कार्ड के साथ अपनी OfficeX स्टोरेज क्षमता का विस्तार करें, यह सुनिश्चित करते हुए कि आपके सभी महत्वपूर्ण दस्तावेज़ क्लाउड में सुरक्षित रूप से संग्रहीत हैं।</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "प्रति माह स्टोरेज और प्रोसेसिंग के लिए, न्यूनतम $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "उपहार कार्ड खरीदें",
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
                    label: "फ़ोरम",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/माह",
                view_page_link: "#",
                call_to_action: "उपहार कार्ड खरीदें",
                description:
                  "इस सुविधाजनक 100GB उपहार कार्ड के साथ अपनी OfficeX स्टोरेज क्षमता का विस्तार करें, यह सुनिश्चित करते हुए कि आपके सभी महत्वपूर्ण दस्तावेज़ क्लाउड में सुरक्षित रूप से संग्रहीत हैं।",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base पर USDC",
                    note: "विक्रेता को आरंभ करने के लिए (नोट: इस चेकआउट विकल्प को आरंभ करने के बाद वास्तविक जमा पता और विवरण बैकएंड द्वारा प्रदान किए जाएंगे)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "आपको AWS S3 के लिए एक उपहार कार्ड प्राप्त होगा",
                    vendor_disclaimer:
                      "तुरंत पहुंच। आपके स्टोरेज उपहार कार्ड में एक क्रिप्टो बैलेंस होगा जो स्टोरेज और बैंडविड्थ के लिए भुगतान करता है। जब भी आपको अधिक आवश्यकता हो तो आप इसे टॉप अप कर सकते हैं।",
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
