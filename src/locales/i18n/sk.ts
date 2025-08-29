import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["sk"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "História nákupov",
      appstore: "Obchod s aplikáciami",
      folder: "Priečinok",
      file: "Súbor",
      settings: "Nastavenia",
    },
    default_disks: {
      browser_cache: {
        title: "Offline vyrovnávacia pamäť prehliadača",
        public_note:
          "Lokálna vyrovnávacia pamäť prehliadača pre offline prístup. Súbory sa vymažú, ak vymažete históriu prehliadača pre túto stránku.",
      },
      free_cloud_filesharing: {
        title: "Bezplatné zdieľanie súborov v cloude",
        public_note:
          "Bezplatné verejné zdieľanie súborov. Súbory vypršia do 24 hodín, denne o polnoci UTC.",
      },
      folders: {
        root: "Koreň",
        throwaway: "Dočasné",
        demo_gallery: "Demo galéria",
        tutorial_videos: "Návodné videá",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline organizácia",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonymná organizácia",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Hľadať aplikácie, agentov a služby...",
        search_offers: "Filtrovať ponuky...",
      },
      s3_offer: {
        id: "19",
        name: "Hromadné cloudové úložisko",
        subheading:
          "Pridajte úložisko do OfficeX s darčekovými kartami za 1 USD na 100 GB/mesiac",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Darčeková karta na 100 GB úložiska",
            images: [],
            description:
              "<p>Kúpte si darčekovú kartu na 100 GB pre bezpečné, škálovateľné cloudové úložisko na Amazon Cloud. Vaše dáta sú chránené špičkovou odolnosťou a dostupnosťou AWS S3, čo zaisťuje vysokú spoľahlivosť a výkon. Táto darčeková karta pridáva prostriedky na váš účet úložiska s cenami na základe využitia.</p><p>Ponúkame rýchle a cenovo dostupné úložisko vďaka AWS S3 Intelligent-Tiering, ktoré automaticky presúva dáta do najefektívnejšej úrovne úložiska bez vplyvu na výkon. To poskytuje vysokú dostupnosť za veľkoobchodné ceny.</p><ul><li>Súbory s občasným prístupom: Automaticky sa presúvajú do chladnejšieho úložiska už za 0,0054 USD/GB za mesiac.</li><li>Súbory s častým prístupom: Udržiavané v štandardnom úložisku za 0,03128 USD/GB za mesiac.</li></ul><p>Upozorňujeme, že výstup dát (sťahovanie dát z cloudu) je spoplatnený 0,1224 USD za GB.</p><p>Rozšírte svoju kapacitu úložiska OfficeX s touto praktickou darčekovou kartou na 100 GB, ktorá zaisťuje, že všetky vaše dôležité dokumenty sú bezpečne uložené v cloude.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "mesačne za úložisko a spracovanie, min. 1 USD",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Kúpiť darčekovú kartu",
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
                    label: "Fórum",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "0,01 USD/GB/mesiac",
                view_page_link: "#",
                call_to_action: "Kúpiť darčekovú kartu",
                description:
                  "Rozšírte svoju kapacitu úložiska OfficeX s touto praktickou darčekovou kartou na 100 GB, ktorá zaisťuje, že všetky vaše dôležité dokumenty sú bezpečne uložené v cloude.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC na Base",
                    note: "Pre inicializáciu dodávateľa (Poznámka: Skutočná adresa vkladu a podrobnosti budú poskytnuté backendom po spustení tejto možnosti platby)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Dostanete darčekovú kartu pre AWS S3",
                    vendor_disclaimer:
                      "Okamžitý prístup. Vaša darčeková karta na úložisko bude mať krypto zostatok, ktorý platí za úložisko a šírku pásma. Môžete ju kedykoľvek dobiť, keď budete potrebovať viac.",
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
