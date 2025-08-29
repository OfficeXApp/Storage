import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["lv"]: {
    helmet: {
      chat: "Tērzēšana | OfficeX",
      purchase_history: "Pirkumu vēsture",
      appstore: "Lietotņu veikals",
      folder: "Mape",
      file: "Fails",
      settings: "Iestatījumi",
    },
    default_disks: {
      browser_cache: {
        title: "Bezsaistes pārlūkprogrammas kešatmiņa",
        public_note:
          "Vietējā pārlūkprogrammas kešatmiņa bezsaistes piekļuvei. Faili tiek dzēsti, ja šai vietnei iztīrāt pārlūkprogrammas vēsturi.",
      },
      free_cloud_filesharing: {
        title: "Bezmaksas mākoņa failu koplietošana",
        public_note:
          "Bezmaksas publiska failu koplietošana. Failu derīguma termiņš beidzas 24 stundu laikā, katru dienu pusnaktī pēc UTC laika.",
      },
      folders: {
        root: "Sakne",
        throwaway: "Izmetamais",
        demo_gallery: "Demo galerija",
        tutorial_videos: "Pamācību video",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Bezsaistes organizācija",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonīma organizācija",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Meklēt lietotnes, aģentus un pakalpojumus...",
        search_offers: "Filtrēt piedāvājumus...",
      },
      s3_offer: {
        id: "19",
        name: "Lielapjoma mākoņa krātuve",
        subheading:
          "Pievienojiet OfficeX krātuvi ar dāvanu kartēm par 1 USD par 100 GB/mēnesī",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100 GB krātuves dāvanu karte",
            images: [],
            description:
              "<p>Iegādājieties 100 GB dāvanu karti drošai, mērogojamai mākoņa krātuvei Amazon Cloud. Jūsu dati ir aizsargāti ar AWS S3 nozares vadošo izturību un pieejamību, nodrošinot augstu uzticamību un veiktspēju. Šī dāvanu karte pievieno līdzekļus jūsu krātuves kontam ar cenām, kas balstītas uz lietojumu.</p><p>Mēs piedāvājam ātru un pieejamu krātuvi, pateicoties AWS S3 Intelligent-Tiering, kas automātiski pārvieto datus uz visrentablāko krātuves līmeni, neietekmējot veiktspēju. Tas nodrošina augstu pieejamību par vairumtirdzniecības cenām.</p><ul><li>Reti pieejamie faili: tiek automātiski pārvietoti uz vēsāku krātuvi par 0,0054 USD/GB mēnesī.</li><li>Bieži pieejamie faili: tiek saglabāti standarta krātuvē par 0,03128 USD/GB mēnesī.</li></ul><p>Lūdzu, ņemiet vērā, ka par datu izvadi (datu lejupielādi no mākoņa) tiek iekasēta maksa 0,1224 USD par GB.</p><p>Paplašiniet savu OfficeX krātuves ietilpību ar šo ērto 100 GB dāvanu karti, nodrošinot, ka visi jūsu svarīgie dokumenti tiek droši uzglabāti mākonī.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "par mēnesi par krātuvi un apstrādi, min. 1 USD",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Pirkt dāvanu karti",
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
                    label: "Forums",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "0,01 USD/GB/mēnesī",
                view_page_link: "#",
                call_to_action: "Pirkt dāvanu karti",
                description:
                  "Paplašiniet savu OfficeX krātuves ietilpību ar šo ērto 100 GB dāvanu karti, nodrošinot, ka visi jūsu svarīgie dokumenti tiek droši uzglabāti mākonī.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC on Base",
                    note: "Lai inicializētu piegādātāju (Piezīme: faktiskā depozīta adrese un detaļas tiks nodrošinātas no aizmugures, pēc šīs izrakstīšanās opcijas iniciēšanas)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Jūs saņemsiet dāvanu karti AWS S3",
                    vendor_disclaimer:
                      "Tūlītēja piekļuve. Jūsu krātuves dāvanu kartei būs kripto atlikums, kas maksā par krātuvi un joslas platumu. Jūs varat to papildināt, kad vien jums ir nepieciešams vairāk.",
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
