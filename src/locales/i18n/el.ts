import { CartCheckoutPatternEnum } from "@officexapp/types";

const LOCALE = {
  ["el"]: {
    helmet: {
      chat: "Συνομιλία | OfficeX",
      purchase_history: "Ιστορικό αγορών",
      appstore: "App Store",
      folder: "Φάκελος",
      file: "Αρχείο",
      settings: "Ρυθμίσεις",
    },
    default_disks: {
      browser_cache: {
        title: "Προσωρινή μνήμη προγράμματος περιήγησης εκτός σύνδεσης",
        public_note:
          "Τοπική προσωρινή μνήμη προγράμματος περιήγησης για πρόσβαση εκτός σύνδεσης. Τα αρχεία διαγράφονται αν καθαρίσετε το ιστορικό του προγράμματος περιήγησης για αυτόν τον ιστότοπο.",
      },
      free_cloud_filesharing: {
        title: "Δωρεάν κοινή χρήση αρχείων στο cloud",
        public_note:
          "Δωρεάν δημόσια κοινή χρήση αρχείων. Τα αρχεία λήγουν εντός 24 ωρών, καθημερινά τα μεσάνυχτα UTC.",
      },
      folders: {
        root: "Ρίζα",
        throwaway: "Προσωρινός",
        demo_gallery: "Εκθεσιακός χώρος επίδειξης",
        tutorial_videos: "Βίντεο εκμάθησης",
      },
    },
    default_orgs: {
      offline_org: {
        org_name: "Οργανισμός εκτός σύνδεσης",
        profile_name: "Ανώνυμος",
      },
      anon_org: {
        org_name: "Ανώνυμος Οργανισμός",
        profile_name: "Ανώνυμος",
      },
    },
    appstore: {
      input_placeholders: {
        search_mall: "Αναζήτηση για εφαρμογές, πράκτορες & υπηρεσίες...",
        search_offers: "Φιλτράρισμα προσφορών...",
      },
      s3_offer: {
        id: "19",
        name: "Μαζική αποθήκευση στο cloud",
        subheading:
          "Προσθέστε αποθήκευση στο OfficeX με δωροκάρτες με 1$ ανά 100GB/μήνα",
        cover_image:
          "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
        is_featured: false,
        offers: [
          {
            id: "offer1-aws-s3-ai-csv-expodrt",
            title: "Δωροκάρτα αποθήκευσης 100GB",
            images: [],
            description:
              "<p>Αγοράστε μια δωροκάρτα 100GB για ασφαλή, επεκτάσιμη αποθήκευση cloud στο Amazon Cloud. Τα δεδομένα σας προστατεύονται από την κορυφαία στον κλάδο ανθεκτικότητα και διαθεσιμότητα του AWS S3, εξασφαλίζοντας υψηλή αξιοπιστία και απόδοση. Αυτή η δωροκάρτα προσθέτει κεφάλαια στον λογαριασμό αποθήκευσης σας με τιμολόγηση βάσει χρήσης.</p><p>Προσφέρουμε γρήγορη και προσιτή αποθήκευση χάρη στο AWS S3 Intelligent-Tiering, το οποίο μετακινεί αυτόματα τα δεδομένα στο πιο οικονομικό επίπεδο αποθήκευσης χωρίς να επηρεάζει την απόδοση. Αυτό παρέχει υψηλή διαθεσιμότητα σε τιμές χονδρικής.</p><ul><li>Αρχεία με σπάνια πρόσβαση: Μετακινούνται αυτόματα σε πιο κρύα αποθήκευση με κόστος τόσο χαμηλό όσο $0,0054/GB ανά μήνα.</li><li>Αρχεία με συχνή πρόσβαση: Διατηρούνται σε τυπική αποθήκευση για $0,03128/GB ανά μήνα.</li></ul><p>Λάβετε υπόψη ότι η έξοδος δεδομένων (η λήψη δεδομένων από το cloud) χρεώνεται με 0,1224 $ ανά GB.</p><p>Επεκτείνετε τη χωρητικότητα αποθήκευσης του OfficeX με αυτήν την πρακτική δωροκάρτα 100GB, διασφαλίζοντας ότι όλα τα σημαντικά έγγραφά σας αποθηκεύονται με ασφάλεια στο cloud.</p>",
            price: 0.01,
            price_unit: "/GB",
            price_explanation:
              "ανά μήνα για αποθήκευση και επεξεργασία, ελάχιστο $1",
            bookmarks: 180,
            bookmarked_demand: 240000,
            cumulative_sales: 105000,
            bookmark_url: "",
            call_to_action: "Αγορά δωροκάρτας",
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
                    label: "Φόρουμ",
                    url: "#",
                  },
                  {
                    label: "Discord",
                    url: "#",
                  },
                ],
                price_line: "$0,01/GB/μήνα",
                view_page_link: "#",
                call_to_action: "Αγορά δωροκάρτας",
                description:
                  "Επεκτείνετε τη χωρητικότητα αποθήκευσης του OfficeX με αυτήν την πρακτική δωροκάρτα 100GB, διασφαλίζοντας ότι όλα τα σημαντικά έγγραφά σας αποθηκεύονται με ασφάλεια στο cloud.",
                vendor_disclaimer: "",
                about_url: "https://vendor.com",
                checkout_options: [
                  {
                    offer_id: "aws-s3-storage-giftcard",
                    checkout_flow_id:
                      "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                    title: "USDC στο Base",
                    note: "Για την αρχικοποίηση του προμηθευτή (Σημείωση: Η πραγματική διεύθυνση κατάθεσης και οι λεπτομέρειες θα παρέχονται από το backend μετά την έναρξη αυτής της επιλογής πληρωμής)",
                    checkout_init_endpoint:
                      "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
                    checkout_pattern:
                      CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                    vendor_notes: "Θα λάβετε μια δωροκάρτα για το AWS S3",
                    vendor_disclaimer:
                      "Άμεση πρόσβαση. Η δωροκάρτα αποθήκευσης σας θα έχει ένα υπόλοιπο κρυπτονομίσματος που πληρώνει για την αποθήκευση και το εύρος ζώνης. Μπορείτε να την ανανεώνετε όποτε χρειάζεστε περισσότερο.",
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
