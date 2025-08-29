import { CartCheckoutPatternEnum } from "@officexapp/types";
import { fromLocale } from "..";

const LOCALE = {
  ["en"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Purchase History",
      appstore: "App Store",
      folder: "Folder",
      file: "File",
      settings: "Settings",
    },
    default_disks: {
      browser_cache: {
        title: "Offline Browser Cache",
        public_note:
          "Local browser cache for offline access. Files get deleted if you clear browser history for this site.",
      },
      free_cloud_filesharing: {
        title: "Free Cloud Filesharing",
        public_note:
          "Free public filesharing. Files expire within 24 hours, UTC midnight daily.",
      },
      folders: {
        root: "Root",
        throwaway: "Throwaway",
        demo_gallery: "Demo Gallery",
        tutorial_videos: "Tutorial Videos",
        trash: "Trash",
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
        search_mall: "Search for apps, agents & services...",
        search_offers: "Filter offers...",
      },
      s3_offer: {
        id: "19",
        name: "Bulk Cloud Storage",
        subheading:
          "Add storage to OfficeX with giftcards for $1 per 100GB/month",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB Storage Giftcard",
            images: [],
            description:
              "<p>Purchase a 100GB gift card for secure, scalable cloud storage on Amazon Cloud. Your data is protected by AWS S3's industry-leading durability and availability, ensuring high reliability and performance. This gift card adds funds to your storage account with usage based pricing.</p><p>We offer fast and affordable storage thanks to AWS S3 Intelligent-Tiering, which automatically moves data to the most cost-effective storage tier without impacting performance. This provides high availability at wholesale pricing.</p><ul><li>Infrequently accessed files: Automatically moved to colder storage for as low as $0.0054/GB per month.</li><li>Frequently accessed files: Kept in standard storage for $0.03128/GB per month.</li></ul><p>Please note that data egress (downloading data from the cloud) is charged at $0.1224 per GB.</p><p>Expand your OfficeX storage capacity with this convenient 100GB gift card, ensuring all your important documents are safely stored in the cloud.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "per month for storage and processing, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Buy Giftcard",
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
                price_line: "$0.01/GB/month",
                view_page_link: "#",
                call_to_action: "Buy Giftcard",
                description:
                  "Expand your OfficeX storage capacity with this convenient 100GB gift card, ensuring all your important documents are safely stored in the cloud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC on Base",
                    note: "To initialize the vendor (Note: Actual deposit address and details would be provided by the backend after initiating this checkout option)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate", //"http://localhost:3001/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "You will receive a giftcard for AWS S3",
                    vendor_disclaimer:
                      "Immediate access. Your storage giftcard will have a crypto balance that pays for storage and bandwidth. You can top it up any time you need more.",
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
