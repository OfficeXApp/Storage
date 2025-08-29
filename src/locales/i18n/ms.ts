import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ms"]: {
    helmet: {
      chat: "Sembang | OfficeX",
      purchase_history: "Sejarah Pembelian",
      appstore: "Kedai Aplikasi",
      folder: "Folder",
      file: "Fail",
      settings: "Tetapan",
    },
    default_disks: {
      browser_cache: {
        title: "Cache Pelayar Luar Talian",
        public_note:
          "Cache pelayar tempatan untuk akses luar talian. Fail akan dipadamkan jika anda mengosongkan sejarah pelayar untuk tapak ini.",
      },
      free_cloud_filesharing: {
        title: "Perkongsian Fail Awan Percuma",
        public_note:
          "Perkongsian fail awam percuma. Fail luput dalam 24 jam, setiap hari pada tengah malam UTC.",
      },
      folders: {
        root: "Root",
        throwaway: "Buang",
        demo_gallery: "Galeri Demo",
        tutorial_videos: "Video Tutorial",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organisasi Luar Talian",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Organisasi Anonim",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Cari apl, ejen & perkhidmatan...",
        search_offers: "Tapis tawaran...",
      },
      s3_offer: {
        id: "19",
        name: "Storan Awan Pukal",
        subheading:
          "Tambah storan ke OfficeX dengan kad hadiah untuk $1 setiap 100GB/bulan",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Kad Hadiah Storan 100GB",
            images: [],
            description:
              "<p>Beli kad hadiah 100GB untuk storan awan yang selamat, boleh skala pada Amazon Cloud. Data anda dilindungi oleh ketahanan dan ketersediaan AWS S3 yang terkemuka dalam industri, memastikan kebolehpercayaan dan prestasi tinggi. Kad hadiah ini menambah dana ke akaun storan anda dengan harga berdasarkan penggunaan.</p><p>Kami menawarkan storan yang pantas dan berpatutan terima kasih kepada AWS S3 Intelligent-Tiering, yang secara automatik memindahkan data ke lapisan storan yang paling kos efektif tanpa menjejaskan prestasi. Ini menyediakan ketersediaan tinggi pada harga borong.</p><ul><li>Fail yang jarang diakses: Dipindahkan secara automatik ke storan yang lebih sejuk dengan harga serendah $0.0054/GB sebulan.</li><li>Fail yang sering diakses: Disimpan dalam storan standard pada $0.03128/GB sebulan.</li></ul><p>Sila ambil perhatian bahawa pengeluaran data (memuat turun data dari awan) dicaj pada $0.1224 per GB.</p><p>Kembangkan kapasiti storan OfficeX anda dengan kad hadiah 100GB yang mudah ini, memastikan semua dokumen penting anda disimpan dengan selamat di awan.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "sebulan untuk storan dan pemprosesan, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Beli Kad Hadiah",
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
                price_line: "$0.01/GB/bulan",
                view_page_link: "#",
                call_to_action: "Beli Kad Hadiah",
                description:
                  "Kembangkan kapasiti storan OfficeX anda dengan kad hadiah 100GB yang mudah ini, memastikan semua dokumen penting anda disimpan dengan selamat di awan.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC di Base",
                    note: "Untuk memulakan vendor (Nota: Alamat deposit sebenar dan butiran akan disediakan oleh bahagian belakang selepas memulakan pilihan pembayaran ini)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Anda akan menerima kad hadiah untuk AWS S3",
                    vendor_disclaimer:
                      "Akses segera. Kad hadiah storan anda akan mempunyai baki kripto yang membayar untuk storan dan lebar jalur. Anda boleh menambahnya pada bila-bila masa anda memerlukan lebih banyak.",
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
