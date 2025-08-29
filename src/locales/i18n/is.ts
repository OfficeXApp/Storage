import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["is"]: {
    helmet: {
      chat: "Spjall | OfficeX",
      purchase_history: "Innkaupasaga",
      appstore: "App Store",
      folder: "Mappa",
      file: "Skrá",
      settings: "Stillingar",
    },
    default_disks: {
      browser_cache: {
        title: "Vafra skyndiminni án nettengingar",
        public_note:
          "Staðbundið vafra skyndiminni fyrir aðgang án nettengingar. Skrám er eytt ef þú hreinsar vafra sögu fyrir þessa síðu.",
      },
      free_cloud_filesharing: {
        title: "Ókeypis skráadeiling í skýi",
        public_note:
          "Ókeypis opinbert skráadeiling. Skrár renna út innan 24 klukkustunda, daglega á miðnætti UTC.",
      },
      folders: {
        root: "Rót",
        throwaway: "Til að henda",
        demo_gallery: "Demo gallerí",
        tutorial_videos: "Kennslumyndbönd",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Ótengd stofnun",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Nafnlaus stofnun",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Leita að forritum, umboðsmönnum og þjónustum...",
        search_offers: "Sía tilboð...",
      },
      s3_offer: {
        id: "19",
        name: "Massív skýgeymsla",
        subheading:
          "Bættu við geymslu í OfficeX með gjafakortum fyrir $1 fyrir 100GB/mánuði",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB geymslugjafakort",
            images: [],
            description:
              "<p>Kaupðu 100GB gjafakort fyrir örugga, stigstærða skýgeymslu á Amazon Cloud. Gögnin þín eru vernduð af AWS S3, sem er leiðandi í iðnaði varanleika og aðgengileika, sem tryggir mikla áreiðanleika og frammistöðu. Þetta gjafakort bætir fjármagni við geymslureikninginn þinn með verðlagningu sem byggir á notkun.</p><p>Við bjóðum upp á hraða og hagkvæma geymslu þökk sé AWS S3 Intelligent-Tiering, sem sjálfkrafa færir gögn yfir á hagkvæmustu geymslustig án þess að hafa áhrif á frammistöðu. Þetta veitir mikið aðgengi á heildsöluverði.</p><ul><li>Skrár sem sjaldan er nálgast: Sjálfkrafa færðar yfir í kaldari geymslu fyrir allt að $0,0054/GB á mánuði.</li><li>Skrár sem er oft nálgast: Geymdar í venjulegri geymslu fyrir $0,03128/GB á mánuði.</li></ul><p>Vinsamlegast athugið að útgjöld gagna (niðurhal gagna úr skýinu) eru rukkuð á $0,1224 á GB.</p><p>Stækkaðu OfficeX geymslurýmið þitt með þessu handhæga 100GB gjafakorti, sem tryggir að öll mikilvægu skjöl þín séu örugglega geymd í skýinu.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "á mánuði fyrir geymslu og vinnslu, min. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Kaupa gjafakort",
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
                    label: "Spjallborð",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0,01/GB/mánuði",
                view_page_link: "#",
                call_to_action: "Kaupa gjafakort",
                description:
                  "Stækkaðu OfficeX geymslurýmið þitt með þessu handhæga 100GB gjafakorti, sem tryggir að öll mikilvægu skjöl þín séu örugglega geymd í skýinu.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC á Base",
                    note: "Til að frumstilla söluaðilann (Ath: Raunverulegt innborgunar heimilisfang og upplýsingar verða veittar af bakenda eftir að þessi úttektarvalkostur hefur verið frumstilltur)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Þú færð gjafakort fyrir AWS S3",
                    vendor_disclaimer:
                      "Strax aðgengi. Gjafakortið þitt fyrir geymslu mun hafa dulritunarjafnvægi sem greiðir fyrir geymslu og bandbreidd. Þú getur fyllt á það hvenær sem þú þarft meira.",
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
