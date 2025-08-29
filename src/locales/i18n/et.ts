import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["et"]: {
    helmet: {
      chat: "Vestlus | OfficeX",
      purchase_history: "Ostude ajalugu",
      appstore: "Rakenduste pood",
      folder: "Kaust",
      file: "Fail",
      settings: "Seaded",
    },
    default_disks: {
      browser_cache: {
        title: "Võrguühenduseta brauseri vahemälu",
        public_note:
          "Kohalik brauseri vahemälu võrguühenduseta juurdepääsuks. Failid kustutatakse, kui kustutate selle saidi brauseri ajaloo.",
      },
      free_cloud_filesharing: {
        title: "Tasuta pilvefailide jagamine",
        public_note:
          "Tasuta avalik failide jagamine. Failide kehtivusaeg lõpeb 24 tunni jooksul, iga päev UTC südaööl.",
      },
      folders: {
        root: "Juurekaust",
        throwaway: "Viska ära",
        demo_gallery: "Demo galerii",
        tutorial_videos: "Õppevideod",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Võrguühenduseta organisatsioon",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonüümne organisatsioon",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Otsi rakendusi, agente ja teenuseid...",
        search_offers: "Filtreeri pakkumisi...",
      },
      s3_offer: {
        id: "19",
        name: "Hulgi pilvemälu",
        subheading:
          "Lisage OfficeX-ile mälu kinkekaartidega 1 dollari eest 100 GB/kuus",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100 GB mälu kinkekaart",
            images: [],
            description:
              "<p>Ostke 100 GB kinkekaart turvalise, skaleeritava pilvemälu jaoks Amazon Cloudis. Teie andmed on kaitstud AWS S3 tööstusharu juhtiva vastupidavuse ja kättesaadavusega, tagades kõrge usaldusväärsuse ja jõudluse. See kinkekaart lisab vahendeid teie mälukontole kasutuspõhise hinnastamisega.</p><p>Pakume kiiret ja taskukohast mälu tänu AWS S3 Intelligent-Tieringile, mis liigutab andmed automaatselt kõige kuluefektiivsemasse mälutasandisse, mõjutamata jõudlust. See pakub suurt kättesaadavust hulgihindadega.</p><ul><li>Harva ligipääsetavad failid: liigutatakse automaatselt jahedamasse mällu, mis maksab alates 0,0054 dollarit/GB kuus.</li><li>Sageli ligipääsetavad failid: hoitakse standardmälus hinnaga 0,03128 dollarit/GB kuus.</li></ul><p>Pange tähele, et andmete väljund (andmete allalaadimine pilvest) maksab 0,1224 dollarit GB kohta.</p><p>Laiendage oma OfficeX mälu mahtu selle mugava 100 GB kinkekaardiga, tagades, et kõik teie olulised dokumendid on turvaliselt pilves salvestatud.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation: "kuus mälu ja töötlemise eest, min. 1 dollar",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Osta kinkekaart",
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
                    label: "Foorum",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "0,01 dollarit/GB/kuus",
                view_page_link: "#",
                call_to_action: "Osta kinkekaart",
                description:
                  "Laiendage oma OfficeX mälu mahtu selle mugava 100 GB kinkekaardiga, tagades, et kõik teie olulised dokumendid on turvaliselt pilves salvestatud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC Base'il",
                    note: "Tarnija initsialiseerimiseks (Märkus: tegelik sissemakse aadress ja üksikasjad antakse tagasikutse abil pärast selle väljamakse valiku algatamist)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Saate AWS S3 jaoks kinkekaardi",
                    vendor_disclaimer:
                      "Kohene juurdepääs. Teie mälu kinkekaardil on krüpto saldo, mis maksab mälu ja ribalaiuse eest. Saate seda igal ajal täiendada, kui vajate rohkem.",
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
