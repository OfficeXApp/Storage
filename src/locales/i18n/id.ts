import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["id"]: {
    helmet: {
      chat: "Obrolan | OfficeX",
      purchase_history: "Riwayat Pembelian",
      appstore: "Toko Aplikasi",
      folder: "Folder",
      file: "Berkas",
      settings: "Pengaturan",
    },
    default_disks: {
      browser_cache: {
        title: "Cache Peramban Offline",
        public_note:
          "Cache peramban lokal untuk akses offline. Berkas akan dihapus jika Anda menghapus riwayat peramban untuk situs ini.",
      },
      free_cloud_filesharing: {
        title: "Berbagi Berkas Cloud Gratis",
        public_note:
          "Berbagi berkas publik gratis. Berkas akan kedaluwarsa dalam 24 jam, setiap hari pada tengah malam UTC.",
      },
      folders: {
        root: "Root",
        throwaway: "Sekali Pakai",
        demo_gallery: "Galeri Demo",
        tutorial_videos: "Video Tutorial",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Organisasi Offline",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Organisasi Anonim",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Cari aplikasi, agen & layanan...",
        search_offers: "Saring penawaran...",
      },
      s3_offer: {
        id: "19",
        name: "Penyimpanan Cloud Massal",
        subheading:
          "Tambahkan penyimpanan ke OfficeX dengan kartu hadiah seharga $1 per 100GB/bulan",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Kartu Hadiah Penyimpanan 100GB",
            images: [],
            description:
              "<p>Beli kartu hadiah 100GB untuk penyimpanan cloud yang aman dan terukur di Amazon Cloud. Data Anda dilindungi oleh ketahanan dan ketersediaan AWS S3 yang terdepan di industri, memastikan keandalan dan kinerja yang tinggi. Kartu hadiah ini menambahkan dana ke akun penyimpanan Anda dengan harga berbasis penggunaan.</p><p>Kami menawarkan penyimpanan yang cepat dan terjangkau berkat AWS S3 Intelligent-Tiering, yang secara otomatis memindahkan data ke tingkat penyimpanan yang paling hemat biaya tanpa memengaruhi kinerja. Ini memberikan ketersediaan tinggi dengan harga grosir.</p><ul><li>Berkas yang jarang diakses: Secara otomatis dipindahkan ke penyimpanan yang lebih dingin dengan biaya serendah $0,0054/GB per bulan.</li><li>Berkas yang sering diakses: Disimpan di penyimpanan standar seharga $0,03128/GB per bulan.</li></ul><p>Harap dicatat bahwa egress data (mengunduh data dari cloud) dikenakan biaya sebesar $0,1224 per GB.</p><p>Perluas kapasitas penyimpanan OfficeX Anda dengan kartu hadiah 100GB yang nyaman ini, memastikan semua dokumen penting Anda tersimpan dengan aman di cloud.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "per bulan untuk penyimpanan dan pemrosesan, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Beli Kartu Hadiah",
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
                price_line: "$0,01/GB/bulan",
                view_page_link: "#",
                call_to_action: "Beli Kartu Hadiah",
                description:
                  "Perluas kapasitas penyimpanan OfficeX Anda dengan kartu hadiah 100GB yang nyaman ini, memastikan semua dokumen penting Anda tersimpan dengan aman di cloud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC di Base",
                    note: "Untuk menginisialisasi vendor (Catatan: Alamat deposit aktual dan detail akan disediakan oleh backend setelah memulai opsi checkout ini)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes:
                      "Anda akan menerima kartu hadiah untuk AWS S3",
                    vendor_disclaimer:
                      "Akses langsung. Kartu hadiah penyimpanan Anda akan memiliki saldo crypto yang membayar untuk penyimpanan dan bandwidth. Anda dapat menambahnya kapan pun Anda butuhkan lebih banyak.",
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
