import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["te"]: {
    helmet: {
      chat: "చాట్ | OfficeX",
      purchase_history: "కొనుగోలు చరిత్ర",
      appstore: "యాప్ స్టోర్",
      folder: "ఫోల్డర్",
      file: "ఫైల్",
      settings: "సెట్టింగ్‌లు",
    },
    default_disks: {
      browser_cache: {
        title: "ఆఫ్‌లైన్ బ్రౌజర్ కాష్",
        public_note:
          "ఆఫ్‌లైన్ యాక్సెస్ కోసం లోకల్ బ్రౌజర్ కాష్. మీరు ఈ సైట్ కోసం బ్రౌజర్ హిస్టరీని క్లియర్ చేస్తే ఫైళ్లు తొలగించబడతాయి.",
      },
      free_cloud_filesharing: {
        title: "ఉచిత క్లౌడ్ ఫైల్‌షేరింగ్",
        public_note:
          "ఉచిత పబ్లిక్ ఫైల్‌షేరింగ్. ఫైళ్లు 24 గంటలలోపు, ప్రతిరోజూ UTC అర్ధరాత్రి గడువు ముగుస్తుంది.",
      },
      folders: {
        root: "రూట్",
        throwaway: "పారేయడం",
        demo_gallery: "డెమో గ్యాలరీ",
        tutorial_videos: "ట్యుటోరియల్ వీడియోలు",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "ఆఫ్‌లైన్ సంస్థ",
        profile_name: "అనాన్",
      },
      anon_org: {
        org_name: "అనామక సంస్థ",
        profile_name: "అనాన్",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "యాప్‌లు, ఏజెంట్‌లు & సేవలను శోధించండి...",
        search_offers: "ఆఫర్‌లను ఫిల్టర్ చేయండి...",
      },
      s3_offer: {
        id: "19",
        name: "బల్క్ క్లౌడ్ నిల్వ",
        subheading:
          "100GB/నెలకి $1 కి గిఫ్ట్‌కార్డులతో OfficeXకి నిల్వను జోడించండి",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB నిల్వ గిఫ్ట్‌కార్డ్",
            images: [],
            description:
              "<p>అమెజాన్ క్లౌడ్‌లో సురక్షితమైన, స్కేలబుల్ క్లౌడ్ నిల్వ కోసం 100GB గిఫ్ట్‌కార్డ్‌ను కొనుగోలు చేయండి. మీ డేటా AWS S3 యొక్క పరిశ్రమ-ప్రముఖ మన్నిక మరియు లభ్యత ద్వారా రక్షించబడుతుంది, అధిక విశ్వసనీయత మరియు పనితీరును నిర్ధారిస్తుంది. ఈ గిఫ్ట్‌కార్డ్ వినియోగం ఆధారిత ధరతో మీ నిల్వ ఖాతాకు నిధులను జోడిస్తుంది.</p><p>మేము AWS S3 ఇంటెలిజెంట్-టియరింగ్‌కు ధన్యవాదాలు, పనితీరును ప్రభావితం చేయకుండా డేటాను స్వయంచాలకంగా అత్యంత ఖర్చు-సమర్థవంతమైన నిల్వ టైర్‌కు తరలిస్తుంది. ఇది టోకు ధరలలో అధిక లభ్యతను అందిస్తుంది.</p><ul><li>అరుదుగా యాక్సెస్ చేయబడిన ఫైళ్లు: నెలకు $0.0054/GB కి తక్కువగా చల్లని నిల్వకు స్వయంచాలకంగా తరలించబడతాయి.</li><li>తరచుగా యాక్సెస్ చేయబడిన ఫైళ్లు: నెలకు $0.03128/GB కోసం ప్రామాణిక నిల్వలో ఉంచబడతాయి.</li></ul><p>దయచేసి గమనించండి, డేటా ఎగ్రెస్‌కు (క్లౌడ్ నుండి డేటాను డౌన్‌లోడ్ చేయడం) ప్రతి GB కి $0.1224 ఛార్జ్ చేయబడుతుంది.</p><p>మీ OfficeX నిల్వ సామర్థ్యాన్ని ఈ సౌకర్యవంతమైన 100GB గిఫ్ట్‌కార్డ్‌తో విస్తరించండి, మీ ముఖ్యమైన పత్రాలు అన్నీ క్లౌడ్‌లో సురక్షితంగా నిల్వ చేయబడతాయని నిర్ధారించుకోండి.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "నిల్వ మరియు ప్రాసెసింగ్‌కు నెలకు, కనిష్టంగా $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "గిఫ్ట్‌కార్డ్ కొనండి",
            vendors: [
              {
                id: "vendorA",
                name: "క్లౌడ్ సొల్యూషన్స్ ఇంక్.",
                avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
                checkout_video:
                  "https://www.youtube.com/embed/ecv-19sYL3w?si=4jQ6W1YuYaK7Q4-k",
                uptime_score: 99.99,
                reviews_score: 4.8,
                community_links: [
                  {
                    label: "ఫోరమ్",
                    url: "#",
                  },
                  {
                    label: "డిస్కార్డ్",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/నెల",
                view_page_link: "#",
                call_to_action: "గిఫ్ట్‌కార్డ్ కొనండి",
                description:
                  "ఈ సౌకర్యవంతమైన 100GB గిఫ్ట్‌కార్డ్‌తో మీ OfficeX నిల్వ సామర్థ్యాన్ని విస్తరించండి, మీ ముఖ్యమైన పత్రాలు అన్నీ క్లౌడ్‌లో సురక్షితంగా నిల్వ చేయబడతాయని నిర్ధారించుకోండి.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "బేస్‌పై USDC",
                    note: "విక్రేతను ప్రారంభించడానికి (గమనిక: ఈ చెక్ అవుట్ ఆప్షన్‌ను ప్రారంభించిన తర్వాత అసలు డిపాజిట్ చిరునామా మరియు వివరాలు బ్యాకెండ్ ద్వారా అందించబడతాయి)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "మీరు AWS S3 కోసం ఒక గిఫ్ట్‌కార్డ్‌ను పొందుతారు",
                    vendor_disclaimer:
                      "తక్షణ యాక్సెస్. మీ నిల్వ గిఫ్ట్‌కార్డ్‌లో నిల్వ మరియు బ్యాండ్‌విడ్త్ కోసం చెల్లించే క్రిప్టో బ్యాలెన్స్ ఉంటుంది. మీకు మరింత అవసరమైనప్పుడు మీరు ఎప్పుడైనా దాన్ని టాప్ అప్ చేయవచ్చు.",
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
