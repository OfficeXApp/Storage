import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["ka"]: {
    helmet: {
      chat: "ჩატი | OfficeX",
      purchase_history: "შესყიდვების ისტორია",
      appstore: "აპლიკაციების მაღაზია",
      folder: "საქაღალდე",
      file: "ფაილი",
      settings: "პარამეტრები",
    },
    default_disks: {
      browser_cache: {
        title: "ბრაუზერის ქეში ხაზგარეშე",
        public_note:
          "ადგილობრივი ბრაუზერის ქეში ხაზგარეშე წვდომისთვის. ფაილები იშლება, თუ ამ საიტისთვის ბრაუზერის ისტორიას გაწმენდთ.",
      },
      free_cloud_filesharing: {
        title: "უფასო ღრუბლოვანი ფაილების გაზიარება",
        public_note:
          "უფასო საჯარო ფაილების გაზიარება. ფაილებს ვადა ეწურება 24 საათში, ყოველდღიურად UTC შუაღამისას.",
      },
      folders: {
        root: "ძირი",
        throwaway: "გადასაგდები",
        demo_gallery: "დემო გალერეა",
        tutorial_videos: "ვიდეო გაკვეთილები",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "ხაზგარეშე ორგანიზაცია",
        profile_name: "ანონ",
      },
      anon_org: {
        org_name: "ანონიმური ორგანიზაცია",
        profile_name: "ანონ",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "მოძებნეთ აპები, აგენტები და სერვისები...",
        search_offers: "ფილტრი შეთავაზებები...",
      },
      s3_offer: {
        id: "19",
        name: "ნაყარი ღრუბლოვანი მეხსიერება",
        subheading:
          "დაამატეთ მეხსიერება OfficeX-ს სასაჩუქრე ბარათებით $1-ად 100 გბ/თვეში",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100 გბ მეხსიერების სასაჩუქრე ბარათი",
            images: [],
            description:
              "<p>შეიძინეთ 100 გბ სასაჩუქრე ბარათი უსაფრთხო, მასშტაბირებადი ღრუბლოვანი მეხსიერებისთვის Amazon Cloud-ზე. თქვენი მონაცემები დაცულია AWS S3-ის ინდუსტრიის წამყვანი გამძლეობით და ხელმისაწვდომობით, რაც უზრუნველყოფს მაღალ საიმედოობას და შესრულებას. ეს სასაჩუქრე ბარათი ამატებს თანხებს თქვენს მეხსიერების ანგარიშს გამოყენებაზე დაფუძნებული ფასებით.</p><p>ჩვენ გთავაზობთ სწრაფ და ხელმისაწვდომ მეხსიერებას AWS S3 Intelligent-Tiering-ის წყალობით, რომელიც ავტომატურად გადააქვს მონაცემებს ყველაზე ეფექტურ მეხსიერების დონეზე შესრულებაზე გავლენის გარეშე. ეს უზრუნველყოფს მაღალ ხელმისაწვდომობას საბითუმო ფასებში.</p><ul><li>იშვიათად ხელმისაწვდომი ფაილები: ავტომატურად გადადის უფრო ცივ მეხსიერებაში თვეში $0.0054/გბ-ად.</li><li>ხშირად ხელმისაწვდომი ფაილები: ინახება სტანდარტულ მეხსიერებაში თვეში $0.03128/გბ-ად.</li></ul><p>გთხოვთ გაითვალისწინოთ, რომ მონაცემთა გამოსვლა (მონაცემების გადმოწერა ღრუბლიდან) ფასდება $0.1224 გბ-ზე.</p><p>გააფართოვეთ თქვენი OfficeX მეხსიერების მოცულობა ამ მოსახერხებელი 100 გბ სასაჩუქრე ბარათით, რაც უზრუნველყოფს, რომ ყველა თქვენი მნიშვნელოვანი დოკუმენტი უსაფრთხოდ არის შენახული ღრუბელში.</p>",
            price: 0.01,
            price_unit: "/გბ",
            price_explanation: "თვეში მეხსიერებისა და დამუშავებისთვის, მინ. $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "სასაჩუქრე ბარათის ყიდვა",
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
                    label: "ფორუმი",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0.01/გბ/თვეში",
                view_page_link: "#",
                call_to_action: "სასაჩუქრე ბარათის ყიდვა",
                description:
                  "გააფართოვეთ თქვენი OfficeX მეხსიერების მოცულობა ამ მოსახერხებელი 100 გბ სასაჩუქრე ბარათით, რაც უზრუნველყოფს, რომ ყველა თქვენი მნიშვნელოვანი დოკუმენტი უსაფრთხოდ არის შენახული ღრუბელში.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC on Base",
                    note: "მიმწოდებლის ინიციალიზაციისთვის (შენიშვნა: დეპოზიტის რეალური მისამართი და დეტალები მოწოდებული იქნება ბეკენდის მიერ ამ გადახდის ოფციის ინიციალიზაციის შემდეგ)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "თქვენ მიიღებთ სასაჩუქრე ბარათს AWS S3-სთვის",
                    vendor_disclaimer:
                      "მყისიერი წვდომა. თქვენი მეხსიერების სასაჩუქრე ბარათს ექნება კრიპტო ბალანსი, რომელიც იხდის მეხსიერებას და გამტარუნარიანობას. შეგიძლიათ შეავსოთ ის ნებისმიერ დროს, როცა მეტი დაგჭირდებათ.",
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
