import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["hr"]: {
    helmet: {
      chat: "Razgovor | OfficeX",
      purchase_history: "Povijest kupovine",
      appstore: "Trgovina aplikacija",
      folder: "Mapa",
      file: "Datoteka",
      settings: "Postavke",
    },
    default_disks: {
      browser_cache: {
        title: "Izvanmrežna predmemorija preglednika",
        public_note:
          "Lokalna predmemorija preglednika za izvanmrežni pristup. Datoteke se brišu ako obrišete povijest preglednika za ovu stranicu.",
      },
      free_cloud_filesharing: {
        title: "Besplatno dijeljenje datoteka u oblaku",
        public_note:
          "Besplatno javno dijeljenje datoteka. Datoteke istječu unutar 24 sata, svakodnevno u ponoć UTC.",
      },
      folders: {
        root: "Korijen",
        throwaway: "Za baciti",
        demo_gallery: "Demo galerija",
        tutorial_videos: "Videozapisi s uputama",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Izvanmrežna organizacija",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonimna organizacija",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Pretražite aplikacije, agente i usluge...",
        search_offers: "Filtrirajte ponude...",
      },
      s3_offer: {
        id: "19",
        name: "Skupna pohrana u oblaku",
        subheading:
          "Dodajte pohranu u OfficeX s poklon karticama za 1 USD po 100 GB/mjesec",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Poklon kartica za 100 GB pohrane",
            images: [],
            description:
              "<p>Kupite poklon karticu za 100 GB za sigurnu, skalabilnu pohranu u oblaku na Amazon Cloudu. Vaši su podaci zaštićeni vodećom u industriji izdržljivošću i dostupnošću AWS S3, što osigurava visoku pouzdanost i performanse. Ova poklon kartica dodaje sredstva na vaš račun za pohranu s cijenama temeljenim na upotrebi.</p><p>Nudimo brzu i pristupačnu pohranu zahvaljujući AWS S3 Intelligent-Tiering, koji automatski premješta podatke na najisplativiju razinu pohrane bez utjecaja na performanse. To pruža visoku dostupnost po veleprodajnim cijenama.</p><ul><li>Datoteke kojima se rijetko pristupa: Automatski se premještaju u hladniju pohranu za samo 0,0054 USD/GB mjesečno.</li><li>Datoteke kojima se često pristupa: Čuvaju se u standardnoj pohrani za 0,03128 USD/GB mjesečno.</li></ul><p>Imajte na umu da se izlaz podataka (preuzimanje podataka iz oblaka) naplaćuje 0,1224 USD po GB.</p><p>Proširite svoj OfficeX kapacitet pohrane s ovom praktičnom poklon karticom za 100 GB, osiguravajući da su svi vaši važni dokumenti sigurno pohranjeni u oblaku.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "mjesečno za pohranu i obradu, min 1 USD",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Kupi poklon karticu",
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
                price_line: "0,01 USD/GB/mjesec",
                view_page_link: "#",
                call_to_action: "Kupi poklon karticu",
                description:
                  "Proširite svoj OfficeX kapacitet pohrane s ovom praktičnom poklon karticom za 100 GB, osiguravajući da su svi vaši važni dokumenti sigurno pohranjeni u oblaku.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC na Base",
                    note: "Za inicijalizaciju dobavljača (Napomena: Stvarna adresa pologa i detalji bit će dostavljeni putem pozadinske obrade nakon pokretanja ove opcije naplate)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Primit ćete poklon karticu za AWS S3",
                    vendor_disclaimer:
                      "Trenutni pristup. Vaša poklon kartica za pohranu imat će kripto saldo koji plaća pohranu i propusnost. Možete je nadopuniti kad god vam zatreba više.",
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
