import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["sl"]: {
    helmet: {
      chat: "Klepet | OfficeX",
      purchase_history: "Zgodovina nakupov",
      appstore: "Trgovina z aplikacijami",
      folder: "Mapa",
      file: "Datoteka",
      settings: "Nastavitve",
    },
    default_disks: {
      browser_cache: {
        title: "Predpomnilnik brskalnika brez povezave",
        public_note:
          "Lokalni predpomnilnik brskalnika za dostop brez povezave. Datoteke se izbrišejo, če izbrišete zgodovino brskalnika za to spletno mesto.",
      },
      free_cloud_filesharing: {
        title: "Brezplačno deljenje datotek v oblaku",
        public_note:
          "Brezplačno javno deljenje datotek. Datoteke potečejo v 24 urah, vsak dan ob polnoči po UTC.",
      },
      folders: {
        root: "Koren",
        throwaway: "Za odmet",
        demo_gallery: "Demo galerija",
        tutorial_videos: "Video posnetki z navodili",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organizacija brez povezave",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonimna organizacija",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Iskanje aplikacij, agentov in storitev...",
        search_offers: "Filtriraj ponudbe...",
      },
      s3_offer: {
        id: "19",
        name: "Množična shramba v oblaku",
        subheading:
          "Dodajte shrambo v OfficeX z darilnimi karticami za 1 USD za 100 GB/mesec",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Darilna kartica za 100 GB shrambe",
            images: [],
            description:
              "<p>Kupite darilno kartico za 100 GB za varno, prilagodljivo shrambo v oblaku na Amazon Cloud. Vaši podatki so zaščiteni z vodilno vzdržljivostjo in razpoložljivostjo AWS S3, kar zagotavlja visoko zanesljivost in zmogljivost. Ta darilna kartica doda sredstva v vaš račun za shrambo s cenami, ki temeljijo na porabi.</p><p>Ponujamo hitro in cenovno dostopno shrambo zahvaljujoč AWS S3 Intelligent-Tiering, ki samodejno premika podatke na stroškovno najučinkovitejšo stopnjo shrambe brez vpliva na zmogljivost. To zagotavlja visoko razpoložljivost po veleprodajnih cenah.</p><ul><li>Redko dostopne datoteke: Samodejno se premaknejo v hladnejšo shrambo za 0,0054 USD/GB na mesec.</li><li>Pogosto dostopne datoteke: Ohranjene v standardni shrambi za 0,03128 USD/GB na mesec.</li></ul><p>Upoštevajte, da se izstop podatkov (prenos podatkov iz oblaka) zaračuna 0,1224 USD na GB.</p><p>Razširite svojo kapaciteto shrambe OfficeX s to priročno darilno kartico za 100 GB, ki zagotavlja, da so vsi vaši pomembni dokumenti varno shranjeni v oblaku.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "na mesec za shrambo in obdelavo, min. 1 USD",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Kupite darilno kartico",
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
                price_line: "0,01 USD/GB/mesec",
                view_page_link: "#",
                call_to_action: "Kupite darilno kartico",
                description:
                  "Razširite svojo kapaciteto shrambe OfficeX s to priročno darilno kartico za 100 GB, ki zagotavlja, da so vsi vaši pomembni dokumenti varno shranjeni v oblaku.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC na Base",
                    note: "Za inicializacijo dobavitelja (Opomba: Dejanski naslov depozita in podrobnosti bo zagotovil zaledni sistem po inicializaciji te možnosti plačila)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Prejeli boste darilno kartico za AWS S3",
                    vendor_disclaimer:
                      "Takojšen dostop. Vaša darilna kartica za shrambo bo imela kripto saldo, ki plača shrambo in pasovno širino. Lahko jo dopolnite kadar koli, ko potrebujete več.",
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
