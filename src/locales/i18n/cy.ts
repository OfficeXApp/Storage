import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["cy"]: {
    helmet: {
      chat: "Sgwrs | OfficeX",
      purchase_history: "Hanes Pryniannau",
      appstore: "Siop App",
      folder: "Ffolder",
      file: "Ffeil",
      settings: "Gosodiadau",
    },
    default_disks: {
      browser_cache: {
        title: "Cofnod Cof Brwydro Allan o'r Llinell",
        public_note:
          "Cofnod cof brwydro lleol ar gyfer mynediad all-lein. Mae ffeiliau'n cael eu dileu os ydych chi'n clirio hanes brwydro ar gyfer y safle hwn.",
      },
      free_cloud_filesharing: {
        title: "Rhannu Ffeiliau yn y Cwmwl am ddim",
        public_note:
          "Rhannu ffeiliau cyhoeddus am ddim. Mae ffeiliau'n dod i ben o fewn 24 awr, bob dydd am hanner nos UTC.",
      },
      folders: {
        root: "Gwraidd",
        throwaway: "I'w daflu",
        demo_gallery: "Oriel Demo",
        tutorial_videos: "Fideos Tiwtorial",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Sefydliad All-lein",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Sefydliad Dienw",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Chwiliwch am apps, asiantau a gwasanaethau...",
        search_offers: "Ffilterio cynigion...",
      },
      s3_offer: {
        id: "19",
        name: "Storio Cwmwl Swmp",
        subheading:
          "Ychwanegu storio i OfficeX gyda chardiau rhodd am $1 y 100GB/mis",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Cerdyn Rhodd Storio 100GB",
            images: [],
            description:
              "<p>Prynwch gerdyn rhodd 100GB ar gyfer storio cwmwl diogel, ysgaladwy ar Amazon Cloud. Mae'ch data'n cael ei ddiogelu gan ddiwydiant AWS S3 sy'n arwain diwydiant, gan sicrhau dibynadwyedd a pherfformiad uchel. Mae'r cerdyn rhodd hwn yn ychwanegu arian at eich cyfrif storio gyda phrisiau sy'n seiliedig ar ddefnydd.</p><p>Rydym yn cynnig storio cyflym a fforddiadwy diolch i AWS S3 Intelligent-Tiering, sy'n symud data yn awtomatig i'r haen storio fwyaf cost-effeithiol heb effeithio ar berfformiad. Mae hyn yn darparu argaeledd uchel ar brisiau cyfanwerthol.</p><ul><li>Ffeiliau y rhoddir mynediad anaml iddynt: Yn cael eu symud yn awtomatig i storio oerach am gyn lleied â $0.0054/GB y mis.</li><li>Ffeiliau y rhoddir mynediad mynych iddynt: Yn cael eu cadw mewn storio safonol am $0.03128/GB y mis.</li></ul><p>Sylwch fod data all-all-all-gaeledd (lawrlwytho data o'r cwmwl) yn cael ei godi ar $0.1224 y GB.</p><p>Ehangwch eich gallu storio OfficeX gyda'r cerdyn rhodd 100GB cyfleus hwn, gan sicrhau bod eich holl ddogfennau pwysig yn cael eu storio'n ddiogel yn y cwmwl.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "y mis ar gyfer storio a phrosesu, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Prynu Cerdyn Rhodd",
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
                    label: "Fforwm",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/mis",
                view_page_link: "#",
                call_to_action: "Prynu Cerdyn Rhodd",
                description:
                  "Ehangwch eich gallu storio OfficeX gyda'r cerdyn rhodd 100GB cyfleus hwn, gan sicrhau bod eich holl ddogfennau pwysig yn cael eu storio'n ddiogel yn y cwmwl.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC ar Base",
                    note: "I ddechrau'r gwerthwr (Nodyn: Bydd yr backend yn darparu'r cyfeiriad adneuo a'r manylion gwirioneddol ar ôl dechrau'r opsiwn taledig hwn)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "Byddwch yn derbyn cerdyn rhodd ar gyfer AWS S3",
                    vendor_disclaimer:
                      "Mynediad uniongyrchol. Bydd gan eich cerdyn rhodd storio falans cripto sy'n talu am storio a lled band. Gallwch ei ail-lenwi unrhyw bryd y bydd angen mwy arnoch.",
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
