import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["it"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Cronologia acquisti",
      appstore: "App Store",
      folder: "Cartella",
      file: "File",
      settings: "Impostazioni",
    },
    default_disks: {
      browser_cache: {
        title: "Cache del browser offline",
        public_note:
          "Cache del browser locale per l'accesso offline. I file vengono eliminati se si cancella la cronologia del browser per questo sito.",
      },
      free_cloud_filesharing: {
        title: "Condivisione gratuita di file cloud",
        public_note:
          "Condivisione pubblica gratuita di file. I file scadono entro 24 ore, ogni giorno a mezzanotte UTC.",
      },
      folders: {
        root: "Radice",
        throwaway: "Temporanei",
        demo_gallery: "Galleria demo",
        tutorial_videos: "Video tutorial",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organizzazione offline",
        profile_name: "Anonimo",
      },
      anon_org: {
        org_name: "Organizzazione anonima",
        profile_name: "Anonimo",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Cerca app, agenti e servizi...",
        search_offers: "Filtra offerte...",
      },
      s3_offer: {
        id: "19",
        name: "Archiviazione cloud in blocco",
        subheading:
          "Aggiungi spazio di archiviazione a OfficeX con carte regalo da $1 per 100GB/mese",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Carta regalo da 100 GB di archiviazione",
            images: [],
            description:
              "<p>Acquista una carta regalo da 100 GB per un'archiviazione cloud sicura e scalabile su Amazon Cloud. I tuoi dati sono protetti dalla durabilità e disponibilità leader del settore di AWS S3, garantendo alta affidabilità e prestazioni. Questa carta regalo aggiunge fondi al tuo account di archiviazione con prezzi basati sull'utilizzo.</p><p>Offriamo un'archiviazione veloce e conveniente grazie a AWS S3 Intelligent-Tiering, che sposta automaticamente i dati al livello di archiviazione più conveniente senza compromettere le prestazioni. Ciò offre un'alta disponibilità a prezzi all'ingrosso.</p><ul><li>File a cui si accede raramente: Vengono spostati automaticamente in un'archiviazione più fredda a un costo di soli $0,0054/GB al mese.</li><li>File a cui si accede di frequente: Vengono mantenuti nell'archiviazione standard a $0,03128/GB al mese.</li></ul><p>Si prega di notare che l'egress dei dati (il download dei dati dal cloud) viene addebitato a $0,1224 per GB.</p><p>Espandi la tua capacità di archiviazione OfficeX con questa comoda carta regalo da 100 GB, assicurandoti che tutti i tuoi documenti importanti siano archiviati in modo sicuro nel cloud.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "al mese per archiviazione e elaborazione, min. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Acquista carta regalo",
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
                price_line: "$0,01/GB/mese",
                view_page_link: "#",
                call_to_action: "Acquista carta regalo",
                description:
                  "Espandi la tua capacità di archiviazione OfficeX con questa comoda carta regalo da 100 GB, assicurandoti che tutti i tuoi documenti importanti siano archiviati in modo sicuro nel cloud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC su Base",
                    note: "Per inizializzare il fornitore (Nota: L'indirizzo di deposito effettivo e i dettagli verranno forniti dal backend dopo aver avviato questa opzione di pagamento)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Riceverai una carta regalo per AWS S3",
                    vendor_disclaimer:
                      "Accesso immediato. La tua carta regalo di archiviazione avrà un saldo crypto che paga per l'archiviazione e la larghezza di banda. Puoi ricaricarla ogni volta che ne hai bisogno.",
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
