import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["lt"]: {
    helmet: {
      chat: "Pokalbis | OfficeX",
      purchase_history: "Pirkimų istorija",
      appstore: "Programėlių parduotuvė",
      folder: "Aplankas",
      file: "Failas",
      settings: "Nustatymai",
    },
    default_disks: {
      browser_cache: {
        title: "Naršyklės talpykla neprisijungus",
        public_note:
          "Vietinė naršyklės talpykla, skirta prieigai neprisijungus. Failai bus ištrinti, jei išvalysite naršyklės istoriją šioje svetainėje.",
      },
      free_cloud_filesharing: {
        title: "Nemokamas failų dalijimasis debesyje",
        public_note:
          "Nemokamas viešas failų dalijimasis. Failų galiojimas baigiasi per 24 valandas, kasdien vidurnaktį UTC laiku.",
      },
      folders: {
        root: "Šaknis",
        throwaway: "Išmetimui",
        demo_gallery: "Demonstracinė galerija",
        tutorial_videos: "Mokomieji vaizdo įrašai",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organizacija neprisijungus",
        profile_name: "Anonimas",
      },
      anon_org: {
        org_name: "Anoniminė organizacija",
        profile_name: "Anonimas",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Ieškoti programėlių, agentų ir paslaugų...",
        search_offers: "Filtruoti pasiūlymus...",
      },
      s3_offer: {
        id: "19",
        name: "Masinė debesies saugykla",
        subheading:
          "Pridėkite saugyklos prie OfficeX su dovanų kortelėmis už 1 USD už 100 GB/mėn.",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100 GB saugyklos dovanų kortelė",
            images: [],
            description:
              "<p>Įsigykite 100 GB dovanų kortelę saugiai, keičiamo dydžio debesies saugyklai Amazon Cloud. Jūsų duomenys apsaugoti AWS S3 pramonėje pirmaujančiu patvarumu ir prieinamumu, užtikrinančiu aukštą patikimumą ir našumą. Ši dovanų kortelė prideda lėšų į jūsų saugyklos paskyrą, su kainodara, pagrįsta naudojimu.</p><p>Mes siūlome greitą ir prieinamą saugyklą dėka AWS S3 Intelligent-Tiering, kuri automatiškai perkelia duomenis į ekonomiškiausią saugyklos lygį, nepaveikdama našumo. Tai užtikrina aukštą prieinamumą didmeninėmis kainomis.</p><ul><li>Retai pasiekiami failai: automatiškai perkeliami į vėsesnę saugyklą, kurioje saugoma nuo 0,0054 USD/GB per mėnesį.</li><li>Dažnai pasiekiami failai: laikomi standartinėje saugykloje už 0,03128 USD/GB per mėnesį.</li></ul><p>Atkreipkite dėmesį, kad duomenų išėjimas (duomenų atsisiuntimas iš debesies) apmokestinamas 0,1224 USD už GB.</p><p>Išplėskite savo OfficeX saugyklos talpą su šia patogia 100 GB dovanų kortele, užtikrindami, kad visi jūsų svarbūs dokumentai būtų saugiai saugomi debesyje.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "už mėnesį už saugojimą ir apdorojimą, min. 1 USD",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Pirkti dovanų kortelę",
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
                    label: "Forumas",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "0,01 USD/GB/mėnesį",
                view_page_link: "#",
                call_to_action: "Pirkti dovanų kortelę",
                description:
                  "Išplėskite savo OfficeX saugyklos talpą su šia patogia 100 GB dovanų kortele, užtikrindami, kad visi jūsų svarbūs dokumentai būtų saugiai saugomi debesyje.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC ant Base",
                    note: "Norėdami inicializuoti tiekėją (Pastaba: Tikrasis indėlio adresas ir informacija bus pateikti backend po šios atsiskaitymo parinkties inicijavimo)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Gausite dovanų kortelę AWS S3",
                    vendor_disclaimer:
                      "Greitas priėjimas. Jūsų saugyklos dovanų kortelė turės kripto likutį, kuris mokės už saugojimą ir pralaidumą. Galite ją papildyti, kai tik jums prireiks daugiau.",
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
