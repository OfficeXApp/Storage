import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["de"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Kaufhistorie",
      appstore: "App Store",
      folder: "Ordner",
      file: "Datei",
      settings: "Einstellungen",
    },
    default_disks: {
      browser_cache: {
        title: "Offline-Browser-Cache",
        public_note:
          "Lokaler Browser-Cache für den Offline-Zugriff. Dateien werden gelöscht, wenn Sie den Browserverlauf für diese Website löschen.",
      },
      free_cloud_filesharing: {
        title: "Kostenlose Cloud-Dateifreigabe",
        public_note:
          "Kostenlose öffentliche Dateifreigabe. Dateien laufen innerhalb von 24 Stunden, täglich um Mitternacht UTC, ab.",
      },
      folders: {
        root: "Stammverzeichnis",
        throwaway: "Wegwerf",
        demo_gallery: "Demo-Galerie",
        tutorial_videos: "Tutorial-Videos",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline-Organisation",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonyme Organisation",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Suche nach Apps, Agenten & Diensten...",
        search_offers: "Angebote filtern...",
      },
      s3_offer: {
        id: "19",
        name: "Großspeicher Cloud-Speicher",
        subheading:
          "Fügen Sie OfficeX Speicherplatz mit Geschenkkarten für $1 pro 100GB/Monat hinzu",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB Speicher-Geschenkkarte",
            images: [],
            description:
              "<p>Kaufen Sie eine 100GB Geschenkkarte für sicheren, skalierbaren Cloud-Speicher auf Amazon Cloud. Ihre Daten sind durch die branchenführende Langlebigkeit und Verfügbarkeit von AWS S3 geschützt, was hohe Zuverlässigkeit und Leistung gewährleistet. Diese Geschenkkarte fügt Ihrem Speicherkonto Guthaben mit nutzungsbasierter Abrechnung hinzu.</p><p>Wir bieten schnellen und erschwinglichen Speicher dank AWS S3 Intelligent-Tiering, das Daten automatisch in die kostengünstigste Speicherebene verschiebt, ohne die Leistung zu beeinträchtigen. Dies bietet eine hohe Verfügbarkeit zu Großhandelspreisen.</p><ul><li>Selten aufgerufene Dateien: Werden automatisch in kälteren Speicher verschoben, für nur 0,0054 $/GB pro Monat.</li><li>Häufig aufgerufene Dateien: Werden im Standardspeicher gehalten, für 0,03128 $/GB pro Monat.</li></ul><p>Bitte beachten Sie, dass der Datenabfluss (das Herunterladen von Daten aus der Cloud) mit 0,1224 $ pro GB berechnet wird.</p><p>Erweitern Sie Ihre OfficeX-Speicherkapazität mit dieser praktischen 100GB-Geschenkkarte, um sicherzustellen, dass alle Ihre wichtigen Dokumente sicher in der Cloud gespeichert sind.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "pro Monat für Speicherung und Verarbeitung, mind. 1 $",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Geschenkkarte kaufen",
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
                price_line: "0,01 $/GB/Monat",
                view_page_link: "#",
                call_to_action: "Geschenkkarte kaufen",
                description:
                  "Erweitern Sie Ihre OfficeX-Speicherkapazität mit dieser praktischen 100GB-Geschenkkarte, um sicherzustellen, dass alle Ihre wichtigen Dokumente sicher in der Cloud gespeichert sind.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC auf Base",
                    note: "Zur Initialisierung des Anbieters (Hinweis: Die tatsächliche Einzahlungsadresse und Details werden vom Backend nach dem Start dieser Checkout-Option bereitgestellt)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Sie erhalten eine Geschenkkarte für AWS S3",
                    vendor_disclaimer:
                      "Sofortiger Zugriff. Ihre Speicher-Geschenkkarte verfügt über ein Krypto-Guthaben, das für Speicher- und Bandbreitengebühren verwendet wird. Sie können es jederzeit aufladen, wenn Sie mehr benötigen.",
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
