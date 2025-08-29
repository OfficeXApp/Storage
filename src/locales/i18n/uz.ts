import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["uz"]: {
    helmet: {
      chat: "Chat | OfficeX",
      purchase_history: "Xaridlar tarixi",
      appstore: "Ilovlar do'koni",
      folder: "Papkalar",
      file: "Fayl",
      settings: "Sozlamalar",
    },
    default_disks: {
      browser_cache: {
        title: "Oflyayn brauzer kesh",
        public_note:
          "Oflyayn kirish uchun mahalliy brauzer kesh. Agar ushbu sayt uchun brauzer tarixini tozalagan bo'lsangiz, fayllar o'chiriladi.",
      },
      free_cloud_filesharing: {
        title: "Bepul bulutli fayllar almashuvi",
        public_note:
          "Bepul ommaviy fayllar almashuvi. Fayllar 24 soat ichida, har kuni UTC yarim kechasida muddati tugaydi.",
      },
      folders: {
        root: "Ildiz",
        throwaway: "Tashlab yuborish",
        demo_gallery: "Demo galereyasi",
        tutorial_videos: "O'quv videolari",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Ilovalar, agentlar va xizmatlarni qidirish...",
        search_offers: "Takliflarni filtrlash...",
      },
      s3_offer: {
        id: "19",
        name: "Ommaviy bulutli xotira",
        subheading:
          "OfficeX'ga 100GB/oy uchun $1 evaziga sovg'a kartalari bilan xotira qo'shing",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100GB xotira sovg'a kartasi",
            images: [],
            description:
              "<p>Amazon Cloud-da xavfsiz, kengaytiriladigan bulutli xotira uchun 100GB sovg'a kartasini xarid qiling. Ma'lumotlaringiz AWS S3 ning sanoatda yetakchi mustahkamligi va mavjudligi bilan himoyalangan, yuqori ishonchlilik va samaradorlikni ta'minlaydi. Ushbu sovg'a kartasi xotira hisobingizga foydalanishga asoslangan narxlar bilan mablag' qo'shadi.</p><p>Biz AWS S3 Intelligent-Tiering tufayli tez va arzon xotirani taklif etamiz, bu esa ma'lumotlarni samaradorlikka ta'sir qilmasdan avtomatik ravishda eng samarali xotira darajasiga o'tkazadi. Bu ulgurji narxlarda yuqori mavjudlikni ta'minlaydi.</p><ul><li>Kamdan-kam foydalaniladigan fayllar: Oyiga $0.0054/GB kabi past narxda avtomatik ravishda sovuqroq xotiraga o'tkaziladi.</li><li>Tez-tez foydalaniladigan fayllar: Oyiga $0.03128/GB uchun standart xotirada saqlanadi.</li></ul><p>Eslatib o'tamiz, ma'lumotlar chiqishi (bulutdan ma'lumotlarni yuklab olish) har bir GB uchun $0.1224 haqqi olinadi.</p><p>Ushbu qulay 100GB sovg'a kartasi bilan OfficeX xotira hajmini kengaytiring, bu barcha muhim hujjatlaringiz bulutda xavfsiz saqlanishini ta'minlaydi.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "xotira va qayta ishlash uchun oyiga, min $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Sovg'a kartasini sotib olish",
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
                price_line: "$0.01/GB/oy",
                view_page_link: "#",
                call_to_action: "Sovg'a kartasini sotib olish",
                description:
                  "Ushbu qulay 100GB sovg'a kartasi bilan OfficeX xotira hajmini kengaytiring, bu barcha muhim hujjatlaringiz bulutda xavfsiz saqlanishini ta'minlaydi.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "Base'da USDC",
                    note: "Sotuvchini ishga tushirish uchun (Eslatma: Haqiqiy depozit manzili va tafsilotlar ushbu to'lov opsiyasi ishga tushirilgandan so'ng backend tomonidan taqdim etiladi)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Siz AWS S3 uchun sovg'a kartasi olasiz",
                    vendor_disclaimer:
                      "Tezkor kirish. Sizning xotira sovg'a kartangizda xotira va o'tkazish qobiliyati uchun to'lovchi kripto balansi bo'ladi. Sizga ko'proq kerak bo'lganda uni istalgan vaqtda to'ldirishingiz mumkin.",
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
