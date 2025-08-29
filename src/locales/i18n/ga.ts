import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ga"]: {
    helmet: {
      chat: "Comhrá | OfficeX",
      purchase_history: "Stair Cheannaigh",
      appstore: "Siopa App",
      folder: "Fillteán",
      file: "Comhad",
      settings: "Socruithe",
    },
    default_disks: {
      browser_cache: {
        title: "Taisce Brabhsálaí As Líne",
        public_note:
          "Taisce brabhsálaí áitiúil le haghaidh rochtain as líne. Scriosfar comhaid má ghlanann tú stair an bhrabhsálaí don suíomh seo.",
      },
      free_cloud_filesharing: {
        title: "Comhroinnt Comhad sa Scamall saor in aisce",
        public_note:
          "Comhroinnt comhad poiblí saor in aisce. Rachaidh comhaid in éag laistigh de 24 uair an chloig, gach lá ag meán oíche UTC.",
      },
      folders: {
        root: "Fréamh",
        throwaway: "Le caitheamh",
        demo_gallery: "Gailearaí Taispeána",
        tutorial_videos: "Físeáin Teagaisc",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Eagraíocht As Líne",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Eagraíocht Anaithnid",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Cuardaigh aipeanna, gníomhairí & seirbhísí...",
        search_offers: "Scag tairiscintí...",
      },
      s3_offer: {
        id: "19",
        name: "Mórstóras sa Scamall",
        subheading:
          "Cuir stóras le OfficeX le cártaí bronntanais ar $1 in aghaidh 100GB/mí",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Cárta Bronntanais Stórais 100GB",
            images: [],
            description:
              "<p>Ceannaigh cárta bronntanais 100GB le haghaidh stórais scamall slán, inscálaithe ar Amazon Cloud. Tá do shonraí cosanta ag buanseasmhacht agus infhaighteacht AWS S3, a bhfuil sé ar thús cadhnaíochta sa tionscal, ag cinntiú iontaofacht agus feidhmíocht ard. Cuireann an cárta bronntanais seo cistí le do chuntas stórais le praghsáil bunaithe ar úsáid.</p><p>Cuirimid stóras tapa agus inacmhainne ar fáil a bhuíochas le AWS S3 Intelligent-Tiering, a aistríonn sonraí go huathoibríoch chuig an leibhéal stórais is éifeachtaí ó thaobh costais gan tionchar a imirt ar fheidhmíocht. Soláthraíonn sé seo infhaighteacht ard ar phraghsanna mórdhíola.</p><ul><li>Comhaid a fhaightear rochtain orthu go hannamh: Aistrítear go huathoibríoch go stóras níos fuaire ar chomh beag le $0.0054/GB in aghaidh na míosa.</li><li>Comhaid a fhaightear rochtain orthu go minic: Coimeádtar i stóras caighdeánach ar $0.03128/GB in aghaidh na míosa.</li></ul><p>Tabhair faoi deara go ngearrtar $0.1224 in aghaidh an GB ar shonraí as-ghaiste (sonraí a íoslódáil ón scamall).</p><p>Leathnaigh do chumas stórais OfficeX leis an gcárta bronntanais áisiúil seo 100GB, ag cinntiú go bhfuil do dhoiciméid thábhachtacha go léir stóráilte go slán sa scamall.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "in aghaidh na míosa le haghaidh stórais agus próiseála, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Ceannaigh Cárta Bronntanais",
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
                    label: "Fóram",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/mí",
                view_page_link: "#",
                call_to_action: "Ceannaigh Cárta Bronntanais",
                description:
                  "Leathnaigh do chumas stórais OfficeX leis an gcárta bronntanais áisiúil seo 100GB, ag cinntiú go bhfuil do dhoiciméid thábhachtacha go léir stóráilte go slán sa scamall.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC ar Base",
                    note: "Chun an díoltóir a thosú (Nóta: Chuirfeadh an cúlán-chríoch an seoladh taisce agus na sonraí iarbhír ar fáil tar éis an rogha seiceáil amach seo a thosú)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "Gheobhaidh tú cárta bronntanais le haghaidh AWS S3",
                    vendor_disclaimer:
                      "Rochtain láithreach. Beidh iarmhéid cripte ar do chárta bronntanais stórais a íocann as stóras agus bandaleithead. Is féidir leat é a bhreisiú aon uair a theastaíonn níos mó uait.",
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
