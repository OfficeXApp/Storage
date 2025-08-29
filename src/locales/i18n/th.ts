import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["th"]: {
    helmet: {
      chat: "แชท | OfficeX",
      purchase_history: "ประวัติการซื้อ",
      appstore: "ร้านค้าแอป",
      folder: "โฟลเดอร์",
      file: "ไฟล์",
      settings: "การตั้งค่า",
    },
    default_disks: {
      browser_cache: {
        title: "แคชเบราว์เซอร์ออฟไลน์",
        public_note:
          "แคชเบราว์เซอร์ในเครื่องสำหรับเข้าถึงแบบออฟไลน์ ไฟล์จะถูกลบหากคุณล้างประวัติเบราว์เซอร์สำหรับเว็บไซต์นี้",
      },
      free_cloud_filesharing: {
        title: "การแชร์ไฟล์บนคลาวด์ฟรี",
        public_note:
          "การแชร์ไฟล์สาธารณะฟรี ไฟล์จะหมดอายุภายใน 24 ชั่วโมง ทุกวันตอนเที่ยงคืน UTC",
      },
      folders: {
        root: "รูท",
        throwaway: "สำหรับทิ้ง",
        demo_gallery: "แกลเลอรี่สาธิต",
        tutorial_videos: "วิดีโอสอนการใช้งาน",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "องค์กรออฟไลน์",
        profile_name: "ไม่ระบุชื่อ",
      },
      anon_org: {
        org_name: "องค์กรไม่ระบุชื่อ",
        profile_name: "ไม่ระบุชื่อ",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "ค้นหาแอป ตัวแทน & บริการ...",
        search_offers: "กรองข้อเสนอ...",
      },
      s3_offer: {
        id: "19",
        name: "พื้นที่เก็บข้อมูลบนคลาวด์แบบเหมา",
        subheading:
          "เพิ่มพื้นที่เก็บข้อมูลใน OfficeX ด้วยบัตรของขวัญในราคา 1 ดอลลาร์ต่อ 100GB/เดือน",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "บัตรของขวัญพื้นที่เก็บข้อมูล 100GB",
            images: [],
            description:
              "<p>ซื้อบัตรของขวัญ 100GB สำหรับพื้นที่เก็บข้อมูลบนคลาวด์ที่ปลอดภัยและปรับขนาดได้บน Amazon Cloud ข้อมูลของคุณได้รับการปกป้องโดยความทนทานและความพร้อมใช้งานชั้นนำในอุตสาหกรรมของ AWS S3 ซึ่งรับประกันความน่าเชื่อถือและประสิทธิภาพสูง บัตรของขวัญนี้จะเพิ่มเงินทุนในบัญชีพื้นที่เก็บข้อมูลของคุณด้วยราคาตามการใช้งาน</p><p>เรานำเสนอพื้นที่เก็บข้อมูลที่รวดเร็วและราคาไม่แพงด้วย AWS S3 Intelligent-Tiering ซึ่งจะย้ายข้อมูลไปยังชั้นพื้นที่เก็บข้อมูลที่คุ้มค่าที่สุดโดยอัตโนมัติโดยไม่ส่งผลกระทบต่อประสิทธิภาพ ซึ่งให้ความพร้อมใช้งานสูงในราคาขายส่ง</p><ul><li>ไฟล์ที่เข้าถึงไม่บ่อย: จะถูกย้ายไปยังพื้นที่เก็บข้อมูลที่เย็นกว่าโดยอัตโนมัติในราคาต่ำเพียง $0.0054/GB ต่อเดือน</li><li>ไฟล์ที่เข้าถึงบ่อย: จะถูกเก็บไว้ในพื้นที่เก็บข้อมูลมาตรฐานในราคา $0.03128/GB ต่อเดือน</li></ul><p>โปรดทราบว่าการส่งออกข้อมูล (การดาวน์โหลดข้อมูลจากคลาวด์) จะถูกเรียกเก็บเงินที่ $0.1224 ต่อ GB</p><p>ขยายความจุพื้นที่เก็บข้อมูล OfficeX ของคุณด้วยบัตรของขวัญ 100GB ที่สะดวกสบายนี้ เพื่อให้แน่ใจว่าเอกสารสำคัญทั้งหมดของคุณจะถูกเก็บไว้อย่างปลอดภัยในคลาวด์</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "ต่อเดือนสำหรับพื้นที่เก็บข้อมูลและการประมวลผล ขั้นต่ำ $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "ซื้อบัตรของขวัญ",
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
                    label: "ฟอรัม",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/GB/เดือน",
                view_page_link: "#",
                call_to_action: "ซื้อบัตรของขวัญ",
                description:
                  "ขยายความจุพื้นที่เก็บข้อมูล OfficeX ของคุณด้วยบัตรของขวัญ 100GB ที่สะดวกสบายนี้ เพื่อให้แน่ใจว่าเอกสารสำคัญทั้งหมดของคุณจะถูกเก็บไว้อย่างปลอดภัยในคลาวด์",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC บน Base",
                    note: "เพื่อเริ่มต้นผู้ขาย (หมายเหตุ: ที่อยู่เงินฝากจริงและรายละเอียดจะได้รับจากแบ็คเอนด์หลังจากเริ่มตัวเลือกการชำระเงินนี้)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "คุณจะได้รับบัตรของขวัญสำหรับ AWS S3",
                    vendor_disclaimer:
                      "เข้าถึงได้ทันที บัตรของขวัญพื้นที่เก็บข้อมูลของคุณจะมียอดคงเหลือคริปโตที่จ่ายค่าพื้นที่เก็บข้อมูลและแบนด์วิดท์ คุณสามารถเติมเงินได้ทุกเมื่อที่คุณต้องการมากขึ้น",
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
