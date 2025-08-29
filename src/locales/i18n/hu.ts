import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["hu"]: {
    helmet: {
      chat: "Csevegés | OfficeX",
      purchase_history: "Vásárlási előzmények",
      appstore: "App Store",
      folder: "Mappa",
      file: "Fájl",
      settings: "Beállítások",
    },
    default_disks: {
      browser_cache: {
        title: "Offline böngésző gyorsítótár",
        public_note:
          "Helyi böngésző gyorsítótár offline hozzáféréshez. A fájlok törlődnek, ha törli a böngésző előzményeit ehhez a webhelyhez.",
      },
      free_cloud_filesharing: {
        title: "Ingyenes felhő alapú fájlmegosztás",
        public_note:
          "Ingyenes nyilvános fájlmegosztás. A fájlok 24 órán belül, naponta éjfélkor UTC lejárnak.",
      },
      folders: {
        root: "Gyökér",
        throwaway: "Eldobható",
        demo_gallery: "Demo galéria",
        tutorial_videos: "Oktatóvideók",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Offline szervezet",
        profile_name: "Anon",
      },
      anon_org: {
        org_name: "Anonim szervezet",
        profile_name: "Anon",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Alkalmazások, ügynökök és szolgáltatások keresése...",
        search_offers: "Ajánlatok szűrése...",
      },
      s3_offer: {
        id: "19",
        name: "Tömeges felhőtárhely",
        subheading:
          "Adjon hozzá tárhelyet az OfficeX-hez ajándékkártyákkal 100 GB/hó áron, 1 dollárért",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "100 GB-os tárhely ajándékkártya",
            images: [],
            description:
              "<p>Vásároljon 100 GB-os ajándékkártyát biztonságos, skálázható felhőtárhelyhez az Amazon Cloud-on. Adatait az AWS S3 iparágvezető tartóssága és rendelkezésre állása védi, biztosítva a magas megbízhatóságot és teljesítményt. Ez az ajándékkártya a használat alapú árazással pénzt ad a tárhely fiókjához.</p><p>Az AWS S3 Intelligent-Tieringnek köszönhetően gyors és megfizethető tárhelyet kínálunk, amely automatikusan áthelyezi az adatokat a legköltséghatékonyabb tárhelyszintre anélkül, hogy a teljesítményt befolyásolná. Ez magas rendelkezésre állást biztosít nagykereskedelmi áron.</p><ul><li>Ritkán hozzáférhető fájlok: Automatikusan hidegebb tárhelyre kerülnek, mindössze 0,0054 $/GB havonta.</li><li>Gyakran hozzáférhető fájlok: Normál tárhelyen maradnak 0,03128 $/GB havonta.</li></ul><p>Felhívjuk figyelmét, hogy az adat egress (a felhőből való letöltés) díja 0,1224 $ / GB.</p><p>Bővítse OfficeX tárhelykapacitását ezzel a kényelmes 100 GB-os ajándékkártyával, biztosítva, hogy minden fontos dokumentuma biztonságosan tárolva legyen a felhőben.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "havonta a tárhelyért és feldolgozásért, min. 1 $",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Ajándékkártya vásárlása",
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
                price_line: "0,01 $/GB/hó",
                view_page_link: "#",
                call_to_action: "Ajándékkártya vásárlása",
                description:
                  "Bővítse OfficeX tárhelykapacitását ezzel a kényelmes 100 GB-os ajándékkártyával, biztosítva, hogy minden fontos dokumentuma biztonságosan tárolva legyen a felhőben.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC a Base-en",
                    note: "A szállító inicializálásához (Megjegyzés: A tényleges befizetési címet és részleteket a háttérrendszer biztosítja a fizetési opció elindítása után)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Kapni fog egy ajándékkártyát az AWS S3-hoz",
                    vendor_disclaimer:
                      "Azonnali hozzáférés. A tárhely ajándékkártyája egy kripto egyenleggel rendelkezik, amely fizet a tárhelyért és a sávszélességért. Bármikor feltöltheti, ha többre van szüksége.",
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
