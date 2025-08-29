import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["sv"]: {
    helmet: {
      chat: "Chatt | OfficeX",
      purchase_history: "Köphistorik",
      appstore: "Appbutik",
      folder: "Mapp",
      file: "Fil",
      settings: "Inställningar",
    },
    default_disks: {
      browser_cache: {
        title: "Offline webbläsarcache",
        public_note:
          "Lokal webbläsarcache för offlineåtkomst. Filer raderas om du rensar webbläsarhistoriken för denna webbplats.",
      },
      free_cloud_filesharing: {
        title: "Gratis molnfilsdelning",
        public_note:
          "Gratis offentlig filsdelning. Filer upphör att gälla inom 24 timmar, dagligen vid midnatt UTC.",
      },
      folders: {
        root: "Rot",
        throwaway: "Slängmapp",
        demo_gallery: "Demogalleri",
        tutorial_videos: "Instruktionsvideor",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline-organisation",
        profile_name: "Anonym",
      },
      anon_org: {
        org_name: "Anonym organisation",
        profile_name: "Anonym",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Sök efter appar, agenter & tjänster...",
        search_offers: "Filtrera erbjudanden...",
      },
      s3_offer: {
        id: "19",
        name: "Masslagring i molnet",
        subheading:
          "Lägg till lagring till OfficeX med presentkort för $1 per 100GB/månad",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB lagringspresentkort",
            images: [],
            description:
              "<p>Köp ett 100GB presentkort för säker, skalbar molnlagring på Amazon Cloud. Dina data skyddas av AWS S3:s branschledande hållbarhet och tillgänglighet, vilket garanterar hög tillförlitlighet och prestanda. Detta presentkort lägger till pengar på ditt lagringskonto med användningsbaserad prissättning.</p><p>Vi erbjuder snabb och prisvärd lagring tack vare AWS S3 Intelligent-Tiering, som automatiskt flyttar data till den mest kostnadseffektiva lagringsnivån utan att påverka prestandan. Detta ger hög tillgänglighet till grossistpriser.</p><ul><li>Sällan åtkomliga filer: Flyttas automatiskt till kallare lagring för så lite som $0,0054/GB per månad.</li><li>Ofta åtkomliga filer: Behålls i standardlagring för $0,03128/GB per månad.</li></ul><p>Observera att datautflöde (nedladdning av data från molnet) debiteras till $0,1224 per GB.</p><p>Utöka din OfficeX-lagringskapacitet med detta praktiska 100GB presentkort, vilket säkerställer att alla dina viktiga dokument lagras säkert i molnet.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "per månad för lagring och bearbetning, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Köp presentkort",
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
                price_line: "$0.01/GB/månad",
                view_page_link: "#",
                call_to_action: "Köp presentkort",
                description:
                  "Utöka din OfficeX-lagringskapacitet med detta praktiska 100GB presentkort, vilket säkerställer att alla dina viktiga dokument lagras säkert i molnet.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC på Base",
                    note: "För att initiera leverantören (Obs: Den faktiska insättningsadressen och detaljerna skulle tillhandahållas av backend efter att ha initierat detta betalningsalternativ)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Du kommer att få ett presentkort för AWS S3",
                    vendor_disclaimer:
                      "Omedelbar åtkomst. Ditt lagringspresentkort kommer att ha ett kryptosaldo som betalar för lagring och bandbredd. Du kan fylla på det när du behöver mer.",
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
