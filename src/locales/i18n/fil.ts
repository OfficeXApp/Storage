import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["fil"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Kasaysayan ng Pagbili",
      appstore: "App Store",
      folder: "Folder",
      file: "File",
      settings: "Mga Setting",
    },
    default_disks: {
      browser_cache: {
        title: "Offline Browser Cache",
        public_note:
          "Lokal na browser cache para sa offline access. Ang mga file ay mabubura kung i-clear mo ang kasaysayan ng browser para sa site na ito.",
      },
      free_cloud_filesharing: {
        title: "Libreng Pagbabahagi ng Cloud Files",
        public_note:
          "Libreng pampublikong pagbabahagi ng file. Ang mga file ay mag-e-expire sa loob ng 24 oras, araw-araw sa hatinggabi ng UTC.",
      },
      folders: {
        root: "Root",
        throwaway: "Throwaway",
        demo_gallery: "Demo Gallery",
        tutorial_videos: "Mga Tutorial na Video",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline Org",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonymous Org",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Maghanap ng mga app, ahente at serbisyo...",
        search_offers: "I-filter ang mga alok...",
      },
      s3_offer: {
        id: "19",
        name: "Maramihang Cloud Storage",
        subheading:
          "Magdagdag ng storage sa OfficeX gamit ang mga giftcard para sa $1 bawat 100GB/buwan",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB Storage Giftcard",
            images: [],
            description:
              "<p>Bumili ng 100GB gift card para sa secure, scalable cloud storage sa Amazon Cloud. Ang iyong data ay protektado ng nangungunang durability at availability ng AWS S3, na tinitiyak ang mataas na reliability at performance. Nagdaragdag ang gift card na ito ng pondo sa iyong storage account na may pricing batay sa paggamit.</p><p>Nag-aalok kami ng mabilis at abot-kayang storage salamat sa AWS S3 Intelligent-Tiering, na awtomatikong naglilipat ng data sa pinaka-cost-effective na storage tier nang hindi nakakaapekto sa performance. Nagbibigay ito ng mataas na availability sa wholesale pricing.</p><ul><li>Mga file na bihira na-access: Awtomatikong inililipat sa colder storage para sa kasingbaba ng $0.0054/GB bawat buwan.</li><li>Mga file na madalas na-access: Pinananatili sa standard storage para sa $0.03128/GB bawat buwan.</li></ul><p>Pakitandaan na ang data egress (pag-download ng data mula sa cloud) ay sinisingil sa $0.1224 bawat GB.</p><p>Palawakin ang iyong OfficeX storage capacity gamit ang maginhawang 100GB gift card na ito, na tinitiyak na ang lahat ng iyong mahahalagang dokumento ay ligtas na nakaimbak sa cloud.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "bawat buwan para sa storage at processing, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Bumili ng Giftcard",
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
                    label: "Forum",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/buwan",
                view_page_link: "#",
                call_to_action: "Bumili ng Giftcard",
                description:
                  "Palawakin ang iyong OfficeX storage capacity gamit ang maginhawang 100GB gift card na ito, na tinitiyak na ang lahat ng iyong mahahalagang dokumento ay ligtas na nakaimbak sa cloud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC sa Base",
                    note: "Para i-initialize ang vendor (Tandaan: Ang aktwal na deposit address at mga detalye ay ibibigay ng backend pagkatapos simulan ang opsyon ng checkout na ito)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "Makakatanggap ka ng gift card para sa AWS S3",
                    vendor_disclaimer:
                      "Agad na access. Ang iyong storage gift card ay magkakaroon ng crypto balance na nagbabayad para sa storage at bandwidth. Maaari mo itong i-top up anumang oras na kailangan mo ng higit pa.",
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
