import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["pt"]: {
    helmet: {
      chat: "Bate-papo | OfficeX",
      purchase_history: "Histórico de compras",
      appstore: "Loja de aplicativos",
      folder: "Pasta",
      file: "Arquivo",
      settings: "Configurações",
    },
    default_disks: {
      browser_cache: {
        title: "Cache do navegador offline",
        public_note:
          "Cache local do navegador para acesso offline. Os arquivos são excluídos se você limpar o histórico do navegador para este site.",
      },
      free_cloud_filesharing: {
        title: "Compartilhamento de arquivos em nuvem gratuito",
        public_note:
          "Compartilhamento de arquivos públicos gratuito. Os arquivos expiram em 24 horas, diariamente à meia-noite UTC.",
      },
      folders: {
        root: "Raiz",
        throwaway: "Temporário",
        demo_gallery: "Galeria de demonstração",
        tutorial_videos: "Vídeos tutoriais",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organização offline",
        profile_name: "Anônimo",
      },
      anon_org: {
        org_name: "Organização anônima",
        profile_name: "Anônimo",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Pesquisar por aplicativos, agentes e serviços...",
        search_offers: "Filtrar ofertas...",
      },
      s3_offer: {
        id: "19",
        name: "Armazenamento em nuvem em massa",
        subheading:
          "Adicione armazenamento ao OfficeX com cartões-presente por $1 por 100GB/mês",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Cartão-presente de 100GB de armazenamento",
            images: [],
            description:
              "<p>Compre um cartão-presente de 100GB para armazenamento em nuvem seguro e escalável na Amazon Cloud. Seus dados são protegidos pela durabilidade e disponibilidade líderes do setor do AWS S3, garantindo alta confiabilidade e desempenho. Este cartão-presente adiciona fundos à sua conta de armazenamento com preços baseados no uso.</p><p>Oferecemos armazenamento rápido e acessível graças ao AWS S3 Intelligent-Tiering, que move automaticamente os dados para o nível de armazenamento mais econômico sem afetar o desempenho. Isso oferece alta disponibilidade a preços de atacado.</p><ul><li>Arquivos acessados com pouca frequência: Movidos automaticamente para armazenamento mais frio por apenas $0,0054/GB por mês.</li><li>Arquivos acessados com frequência: Mantidos no armazenamento padrão por $0,03128/GB por mês.</li></ul><p>Observe que o egresso de dados (baixar dados da nuvem) é cobrado a $0,1224 por GB.</p><p>Expanda sua capacidade de armazenamento do OfficeX com este conveniente cartão-presente de 100GB, garantindo que todos os seus documentos importantes sejam armazenados com segurança na nuvem.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "por mês para armazenamento e processamento, mínimo de $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Comprar cartão-presente",
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
                price_line: "$0.01/GB/mês",
                view_page_link: "#",
                call_to_action: "Comprar cartão-presente",
                description:
                  "Expanda sua capacidade de armazenamento do OfficeX com este conveniente cartão-presente de 100GB, garantindo que todos os seus documentos importantes sejam armazenados com segurança na nuvem.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC no Base",
                    note: "Para inicializar o fornecedor (Nota: O endereço de depósito real e os detalhes seriam fornecidos pelo back-end após iniciar esta opção de checkout)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "Você receberá um cartão-presente para AWS S3",
                    vendor_disclaimer:
                      "Acesso imediato. Seu cartão-presente de armazenamento terá um saldo em criptomoeda que paga pelo armazenamento e largura de banda. Você pode recarregá-lo a qualquer momento que precisar de mais.",
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
