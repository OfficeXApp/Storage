import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["fi"]: {
    helmet: {
      chat: "Chatti | OfficeX",
      purchase_history: "Ostoshistoria",
      appstore: "App Store",
      folder: "Kansio",
      file: "Tiedosto",
      settings: "Asetukset",
    },
    default_disks: {
      browser_cache: {
        title: "Offline-selainvälimuisti",
        public_note:
          "Paikallinen selainvälimuisti offline-käyttöä varten. Tiedostot poistetaan, jos tyhjennät tämän sivuston selainhistorian.",
      },
      free_cloud_filesharing: {
        title: "Ilmainen pilvitiedostojen jakaminen",
        public_note:
          "Ilmainen julkinen tiedostojen jakaminen. Tiedostot vanhenevat 24 tunnin sisällä, päivittäin keskiyöllä UTC.",
      },
      folders: {
        root: "Juuri",
        throwaway: "Kertakäyttöinen",
        demo_gallery: "Demo-galleria",
        tutorial_videos: "Tutorial-videot",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline-organisaatio",
        profile_name: "Anonyymi",
      },
      anon_org: {
        org_name: "Anonyymi organisaatio",
        profile_name: "Anonyymi",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Hae sovelluksia, agentteja ja palveluita...",
        search_offers: "Suodata tarjouksia...",
      },
      s3_offer: {
        id: "19",
        name: "Massiivinen pilvitallennustila",
        subheading:
          "Lisää tallennustilaa OfficeX:ään lahjakorteilla hintaan 1$ per 100GB/kuukausi",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB:n tallennuslahjakortti",
            images: [],
            description:
              "<p>Osta 100 Gt:n lahjakortti turvalliseen ja skaalautuvaan pilvitallennustilaan Amazon Cloudissa. Tietosi on suojattu AWS S3:n alan johtavalla kestävyydellä ja saatavuudella, mikä takaa korkean luotettavuuden ja suorituskyvyn. Tämä lahjakortti lisää varoja tallennustilillesi käyttöön perustuvalla hinnoittelulla.</p><p>Tarjoamme nopean ja edullisen tallennustilan AWS S3 Intelligent-Tiering -toiminnon ansiosta, joka siirtää tiedot automaattisesti kustannustehokkaimpaan tallennuskerrokseen vaikuttamatta suorituskykyyn. Tämä tarjoaa korkean saatavuuden tukkuhinnoilla.</p><ul><li>Harvoin käytetyt tiedostot: Siirretään automaattisesti kylmempään tallennustilaan vain 0,0054 $/Gt kuukaudessa.</li><li>Usein käytetyt tiedostot: Pidetään vakiotallennustilassa hintaan 0,03128 $/Gt kuukaudessa.</li></ul><p>Huomaa, että tiedonsiirrosta (tietojen lataamisesta pilvestä) veloitetaan 0,1224 $ per Gt.</p><p>Laajenna OfficeX-tallennuskapasiteettiasi tällä kätevällä 100 Gt:n lahjakortilla varmistaaksesi, että kaikki tärkeät asiakirjasi tallennetaan turvallisesti pilveen.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "kuukaudessa tallennuksesta ja käsittelystä, min. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Osta lahjakortti",
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
                    label: "Foorumi",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/kuukausi",
                view_page_link: "#",
                call_to_action: "Osta lahjakortti",
                description:
                  "Laajenna OfficeX-tallennuskapasiteettiasi tällä kätevällä 100 Gt:n lahjakortilla varmistaaksesi, että kaikki tärkeät asiakirjasi tallennetaan turvallisesti pilveen.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC Base-alustalla",
                    note: "Myyjän alustamiseksi (Huomautus: Todellinen talletusosoite ja tiedot toimitetaan taustajärjestelmästä tämän maksutapahtuman aloittamisen jälkeen)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Saat lahjakortin AWS S3:lle",
                    vendor_disclaimer:
                      "Välitön pääsy. Tallennuslahjakortillasi on kryptosaldo, jolla maksetaan tallennustilasta ja kaistanleveydestä. Voit täydentää sitä milloin tahansa, kun tarvitset lisää.",
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
