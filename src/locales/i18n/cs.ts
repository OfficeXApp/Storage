import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["cs"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Historie nákupů",
      appstore: "App Store",
      folder: "Složka",
      file: "Soubor",
      settings: "Nastavení",
    },
    default_disks: {
      browser_cache: {
        title: "Offline mezipaměť prohlížeče",
        public_note:
          "Lokální mezipaměť prohlížeče pro offline přístup. Soubory se smažou, pokud vymažete historii prohlížeče pro tuto stránku.",
      },
      free_cloud_filesharing: {
        title: "Bezplatné sdílení souborů v cloudu",
        public_note:
          "Bezplatné veřejné sdílení souborů. Platnost souborů vyprší do 24 hodin, denně o půlnoci UTC.",
      },
      folders: {
        root: "Kořen",
        throwaway: "Odpadní",
        demo_gallery: "Demo galerie",
        tutorial_videos: "Videa s návody",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline organizace",
        profile_name: "Anonym",
      },
      anon_org: {
        org_name: "Anonymní organizace",
        profile_name: "Anonym",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Hledat aplikace, agenty a služby...",
        search_offers: "Filtrovat nabídky...",
      },
      s3_offer: {
        id: "19",
        name: "Hromadné cloudové úložiště",
        subheading:
          "Přidejte úložiště do OfficeX s dárkovými kartami za 1 $ za 100 GB/měsíc",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Dárková karta na 100 GB úložiště",
            images: [],
            description:
              "<p>Kupte si dárkovou kartu na 100 GB pro bezpečné, škálovatelné cloudové úložiště na Amazon Cloud. Vaše data jsou chráněna špičkovou odolností a dostupností AWS S3, což zajišťuje vysokou spolehlivost a výkon. Tato dárková karta přidává finanční prostředky na váš účet úložiště s cenami založenými na používání.</p><p>Nabízíme rychlé a cenově dostupné úložiště díky AWS S3 Intelligent-Tiering, který automaticky přesouvá data do nákladově nejefektivnější úrovně úložiště, aniž by to ovlivnilo výkon. To poskytuje vysokou dostupnost za velkoobchodní ceny.</p><ul><li>Soubory s nízkou frekvencí přístupu: Jsou automaticky přesunuty do chladnějšího úložiště za pouhých 0,0054 $/GB za měsíc.</li><li>Soubory s častým přístupem: Jsou ponechány ve standardním úložišti za 0,03128 $/GB za měsíc.</li></ul><p>Vezměte prosím na vědomí, že odchozí datový provoz (stahování dat z cloudu) je účtován za 0,1224 $ za GB.</p><p>Rozšiřte svou kapacitu úložiště OfficeX pomocí této pohodlné dárkové karty na 100 GB, která zajistí, že všechny vaše důležité dokumenty budou bezpečně uloženy v cloudu.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "měsíčně za úložiště a zpracování, min. 1 $",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Koupit dárkovou kartu",
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
                price_line: "0,01 $/GB/měsíc",
                view_page_link: "#",
                call_to_action: "Koupit dárkovou kartu",
                description:
                  "Rozšiřte svou kapacitu úložiště OfficeX pomocí této pohodlné dárkové karty na 100 GB, která zajistí, že všechny vaše důležité dokumenty budou bezpečně uloženy v cloudu.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC na Base",
                    note: "Pro inicializaci dodavatele (Poznámka: Skutečná adresa vkladu a podrobnosti budou poskytnuty backendem po zahájení této možnosti platby)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Obdržíte dárkovou kartu pro AWS S3",
                    vendor_disclaimer:
                      "Okamžitý přístup. Vaše dárková karta úložiště bude mít krypto zůstatek, který platí za úložiště a šířku pásma. Můžete jej dobít kdykoli, když potřebujete více.",
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
