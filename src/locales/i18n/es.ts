import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["es"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Historial de Compras",
      appstore: "Tienda de Aplicaciones",
      folder: "Carpeta",
      file: "Archivo",
      settings: "Configuración",
    },
    default_disks: {
      browser_cache: {
        title: "Caché del Navegador sin Conexión",
        public_note:
          "Caché del navegador local para acceso sin conexión. Los archivos se eliminan si borras el historial del navegador para este sitio.",
      },
      free_cloud_filesharing: {
        title: "Compartición de Archivos en la Nube Gratuita",
        public_note:
          "Compartición de archivos pública y gratuita. Los archivos caducan a las 24 horas, a la medianoche UTC todos los días.",
      },
      folders: {
        root: "Raíz",
        throwaway: "Desechable",
        demo_gallery: "Galería de Demostración",
        tutorial_videos: "Videos Tutoriales",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organización sin Conexión",
        profile_name: "Anónimo",
      },
      anon_org: {
        org_name: "Organización Anónima",
        profile_name: "Anónimo",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Buscar aplicaciones, agentes y servicios...",
        search_offers: "Filtrar ofertas...",
      },
      s3_offer: {
        id: "19",
        name: "Almacenamiento en la Nube Masivo",
        subheading:
          "Añade almacenamiento a OfficeX con tarjetas de regalo por $1 por 100GB/mes",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Tarjeta de Regalo de 100GB de Almacenamiento",
            images: [],
            description:
              "<p>Compra una tarjeta de regalo de 100GB para almacenamiento en la nube seguro y escalable en Amazon Cloud. Tus datos están protegidos por la durabilidad y disponibilidad líderes en la industria de AWS S3, lo que garantiza una alta fiabilidad y rendimiento. Esta tarjeta de regalo añade fondos a tu cuenta de almacenamiento con precios basados en el uso.</p><p>Ofrecemos almacenamiento rápido y asequible gracias a AWS S3 Intelligent-Tiering, que mueve automáticamente los datos al nivel de almacenamiento más rentable sin afectar el rendimiento. Esto proporciona alta disponibilidad a precios de mayoreo.</p><ul><li>Archivos de acceso poco frecuente: Se mueven automáticamente a almacenamiento más frío por tan solo $0.0054/GB por mes.</li><li>Archivos de acceso frecuente: Se mantienen en almacenamiento estándar por $0.03128/GB por mes.</li></ul><p>Ten en cuenta que la salida de datos (descargar datos de la nube) se cobra a $0.1224 por GB.</p><p>Amplía tu capacidad de almacenamiento en OfficeX con esta conveniente tarjeta de regalo de 100GB, asegurando que todos tus documentos importantes se almacenen de forma segura en la nube.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "por mes para almacenamiento y procesamiento, mínimo $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Comprar Tarjeta de Regalo",
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
                    label: "Foro",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/mes",
                view_page_link: "#",
                call_to_action: "Comprar Tarjeta de Regalo",
                description:
                  "Amplía tu capacidad de almacenamiento en OfficeX con esta conveniente tarjeta de regalo de 100GB, asegurando que todos tus documentos importantes se almacenen de forma segura en la nube.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC en Base",
                    note: "Para inicializar al vendedor (Nota: La dirección de depósito real y los detalles serían proporcionados por el backend después de iniciar esta opción de pago)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Recibirás una tarjeta de regalo para AWS S3",
                    vendor_disclaimer:
                      "Acceso inmediato. Tu tarjeta de regalo de almacenamiento tendrá un saldo de criptomonedas que paga por el almacenamiento y el ancho de banda. Puedes recargarla en cualquier momento que necesites más.",
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
