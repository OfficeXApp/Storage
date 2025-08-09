import {
  ServiceWithOffersFromVendors,
  DiskTypeEnum,
  IDPrefixEnum,
  CartCheckoutPatternEnum,
} from "@officexapp/types";
import { LOCAL_DEV_MODE } from "../../framework/identity/constants";

export const appstore_apps_prod: ServiceWithOffersFromVendors[] = [
  {
    id: "19",
    name: "Amazon Cloud",
    subheading: "Add storage to OfficeX with giftcards for $1 per 100GB/month",
    cover_image:
      "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
    is_featured: false,
    offers: [
      {
        id: "offer1-aws-s3-ai-csv-expodrt",
        title: "100GB Storage Giftcard",
        images: [],
        description:
          "<p>Purchase a 100GB gift card for secure, scalable cloud storage on Amazon Cloud. Your data is protected by AWS S3's industry-leading durability and availability, ensuring high reliability and performance. This gift card adds funds to your storage account with usage based pricing.</p><p>We offer fast and affordable storage thanks to AWS S3 Intelligent-Tiering, which automatically moves data to the most cost-effective storage tier without impacting performance. This provides high availability at wholesale pricing.</p><ul><li>Infrequently accessed files: Automatically moved to colder storage for as low as $0.0054/GB per month.</li><li>Frequently accessed files: Kept in standard storage for $0.03128/GB per month.</li></ul><p>Please note that data egress (downloading data from the cloud) is charged at $0.1224 per GB.</p><p>Expand your OfficeX storage capacity with this convenient 100GB gift card, ensuring all your important documents are safely stored in the cloud.</p>",
        price: 0.01,
        price_unit: "/GB",
        price_explanation: "per month for storage and processing, min $1",
        bookmarks: 180,
        bookmarked_demand: 0,
        cumulative_sales: 105000,
        bookmark_url: "",
        call_to_action: "Buy Giftcard",
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
            price_line: "$0.01/GB/month",
            view_page_link: "#",
            call_to_action: "Buy Giftcard",
            description:
              "Expand your OfficeX storage capacity with this convenient 100GB gift card, ensuring all your important documents are safely stored in the cloud.",
            vendor_disclaimer: "",
            about_url: "https://vendor.com",
            checkout_options: [
              {
                offer_id: "aws-s3-storage-giftcard",
                checkout_flow_id:
                  "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                title: "USDC on Base",
                note: "To initialize the vendor (Note: Actual deposit address and details would be provided by the backend after initiating this checkout option)",
                checkout_init_endpoint:
                  "https://vendorofficex.otterpad.cc/v1/checkout/initiate", //"http://localhost:3001/v1/checkout/initiate",
                checkout_pattern: CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                vendor_notes: "You will receive a giftcard for AWS S3",
                vendor_disclaimer:
                  "Immediate access. Your storage giftcard will have a crypto balance that pays for storage and bandwidth. You can top it up any time you need more.",
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

  // {
  //   id: "17",
  //   name: "The Pirate Bay",
  //   subheading: "Upload to your storage. Delegate torrenting to cloud vendors",
  //   coverImage:
  //     "https://www.prsformusic.com/-/media/images/mmagazine/images/2017/08/piratebayresize.ashx?h=358&w=637&la=en&hash=0C7EFCAF4BED538A4A2E8A0D855333CD",
  //   isFeatured: true,
  //   offers: [
  //     {
  //       id: "offer-piratebay-data-scraping",
  //       title: "Delegate Torrent Download",
  //       images: [],
  //       description:
  //         "<p>Delegate torrent downloads to cloud vendors for seamless integration with your Anonymous OfficeX storage. This service allows you to initiate torrent downloads remotely, with the downloaded content automatically saved to your designated cloud storage. Free up your local resources and ensure efficient, secure file acquisition for your projects.</p><p>Key features:</p><ul><li><strong>Cloud-Based Torrenting:</strong> Delegate torrent downloads to high-speed cloud servers.</li><li><strong>Direct to Storage:</strong> Automatically save downloaded files directly to your OfficeX integrated cloud storage (e.g., AWS S3).</li><li><strong>Bandwidth Efficiency:</strong> Utilize vendor's bandwidth for faster downloads without impacting your local network.</li><li><strong>Privacy & Security:</strong> Enhance privacy by offloading torrent activity from your personal devices.</li><li><strong>Automated & Scheduled:</strong> Option to schedule downloads or set up automated processes for new torrents.</li></ul><p>Streamline your file acquisition process by delegating torrent downloads to secure cloud vendors, ensuring direct delivery to your OfficeX storage.</p>",
  //       price: 0.05,
  //       priceUnit: "/GB",
  //       priceExplanation: "per GB of data downloaded",
  //       bookmarks: 350,
  //       bookmarkUrl: "#",
  //       avgCustomerLifetimeValue: 100,
  //       cumulativeSales: 35000,
  //       callToAction: "Book Service",
  //       vendors: [
  //         {
  //           id: "tpb-vendor1",
  //           name: "Data Harvest Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DHS",
  //           needs_auth_installation: true,
  //           need_cloud_officex: true,
  //           aboutUrl: "#",
  //           uptimeScore: 99.5,
  //           reviewsScore: 4.1,
  //           communityLinks: [
  //             {
  //               label: "Support Forum",
  //               url: "#",
  //             },
  //           ],
  //           priceLine: "$0.05/record",
  //           viewPageLink: "#",
  //           verificationUrl: "#",
  //           auth_installation_url:
  //             "http://localhost:3000/officex/install/click-worker-complex-task",
  //           description:
  //             "We promise the best results and have a 30 day money back guarantee.",
  //           callToAction: "Book Service",
  //           requirements: [
  //             {
  //               id: "tpb-vendor1-requirement1",
  //               title: "Save to Disk",
  //               explanation: "Select the disk to save the data to",
  //               type: IDPrefixEnum.Disk,
  //               required: true,
  //             },
  //             {
  //               id: "tpb-vendor1-requirement2",
  //               title: "Disk Type",
  //               explanation: "Select the disk type",
  //               type: DiskTypeEnum.AwsBucket,
  //               required: true,
  //             },
  //             {
  //               id: "tpb-vendor1-requirement3",
  //               title: "Save to Folder",
  //               explanation: "Select the folder to save the data to",
  //               type: IDPrefixEnum.Folder,
  //               required: true,
  //             },
  //           ],
  //           depositOptions: [
  //             {
  //               title: "USDC on Base",
  //               amount: 60,
  //               depositAddress: "0x3e3715629f3Df9f315B647f6BedF91615A3BAF65",
  //               tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  //               tokenName: "Circle USD",
  //               tokenSymbol: "USDC",
  //               tokenDecimals: 6,
  //               explanation: "To initialize the vendor",
  //               chain: "BASE_L2",
  //               depositUrlCheckout: "",
  //               chainExplorerUrl: "https://basescan.org/",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "21-t",
  //   name: "Tornado Cash",
  //   subheading: "Decentralized crypto mixer for enhanced transaction privacy.",
  //   coverImage:
  //     "https://img.freepik.com/premium-vector/tornado-cash-torn-coin-cryptocurrency-concept-banner-background_32996-2281.jpg", // Placeholder image, replace with a suitable one if available
  //   isFeatured: true,
  //   offers: [
  //     {
  //       id: "offer-tornado-cash-0-1-eth",
  //       title: "Mix 0.1 ETH",
  //       images: [],
  //       description:
  //         "<p>Deposit <strong>0.1 ETH</strong> into the Tornado Cash privacy pool to break the on-chain link between your deposit and withdrawal addresses. This service enhances transaction anonymity by mixing your funds with those of other users in a large liquidity pool.</p><p>Key benefits:</p><ul><li><strong>Enhanced Privacy:</strong> Obfuscates transaction history.</li><li><strong>Decentralized:</strong> Operated by smart contracts, not a central entity.</li><li><strong>Permissionless:</strong> Accessible to anyone with an Ethereum wallet.</li><li><strong>Fixed Denomination:</strong> Standardized pool sizes for consistent mixing.</li></ul><p>Please ensure you understand the mechanics of crypto mixers and the associated risks before proceeding. A 'note' (secret) is generated upon deposit, which is required for withdrawal.</p>",
  //       price: 0.1, // This represents the denomination of the pool
  //       priceUnit: "ETH",
  //       priceExplanation:
  //         "The fixed denomination for this mixing pool. A small relayer fee (paid in ETH) is typically required for withdrawal.",
  //       bookmarks: 500000, // Represents approximate number of transactions processed through this pool
  //       bookmarkUrl: "https://dune.com/queries/100000/200000", // Example: Link to a Dune Analytics dashboard for Tornado Cash stats
  //       avgCustomerLifetimeValue: 10, // Not applicable for a mixer in this context
  //       cumulativeSales: 50000, // Represents total ETH mixed through this specific pool (0.1 ETH * 500,000 transactions)
  //       callToAction: "Deposit 0.1 ETH",
  //       vendors: [
  //         {
  //           id: "tornado-cash-protocol",
  //           name: "Tornado Cash Protocol",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TCP",
  //           needs_auth_installation: false, // Permissionless protocol
  //           need_cloud_officex: false,
  //           aboutUrl: "https://tornado-cash.info/", // Link to a general info page or historical archive
  //           uptimeScore: 99.9, // Represents smart contract reliability/availability
  //           reviewsScore: 5, // Not applicable for a protocol
  //           communityLinks: [
  //             {
  //               label: "GitHub (Archived)",
  //               url: "https://github.com/tornadocash",
  //             },
  //             {
  //               label: "Audit Reports",
  //               url: "https://tornado-cash.info/audits/",
  //             },
  //           ],
  //           priceLine: "Variable relayer fees for withdrawal",
  //           viewPageLink: "https://tornado-cash.info/", // Link to a general info page or historical archive
  //           verificationUrl:
  //             "https://etherscan.io/address/0x47ce0c6ed5b0ce3d3967a0cf4e132c820fbcab09", // Example: Etherscan link to the 0.1 ETH pool contract
  //           auth_installation_url: "", // Not an installable application
  //           description:
  //             "Tornado Cash is a fully decentralized, non-custodial protocol that improves transaction privacy on Ethereum by breaking the on-chain link between sender and receiver addresses.",
  //           callToAction: "Access Mixer Interface",
  //           requirements: [
  //             {
  //               id: "tornado-cash-requirement-recipient",
  //               title: "Recipient Ethereum Address",
  //               explanation:
  //                 "The address where you want the mixed funds to be sent. This should be a new, clean address.",
  //               type: "text", // Or 'address' if a specific type is supported
  //               required: true,
  //             },
  //             {
  //               id: "tornado-cash-requirement-relayer",
  //               title: "Relayer Fee (Optional)",
  //               explanation:
  //                 "An optional fee paid to a relayer to withdraw funds without revealing your IP address or using your original wallet.",
  //               type: "number",
  //               required: false,
  //             },
  //           ],
  //           depositOptions: [
  //             // This section describes the *input* to the mixer, which is the "deposit" itself
  //             {
  //               title: "Deposit 0.1 ETH",
  //               amount: 0.1,
  //               depositAddress: "0x47ce0c6ed5b0ce3d3967a0cf4e132c820fbcab09", // Tornado Cash 0.1 ETH pool contract address
  //               tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH address on Ethereum Mainnet
  //               tokenName: "Wrapped Ether",
  //               tokenSymbol: "WETH",
  //               tokenDecimals: 18,
  //               explanation: "Deposit 0.1 ETH into the privacy pool.",
  //               chain: "ETHEREUM_MAINNET",
  //               depositUrlCheckout: "", // User interacts directly with smart contract
  //               chainExplorerUrl: "https://etherscan.io/",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       id: "offer-tornado-cash-1-eth",
  //       title: "Mix 1 ETH",
  //       images: [],
  //       description:
  //         "<p>Utilize the <strong>1 ETH</strong> Tornado Cash pool for enhanced privacy of larger Ethereum transactions. Similar to other denominations, this pool allows you to deposit 1 ETH and withdraw it to a new address, breaking the on-chain link and improving your financial anonymity.</p><p>Key benefits:</p><ul><li><strong>Higher Denomination:</strong> Suitable for larger amounts of ETH.</li><li><strong>Proven Mechanism:</strong> Operates on the same audited smart contract principles.</li><li><strong>Community Supported:</strong> Relayers and interfaces maintained by the community.</li><li><strong>Non-Custodial:</strong> You retain control of your funds throughout the process.</li></ul><p>Remember to securely store your generated 'note' (secret) as it is essential for withdrawing your funds. Consider using a relayer for withdrawal to maximize privacy.</p>",
  //       price: 1, // Denomination
  //       priceUnit: "ETH",
  //       priceExplanation:
  //         "The fixed denomination for this mixing pool. A small relayer fee (paid in ETH) is typically required for withdrawal.",
  //       bookmarks: 200000, // Approximate number of transactions
  //       bookmarkUrl: "https://dune.com/queries/100000/200000", // Example: Link to a Dune Analytics dashboard
  //       avgCustomerLifetimeValue: 10,
  //       cumulativeSales: 200000, // Total ETH mixed (1 ETH * 200,000 transactions)
  //       callToAction: "Deposit 1 ETH",
  //       vendors: [
  //         {
  //           id: "tornado-cash-protocol",
  //           name: "Tornado Cash Protocol",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TCP",
  //           needs_auth_installation: false,
  //           need_cloud_officex: false,
  //           aboutUrl: "https://tornado-cash.info/",
  //           uptimeScore: 99.9,
  //           reviewsScore: 5,
  //           communityLinks: [
  //             {
  //               label: "GitHub (Archived)",
  //               url: "https://github.com/tornadocash",
  //             },
  //             {
  //               label: "Audit Reports",
  //               url: "https://tornado-cash.info/audits/",
  //             },
  //           ],
  //           priceLine: "Variable relayer fees for withdrawal",
  //           viewPageLink: "https://tornado-cash.info/",
  //           verificationUrl:
  //             "https://etherscan.io/address/0x910CebD20aC4626E3D63C7d6bF8d4fF86Ff3aE17", // Example: Etherscan link to the 1 ETH pool contract
  //           auth_installation_url: "",
  //           description:
  //             "Tornado Cash is a fully decentralized, non-custodial protocol that improves transaction privacy on Ethereum by breaking the on-chain link between sender and receiver addresses.",
  //           callToAction: "Access Mixer Interface",
  //           requirements: [
  //             {
  //               id: "tornado-cash-requirement-recipient",
  //               title: "Recipient Ethereum Address",
  //               explanation:
  //                 "The address where you want the mixed funds to be sent. This should be a new, clean address.",
  //               type: "text",
  //               required: true,
  //             },
  //             {
  //               id: "tornado-cash-requirement-relayer",
  //               title: "Relayer Fee (Optional)",
  //               explanation:
  //                 "An optional fee paid to a relayer to withdraw funds without revealing your IP address or using your original wallet.",
  //               type: "number",
  //               required: false,
  //             },
  //           ],
  //           depositOptions: [
  //             {
  //               title: "Deposit 1 ETH",
  //               amount: 1,
  //               depositAddress: "0x910CebD20aC4626E3D63C7d6bF8d4fF86Ff3aE17", // Tornado Cash 1 ETH pool contract address
  //               tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH address on Ethereum Mainnet
  //               tokenName: "Wrapped Ether",
  //               tokenSymbol: "WETH",
  //               tokenDecimals: 18,
  //               explanation: "Deposit 1 ETH into the privacy pool.",
  //               chain: "ETHEREUM_MAINNET",
  //               depositUrlCheckout: "",
  //               chainExplorerUrl: "https://etherscan.io/",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "20",
  //   name: "Clickworker",
  //   subheading: "Bulk volunteers for online gigwork & microtasks.",
  //   coverImage:
  //     "https://static.vecteezy.com/system/resources/previews/029/182/639/non_2x/black-corporate-id-card-template-clean-id-card-design-with-realistic-lanyard-mockup-free-vector.jpg", // "https://res.cloudinary.com/people-matters/image/upload/fl_immutable_cache,w_624,h_351,q_auto,f_auto/v1717428082/1717428081.jpg", // "https://cdn.prod.website-files.com/643a3434759b024418ea32c0/64a3e22aeb0e06778d2e4cfc_Gig-Economy.png", //"https://www.keka.com/us/wp-content/uploads/2024/10/gig-worker-rights-1.png",
  //   isFeatured: true,
  //   offers: [
  //     {
  //       id: "offer-clickworker-100-simple-task",
  //       title: "25 Volunteers for Simple Task",
  //       images: [],
  //       description:
  //         "<p>Quickly complete 25 simple, repetitive microtasks using the Clickworker crowd. This offer is perfect for large-volume, straightforward assignments such as data entry, image tagging, sentiment analysis of short texts, or basic data validation. Get fast and accurate results for tasks that don't require complex decision-making.</p><p>Key benefits:</p><ul><li><strong>High Volume, Fast Turnaround:</strong> Ideal for large datasets and quick completion.</li><li><strong>Cost-Effective:</strong> Efficiently process many simple tasks at a lower unit cost.</li><li><strong>Scalable Workforce:</strong> Access a massive pool of Clickworkers.</li><li><strong>Automated Quality Checks:</strong> Benefit from Clickworker's streamlined quality assurance for microtasks.</li><li><strong>Seamless Integration:</strong> Easily integrate task submission and result retrieval.</li></ul><p>Automate your microtask workflows with the power of the Clickworker crowd.</p>",
  //       price: 25,
  //       priceUnit: "/project",
  //       priceExplanation:
  //         "Starting price for 25 simple tasks, varies by task type",
  //       bookmarks: 300,
  //       bookmarkUrl: "#",
  //       avgCustomerLifetimeValue: 1000,
  //       cumulativeSales: 100000,
  //       callToAction: "Configure Project",
  //       vendors: [
  //         {
  //           id: "clickworker-vendor1",
  //           name: "Clickworker GmbH",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CWG",
  //           needs_auth_installation: true,
  //           need_cloud_officex: false,
  //           aboutUrl: "https://www.clickworker.com/how-it-works/",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.6,
  //           communityLinks: [
  //             {
  //               label: "API Docs",
  //               url: "http://docs.clickworker.com/swagger.html",
  //             },
  //           ],
  //           priceLine: "Pricing varies by task",
  //           viewPageLink: "https://www.clickworker.com/",
  //           verificationUrl: "https://www.clickworker.com/",
  //           auth_installation_url:
  //             "http://localhost:3000/officex/install/click-worker-simple-task",
  //           description:
  //             "Clickworker is a leading crowdsourcing platform providing human intelligence for diverse tasks.",
  //           callToAction: "Access Platform",
  //           requirements: [
  //             {
  //               id: "clickworker-vendor1-requirement3",
  //               title: "Data Input CSV URL",
  //               explanation:
  //                 "URL to a CSV file containing the data for simple tasks",
  //               type: "url",
  //               required: true,
  //             },
  //           ],
  //           depositOptions: [
  //             {
  //               title: "USDC on Base",
  //               amount: 10000,
  //               depositAddress: "0x3e3715629f3Df9f315B647f6BedF91615A3BAF65",
  //               tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  //               tokenName: "USDC",
  //               tokenSymbol: "USDC",
  //               tokenDecimals: 6,
  //               explanation: "Deposit USDC to fund your Clickworker projects",
  //               chain: "BASE_L2",
  //               depositUrlCheckout: "",
  //               chainExplorerUrl: "https://basescan.org/",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       id: "offer-clickworker-25-complex-task",
  //       title: "10 Volunteers for Complex Task",
  //       images: [],
  //       description:
  //         "<p>Leverage the Clickworker crowd to tackle 25 complex tasks requiring human intelligence and nuanced understanding. This offer is ideal for projects such as detailed web research, content creation, data categorization with intricate rules, or in-depth data verification. Clickworkers are qualified based on your specific requirements to ensure high-quality results for challenging assignments.</p><p>Key benefits:</p><ul><li><strong>High-Quality Output:</strong> Access Clickworkers trained for complex tasks.</li><li><strong>Scalable Workforce:</strong> Get tasks completed efficiently by a large crowd.</li><li><strong>Customizable Requirements:</strong> Define specific skills or qualifications needed.</li><li><strong>Integrated Quality Control:</strong> Benefit from Clickworker's quality assurance processes.</li><li><strong>Flexible & On-Demand:</strong> Hire exactly when and how many you need.</li></ul><p>Empower your business with human intelligence for tasks that AI can't handle alone.</p>",
  //       price: 30,
  //       priceUnit: "/project",
  //       priceExplanation:
  //         "Starting price for 25 complex tasks, varies by task type and complexity",
  //       bookmarks: 120,
  //       bookmarkUrl: "#",
  //       avgCustomerLifetimeValue: 2500,
  //       cumulativeSales: 62500,
  //       callToAction: "Configure Project",
  //       vendors: [
  //         {
  //           id: "clickworker-vendor1",
  //           name: "Clickworker GmbH",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CWG",
  //           needs_auth_installation: true,
  //           need_cloud_officex: false,
  //           aboutUrl: "https://www.clickworker.com/how-it-works/",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.6,
  //           communityLinks: [
  //             {
  //               label: "API Docs",
  //               url: "http://docs.clickworker.com/swagger.html",
  //             },
  //           ],
  //           priceLine: "Pricing varies by task",
  //           viewPageLink: "https://www.clickworker.com/",
  //           verificationUrl: "https://www.clickworker.com/",
  //           auth_installation_url:
  //             "http://localhost:3000/officex/install/click-worker-complex-task",
  //           description:
  //             "Clickworker is a leading crowdsourcing platform providing human intelligence for diverse tasks.",
  //           callToAction: "Access Platform",
  //           requirements: [
  //             {
  //               id: "clickworker-vendor1-requirement3",
  //               title: "Instructions Document URL",
  //               explanation:
  //                 "URL to a detailed document outlining task instructions and quality guidelines",
  //               type: "url",
  //               required: true,
  //             },
  //           ],
  //           depositOptions: [
  //             {
  //               title: "USDC on Base",
  //               amount: 50000,
  //               depositAddress: "0x3e3715629f3Df9f315B647f6BedF91615A3BAF65",
  //               tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  //               tokenName: "USDC",
  //               tokenSymbol: "USDC",
  //               tokenDecimals: 6,
  //               explanation: "Deposit USDC to fund your Clickworker projects",
  //               chain: "BASE_L2",
  //               depositUrlCheckout: "",
  //               chainExplorerUrl: "https://basescan.org/",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "american-express",
  //   name: "American Express",
  //   subheading: "Global financial services. Credit card points.",
  //   coverImage:
  //     "https://icm.aexp-static.com/Internet/internationalcardshop/en_in/images/cards/Gold_Card.png",
  //   isFeatured: false,
  //   offers: [
  //     {
  //       id: "offer-amex-transaction-csv",
  //       title: "Signup Bonus $100",
  //       images: [],
  //       description:
  //         "<p>Sign up for a new American Express card through this offer and receive a $100 signup bonus! This exclusive promotion provides a direct incentive for new cardmembers, giving you a valuable boost when you join the American Express family. Enjoy the benefits and services of an Amex card along with this special bonus.</p><p>Key features of this offer:</p><ul><li><strong>$100 Signup Bonus:</strong> Receive a $100 bonus credited to your account after meeting initial spending requirements.</li><li><strong>Access to American Express Benefits:</strong> Enjoy premium customer service, purchase protection, and travel perks.</li><li><strong>Global Acceptance:</strong> Use your American Express card worldwide.</li><li><strong>Flexible Rewards Programs:</strong> Earn points on your spending, redeemable for travel, gift cards, or statement credits.</li><li><strong>Secure Transactions:</strong> Benefit from American Express's robust security features for peace of mind.</li></ul><p>Take advantage of this limited-time offer to earn a $100 signup bonus and experience the premium services of American Express.</p>",
  //       price: 120,
  //       priceUnit: "/year",
  //       priceExplanation:
  //         "American Express Gold Card starting at $10k/month credit limit",
  //       bookmarks: 100,
  //       bookmarkUrl: "#",
  //       avgCustomerLifetimeValue: 600,
  //       cumulativeSales: 60000,
  //       callToAction: "Signup Free",
  //       vendors: [
  //         {
  //           id: "amex-vendor1",
  //           name: "Financial Data Solutions Inc.",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FDSI",
  //           checkout_video:
  //             "https://www.youtube.com/embed/EbLmCRuoW1w?si=YHaM5gX1MgbFhmTG",
  //           needs_auth_installation: false,
  //           need_cloud_officex: false,
  //           aboutUrl: "#",
  //           verificationUrl: "#",
  //           auth_installation_url: "https://obedient-airline-13.webhook.cool",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.8,
  //           communityLinks: [
  //             {
  //               label: "Support",
  //               url: "#",
  //             },
  //           ],
  //           priceLine: "$90/month",
  //           viewPageLink: "#",
  //           requirements: [],
  //           description:
  //             "We promise the best results and have a 30 day money back guarantee.",
  //           depositOptions: [],
  //           callToAction: "Signup Free",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "30",
  //   name: "Gemini Agent",
  //   subheading: "Enable AI features on OfficeX with powerful Gemini models.",
  //   coverImage:
  //     "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/final_keyword_header.width-1200.format-webp.webp",
  //   isFeatured: true,
  //   offers: [
  //     {
  //       id: "offer-gemini-ai-dobrowser",
  //       title: "Gemini AI on DoBrowser",
  //       images: [],
  //       description:
  //         "<p>Integrate Gemini's powerful AI capabilities directly into your Anonymous OfficeX DoBrowser for intelligent web Browse, content summarization, and interactive assistance. This offer provides API access to Gemini, allowing you to use AI to enhance your Browse experience, extract key information from web pages, and get instant answers without leaving your browser environment.</p><p>Key benefits:</p><ul><li><strong>Intelligent Web Browse:</strong> Ask natural language questions about web content and get AI-driven answers.</li><li><strong>Content Summarization:</strong> Quickly summarize lengthy articles or documents directly within your browser.</li><li><strong>Interactive Assistance:</strong> Get real-time help with research, data extraction, and content generation.</li><li><strong>Secure & Private:</strong> Your Browse data is processed securely to maintain privacy within your Anonymous OfficeX platform.</li><li><strong>Seamless Integration:</strong> Easy setup to link Gemini AI with your DoBrowser instance.</li></ul><p>Transform your DoBrowser into a powerful AI-powered research and productivity tool with Gemini AI.</p>",
  //       price: 0.007,
  //       priceUnit: "/1K tokens",
  //       priceExplanation: "for AI processing and generation",
  //       bookmarks: 250,
  //       bookmarkUrl: "#",
  //       avgCustomerLifetimeValue: 1500,
  //       cumulativeSales: 187500,
  //       callToAction: "Install App",
  //       vendors: [
  //         {
  //           id: "gemini-vendor1",
  //           name: "AI Innovators Hub",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AIH",
  //           needs_auth_installation: true,
  //           aboutUrl: "#",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.9,
  //           communityLinks: [
  //             {
  //               label: "Docs",
  //               url: "#",
  //             },
  //           ],
  //           priceLine: "Starting from $0.007/1K tokens",
  //           viewPageLink: "#",
  //           verificationUrl: "#",
  //           auth_installation_url: "https://obedient-airline-13.webhook.cool",
  //           description:
  //             "We specialize in cutting-edge AI integrations and offer unparalleled support for our solutions.",
  //           callToAction: "Install App",
  //           requirements: [
  //             {
  //               id: "gemini-vendor1-requirement1",
  //               title: "DoBrowser Instance ID",
  //               explanation:
  //                 "Select the DoBrowser instance to install the app to",
  //               type: "IDPrefixEnum.DoBrowser",
  //               required: true,
  //             },
  //             {
  //               id: "gemini-vendor1-requirement2",
  //               title: "Gemini API Key",
  //               explanation: "Provide your Gemini API key for access",
  //               type: "string",
  //               required: true,
  //             },
  //           ],
  //           depositOptions: [
  //             {
  //               title: "USDC on Base",
  //               amount: 60,
  //               depositAddress: "0x3e3715629f3Df9f315B647f6BedF91615A3BAF65",
  //               tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  //               tokenName: "USDC",
  //               tokenSymbol: "USDC",
  //               tokenDecimals: 6,
  //               explanation: "Deposit USDC to purchase API credits",
  //               chain: "BASE_L2",
  //               depositUrlCheckout: "",
  //               chainExplorerUrl: "https://basescan.org/",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "31",
  //   name: "Gnosis Multi-Sig",
  //   subheading: "Secure your workspace with multiple admin voting rights",
  //   coverImage:
  //     "https://cdn.prod.website-files.com/67ed326db9d26b1dc1df7929/68017edea825224b44cfb0c7_6653f8d50a4daf8c4066b928_Gnosis%2520Safe%2520Explained.webp",
  //   isFeatured: Math.random() > 0.7,
  //   offers: [
  //     {
  //       id: "offer-gnosis-secure-folders",
  //       title:
  //         "Gnosis Safe Integration for Secure Cloud Folder Access (Multisig)",
  //       images: [],
  //       description: `
  //         <p>Integrate Gnosis Safe with your Anonymous OfficeX cloud storage to create multi-signature protected secret folders and documents. This offer provides a robust security layer, requiring multiple authorized signatures (e.g., from team members or specific roles) to access, modify, or download sensitive files. Ideal for highly confidential documents, financial records, or strategic plans that demand an extra layer of access control.</p>
  //         <p>Services include:</p>
  //         <ul>
  //           <li><strong>Multi-sig Folder Setup:</strong> Configure specific cloud folders to require Gnosis Safe multi-signature approval for access.</li>
  //           <li><strong>Granular Access Control:</strong> Define 'M of N' signature requirements for different levels of access (read-only, edit, download).</li>
  //           <li><strong>Activity Logging & Auditing:</strong> Track all access attempts and modifications to multisig-protected content.</li>
  //           <li><strong>Secure Key Management Consultation:</strong> Best practices for securing the private keys of the signers.</li>
  //           <li><strong>Integration with OfficeX:</strong> Seamlessly grant/revoke access directly from your OfficeX environment.</li>
  //         </ul>
  //         <p>Add an unparalleled level of security to your most sensitive OfficeX documents with Gnosis Safe multi-signature protection.</p>
  //       `,
  //       price: 750, // Higher for advanced security integration
  //       priceUnit: "/setup",
  //       priceExplanation: "One-time setup fee for folder integration",
  //       bookmarks: 120,
  //       avgCustomerLifetimeValue: 1000,
  //       cumulativeSales: 60000,
  //       vendors: [
  //         {
  //           id: "gnosis-vendor1",
  //           name: "SecureDocs Blockchain",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDBC",
  //           uptimeScore: 99.99,
  //           reviewsScore: 4.8,
  //           communityLinks: [{ label: "Consultation", url: "#" }],
  //           priceLine: "$750 (setup)",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "16",
  //   name: "YouTube Downloader",
  //   subheading: "Bulk download entire channels and playlists to your storage.",
  //   coverImage:
  //     "https://static1.anpoimages.com/wordpress/wp-content/uploads/2022/09/youtube-ap-hero-2.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-youtubedl-bulk-archive",
  //       title: "Bulk YouTube Content Archiving to OfficeX Cloud Storage",
  //       images: [],
  //       description: `
  //         <p>This offer provides a service for bulk downloading and archiving YouTube video and audio content directly into your Anonymous OfficeX cloud storage. Ideal for researchers, content creators, or businesses needing to retain large volumes of public YouTube data (e.g., competitor analysis, public sentiment, trend analysis) in a structured and accessible format. We can provide accompanying metadata in CSV format.</p>
  //         <p>Features include:</p>
  //         <ul>
  //           <li><strong>Bulk Video/Audio Downloads:</strong> Download entire YouTube channels, playlists, or specific video lists.</li>
  //           <li><strong>OfficeX Cloud Integration:</strong> Directly save downloaded content to your designated OfficeX cloud storage folders.</li>
  //           <li><strong>Metadata CSV Export:</strong> Receive a CSV file with video titles, descriptions, upload dates, views, and other relevant data.</li>
  //           <li><strong>Custom Quality & Format:</strong> Specify desired video quality (up to 4K) and audio formats (MP3, WAV).</li>
  //           <li><strong>Automated Archiving:</strong> Set up recurring downloads for continuously updated content.</li>
  //         </ul>
  //         <p>Build a comprehensive archive of YouTube content within your OfficeX ecosystem for research, analysis, or internal use. Ensure compliance with YouTube's terms of service and copyright laws.</p>
  //       `,
  //       price: 10,
  //       priceUnit: "/GB",
  //       priceExplanation: "per GB of downloaded and stored content",
  //       bookmarks: 250,
  //       avgCustomerLifetimeValue: 50,
  //       cumulativeSales: 12500,
  //       vendors: [
  //         {
  //           id: "youtubedl-vendor1",
  //           name: "Video Archiving Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VAS",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.3,
  //           communityLinks: [{ label: "FAQ", url: "#" }],
  //           priceLine: "$10/GB",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "tiktok",
  //   name: "Buy TikTok Accounts",
  //   subheading: "Scale social marketing with warmed healthy accounts",
  //   coverImage: "https://img-c.udemycdn.com/course/750x422/4890032_95a9_2.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-tiktok-analytics-csv",
  //       title: "Bulk Download TikTok Videos",
  //       images: [],
  //       description: `
  //         <p>This service allows you to extract detailed analytics and trend data from TikTok, delivering it as structured CSV files for analysis within your Anonymous OfficeX environment. Gain insights into video performance, hashtag trends, audience demographics, and popular sounds to inform your content strategy or market research.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Video Performance Data:</strong> Export metrics like views, likes, shares, comments, and watch time for your TikTok content.</li>
  //           <li><strong>Hashtag & Trend Analysis:</strong> Get CSVs on trending hashtags, popular sounds, and viral challenges.</li>
  //           <li><strong>Audience Demographics:</strong> Access aggregated audience data to understand your viewers better.</li>
  //           <li><strong>Competitor Analysis:</strong> Monitor and export data from public competitor profiles.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs ready for import into OfficeX Sheets for reporting and analysis.</li>
  //         </ul>
  //         <p>Leverage TikTok's vast dataset to drive your marketing decisions, all within your OfficeX suite.</p>
  //       `,
  //       price: 1,
  //       priceUnit: "/channel",
  //       priceExplanation:
  //         "monthly subscription for data extraction and reporting",
  //       bookmarks: 90,
  //       avgCustomerLifetimeValue: 800,
  //       cumulativeSales: 72000,
  //       vendors: [
  //         {
  //           id: "tiktok-vendor1",
  //           name: "Social Data Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDI",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Case Studies", url: "#" }],
  //           priceLine: "$250/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "exa-ai",
  //   name: "Exa AI Search",
  //   subheading: "Hyper-relevant lead prospecting using AI search & compilation",
  //   coverImage: "https://pbs.twimg.com/media/GwkR4Q6bUAAJKUR?format=png",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-exa-ai-web-data-csv",
  //       title: "Exa AI Web Data Extraction & CSV Export",
  //       images: [], // Will be populated with app.coverImage at runtime
  //       description: `
  //         <p>Integrate exa.ai's advanced AI-powered search capabilities with your Anonymous OfficeX environment to perform highly targeted web data extraction and receive results as structured CSV files. This service leverages exa.ai's ability to find and understand hyper-relevant information across the web, making it ideal for market research, competitive analysis, trend identification, and gathering specific data points for your OfficeX spreadsheets.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>AI-Powered Targeted Search:</strong> Utilize exa.ai to conduct deep, semantic searches across the web for specific information.</li>
  //           <li><strong>Automated Data Extraction:</strong> Automatically pull relevant text, numbers, links, and other data points from search results.</li>
  //           <li><strong>Structured CSV Output:</strong> Receive clean, organized CSV files tailored for easy import and analysis in OfficeX Sheets.</li>
  //           <li><strong>Customizable Search Queries:</strong> Define precise search parameters and criteria to get the exact data you need.</li>
  //           <li><strong>Scheduled Data Pulls:</strong> Set up recurring data extraction tasks to keep your datasets updated.</li>
  //         </ul>
  //         <p>Enhance your data intelligence by transforming the vastness of the web into actionable, structured CSV data, seamlessly integrated with your OfficeX suite.</p>
  //       `,
  //       price: 0.02,
  //       priceUnit: "/query",
  //       priceExplanation: "per AI-powered search query with data extraction",
  //       bookmarks: 80,
  //       avgCustomerLifetimeValue: 300,
  //       cumulativeSales: 24000,
  //       vendors: [
  //         {
  //           id: "exa-ai-vendor1",
  //           name: "AI Search Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ASS",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "API Docs", url: "#" }],
  //           priceLine: "$0.02/query",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "sproutgigs",
  //   name: "SproutGigs",
  //   subheading:
  //     "Earn money by completing micro-purchases like social media engagement.",
  //   coverImage:
  //     "https://prabumulihpos.bacakoran.co/upload/02dbaa6f8e781dc7585fb835dccf2abb.jpg", // Placeholder for a microtask-related image
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-sproutgigs-microtask-fulfillment",
  //       title: "Human Microtasks",
  //       images: [],
  //       description: `
  //         <p>This service offers fulfillment of various microtasks on SproutGigs, delivering structured data or completed tasks directly to your Anonymous OfficeX. Ideal for businesses needing rapid completion of repetitive digital tasks, data collection, content moderation, or simple verification processes.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Diverse Task Categories:</strong> Fulfill tasks like data entry, categorization, image tagging, content moderation, surveys, and more.</li>
  //           <li><strong>Scalable Workforce:</strong> Leverage a large pool of micro-taskers for high-volume task completion.</li>
  //           <li><strong>Quality Assurance:</strong> Implement checks to ensure accuracy and adherence to task instructions.</li>
  //           <li><strong>Rapid Turnaround:</strong> Achieve quick completion for time-sensitive projects.</li>
  //           <li><strong>Data Delivery to OfficeX:</strong> Receive clean, organized data or results directly in your OfficeX Sheets for further analysis, integration, or reporting.</li>
  //         </ul>
  //         <p>Streamline your workflows and gather valuable data efficiently by integrating SproutGigs microtask fulfillment into your OfficeX operations.</p>
  //       `,
  //       price: 0.03,
  //       priceUnit: "/task",
  //       priceExplanation: "per completed microtask",
  //       bookmarks: 120,
  //       avgCustomerLifetimeValue: 300,
  //       cumulativeSales: 35000,
  //       vendors: [
  //         {
  //           id: "sproutgigs-vendor1",
  //           name: "TaskFlow Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TFS",
  //           uptimeScore: 98.9,
  //           reviewsScore: 4.3,
  //           communityLinks: [{ label: "FAQs", url: "#" }],
  //           priceLine: "$0.01/task",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "facebook-marketplace",
  //   name: "Facebook Marketplace",
  //   subheading: "Pay someone to post more for you. Posting as a service.",
  //   coverImage: "https://juphy.com/wp-content/uploads/2023/05/image-51.png",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-fb-marketplace-listings-csv",
  //       title: "Facebook Marketplace Listing Data Extraction (CSV Export)",
  //       images: [],
  //       description: `
  //         <p>This service enables extraction of public listing data from Facebook Marketplace, providing it to your Anonymous OfficeX as structured CSV files. Ideal for market researchers, resellers, or businesses looking to analyze product trends, pricing strategies, or inventory availability within local or specific regions.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Targeted Listing Search:</strong> Extract data based on keywords, categories, price range, and location.</li>
  //           <li><strong>Detailed Listing Data:</strong> Capture product title, description, price, seller information, and condition.</li>
  //           <li><strong>Image URL Export:</strong> Include URLs to listing images for visual analysis.</li>
  //           <li><strong>Trend & Pricing Analysis:</strong> Use extracted data to identify pricing trends and popular items.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for detailed analysis.</li>
  //         </ul>
  //         <p>Gain a competitive edge by leveraging real-time marketplace data, formatted for easy use in your OfficeX spreadsheets.</p>
  //       `,
  //       price: 0.1,
  //       priceUnit: "/listing",
  //       priceExplanation: "per extracted listing record",
  //       bookmarks: 85,
  //       avgCustomerLifetimeValue: 200,
  //       cumulativeSales: 17000,
  //       vendors: [
  //         {
  //           id: "fb-marketplace-vendor1",
  //           name: "E-commerce Data Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ECDS",
  //           uptimeScore: 99.4,
  //           reviewsScore: 4.2,
  //           communityLinks: [{ label: "Client Portal", url: "#" }],
  //           priceLine: "$0.10/listing",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "linkedin",
  //   name: "LinkedIn Delegation",
  //   subheading: "Rent professional accounts to scale outreach & connections",
  //   coverImage:
  //     "https://www.codeur.com/blog/wp-content/uploads/2024/02/linkedin-top-voices-1-740x416.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-linkedin-lead-gen-csv",
  //       title: "Rent LinkedIn Accounts",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting targeted lead and company data from LinkedIn for your Anonymous OfficeX, delivered as organized CSV files. Ideal for sales teams, recruiters, and market researchers looking to build prospect lists, analyze industry trends, or gather competitive intelligence from the world's largest professional network.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Targeted Lead Extraction:</strong> Identify and extract professional profiles based on industry, role, location, and seniority.</li>
  //           <li><strong>Company Data Enrichment:</strong> Gather public company information including size, industry, location, and key employees.</li>
  //           <li><strong>Purchase Posting Data:</strong> Extract data from purchase postings for talent market analysis.</li>
  //           <li><strong>Network Mapping:</strong> Visualize connections and influence within specific professional networks (optional add-on).</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, structured CSVs ready for CRM import or analysis in OfficeX Sheets.</li>
  //         </ul>
  //         <p>Supercharge your outreach and market research efforts with precisely targeted LinkedIn data, seamlessly integrated into your OfficeX platform.</p>
  //       `,
  //       price: 30,
  //       priceUnit: "/month",
  //       priceExplanation: "per verified professional",
  //       bookmarks: 140,
  //       avgCustomerLifetimeValue: 600,
  //       cumulativeSales: 84000,
  //       vendors: [
  //         {
  //           id: "linkedin-vendor1",
  //           name: "Professional Data Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PDS",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "Success Stories", url: "#" }],
  //           priceLine: "$0.20/lead",
  //           viewPageLink: "#",
  //           requirements: JSON.stringify({
  //             field1: "value1",
  //           }),
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "uma-protocol",
  //   name: "UMA Protocol",
  //   subheading: "Verify marketplace purchases with decentralized oracles.",
  //   coverImage:
  //     "https://public.bnbstatic.com/static/academy/uploads-original/fc76576af82644fca04b60a46ad9dd39.png", // Placeholder image, replace with a UMA-specific one if available
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-uma-transaction-verification",
  //       title: "Marketplace Transaction Verification",
  //       images: [],
  //       description: `
  //         <p>Leverage the UMA Protocol's Optimistic Oracle for robust and decentralized verification of marketplace transactions within your Anonymous OfficeX ecosystem. This service provides a crowd-sourced mechanism to ensure the accuracy and integrity of transaction data, minimizing disputes and building trust.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Optimistic Verification:</strong> Transactions are optimistically assumed correct, with a challenge period for disputes.</li>
  //           <li><strong>Decentralized Dispute Resolution:</strong> UMA token holders vote to resolve disputed assertions, ensuring unbiased outcomes.</li>
  //           <li><strong>Cost-Efficient:</strong> Verifications are only escalated to the full dispute mechanism when challenged, saving on gas fees.</li>
  //           <li><strong>Enhanced Trust:</strong> Provides a transparent and verifiable layer of security for your marketplace transactions.</li>
  //           <li><strong>Integration with OfficeX:</strong> Receive verification statuses and dispute outcomes directly within your OfficeX applications.</li>
  //         </ul>
  //         <p>Build a more secure and trustworthy marketplace with UMA Protocol's decentralized verification capabilities.</p>
  //       `,
  //       price: 2,
  //       priceUnit: "/verification",
  //       priceExplanation: "per crowd verification via Optimistic Oracle",
  //       bookmarks: Math.floor(Math.random() * 100) + 20, // Random bookmarks for a new app
  //       avgCustomerLifetimeValue: Math.floor(Math.random() * 500) + 100, // Random CLV
  //       cumulativeSales: Math.floor(Math.random() * 50000) + 5000, // Random cumulative sales
  //       vendors: [
  //         {
  //           id: "uma-vendor1",
  //           name: "VeriTrust Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VTS",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.8,
  //           communityLinks: [
  //             { label: "UMA Docs", url: "https://docs.uma.xyz/" },
  //           ],
  //           priceLine: "$2/verification",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "tiktok",
  //   name: "TikTok Downloader",
  //   subheading:
  //     "Short-form video platform.\nCreate and discover viral content.",
  //   coverImage: "https://img-c.udemycdn.com/course/750x422/4890032_95a9_2.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-tiktok-analytics-csv",
  //       title: "Bulk Download TikTok Videos",
  //       images: [],
  //       description: `
  //         <p>This service allows you to extract detailed analytics and trend data from TikTok, delivering it as structured CSV files for analysis within your Anonymous OfficeX environment. Gain insights into video performance, hashtag trends, audience demographics, and popular sounds to inform your content strategy or market research.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Video Performance Data:</strong> Export metrics like views, likes, shares, comments, and watch time for your TikTok content.</li>
  //           <li><strong>Hashtag & Trend Analysis:</strong> Get CSVs on trending hashtags, popular sounds, and viral challenges.</li>
  //           <li><strong>Audience Demographics:</strong> Access aggregated audience data to understand your viewers better.</li>
  //           <li><strong>Competitor Analysis:</strong> Monitor and export data from public competitor profiles.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs ready for import into OfficeX Sheets for reporting and analysis.</li>
  //         </ul>
  //         <p>Leverage TikTok's vast dataset to drive your marketing decisions, all within your OfficeX suite.</p>
  //       `,
  //       price: 1,
  //       priceUnit: "/channel",
  //       priceExplanation:
  //         "monthly subscription for data extraction and reporting",
  //       bookmarks: 90,
  //       avgCustomerLifetimeValue: 800,
  //       cumulativeSales: 72000,
  //       vendors: [
  //         {
  //           id: "tiktok-vendor1",
  //           name: "Social Data Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDI",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Case Studies", url: "#" }],
  //           priceLine: "$250/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "13",
  //   name: "Spreadsheets",
  //   subheading: "Powerful tool for data organization and analysis. CSV dumps",
  //   coverImage:
  //     "https://static1.howtogeekimages.com/wordpress/wp-content/uploads/2024/08/an-excel-spreadsheet-displaying-a-heat-map-with-the-excel-logo-in-front-of-it.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-spreadsheet-ai-csv-workflows",
  //       title:
  //         "AI-Driven Workflows for CSV Uploads in Anonymous OfficeX Sheets",
  //       images: [],
  //       description: `
  //         <p>This offer provides advanced services to build AI-driven workflows directly within Anonymous OfficeX Spreadsheets, specifically designed for handling CSV data uploads. Automate tasks like data cleaning, categorization, enrichment via web scraping, or even trigger AI models for predictive analysis immediately after a CSV is uploaded to your cloud storage or imported into a sheet.</p>
  //         <p>Services include:</p>
  //         <ul>
  //           <li><strong>Automated CSV Data Cleaning:</strong> AI identifies and corrects inconsistencies, duplicates, or missing values upon upload.</li>
  //           <li><strong>Data Enrichment (Web Scraping):</strong> Automatically pull additional data from the web based on CSV content (e.g., company details from names).</li>
  //           <li><strong>AI Categorization & Tagging:</strong> Use AI to classify data points within your CSVs for better organization.</li>
  //           <li><strong>Custom Macro/Script Development:</strong> Build powerful automation scripts (e.g., Google Apps Script, VBA for compatibility) to react to CSV changes.</li>
  //           <li><strong>Dashboard Integration:</strong> Update interactive dashboards automatically with newly uploaded CSV data.</li>
  //         </ul>
  //         <p>Transform your spreadsheets into intelligent, automated data processing hubs for all your CSV-based workflows.</p>
  //       `,
  //       price: 400, // Higher for AI/automation integration
  //       priceUnit: "/workflow",
  //       priceExplanation: "starting price for custom AI-powered CSV workflows",
  //       bookmarks: 150,
  //       avgCustomerLifetimeValue: 1200,
  //       cumulativeSales: 180000,
  //       vendors: [
  //         {
  //           id: "spreadsheet-vendor1",
  //           name: "Data Flow Gurus",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DFG",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Samples", url: "#" }],
  //           priceLine: "From $400",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "15",
  //   name: "Telegram Agent",
  //   subheading:
  //     "Secure messaging and voice calls.\nConnect with friends and family.",
  //   coverImage:
  //     "https://mir-s3-cdn-cf.behance.net/project_modules/1400/3d89aa78088397.5c9a9eb73dabf.png",
  //   isFeatured: false,
  //   offers: [
  //     {
  //       id: "offer-telegram-csv-notifications",
  //       title: "Telegram Media Archive Bot",
  //       images: [],
  //       description:
  //         "<p>This offer provides a custom Telegram bot designed to help you archive media and files from your Telegram chats directly to your OfficeX cloud storage. Never lose important photos, videos, or documents shared in your Telegram conversations. The bot automates the process of saving media to your designated OfficeX-connected cloud folders, keeping your valuable data organized and accessible.</p><p>Features include:</p><ul><li><strong>Automated Media Archiving:</strong> Automatically save photos, videos, and documents from Telegram chats to OfficeX storage.</li><li><strong>Configurable Storage Locations:</strong> Choose specific OfficeX cloud folders for different types of media or chats.</li><li><strong>Real-time Sync:</strong> Media is archived as it's shared, ensuring you have the latest content.</li><li><strong>Secure & Private:</strong> Ensures your media is securely transferred and stored in your private OfficeX environment.</li><li><strong>Easy Setup:</strong> Simple installation and configuration to link your Telegram with OfficeX storage.</li></ul><p>Transform your Telegram into a powerful media archiving tool, securing all your shared content within your Anonymous OfficeX platform.</p>",
  //       price: 10,
  //       priceUnit: "/month",
  //       priceExplanation:
  //         "starting price for custom bot development and integration",
  //       bookmarks: 150,
  //       bookmarkUrl: "#",
  //       avgCustomerLifetimeValue: 750,
  //       cumulativeSales: 112500,
  //       callToAction: "Install App",
  //       vendors: [
  //         {
  //           id: "telegram-vendor1",
  //           name: "Bot Builders Co.",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BBC",
  //           needs_auth_installation: true,
  //           aboutUrl: "#",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.5,
  //           communityLinks: [
  //             {
  //               label: "Portfolio",
  //               url: "#",
  //             },
  //           ],
  //           priceLine: "From $10/month",
  //           viewPageLink: "#",
  //           verificationUrl: "#",
  //           auth_installation_url: "https://obedient-airline-13.webhook.cool",
  //           description:
  //             "We promise the best results and have a 30 day money back guarantee.",
  //           callToAction: "Install App",
  //           requirements: [
  //             {
  //               id: "telegram-vendor1-requirement1",
  //               title: "Group ID",
  //               explanation: "Select the group to install the app to",
  //               type: IDPrefixEnum.Group,
  //               required: true,
  //             },
  //             {
  //               id: "telegram-vendor1-requirement2",
  //               title: "Disk ID",
  //               explanation: "Select the disk to install the app to",
  //               type: IDPrefixEnum.Disk,
  //               required: true,
  //             },
  //             {
  //               id: "telegram-vendor1-requirement3",
  //               title: "Disk Type",
  //               explanation: "Select the disk type",
  //               type: DiskTypeEnum.AwsBucket,
  //               required: true,
  //             },
  //             {
  //               id: "telegram-vendor1-requirement4",
  //               title: "Folder ID",
  //               explanation: "Select the folder to install the app to",
  //               type: IDPrefixEnum.Folder,
  //               required: true,
  //             },
  //           ],
  //           depositOptions: [
  //             {
  //               title: "USDC on Base",
  //               amount: 60,
  //               depositAddress: "0x3e3715629f3Df9f315B647f6BedF91615A3BAF65",
  //               tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  //               tokenName: "USDC",
  //               tokenSymbol: "USDC",
  //               tokenDecimals: 6,
  //               explanation: "Deposit USDC to purchase the app",
  //               chain: "BASE_L2",
  //               depositUrlCheckout: "",
  //               chainExplorerUrl: "https://basescan.org/",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "5",
  //   name: "Uniswap",
  //   subheading:
  //     "Decentralized exchange for cryptocurrency trading.\nSwap tokens securely.",
  //   coverImage:
  //     "https://www.newsbtc.com/wp-content/uploads/2024/11/Uniswap-from-LinkedIn.jpg?fit=800%2C450",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-uniswap-data-analytics",
  //       title:
  //         "DeFi Data Analytics for OfficeX: Uniswap Trading & LP CSV Exports",
  //       images: [],
  //       description: `
  //         <p>This offer provides specialized data analytics services focused on Decentralized Finance (DeFi) platforms like Uniswap. We help you scrape and organize your on-chain transaction data, liquidity provision activities, and yield farming metrics into comprehensive CSV files, ready for detailed analysis within your Anonymous OfficeX spreadsheets. Understand your crypto portfolio performance, impermanent loss, and fee generation with clear, structured data.</p>
  //         <p>What you'll get:</p>
  //         <ul>
  //           <li><strong>Uniswap Transaction CSVs:</strong> Export detailed records of your swaps, liquidity additions, and removals.</li>
  //           <li><strong>Yield Farming Performance Reports:</strong> Generate CSVs outlining your earnings and impermanent loss from various liquidity pools.</li>
  //           <li><strong>Custom Data Queries:</strong> Request specific on-chain data to be pulled and formatted into CSV.</li>
  //           <li><strong>Integration Readiness:</strong> CSV outputs are optimized for easy import and analysis in OfficeX Sheets.</li>
  //           <li><strong>Expert Analysis & Insights:</strong> Optional add-on for a human analyst to provide insights from your data.</li>
  //         </ul>
  //         <p>Gain a clearer financial picture of your DeFi activities with structured data for your OfficeX cloud office suite.</p>
  //       `,
  //       price: 199, // Higher for specialized blockchain data
  //       priceUnit: "/report",
  //       priceExplanation: "per custom data report/CSV export",
  //       bookmarks: 180,
  //       avgCustomerLifetimeValue: 250,
  //       cumulativeSales: 45000,
  //       vendors: [
  //         {
  //           id: "uniswap-vendor1",
  //           name: "DeFi Data Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DDI",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "Webinars", url: "#" }],
  //           priceLine: "$199/report",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "3",
  //   name: "n8n",
  //   subheading:
  //     "Workflow automation for developers.\nIntegrate apps and services.",
  //   coverImage:
  //     "https://blog.n8n.io/content/images/size/w1200/2024/10/ai-workflow-automationA--1-.png",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-n8n-ai-csv-integration",
  //       title: "n8n Automation for AI Web Scraping & CSV Processing in OfficeX",
  //       images: [],
  //       description: `
  //         <p>This offer provides expert development of custom n8n workflows specifically tailored for your Anonymous OfficeX environment, focusing on AI-powered web scraping, automated CSV data dumps, and actions triggered by CSV uploads. Build complex, multi-step automations that interact with websites, extract data, transform it into CSVs, and then use that data to update or trigger actions within your OfficeX documents and cloud storage.</p>
  //         <p>Services include:</p>
  //         <ul>
  //           <li><strong>AI Web Scraping Workflows:</strong> Design n8n workflows that use AI to intelligently extract data from websites, even complex or unstructured content.</li>
  //           <li><strong>Automated CSV Generation:</strong> Convert scraped data or other inputs into clean, formatted CSV files for OfficeX import.</li>
  //           <li><strong>CSV Upload Triggers:</strong> Create workflows that automatically run (e.g., data validation, processing, notification) when a CSV is uploaded to OfficeX cloud storage.</li>
  //           <li><strong>Bulk Data Actions:</strong> Implement workflows for bulk downloading specific documents or data sets from OfficeX, based on CSV instructions.</li>
  //           <li><strong>Integration with OfficeX APIs:</strong> Connect n8n directly with OfficeX's underlying APIs for seamless data flow.</li>
  //         </ul>
  //         <p>Supercharge your OfficeX operations with custom n8n automations for intelligent data acquisition and processing.</p>
  //       `,
  //       price: 600, // Higher for complex AI/web scraping integrations
  //       priceUnit: "/workflow",
  //       priceExplanation: "starting price per custom advanced workflow",
  //       bookmarks: 100,
  //       avgCustomerLifetimeValue: 1500,
  //       cumulativeSales: 150000,
  //       vendors: [
  //         {
  //           id: "n8n-vendor1",
  //           name: "Automation Architects",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AA",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.8,
  //           communityLinks: [{ label: "Case Studies", url: "#" }],
  //           priceLine: "From $600",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "32-places",
  //   name: "Google Maps Reviews",
  //   subheading:
  //     "Prospect leads from local businesses and places.\nExplore your city.",
  //   coverImage:
  //     "https://cdn.mappr.co/wp-content/uploads/2022/03/google-places-api-alternatives.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-gmaps-ai-lead-generation",
  //       title: "AI-Powered Google Maps Business Lead Generation & CSV Export",
  //       images: [],
  //       description: `
  //         <p>This offer provides an AI-enhanced service for generating targeted business leads from Google Maps, delivering them directly to your Anonymous OfficeX as organized CSV dumps. Leverage AI to refine search criteria, filter for high-potential leads, and extract richer data points (e.g., website contact info, social media links) beyond standard listings, all formatted for immediate use in your OfficeX spreadsheets or CRM.</p>
  //         <p>What you'll get:</p>
  //         <ul>
  //           <li><strong>AI-Optimized Lead Filtering:</strong> Use AI to identify businesses matching complex criteria (e.g., specific keywords in reviews, business activity signals).</li>
  //           <li><strong>Comprehensive Data Points:</strong> Extract business name, address, phone, website, email (if publicly available), social media links, reviews count, and ratings.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, structured CSV files ready for import into OfficeX Sheets for sales outreach or market analysis.</li>
  //           <li><strong>Bulk Download & Automation:</strong> Option to schedule recurring lead generation and automated CSV delivery to your cloud storage.</li>
  //           <li><strong>Geospatial Data Visualization (Add-on):</strong> Integrate extracted lead data with mapping tools (optional).</li>
  //         </ul>
  //         <p>Fill your sales pipeline with high-quality, AI-curated local business leads, delivered in a convenient CSV format for your OfficeX platform.</p>
  //       `,
  //       price: 0.15, // Higher for AI-enhanced extraction
  //       priceUnit: "/lead",
  //       priceExplanation: "per verified and AI-enriched lead record",
  //       bookmarks: 180,
  //       avgCustomerLifetimeValue: 400,
  //       cumulativeSales: 72000,
  //       vendors: [
  //         {
  //           id: "gmaps-vendor1",
  //           name: "AI Lead Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ALS",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "Testimonials", url: "#" }],
  //           priceLine: "$0.15/lead",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "1",
  //   name: "Dmail",
  //   subheading:
  //     "Secure and decentralized email communication.\nProtect your privacy.",
  //   coverImage: "https://dmail.ai/assets/2-6c029453.png",
  //   isFeatured: true,
  //   offers: [
  //     {
  //       id: "offer-dmail-csv-email-automation",
  //       title: "Dmail Integration for CSV-Driven Bulk Email Campaigns",
  //       images: [],
  //       description: `
  //         <p>Integrate Dmail's secure, decentralized email capabilities with your Anonymous OfficeX platform to launch CSV-driven bulk email campaigns. This offer allows you to upload recipient lists and email content via CSV files, then leverage Dmail for secure, privacy-focused outreach. Ideal for newsletters, transactional emails, or secure communications where privacy and decentralization are paramount.</p>
  //         <p>Benefits include:</p>
  //         <ul>
  //           <li><strong>CSV-to-Email Automation:</strong> Use recipient lists and personalized content from OfficeX CSVs to send bulk emails via Dmail.</li>
  //           <li><strong>Decentralized & Secure Sending:</strong> Leverage Dmail's Web3 infrastructure for enhanced privacy and censorship resistance.</li>
  //           <li><strong>Personalized Campaigns:</strong> Dynamically insert data from your CSV into email templates for personalized outreach.</li>
  //           <li><strong>Attachment Support:</strong> Attach documents from your OfficeX cloud storage to Dmail emails.</li>
  //           <li><strong>Delivery Reports (CSV):</strong> Receive analytics and delivery statuses in CSV format for performance tracking.</li>
  //         </ul>
  //         <p>Execute secure and privacy-centric email campaigns directly from your OfficeX data, powered by Dmail.</p>
  //       `,
  //       price: 0.01,
  //       priceUnit: "/email",
  //       priceExplanation: "per bulk email sent via Dmail",
  //       bookmarks: 130,
  //       avgCustomerLifetimeValue: 100,
  //       cumulativeSales: 13000,
  //       vendors: [
  //         {
  //           id: "dmail-vendor1",
  //           name: "Dmail Official",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DO",
  //           uptimeScore: 99.99,
  //           reviewsScore: 4.9,
  //           communityLinks: [{ label: "Docs", url: "#" }],
  //           priceLine: "$0.01/email",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "instagram",
  //   name: "Instagram",
  //   subheading: "Photo and video sharing social network.\nConnect visually.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-instagram-data-scraper-csv",
  //       title: "Instagram Profile & Engagement Data Scraper (CSV Export)",
  //       images: [],
  //       description: `
  //         <p>This service provides tools for extracting public data from Instagram profiles, posts, and engagement metrics, delivering the insights directly to your Anonymous OfficeX as structured CSV files. Ideal for social media marketers, influencers, or businesses looking to analyze trends, monitor competitor activity, or identify potential collaborators.</p>
  //         <p>Features include:</p>
  //         <ul>
  //           <li><strong>Profile Data Export:</strong> Scrape public profile information like follower count, following count, bio, and contact details.</li>
  //           <li><strong>Post Engagement Metrics:</strong> Extract likes, comments, and shares for specified posts.</li>
  //           <li><strong>Hashtag & Location Data:</strong> Gather data related to posts using specific hashtags or geotags.</li>
  //           <li><strong>Comment & Mention Analysis:</strong> Export comments and mentions for sentiment analysis or trend identification.</li>
  //           <li><strong>CSV Output for OfficeX:</strong> Receive clean, formatted CSVs for easy import into OfficeX Sheets.</li>
  //         </ul>
  //         <p>Transform raw Instagram data into actionable insights for your marketing and content strategies within OfficeX.</p>
  //       `,
  //       price: 0.08,
  //       priceUnit: "/record",
  //       priceExplanation: "per data record (e.g., profile, post, comment)",
  //       bookmarks: 110,
  //       avgCustomerLifetimeValue: 300,
  //       cumulativeSales: 33000,
  //       vendors: [
  //         {
  //           id: "instagram-vendor1",
  //           name: "Social Metrics Pro",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SMP",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.4,
  //           communityLinks: [{ label: "Blog", url: "#" }],
  //           priceLine: "$0.08/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "4",
  //   name: "ChatGPT",
  //   subheading: "AI-powered conversational assistant.\nGet instant answers.",
  //   coverImage:
  //     "https://www.designmantic.com/blog/wp-content/uploads/2023/04/ChatGPT-1280x720.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-chatgpt-csv-prompting",
  //       title: "ChatGPT for CSV-Driven Document Generation & AI Actions",
  //       images: [], // Will be populated with app.coverImage at runtime
  //       description: `
  //         <p>Integrate ChatGPT's advanced AI capabilities with your Anonymous OfficeX workflows to enable document generation and AI actions driven by CSV data uploads. This service allows you to use content from your spreadsheets as prompts for ChatGPT, generating reports, drafting emails, summarizing data, or performing complex text-based tasks directly within your cloud office environment. Upload a CSV, and let AI generate structured documents or perform bulk text operations.</p>
  //         <p>Benefits include:</p>
  //         <ul>
  //           <li><strong>CSV-to-Document Automation:</strong> Generate reports, contracts, or personalized emails by feeding data from OfficeX CSVs to ChatGPT.</li>
  //           <li><strong>Bulk Content Generation:</strong> Create multiple variations of text content based on rows in a spreadsheet (e.g., product descriptions, marketing copy).</li>
  //           <li><strong>AI-Powered Data Summarization:</strong> Summarize large textual datasets within your CSVs into concise reports or overviews.</li>
  //           <li><strong>Semantic Search & Q&A:</strong> Use natural language to query your CSV data, leveraging ChatGPT's understanding.</li>
  //           <li><strong>Content Refinement & Editing:</strong> Leverage AI to improve grammar, style, or tone of documents generated from data.</li>
  //         </ul>
  //         <p>Transform your OfficeX CSV data into dynamic, AI-generated text and documents, enhancing productivity and content creation.</p>
  //       `,
  //       price: 30, // Higher for integrated AI services
  //       priceUnit: "/month",
  //       priceExplanation: "flat rate for API access and integrated workflows",
  //       bookmarks: 400,
  //       avgCustomerLifetimeValue: 360,
  //       cumulativeSales: 144000,
  //       vendors: [
  //         {
  //           id: "chat-vendor1",
  //           name: "AI Solutions Direct",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ASD",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "FAQ", url: "#" }],
  //           priceLine: "$30/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "lastpass",
  //   name: "LastPass",
  //   subheading:
  //     "Password manager.\nSecurely store and access your credentials.",
  //   coverImage: "https://images.unsplash.com/photo-1629744415843-0b0b0b0b0b0b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-lastpass-secure-csv-import",
  //       title: "Secure LastPass CSV Password Import & Audit",
  //       images: [],
  //       description: `
  //         <p>This offer facilitates secure import and auditing of LastPass-exported CSV password data into a protected environment linked with your Anonymous OfficeX. We help you securely migrate, organize, and analyze your password vault data (e.g., for compliance, identifying weak passwords, or consolidating logins) while ensuring maximum privacy and security.</p>
  //         <p>Services include:</p>
  //         <ul>
  //           <li><strong>Secure CSV Import:</strong> Guided process for safely importing LastPass CSV exports.</li>
  //           <li><strong>Password Audit & Analysis:</strong> Identify weak, duplicate, or compromised passwords within your dataset.</li>
  //           <li><strong>Categorization & Organization:</strong> Help structure your password data within OfficeX for easy management.</li>
  //           <li><strong>Security Best Practices:</strong> Consultation on best practices for managing sensitive credential data.</li>
  //           <li><strong>Encrypted Storage Options:</strong> Advise on and implement highly encrypted storage solutions for your credential CSVs.</li>
  //         </ul>
  //         <p>Enhance your organization's digital security by efficiently managing and auditing your LastPass credential data in a secure OfficeX-compatible format.</p>
  //       `,
  //       price: 150,
  //       priceUnit: "/audit",
  //       priceExplanation: "per secure import and audit session",
  //       bookmarks: 70,
  //       avgCustomerLifetimeValue: 400,
  //       cumulativeSales: 28000,
  //       vendors: [
  //         {
  //           id: "lastpass-vendor1",
  //           name: "CyberSafe Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CSS",
  //           uptimeScore: 99.99,
  //           reviewsScore: 4.8,
  //           communityLinks: [{ label: "Security Whitepapers", url: "#" }],
  //           priceLine: "$150/audit",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "reddit",
  //   name: "Reddit",
  //   subheading:
  //     "Community-driven news and discussion platform.\nExplore diverse topics.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-reddit-sentiment-csv",
  //       title: "Reddit Sentiment Analysis & Trend Data (CSV Export)",
  //       images: [],
  //       description: `
  //         <p>This service offers in-depth sentiment analysis and trend data extraction from Reddit, delivering valuable insights as structured CSV files to your Anonymous OfficeX. Monitor brand mentions, public opinion, trending topics, and community discussions to inform your marketing, product development, or public relations strategies.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Keyword & Subreddit Monitoring:</strong> Track specific keywords, phrases, or subreddits for relevant discussions.</li>
  //           <li><strong>Sentiment Analysis:</strong> Categorize public sentiment (positive, negative, neutral) regarding your brand, products, or topics.</li>
  //           <li><strong>Trend Identification:</strong> Identify emerging trends and viral content across Reddit communities.</li>
  //           <li><strong>User Engagement Metrics:</strong> Extract upvotes, comments, and share counts for posts and comments.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive organized CSVs for easy import into OfficeX Sheets for further analysis and reporting.</li>
  //         </ul>
  //         <p>Uncover the pulse of online communities and gain competitive intelligence by integrating Reddit data into your OfficeX workflows.</p>
  //       `,
  //       price: 300,
  //       priceUnit: "/month",
  //       priceExplanation:
  //         "monthly subscription for Reddit data monitoring and export",
  //       bookmarks: 100,
  //       avgCustomerLifetimeValue: 900,
  //       cumulativeSales: 90000,
  //       vendors: [
  //         {
  //           id: "reddit-vendor1",
  //           name: "Community Insights Lab",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CIL",
  //           uptimeScore: 99.5,
  //           reviewsScore: 4.3,
  //           communityLinks: [{ label: "API Docs", url: "#" }],
  //           priceLine: "$300/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "discord",
  //   name: "Discord",
  //   subheading:
  //     "Voice, video, and text chat for communities.\nConnect with groups.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-discord-community-csv",
  //       title: "Discord Community Activity & Sentiment Analysis (CSV Export)",
  //       images: [],
  //       description: `
  //         <p>This service provides tools for extracting and analyzing public activity and sentiment from Discord servers, delivering the insights as structured CSV files to your Anonymous OfficeX. Monitor discussions, identify key community members, track sentiment around specific topics or products, and understand engagement patterns for community management, market research, or brand monitoring.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Server & Channel Monitoring:</strong> Track activity within specified public Discord servers and channels.</li>
  //           <li><strong>Message & User Data:</strong> Extract message content, user IDs, timestamps, and reaction counts.</li>
  //           <li><strong>Sentiment Analysis:</strong> Apply AI to categorize the sentiment of messages (positive, negative, neutral).</li>
  //           <li><strong>Keyword & Topic Tracking:</strong> Monitor discussions around specific keywords or emerging topics.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for detailed reporting.</li>
  //         </ul>
  //         <p>Turn raw Discord chatter into actionable data points for your strategic planning within the OfficeX environment.</p>
  //       `,
  //       price: 400,
  //       priceUnit: "/month",
  //       priceExplanation:
  //         "monthly subscription for Discord data monitoring and export",
  //       bookmarks: 60,
  //       avgCustomerLifetimeValue: 1200,
  //       cumulativeSales: 72000,
  //       vendors: [
  //         {
  //           id: "discord-vendor1",
  //           name: "Community Data Experts",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CDE",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.4,
  //           communityLinks: [{ label: "Support Chat", url: "#" }],
  //           priceLine: "$400/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "pinterest",
  //   name: "Pinterest",
  //   subheading: "Visual discovery engine.\nFind ideas and inspiration.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-pinterest-trend-csv",
  //       title: "Pinterest Trend & Idea Pin Data Extraction (CSV Export)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting trending visual content data and idea pin insights from Pinterest, delivering them as structured CSV files to your Anonymous OfficeX. Ideal for content creators, marketers, and product developers to identify visual trends, popular product ideas, and user preferences to inform their creative and business strategies.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Trending Topic Extraction:</strong> Identify popular and emerging visual trends across Pinterest categories.</li>
  //           <li><strong>Idea Pin Data:</strong> Extract data from Idea Pins, including titles, descriptions, and engagement metrics.</li>
  //           <li><strong>Keyword & Category Analysis:</strong> Gather data related to specific keywords, themes, and product categories.</li>
  //           <li><strong>Image & Video URLs:</strong> Include URLs to pins for visual reference and content analysis.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for easy import into OfficeX Sheets for visual trend analysis.</li>
  //         </ul>
  //         <p>Unlock the power of visual trends and consumer inspiration by integrating Pinterest data into your OfficeX workflows.</p>
  //       `,
  //       price: 0.05,
  //       priceUnit: "/pin",
  //       priceExplanation: "per extracted trending pin or idea pin record",
  //       bookmarks: 75,
  //       avgCustomerLifetimeValue: 250,
  //       cumulativeSales: 18750,
  //       vendors: [
  //         {
  //           id: "pinterest-vendor1",
  //           name: "Visual Trend Analytics",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VTA",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Portfolio", url: "#" }],
  //           priceLine: "$0.05/pin",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "github",
  //   name: "GitHub",
  //   subheading:
  //     "Developer platform for version control and collaboration.\nBuild software.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-github-repo-data-csv",
  //       title: "GitHub Repository & Developer Data Extraction (CSV Export)",
  //       images: [],
  //       description: `
  //         <p>This service provides tools for extracting public data from GitHub repositories and developer profiles, delivering insights as structured CSV files to your Anonymous OfficeX. Ideal for recruiters, researchers, or project managers to analyze open-source projects, track developer activity, or identify potential collaborators and talent.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Repository Metrics:</strong> Extract data on stars, forks, issues, pull requests, and commit activity for public repos.</li>
  //           <li><strong>Developer Profile Data:</strong> Gather public information on developers, their contributions, and spoken languages.</li>
  //           <li><strong>Codebase Analysis (Metadata):</strong> Extract metadata about code languages used and file structures.</li>
  //           <li><strong>Issue & Pull Request Tracking:</strong> Monitor and export data on open/closed issues and pull requests.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for project management or talent sourcing.</li>
  //         </ul>
  //         <p>Gain a data-driven perspective on the open-source world by integrating GitHub data into your OfficeX environment.</p>
  //       `,
  //       price: 0.12,
  //       priceUnit: "/record",
  //       priceExplanation: "per extracted repository or developer record",
  //       bookmarks: 95,
  //       avgCustomerLifetimeValue: 400,
  //       cumulativeSales: 38000,
  //       vendors: [
  //         {
  //           id: "github-vendor1",
  //           name: "DevData Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DDS",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Documentation", url: "#" }],
  //           priceLine: "$0.12/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "sendgrid",
  //   name: "SendGrid",
  //   subheading:
  //     "Email marketing and transactional email service.\nDeliver emails reliably.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-sendgrid-email-logs-csv",
  //       title: "SendGrid Email Log & Analytics Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of detailed email logs and analytics from SendGrid, delivering them as structured CSV files to your Anonymous OfficeX. Gain comprehensive insights into your email campaign performance, delivery rates, bounces, clicks, and opens for in-depth analysis and reporting within your spreadsheets.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Detailed Email Event Logs:</strong> Export data on delivered, opened, clicked, bounced, and unsubscribed emails.</li>
  //           <li><strong>Campaign Performance Metrics:</strong> Gather aggregated data for specific email campaigns or automation.</li>
  //           <li><strong>Recipient Engagement Data:</strong> Track individual recipient activity for personalized follow-ups.</li>
  //           <li><strong>Error & Bounce Analysis:</strong> Identify reasons for non-delivery and improve email deliverability.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for reporting and optimization.</li>
  //         </ul>
  //         <p>Optimize your email marketing and transactional communications with granular SendGrid data, seamlessly integrated into your OfficeX analytics.</p>
  //       `,
  //       price: 200,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for SendGrid data export",
  //       bookmarks: 80,
  //       avgCustomerLifetimeValue: 500,
  //       cumulativeSales: 40000,
  //       vendors: [
  //         {
  //           id: "sendgrid-vendor1",
  //           name: "Email Analytics Hub",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EAH",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "Help Center", url: "#" }],
  //           priceLine: "$200/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "twilio",
  //   name: "Twilio",
  //   subheading:
  //     "Cloud communications platform.\nAdd messaging, voice, and video.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-twilio-cdr-csv",
  //       title: "Twilio Call & SMS Log (CDR) Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of detailed Call Detail Records (CDRs) and SMS logs from Twilio, delivering them as structured CSV files to your Anonymous OfficeX. Analyze your communication patterns, track call durations, message statuses, costs, and identify trends for optimizing your customer interactions and communication workflows.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Call Log Export:</strong> Extract data on incoming/outgoing calls, duration, status, and associated numbers.</li>
  //           <li><strong>SMS Log Export:</strong> Gather data on sent/received messages, status, and content (metadata only for privacy).</li>
  //           <li><strong>Cost Analysis:</strong> Track communication costs per call or message for budget management.</li>
  //           <li><strong>Communication Pattern Analysis:</strong> Identify peak usage times, common destinations, or frequent contacts.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for reporting and optimization.</li>
  //         </ul>
  //         <p>Gain a clear overview of your Twilio-powered communications with granular data, seamlessly integrated into your OfficeX analytics.</p>
  //       `,
  //       price: 0.01,
  //       priceUnit: "/record",
  //       priceExplanation: "per call or SMS record extracted",
  //       bookmarks: 65,
  //       avgCustomerLifetimeValue: 300,
  //       cumulativeSales: 19500,
  //       vendors: [
  //         {
  //           id: "twilio-vendor1",
  //           name: "CommData Integrators",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CDI",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Case Studies", url: "#" }],
  //           priceLine: "$0.01/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "deepseek",
  //   name: "Deepseek AI",
  //   subheading:
  //     "Advanced AI models for code and chat.\nBoost your productivity.",
  //   coverImage:
  //     "https://hbr.org/resources/images/article_assets/2025/03/Apr25_02_1144347670.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-deepseek-ai-code-analysis-csv",
  //       title:
  //         "Deepseek AI for Codebase Analysis & Data Export (CSV) to OfficeX",
  //       images: [],
  //       description: `
  //         <p>This offer integrates Deepseek AI's advanced code analysis capabilities with your Anonymous OfficeX environment, enabling the processing of code repositories and delivering insights as structured CSV files. Ideal for software development teams, auditors, or researchers needing to analyze codebase structure, identify vulnerabilities, extract function lists, or track code quality metrics.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Codebase Structure Analysis:</strong> Generate CSVs outlining file structure, module dependencies, and function calls.</li>
  //           <li><strong>Vulnerability Scanning (Metadata):</strong> Identify potential security hotspots and list them in CSV reports.</li>
  //           <li><strong>Code Quality Metrics:</strong> Extract data on code complexity, maintainability, and test coverage.</li>
  //           <li><strong>Function & Variable Extraction:</strong> Create CSV lists of functions, variables, and their usage within the codebase.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for project management or auditing.</li>
  //         </ul>
  //         <p>Gain deep, AI-driven insights into your codebases, transforming raw code into actionable data for your OfficeX development workflows.</p>
  //       `,
  //       price: 0.03,
  //       priceUnit: "/1K tokens",
  //       priceExplanation: "for AI processing of code tokens",
  //       bookmarks: 55,
  //       avgCustomerLifetimeValue: 800,
  //       cumulativeSales: 44000,
  //       vendors: [
  //         {
  //           id: "deepseek-vendor1",
  //           name: "AI Code Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ACI",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.8,
  //           communityLinks: [{ label: "API Docs", url: "#" }],
  //           priceLine: "$0.03/1K tokens",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "semrush",
  //   name: "Semrush",
  //   subheading:
  //     "Online visibility management and content marketing SaaS platform.\nImprove your SEO.",
  //   coverImage:
  //     "https://www.pagetraffic.in/wp-content/uploads/2022/05/semrush-review-adn-guide.jpg",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-semrush-seo-data-csv",
  //       title: "Semrush SEO & Competitor Data Export (CSV) to OfficeX",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of comprehensive SEO and competitor data from Semrush, delivering it as structured CSV files to your Anonymous OfficeX. Gain deep insights into keyword rankings, organic traffic, backlink profiles, competitor strategies, and content performance for in-depth analysis and reporting within your spreadsheets.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Keyword Ranking & Traffic Data:</strong> Export current and historical keyword positions and estimated organic traffic.</li>
  //           <li><strong>Competitor Analysis:</strong> Gather data on competitor keywords, backlinks, and content performance.</li>
  //           <li><strong>Backlink Profile Data:</strong> Export detailed backlink information for specific domains.</li>
  //           <li><strong>Content Gap Analysis:</strong> Identify content opportunities by comparing your site to competitors.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for strategic planning and reporting.</li>
  //         </ul>
  //         <p>Supercharge your SEO and content marketing strategies with granular Semrush data, seamlessly integrated into your OfficeX analytics.</p>
  //       `,
  //       price: 350,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for Semrush data export",
  //       bookmarks: 105,
  //       avgCustomerLifetimeValue: 1500,
  //       cumulativeSales: 157500,
  //       vendors: [
  //         {
  //           id: "semrush-vendor1",
  //           name: "SEO Data Specialists",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDS",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Case Studies", url: "#" }],
  //           priceLine: "$350/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "ebay",
  //   name: "eBay",
  //   subheading: "Online auction and shopping website.\nBuy and sell goods.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-ebay-listing-data-csv",
  //       title: "eBay Listing & Sales Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public listing and sales data from eBay, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for e-commerce businesses, resellers, and market researchers to analyze product trends, pricing strategies, competitor activity, and sales performance on the eBay platform.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Active & Completed Listings:</strong> Extract data on product titles, descriptions, prices, seller info, and condition.</li>
  //           <li><strong>Sales History & Price Trends:</strong> Gather data on sold items, final sale prices, and historical pricing trends.</li>
  //           <li><strong>Category & Keyword Filtering:</strong> Target specific product categories or search terms for data extraction.</li>
  //           <li><strong>Seller Performance Metrics:</strong> Analyze public seller ratings and feedback.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for inventory management or market analysis.</li>
  //         </ul>
  //         <p>Gain a competitive edge in e-commerce by leveraging real-time and historical eBay data, seamlessly integrated into your OfficeX spreadsheets.</p>
  //       `,
  //       price: 0.07,
  //       priceUnit: "/listing",
  //       priceExplanation: "per extracted listing or sold item record",
  //       bookmarks: 90,
  //       avgCustomerLifetimeValue: 300,
  //       cumulativeSales: 27000,
  //       vendors: [
  //         {
  //           id: "ebay-vendor1",
  //           name: "E-commerce Data Analysts",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ECDA",
  //           uptimeScore: 99.5,
  //           reviewsScore: 4.3,
  //           communityLinks: [{ label: "Client Portal", url: "#" }],
  //           priceLine: "$0.07/listing",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "amazon",
  //   name: "Amazon",
  //   subheading:
  //     "E-commerce giant and cloud services provider.\nShop and innovate.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-amazon-product-data-csv",
  //       title: "Amazon Product & Review Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public product and customer review data from Amazon, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for product developers, market researchers, and e-commerce businesses to analyze product trends, competitor offerings, customer sentiment, and optimize their Amazon listings.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Product Listing Data:</strong> Extract product titles, descriptions, ASINs, prices, and availability.</li>
  //           <li><strong>Customer Review Analysis:</strong> Gather review text, ratings, and reviewer demographics for sentiment analysis.</li>
  //           <li><strong>Best Seller & New Release Tracking:</strong> Monitor trending products within specific categories.</li>
  //           <li><strong>Competitor Product Monitoring:</strong> Track competitor pricing and product changes.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis and product strategy.</li>
  //         </ul>
  //         <p>Gain a significant competitive advantage in the e-commerce landscape by integrating granular Amazon data into your OfficeX analytics.</p>
  //       `,
  //       price: 0.09,
  //       priceUnit: "/record",
  //       priceExplanation: "per extracted product or review record",
  //       bookmarks: 120,
  //       avgCustomerLifetimeValue: 500,
  //       cumulativeSales: 60000,
  //       vendors: [
  //         {
  //           id: "amazon-vendor1",
  //           name: "E-commerce Intelligence",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EI",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Webinars", url: "#" }],
  //           priceLine: "$0.09/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "producthunt",
  //   name: "Product Hunt",
  //   subheading:
  //     "Platform for new product discovery.\nFind the latest innovations.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-producthunt-data-csv",
  //       title: "Product Hunt Launch & Trend Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public launch data, trend information, and user comments from Product Hunt, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for product managers, investors, and entrepreneurs to monitor new product launches, identify emerging trends, analyze market reception, and discover potential competitors or collaborators.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Product Launch Data:</strong> Extract product names, descriptions, creators, upvotes, and comments from launches.</li>
  //           <li><strong>Trending Product Analysis:</strong> Identify daily, weekly, or monthly trending products and categories.</li>
  //           <li><strong>User Comment & Review Export:</strong> Gather public comments and reviews for sentiment analysis and feedback.</li>
  //           <li><strong>Creator & Company Data:</strong> Extract public information about the creators and companies behind new products.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for competitive analysis or market research.</li>
  //         </ul>
  //         <p>Stay ahead of the innovation curve by integrating real-time Product Hunt data into your OfficeX strategic planning and analysis.</p>
  //       `,
  //       price: 0.06,
  //       priceUnit: "/product",
  //       priceExplanation: "per extracted product launch record",
  //       bookmarks: 70,
  //       avgCustomerLifetimeValue: 350,
  //       cumulativeSales: 24500,
  //       vendors: [
  //         {
  //           id: "producthunt-vendor1",
  //           name: "Innovation Data Labs",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=IDL",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Blog", url: "#" }],
  //           priceLine: "$0.06/product",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "crunchbase",
  //   name: "Crunchbase",
  //   subheading:
  //     "Platform for business information and insights.\nTrack startups and investments.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-crunchbase-company-data-csv",
  //       title: "Crunchbase Company & Funding Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public company, funding, and M&A data from Crunchbase, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for investors, sales teams, and market researchers to build target lists, analyze industry landscapes, track funding rounds, and monitor competitive activity.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Company Profile Data:</strong> Extract company name, industry, location, description, and founding date.</li>
  //           <li><strong>Funding Round Details:</strong> Gather data on investment rounds, investors, and funding amounts.</li>
  //           <li><strong>Acquisition & IPO Data:</strong> Track M&A activities and public offerings.</li>
  //           <li><strong>Key Personnel Data:</strong> Extract public information about executives and board members.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for financial analysis or lead generation.</li>
  //         </ul>
  //         <p>Gain a comprehensive overview of the private and public company landscape by integrating Crunchbase data into your OfficeX strategic planning.</p>
  //       `,
  //       price: 0.25,
  //       priceUnit: "/record",
  //       priceExplanation: "per extracted company or funding record",
  //       bookmarks: 115,
  //       avgCustomerLifetimeValue: 700,
  //       cumulativeSales: 80500,
  //       vendors: [
  //         {
  //           id: "crunchbase-vendor1",
  //           name: "Business Intelligence Co.",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BIC",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "Solutions Page", url: "#" }],
  //           priceLine: "$0.25/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "bitly",
  //   name: "Bitly",
  //   subheading:
  //     "Link management platform.\nShorten, track, and optimize your links.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-bitly-link-analytics-csv",
  //       title: "Bitly Link Click & Analytics Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of detailed click data and analytics from your Bitly links, delivering them as structured CSV files to your Anonymous OfficeX. Gain comprehensive insights into link performance, geographic clicks, referral sources, and more for in-depth analysis and reporting within your spreadsheets.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Link Performance Metrics:</strong> Export total clicks, unique clicks, and click-through rates for your Bitly links.</li>
  //           <li><strong>Geographic Data:</strong> Analyze clicks by country, region, and city to understand audience distribution.</li>
  //           <li><strong>Referral Source Analysis:</strong> Identify where your clicks are coming from (e.g., social media, websites).</li>
  //           <li><strong>Custom Date Range Reporting:</strong> Generate reports for specific periods to track campaign performance.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for marketing analysis.</li>
  //         </ul>
  //         <p>Optimize your digital campaigns with granular Bitly link data, seamlessly integrated into your OfficeX analytics.</p>
  //       `,
  //       price: 150,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for Bitly data export",
  //       bookmarks: 80,
  //       avgCustomerLifetimeValue: 600,
  //       cumulativeSales: 48000,
  //       vendors: [
  //         {
  //           id: "bitly-vendor1",
  //           name: "Link Analytics Pro",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LAP",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Support Docs", url: "#" }],
  //           priceLine: "$150/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "veo3",
  //   name: "Veo3",
  //   subheading: "Advanced video analysis for sports.\nUnderstand performance.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder, find a relevant image
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-veo3-match-data-csv",
  //       title: "Veo3 Match Event & Player Performance Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of detailed match events and player performance data from Veo3 footage, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for sports coaches, analysts, and recruiters to analyze game strategies, individual player statistics, and team performance for in-depth tactical planning and scouting.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Match Event Data:</strong> Export timestamps and descriptions of key events (goals, fouls, passes, shots).</li>
  //           <li><strong>Player Performance Metrics:</strong> Gather data on touches, passes, distance covered, and other customizable metrics for each player.</li>
  //           <li><strong>Team Statistics:</strong> Analyze overall team possession, shots on target, and defensive actions.</li>
  //           <li><strong>Custom Tagging & Filtering:</strong> Export data based on custom tags applied within Veo3 or specific match criteria.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for statistical analysis and reporting.</li>
  //         </ul>
  //         <p>Transform raw sports footage into actionable data with Veo3 integration, seamlessly enhancing your OfficeX performance analysis.</p>
  //       `,
  //       price: 500,
  //       priceUnit: "/match",
  //       priceExplanation: "per analyzed match and data export",
  //       bookmarks: 45,
  //       avgCustomerLifetimeValue: 2000,
  //       cumulativeSales: 90000,
  //       vendors: [
  //         {
  //           id: "veo3-vendor1",
  //           name: "Sports Analytics Pro",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SAP",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "Consultation", url: "#" }],
  //           priceLine: "$500/match",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "taskrabbit",
  //   name: "TaskRabbit",
  //   subheading:
  //     "Platform connecting people with local taskers.\nGet help with everyday tasks.",
  //   coverImage:
  //     "https://www.taskrabbit.com/blog/wp-content/uploads/2023/11/Hero_Taskers-1024x683.jpg", // Placeholder, find a relevant image
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-taskrabbit-task-data-csv",
  //       title: "TaskRabbit Task & Tasker Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public task listings and tasker profile data from TaskRabbit, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for market researchers, businesses analyzing gig economy trends, or individuals tracking service availability and pricing in specific regions.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Task Listing Data:</strong> Extract task descriptions, requested skills, estimated duration, and pricing (if public).</li>
  //           <li><strong>Tasker Profile Data:</strong> Gather public information on tasker skills, hourly rates, reviews, and availability.</li>
  //           <li><strong>Geographic & Category Filtering:</strong> Extract data based on specific locations or task categories.</li>
  //           <li><strong>Pricing & Demand Analysis:</strong> Analyze trends in task pricing and service demand.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis or competitive benchmarking.</li>
  //         </ul>
  //         <p>Gain insights into the local service economy by integrating TaskRabbit data into your OfficeX analytical workflows.</p>
  //       `,
  //       price: 0.04,
  //       priceUnit: "/record",
  //       priceExplanation: "per extracted task or tasker record",
  //       bookmarks: 50,
  //       avgCustomerLifetimeValue: 200,
  //       cumulativeSales: 10000,
  //       vendors: [
  //         {
  //           id: "taskrabbit-vendor1",
  //           name: "Gig Economy Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=GEI",
  //           uptimeScore: 99.4,
  //           reviewsScore: 4.2,
  //           communityLinks: [{ label: "Research Blog", url: "#" }],
  //           priceLine: "$0.04/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "shopee",
  //   name: "Shopee",
  //   subheading:
  //     "Leading e-commerce platform in Southeast Asia and Taiwan.\nShop and sell with ease.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder, find a relevant image
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-shopee-product-data-csv",
  //       title: "Shopee Product & Seller Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public product listings and seller information from Shopee, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for e-commerce businesses, market researchers, and competitive analysts looking to understand product trends, pricing strategies, and seller performance in the Southeast Asian and Taiwanese markets.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Product Listing Data:</strong> Extract product names, descriptions, prices, categories, and stock availability.</li>
  //           <li><strong>Seller Information:</strong> Gather public data on seller ratings, shop location, and number of products.</li>
  //           <li><strong>Sales & Review Data:</strong> Analyze sales volume (if publicly available) and customer reviews for specific products.</li>
  //           <li><strong>Keyword & Category Filtering:</strong> Target specific product categories or search terms for data extraction.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, inventory planning, or competitive intelligence.</li>
  //         </ul>
  //         <p>Gain a significant competitive advantage in the Southeast Asian e-commerce market by integrating granular Shopee data into your OfficeX analytics.</p>
  //       `,
  //       price: 0.08,
  //       priceUnit: "/record",
  //       priceExplanation: "per extracted product or seller record",
  //       bookmarks: 100,
  //       avgCustomerLifetimeValue: 400,
  //       cumulativeSales: 40000,
  //       vendors: [
  //         {
  //           id: "shopee-vendor1",
  //           name: "SEA E-commerce Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SEI",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Client Portal", url: "#" }],
  //           priceLine: "$0.08/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "taobao",
  //   name: "Taobao",
  //   subheading:
  //     "Largest e-commerce platform in China.\nDiscover a vast array of products.",
  //   coverImage:
  //     "https://tiengtrungcamxu.com/wp-content/uploads/2018/01/krupnejshij-marketplejs-taobao-news.jpg", // Placeholder, find a relevant image
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-taobao-product-data-csv",
  //       title: "Taobao Product & Pricing Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public product listings and pricing information from Taobao, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for e-commerce businesses, sourcing agents, and market researchers looking to understand product availability, pricing trends, and supplier information within the Chinese e-commerce market.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Product Listing Data:</strong> Extract product names, descriptions, prices, and available variations.</li>
  //           <li><strong>Seller/Shop Information:</strong> Gather public data on seller ratings, location, and sales volume (if publicly available).</li>
  //           <li><strong>Image & Video URLs:</strong> Include URLs to product images and videos for visual reference.</li>
  //           <li><strong>Trend & Price Analysis:</strong> Analyze historical pricing data and identify trending products.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for competitive pricing, sourcing, or market entry analysis.</li>
  //         </ul>
  //         <p>Gain a significant competitive advantage in the Chinese e-commerce market by integrating granular Taobao data into your OfficeX analytics.</p>
  //       `,
  //       price: 0.1,
  //       priceUnit: "/record",
  //       priceExplanation: "per extracted product or seller record",
  //       bookmarks: 95,
  //       avgCustomerLifetimeValue: 600,
  //       cumulativeSales: 57000,
  //       vendors: [
  //         {
  //           id: "taobao-vendor1",
  //           name: "China E-commerce Data",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CED",
  //           uptimeScore: 99.5,
  //           reviewsScore: 4.4,
  //           communityLinks: [{ label: "Consultation", url: "#" }],
  //           priceLine: "$0.10/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "uber",
  //   name: "Uber",
  //   subheading:
  //     "Ride-sharing and food delivery service.\nTravel and order food with ease.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-uber-ride-data-csv",
  //       title: "Uber Ride & Expense Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of your Uber ride history and associated expense data, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for business professionals, accountants, or individuals looking to track transportation expenses, analyze travel patterns, or reconcile company spending.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Ride History Export:</strong> Extract date, time, pickup/dropoff locations, distance, and trip cost.</li>
  //           <li><strong>Expense Categorization:</strong> Option to categorize rides for business vs. personal expense tracking.</li>
  //           <li><strong>Invoice Data (Metadata):</strong> Export metadata related to trip invoices for easy reconciliation.</li>
  //           <li><strong>Travel Pattern Analysis:</strong> Analyze frequently used routes, times, and associated costs.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for expense reporting and budgeting.</li>
  //         </ul>
  //         <p>Streamline your travel expense management by integrating detailed Uber ride data into your OfficeX financial workflows.</p>
  //       `,
  //       price: 50,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for automated data export",
  //       bookmarks: 60,
  //       avgCustomerLifetimeValue: 300,
  //       cumulativeSales: 18000,
  //       vendors: [
  //         {
  //           id: "uber-vendor1",
  //           name: "Travel Expense Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TES",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "FAQ", url: "#" }],
  //           priceLine: "$50/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "grab",
  //   name: "Grab",
  //   subheading:
  //     "Leading super-app in Southeast Asia for ride-hailing, food delivery, and payments.\nYour everyday everything.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-grab-transaction-data-csv",
  //       title: "Grab Ride, Food, & Payment Transaction Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of your Grab transaction history, including rides, food deliveries, and payments, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals and businesses in Southeast Asia to track expenses, analyze spending patterns across different services, or reconcile financial records.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Comprehensive Transaction History:</strong> Export data on Grab rides, GrabFood orders, GrabMart purchases, and GrabPay transactions.</li>
  //           <li><strong>Detailed Expense Breakdown:</strong> Capture date, time, service type, amount, and associated notes for each transaction.</li>
  //           <li><strong>Spending Pattern Analysis:</strong> Identify trends in your Grab usage and allocate spending across categories.</li>
  //           <li><strong>Receipt Data (Metadata):</strong> Export metadata related to digital receipts for easy record-keeping.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for personal budgeting or business expense management.</li>
  //         </ul>
  //         <p>Gain complete visibility into your Grab ecosystem spending by integrating detailed transaction data into your OfficeX financial workflows.</p>
  //       `,
  //       price: 75,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for automated data export",
  //       bookmarks: 70,
  //       avgCustomerLifetimeValue: 400,
  //       cumulativeSales: 28000,
  //       vendors: [
  //         {
  //           id: "grab-vendor1",
  //           name: "Southeast Asia Data Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SEADS",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Help Docs", url: "#" }],
  //           priceLine: "$75/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "brex",
  //   name: "Brex",
  //   subheading:
  //     "Financial operating system for growing businesses.\nManage corporate spend.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-brex-transaction-csv",
  //       title: "Brex Transaction & Expense Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of detailed transaction and expense data from your Brex account, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for finance teams, accountants, and business owners looking to reconcile corporate spending, manage budgets, and perform in-depth financial analysis directly within their spreadsheets.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Transaction History Export:</strong> Extract date, merchant, amount, category, and associated notes for all Brex transactions.</li>
  //           <li><strong>Expense Report Data:</strong> Pull data from submitted expense reports, including attachments (metadata) and approvals.</li>
  //           <li><strong>Budget Tracking:</strong> Monitor spending against departmental or project budgets with granular data.</li>
  //           <li><strong>Vendor Analysis:</strong> Analyze spending patterns with specific vendors for negotiation or optimization.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for financial reporting, auditing, and reconciliation.</li>
  //         </ul>
  //         <p>Automate your financial reporting and gain deep insights into corporate spend by integrating Brex data into your OfficeX financial workflows.</p>
  //       `,
  //       price: 100,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for automated data export",
  //       bookmarks: 85,
  //       avgCustomerLifetimeValue: 1200,
  //       cumulativeSales: 102000,
  //       vendors: [
  //         {
  //           id: "brex-vendor1",
  //           name: "Corporate Finance Data",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CFD",
  //           uptimeScore: 99.9,
  //           reviewsScore: 4.8,
  //           communityLinks: [{ label: "API Docs", url: "#" }],
  //           priceLine: "$100/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "paypal",
  //   name: "PayPal",
  //   subheading: "Online payment system.\nSend and receive money securely.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-paypal-transaction-csv",
  //       title: "PayPal Transaction History & Fee Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of your detailed PayPal transaction history, including payments sent, received, and associated fees, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals and businesses to reconcile financial records, track income and expenses, and analyze payment processing costs directly within their spreadsheets.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Transaction History Export:</strong> Extract date, type, status, gross amount, fees, and net amount for all transactions.</li>
  //           <li><strong>Sender/Recipient Details:</strong> Gather information on the parties involved in each transaction.</li>
  //           <li><strong>Currency Conversion Data:</strong> Track details for transactions involving currency conversions.</li>
  //           <li><strong>Fee Analysis:</strong> Analyze PayPal fees incurred over time for cost optimization.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for financial tracking, accounting, and reporting.</li>
  //         </ul>
  //         <p>Streamline your financial record-keeping and gain deep insights into your PayPal activities by integrating transaction data into your OfficeX financial workflows.</p>
  //       `,
  //       price: 70,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for automated data export",
  //       bookmarks: 90,
  //       avgCustomerLifetimeValue: 500,
  //       cumulativeSales: 45000,
  //       vendors: [
  //         {
  //           id: "paypal-vendor1",
  //           name: "Payment Data Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PDS",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "Help Center", url: "#" }],
  //           priceLine: "$70/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "cashapp",
  //   name: "Cash App",
  //   subheading: "Mobile payment service.\nSend, spend, save, and invest money.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-cashapp-transaction-csv",
  //       title: "Cash App Transaction History Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of your Cash App transaction history, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals to track personal spending, manage budgets, and reconcile financial records from their Cash App activities.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Transaction History Export:</strong> Extract date, type (sent/received), amount, and transaction description for all activities.</li>
  //           <li><strong>Bitcoin & Stock Activity (Metadata):</strong> Include metadata for any linked Bitcoin or stock purchase/sale activities.</li>
  //           <li><strong>Spending Categorization:</strong> Option to categorize transactions for personal budgeting.</li>
  //           <li><strong>Custom Date Range Reporting:</strong> Generate reports for specific periods for financial overview.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for personal finance tracking.</li>
  //         </ul>
  //         <p>Gain clarity on your Cash App spending and investments by integrating detailed transaction data into your OfficeX financial workflows.</p>
  //       `,
  //       price: 40,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for automated data export",
  //       bookmarks: 55,
  //       avgCustomerLifetimeValue: 250,
  //       cumulativeSales: 13750,
  //       vendors: [
  //         {
  //           id: "cashapp-vendor1",
  //           name: "Personal Finance Data Co.",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PFDC",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "User Guide", url: "#" }],
  //           priceLine: "$40/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "google-drive",
  //   name: "Google Drive",
  //   subheading:
  //     "Cloud storage and file synchronization service.\nStore and share your files.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-google-drive-file-metadata-csv",
  //       title: "Google Drive File Metadata & Usage Report Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of detailed file metadata and usage reports from your Google Drive, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for organizations and individuals managing large Drive accounts to audit file access, track storage usage, organize documents, and manage permissions efficiently.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>File Metadata Export:</strong> Extract file names, types, sizes, creation/modification dates, and owner information.</li>
  //           <li><strong>Sharing & Permissions Audit:</strong> Track sharing settings, collaborators, and public/private access for files and folders.</li>
  //           <li><strong>Storage Usage Analysis:</strong> Generate reports on storage consumption by file type, owner, or folder.</li>
  //           <li><strong>Activity Log (Metadata):</strong> Export metadata on file views, edits, and downloads for auditing purposes.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for data governance and organization.</li>
  //         </ul>
  //         <p>Gain comprehensive control and insights over your Google Drive assets by integrating detailed metadata into your OfficeX management workflows.</p>
  //       `,
  //       price: 80,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for automated data export",
  //       bookmarks: 110,
  //       avgCustomerLifetimeValue: 700,
  //       cumulativeSales: 77000,
  //       vendors: [
  //         {
  //           id: "google-drive-vendor1",
  //           name: "Cloud Data Organizers",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CDO",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "Solutions", url: "#" }],
  //           priceLine: "$80/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "agoda",
  //   name: "Agoda",
  //   subheading:
  //     "Online travel agency for accommodations.\nBook hotels and flights worldwide.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-agoda-hotel-data-csv",
  //       title: "Agoda Hotel Listing & Pricing Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public hotel listings, pricing, and review data from Agoda, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for hospitality businesses, travel agencies, and market researchers to analyze accommodation trends, competitive pricing, customer feedback, and optimize their online presence.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Hotel Listing Data:</strong> Extract hotel names, locations, star ratings, amenities, and image URLs.</li>
  //           <li><strong>Pricing & Availability:</strong> Gather real-time or historical pricing data for specific dates and room types.</li>
  //           <li><strong>Customer Review Analysis:</strong> Export review text and scores for sentiment analysis and feedback.</li>
  //           <li><strong>Destination & Property Type Filtering:</strong> Target specific regions, cities, or accommodation types for data extraction.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, revenue management, or competitive benchmarking.</li>
  //         </ul>
  //         <p>Gain a significant competitive advantage in the travel industry by integrating granular Agoda data into your OfficeX analytics.</p>
  //       `,
  //       price: 0.15,
  //       priceUnit: "/record",
  //       priceExplanation: "per extracted hotel or review record",
  //       bookmarks: 75,
  //       avgCustomerLifetimeValue: 450,
  //       cumulativeSales: 33750,
  //       vendors: [
  //         {
  //           id: "agoda-vendor1",
  //           name: "Travel Data Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TDI",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Client Support", url: "#" }],
  //           priceLine: "$0.15/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "donotpay",
  //   name: "Do Not Pay",
  //   subheading:
  //     "AI-powered legal bot.\nFight corporations, beat bureaucracy, and sue anyone at the press of a button.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-donotpay-legal-doc-csv",
  //       title: "Do Not Pay Case & Document Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of your own Do Not Pay case data and generated document metadata, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals tracking their legal disputes, managing appeals, or organizing generated legal documents for personal record-keeping or further analysis.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Case Status Export:</strong> Extract data on case type, current status, and relevant deadlines.</li>
  //           <li><strong>Document Metadata:</strong> Gather metadata on generated legal documents (e.g., date generated, document type, associated case).</li>
  //           <li><strong>Fine & Fee Tracking:</strong> Analyze the amounts of fines or fees disputed and their outcomes.</li>
  //           <li><strong>Correspondence Log (Metadata):</strong> Export metadata related to communications generated or received through the platform.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for personal legal tracking and record management.</li>
  //         </ul>
  //         <p>Organize and analyze your Do Not Pay activities by integrating detailed case and document data into your OfficeX personal archives.</p>
  //       `,
  //       price: 60,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for automated data export",
  //       bookmarks: 40,
  //       avgCustomerLifetimeValue: 300,
  //       cumulativeSales: 12000,
  //       vendors: [
  //         {
  //           id: "donotpay-vendor1",
  //           name: "Legal Data Organizers",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LDO",
  //           uptimeScore: 99.5,
  //           reviewsScore: 4.3,
  //           communityLinks: [{ label: "FAQs", url: "#" }],
  //           priceLine: "$60/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "fedex",
  //   name: "FedEx",
  //   subheading:
  //     "Global shipping and logistics services.\nDeliver packages worldwide.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-fedex-shipping-data-csv",
  //       title: "FedEx Shipping & Tracking Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of your FedEx shipping history and tracking data, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for businesses and individuals managing high volumes of shipments to analyze shipping costs, delivery performance, track packages, and reconcile logistics records.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Shipment History Export:</strong> Extract data on package details, origin/destination, service type, and shipping costs.</li>
  //           <li><strong>Tracking Status Updates:</strong> Gather real-time or historical tracking updates for specific packages.</li>
  //           <li><strong>Delivery Performance Analysis:</strong> Analyze on-time delivery rates and identify potential delays.</li>
  //           <li><strong>Cost Allocation:</strong> Categorize shipping expenses by department, project, or client.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for logistics management, expense tracking, and reporting.</li>
  //         </ul>
  //         <p>Optimize your shipping operations and gain clear visibility into your logistics with granular FedEx data, seamlessly integrated into your OfficeX workflows.</p>
  //       `,
  //       price: 180,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for automated data export",
  //       bookmarks: 95,
  //       avgCustomerLifetimeValue: 800,
  //       cumulativeSales: 76000,
  //       vendors: [
  //         {
  //           id: "fedex-vendor1",
  //           name: "Logistics Data Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LDS",
  //           uptimeScore: 99.8,
  //           reviewsScore: 4.7,
  //           communityLinks: [{ label: "API Docs", url: "#" }],
  //           priceLine: "$180/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "airbnb",
  //   name: "Airbnb",
  //   subheading:
  //     "Online marketplace for lodging, primarily homestays, and tourism experiences.\nFind unique stays.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-airbnb-listing-data-csv",
  //       title: "Airbnb Listing & Market Trend Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public Airbnb listing data and market trend insights, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for property managers, real estate investors, and market researchers to analyze occupancy rates, pricing strategies, competitor listings, and identify profitable investment opportunities in specific regions.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Listing Details Export:</strong> Extract property type, number of bedrooms/bathrooms, amenities, and host information.</li>
  //           <li><strong>Pricing & Availability Data:</strong> Gather real-time or historical pricing and calendar availability for specific dates.</li>
  //           <li><strong>Review & Rating Analysis:</strong> Export customer reviews and overall ratings for sentiment analysis and feedback.</li>
  //           <li><strong>Geographic & Property Type Filtering:</strong> Target specific cities, neighborhoods, or property types for data extraction.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, revenue optimization, and competitive benchmarking.</li>
  //         </ul>
  //         <p>Gain a significant competitive advantage in the short-term rental market by integrating granular Airbnb data into your OfficeX analytics and decision-making.</p>
  //       `,
  //       price: 0.2,
  //       priceUnit: "/listing",
  //       priceExplanation: "per extracted listing record",
  //       bookmarks: 130,
  //       avgCustomerLifetimeValue: 800,
  //       cumulativeSales: 104000,
  //       bookmarkUrl: "#",
  //       vendors: [
  //         {
  //           id: "airbnb-vendor1",
  //           name: "Rental Market Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RMI",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Case Studies", url: "#" }],
  //           priceLine: "$0.20/listing",
  //           viewPageLink: "#",
  //           requirements: "",
  //           depositOptions: [],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "makerworld",
  //   name: "MakerWorld",
  //   subheading:
  //     "3D model platform for 3D printing.\nShare and download designs.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-makerworld-design-data-csv",
  //       title: "MakerWorld 3D Model & Creator Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of public 3D model data and creator statistics from MakerWorld, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for 3D printing businesses, designers, and market researchers to analyze trending designs, popular creators, model specifications, and user engagement for product development or content strategy.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>3D Model Metadata:</strong> Extract model names, descriptions, categories, download counts, and print statistics.</li>
  //           <li><strong>Creator Insights:</strong> Gather public data on creator followers, print counts, and popular models.</li>
  //           <li><strong>User Engagement Data:</strong> Analyze likes, comments, and collections for specific designs.</li>
  //           <li><strong>Keyword & Category Analysis:</strong> Identify trending keywords and popular design categories.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for trend analysis, content planning, or competitive benchmarking.</li>
  //         </ul>
  //         <p>Gain deep insights into the 3D printing community and market by integrating MakerWorld data into your OfficeX analytical workflows.</p>
  //       `,
  //       price: 0.1,
  //       priceUnit: "/record",
  //       priceExplanation: "per extracted model or creator record",
  //       bookmarks: 60,
  //       avgCustomerLifetimeValue: 300,
  //       cumulativeSales: 18000,
  //       vendors: [
  //         {
  //           id: "makerworld-vendor1",
  //           name: "3D Print Data Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=3DPDS",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.4,
  //           communityLinks: [{ label: "Forum", url: "#" }],
  //           priceLine: "$0.10/record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "home-depot",
  //   name: "Home Depot",
  //   subheading:
  //     "Home improvement and appliance retailer.\nFind tools and materials for your projects.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-home-depot-product-data-csv",
  //       title: "Home Depot Product Inventory & Pricing Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public product inventory, pricing, and specification data from Home Depot, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for contractors, resellers, and market researchers to analyze product availability, competitive pricing, and trending home improvement items across various locations.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Product Catalog Export:</strong> Extract product names, descriptions, categories, SKUs, and online availability.</li>
  //           <li><strong>Pricing & Promotions:</strong> Gather current pricing data, sale prices, and active promotions.</li>
  //           <li><strong>In-Store Inventory (Limited):</strong> Provide insights into approximate in-store stock levels for specific products and locations (where publicly accessible).</li>
  //           <li><strong>Product Specifications:</strong> Extract technical specifications and attributes for detailed analysis.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for inventory management, competitive pricing, or procurement planning.</li>
  //         </ul>
  //         <p>Gain a significant competitive edge in the home improvement market by integrating granular Lowe's data into your OfficeX operations and analysis.</p>
  //       `,
  //       price: 0.12,
  //       priceUnit: "/product",
  //       priceExplanation: "per extracted product record",
  //       bookmarks: 80,
  //       avgCustomerLifetimeValue: 400,
  //       cumulativeSales: 32000,
  //       vendors: [
  //         {
  //           id: "home-depot-vendor1",
  //           name: "Retail Data Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RDS",
  //           uptimeScore: 99.5,
  //           reviewsScore: 4.3,
  //           communityLinks: [{ label: "Client Support", url: "#" }],
  //           priceLine: "$0.12/product",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "shopify",
  //   name: "Shopify",
  //   subheading:
  //     "E-commerce platform for online stores and retail point-of-sale systems.\nBuild and grow your business.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-shopify-store-data-csv",
  //       title: "Shopify Store & Product Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public product listings, pricing, and store information from Shopify-powered online stores, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for competitive analysis, market research, or dropshippers looking to identify trending products, pricing strategies, and successful store setups.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Product Listing Data:</strong> Extract product titles, descriptions, images, prices, and inventory levels (if publicly available).</li>
  //           <li><strong>Storefront Analysis:</strong> Gather data on shop themes, app integrations (visible), and general product offerings.</li>
  //           <li><strong>Pricing Trends:</strong> Monitor pricing changes for specific products or categories across multiple Shopify stores.</li>
  //           <li><strong>Competitor Product Research:</strong> Identify popular products and successful strategies of competitors.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, product sourcing, or business strategy.</li>
  //         </ul>
  //         <p>Gain a significant competitive edge in the e-commerce landscape by integrating granular Shopify store data into your OfficeX analytics.</p>
  //       `,
  //       price: 0.15,
  //       priceUnit: "/product_record",
  //       priceExplanation: "per extracted product record from public stores",
  //       bookmarks: 110,
  //       avgCustomerLifetimeValue: 700,
  //       cumulativeSales: 77000,
  //       vendors: [
  //         {
  //           id: "shopify-vendor1",
  //           name: "Ecom Data Solutions",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EDS",
  //           uptimeScore: 99.7,
  //           reviewsScore: 4.6,
  //           communityLinks: [{ label: "Client Portal", url: "#" }],
  //           priceLine: "$0.15/product_record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "draftkings",
  //   name: "DraftKings",
  //   subheading:
  //     "Daily fantasy sports contest and sports betting operator.\nPlay and win big.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-draftkings-data-csv",
  //       title: "DraftKings Contest & Player Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public contest details, player statistics, and outcome data from DraftKings, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for sports analysts, data scientists, or serious players looking to optimize strategies, identify trends, and perform in-depth statistical analysis on player performance and contest outcomes.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Contest Details:</strong> Export data on contest types, entry fees, prize pools, and number of entries.</li>
  //           <li><strong>Player Statistics:</strong> Gather detailed player performance data for various sports and contests.</li>
  //           <li><strong>Historical Outcome Data:</strong> Analyze past contest results and winning lineups (if publicly available).</li>
  //           <li><strong>Trend Identification:</strong> Identify patterns in player performance, scoring, and winning strategies.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for predictive modeling or strategy optimization.</li>
  //         </ul>
  //         <p>Gain a competitive edge in daily fantasy sports and sports betting by integrating granular DraftKings data into your OfficeX analytical workflows.</p>
  //       `,
  //       price: 300,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for data export and analysis",
  //       bookmarks: 70,
  //       avgCustomerLifetimeValue: 1000,
  //       cumulativeSales: 70000,
  //       vendors: [
  //         {
  //           id: "draftkings-vendor1",
  //           name: "Fantasy Sports Data Labs",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FSDL",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Research Papers", url: "#" }],
  //           priceLine: "$300/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "geeksquad",
  //   name: "Geek Squad",
  //   subheading:
  //     "Tech support and repair services by Best Buy.\nGet help with your electronics.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-geeksquad-service-log-csv",
  //       title: "Geek Squad Service History Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service provides extraction of your Geek Squad service history and associated details, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals and businesses managing multiple devices or tech assets to track repair history, warranty information, service costs, and maintenance schedules directly within their spreadsheets.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Service History Export:</strong> Extract date of service, service type, device serviced, issue description, and resolution.</li>
  //           <li><strong>Cost & Warranty Tracking:</strong> Log service charges and link them to device warranty periods.</li>
  //           <li><strong>Device Inventory Management:</strong> Maintain a detailed record of all serviced devices and their repair history.</li>
  //           <li><strong>Problem Pattern Analysis:</strong> Identify recurring issues across devices or specific product types.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for asset management and maintenance planning.</li>
  //         </ul>
  //         <p>Efficiently manage your tech support and device maintenance by integrating detailed Geek Squad service data into your OfficeX records.</p>
  //       `,
  //       price: 50,
  //       priceUnit: "/year",
  //       priceExplanation: "annual fee for data export and organization",
  //       bookmarks: 30,
  //       avgCustomerLifetimeValue: 150,
  //       cumulativeSales: 4500,
  //       vendors: [
  //         {
  //           id: "geeksquad-vendor1",
  //           name: "Tech Records Management",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TRM",
  //           uptimeScore: 99.5,
  //           reviewsScore: 4.2,
  //           communityLinks: [{ label: "Help Guide", url: "#" }],
  //           priceLine: "$50/year",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "turo",
  //   name: "Turo Car Rental",
  //   subheading:
  //     "Peer-to-peer car sharing marketplace.\nRent unique cars from local hosts.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-turo-rental-data-csv",
  //       title: "Turo Rental & Host Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public Turo car rental listing data and host performance metrics, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for car owners considering Turo, rental market analysts, or competitors looking to understand rental trends, pricing strategies, and successful host practices.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Vehicle Listing Data:</strong> Extract car make/model, year, location, daily rate, and availability details.</li>
  //           <li><strong>Host Performance Metrics:</strong> Gather public data on host ratings, response rates, and number of trips.</li>
  //           <li><strong>Pricing & Demand Analysis:</strong> Analyze rental pricing trends and demand for specific vehicle types or locations.</li>
  //           <li><strong>Booking Calendar Data (Metadata):</strong> Include metadata related to booking availability for optimal scheduling.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for revenue optimization, competitive analysis, or investment planning.</li>
  //         </ul>
  //         <p>Gain a significant competitive edge in the peer-to-peer car rental market by integrating granular Turo data into your OfficeX analytical workflows.</p>
  //       `,
  //       price: 0.18,
  //       priceUnit: "/rental_record",
  //       priceExplanation: "per extracted rental listing record",
  //       bookmarks: 65,
  //       avgCustomerLifetimeValue: 400,
  //       cumulativeSales: 26000,
  //       vendors: [
  //         {
  //           id: "turo-vendor1",
  //           name: "Car Rental Data Insights",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CRDI",
  //           uptimeScore: 99.6,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Host Resources", url: "#" }],
  //           priceLine: "$0.18/rental_record",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "timeleft",
  //   name: "Timeleft",
  //   subheading:
  //     "App for anonymous dinner parties with strangers.\nMeet new people.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-timeleft-event-data-csv",
  //       title: "Timeleft Event & User Interaction Data Export (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public event details and aggregated, anonymized user interaction data from Timeleft, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for social researchers, event organizers, or businesses interested in networking trends, social preferences, and group dynamics.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Event Details:</strong> Export data on event dates, locations (general), participant counts (anonymized), and themes.</li>
  //           <li><strong>Aggregated Interaction Data:</strong> Analyze trends in user matching preferences, common interests, and feedback (anonymized).</li>
  //           <li><strong>Demographic Trends (Anonymized):</strong> Identify broad demographic participation patterns in events.</li>
  //           <li><strong>Topic & Conversation Analysis:</strong> Extract aggregated keywords from anonymized conversations to identify popular topics.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for social trend analysis or event planning insights.</li>
  //         </ul>
  //         <p>Gain insights into social networking and event dynamics by integrating aggregated Timeleft data into your OfficeX analytical workflows, with full respect for user privacy.</p>
  //       `,
  //       price: 200,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly subscription for aggregated data export",
  //       bookmarks: 25,
  //       avgCustomerLifetimeValue: 800,
  //       cumulativeSales: 20000,
  //       vendors: [
  //         {
  //           id: "timeleft-vendor1",
  //           name: "Social Dynamics Lab",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDL",
  //           uptimeScore: 99.5,
  //           reviewsScore: 4.3,
  //           communityLinks: [{ label: "Research Blog", url: "#" }],
  //           priceLine: "$200/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "craigslist",
  //   name: "Craigslist",
  //   subheading:
  //     "Centralized network of online communities, featuring classified advertisements and forums.\nFind anything locally.",
  //   coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b", // Placeholder
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-craigslist-listings-csv",
  //       title: "Craigslist Classifieds & Listings Data Extraction (CSV)",
  //       images: [],
  //       description: `
  //         <p>This service focuses on extracting public classified advertisements and listings from Craigslist, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for market researchers, resellers, or businesses tracking local demand, pricing trends, and product/service availability in specific geographical areas.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Categorized Listing Export:</strong> Extract data on titles, descriptions, prices, categories, and posting dates for various sections (e.g., for sale, housing, services).</li>
  //           <li><strong>Geographic Filtering:</strong> Target specific cities or regions for highly localized data extraction.</li>
  //           <li><strong>Keyword & Price Range Search:</strong> Filter listings based on keywords and price parameters.</li>
  //           <li><strong>Trend Analysis:</strong> Identify emerging trends in local buying, selling, or service demands.</li>
  //           <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, inventory sourcing, or competitive intelligence.</li>
  //         </ul>
  //         <p>Gain valuable insights into local markets and consumer behavior by integrating granular Craigslist data into your OfficeX analytical workflows.</p>
  //       `,
  //       price: 0.05,
  //       priceUnit: "/listing",
  //       priceExplanation: "per extracted classified listing record",
  //       bookmarks: 80,
  //       avgCustomerLifetimeValue: 250,
  //       cumulativeSales: 20000,
  //       vendors: [
  //         {
  //           id: "craigslist-vendor1",
  //           name: "Local Market Data",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LMD",
  //           uptimeScore: 99.4,
  //           reviewsScore: 4.1,
  //           communityLinks: [{ label: "FAQs", url: "#" }],
  //           priceLine: "$0.05/listing",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "anyone-farm",
  //   name: "Anyone Farm",
  //   subheading:
  //     "A marketplace for acquiring aged social media accounts, including Telegram, Facebook, and others. Specializes in providing accounts with history and established presence.",
  //   coverImage: "https://images.unsplash.com/photo-1516259020967-159b3f3a8b4b", // Placeholder for a digital identity/account-related image
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-anyonefarm-aged-social-accounts",
  //       title: "Aged Social Media Accounts (Telegram, Facebook, etc.)",
  //       images: [],
  //       description: `
  //         <p>This service provides access to a catalog of aged social media accounts for various platforms like Telegram, Facebook, and more, delivered with credentials suitable for integration into your Anonymous OfficeX workflows. These accounts are presented as having a history of activity, which can be desirable for specific digital marketing or engagement strategies.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Diverse Platform Availability:</strong> Access accounts for popular platforms including Telegram, Facebook, Instagram, and potentially others.</li>
  //           <li><strong>Account Age & Activity:</strong> Accounts are presented as having varying degrees of age and prior activity to appear more established.</li>
  //           <li><strong>Bulk Acquisition:</strong> Options for purchasing single accounts or larger quantities to scale operations.</li>
  //           <li><strong>Credential Delivery to OfficeX:</strong> Receive account login details and associated information in structured formats for easy import into OfficeX Sheets.</li>
  //         </ul>
  //         <p>Utilize these aged accounts for various digital engagement purposes, carefully considering platform terms of service and best practices.</p>
  //       `,
  //       price: 5.0,
  //       priceUnit: "/account",
  //       priceExplanation: "per aged social media account",
  //       bookmarks: 150,
  //       avgCustomerLifetimeValue: 400,
  //       cumulativeSales: 50000,
  //       vendors: [
  //         {
  //           id: "anyonefarm-vendor1",
  //           name: "Digital Footprint Co.",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DFC",
  //           uptimeScore: 97.2,
  //           reviewsScore: 3.8,
  //           communityLinks: [{ label: "Usage Guidelines", url: "#" }],
  //           priceLine: "$5.00/account",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: "ads-tiger",
  //   name: "Ads Tiger",
  //   subheading:
  //     "Provider of agency-level Facebook Ads accounts with high spending limits",
  //   coverImage: "https://images.unsplash.com/photo-1516252726392-4d22162a8d1a", // Placeholder for an advertising/marketing-related image
  //   isFeatured: Math.random() > 0.5,
  //   offers: [
  //     {
  //       id: "offer-adstiger-high-spend-fb-ads",
  //       title: "High-Spend Facebook Agency Ads Accounts",
  //       images: [],
  //       description: `
  //         <p>This service offers agency-level Facebook Ads accounts with significantly higher spending limits and enhanced stability, delivered for seamless integration into your Anonymous OfficeX advertising management. These accounts are designed for advertisers running large-scale campaigns or those who frequently face spending limits or restrictions with standard ad accounts.</p>
  //         <p>Key features:</p>
  //         <ul>
  //           <li><strong>Elevated Spending Limits:</strong> Access accounts pre-configured with high daily or monthly spending capacities.</li>
  //           <li><strong>Increased Stability & Trust Score:</strong> Accounts are presented as having a higher trust score within the Facebook advertising ecosystem, potentially reducing ban rates.</li>
  //           <li><strong>Direct Business Manager Access:</strong> Accounts are shared with your Facebook Business Manager for full control and integration with your existing assets (pixels, pages, etc.).</li>
  //           <li><strong>Dedicated Support:</strong> Access to support for account issues and operational guidance.</li>
  //           <li><strong>Scalability for OfficeX Workflows:</strong> Manage and monitor high-volume ad campaigns directly from OfficeX, leveraging the provided account infrastructure.</li>
  //         </ul>
  //         <p>Optimize your large-scale Facebook advertising efforts and overcome common limitations by utilizing high-spend agency accounts, managed efficiently through your OfficeX ecosystem.</p>
  //       `,
  //       price: 500.0,
  //       priceUnit: "/month",
  //       priceExplanation: "monthly fee per high-spend agency ad account",
  //       bookmarks: 200,
  //       avgCustomerLifetimeValue: 1500,
  //       cumulativeSales: 100000,
  //       vendors: [
  //         {
  //           id: "adstiger-vendor1",
  //           name: "AdScale Pro",
  //           avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ASP",
  //           uptimeScore: 99.1,
  //           reviewsScore: 4.5,
  //           communityLinks: [{ label: "Policy Guidelines", url: "#" }],
  //           priceLine: "$500/month",
  //           viewPageLink: "#",
  //         },
  //       ],
  //     },
  //   ],
  // },
];

const appstore_apps_dev: ServiceWithOffersFromVendors[] = [
  {
    id: "19",
    name: "Amazon Cloud",
    subheading: "Add storage to OfficeX with giftcards for $1 per 100GB/month",
    cover_image:
      "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
    is_featured: false,
    offers: [
      {
        id: "offer1-aws-s3-ai-csv-expodrt",
        title: "100GB Storage Giftcard",
        images: [],
        description:
          "<p>Purchase a 100GB gift card for secure, scalable cloud storage on Amazon Cloud. Your data is protected by AWS S3's industry-leading durability and availability, ensuring high reliability and performance. This gift card adds funds to your storage account with usage based pricing.</p><p>We offer fast and affordable storage thanks to AWS S3 Intelligent-Tiering, which automatically moves data to the most cost-effective storage tier without impacting performance. This provides high availability at wholesale pricing.</p><ul><li>Infrequently accessed files: Automatically moved to colder storage for as low as $0.0054/GB per month.</li><li>Frequently accessed files: Kept in standard storage for $0.03128/GB per month.</li></ul><p>Please note that data egress (downloading data from the cloud) is charged at $0.1224 per GB.</p><p>Expand your OfficeX storage capacity with this convenient 100GB gift card, ensuring all your important documents are safely stored in the cloud.</p>",
        price: 0.01,
        price_unit: "/GB",
        price_explanation: "per month for storage and processing, min $1",
        bookmarks: 180,
        bookmarked_demand: 0,
        cumulative_sales: 105000,
        bookmark_url: "",
        call_to_action: "Buy Giftcard",
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
            price_line: "$0.01/GB/month",
            view_page_link: "#",
            call_to_action: "Buy Giftcard",
            description:
              "Expand your OfficeX storage capacity with this convenient 100GB gift card, ensuring all your important documents are safely stored in the cloud.",
            vendor_disclaimer: "",
            about_url: "https://vendor.com",
            checkout_options: [
              {
                offer_id: "aws-s3-storage-giftcard",
                checkout_flow_id:
                  "001_amazon_storage_crypto_wallet_topup_gift_card_only",
                title: "USDC on Base",
                note: "To initialize the vendor (Note: Actual deposit address and details would be provided by the backend after initiating this checkout option)",
                checkout_init_endpoint:
                  "http://localhost:3001/v1/checkout/initiate",
                checkout_pattern: CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
                vendor_notes: "You will receive a giftcard for AWS S3",
                vendor_disclaimer:
                  "Immediate access. Your storage giftcard will have a crypto balance that pays for storage and bandwidth. You can top it up any time you need more.",
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

  // {
  //     id: "2",
  //     name: "TikTok Downloader",
  //     subheading:
  //       "Download your favorite TikTok videos easily.\nSave content offline.",
  //     coverImage: "https://placehold.co/400x250/FFF3E0/000?text=TikTok",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "6",
  //     name: "Canva",
  //     subheading:
  //       "Easy-to-use graphic design platform.\nCreate stunning visuals.",
  //     coverImage: "https://placehold.co/400x250/FFFDE7/000?text=Canva",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "7",
  //     name: "Polymarket",
  //     subheading:
  //       "Decentralized prediction market platform.\nBet on real-world events.",
  //     coverImage: "https://placehold.co/400x250/F3E5F5/000?text=Polymarket",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "8",
  //     name: "X Fanfilter",
  //     subheading:
  //       "AI Prospecting for X (Twitter).\nFilter and find relevant profiles.",
  //     coverImage: "https://placehold.co/400x250/E0F7FA/000?text=X+Fanfilter",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "9",
  //     name: "DocuSign",
  //     subheading:
  //       "Secure electronic signatures for documents.\nSign and send with ease.",
  //     coverImage: "https://placehold.co/400x250/FCE4EC/000?text=DocuSign",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "10",
  //     name: "Google Meets",
  //     subheading: "Video conferencing for teams.\nConnect and collaborate.",
  //     coverImage: "https://placehold.co/400x250/FBE9E7/000?text=Google+Meets",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "11",
  //     name: "LastPass",
  //     subheading:
  //       "Password manager for secure online access.\nStore and generate passwords.",
  //     coverImage: "https://placehold.co/400x250/E1F5FE/000?text=LastPass",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "12",
  //     name: "Calendly",
  //     subheading:
  //       "Schedule meetings and appointments effortlessly.\nStreamline your calendar.",
  //     coverImage: "https://placehold.co/400x250/FFFDE7/000?text=Calendly",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "14",
  //     name: "Reddit",
  //     subheading:
  //       "Discover communities and discussions.\nExplore diverse topics.",
  //     coverImage: "https://placehold.co/400x250/FBE9E7/000?text=Reddit",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "18",
  //     name: "PromptBase",
  //     subheading: "Discover and share AI prompts.\nUnleash your creativity.",
  //     // coverImage: "https://placehold.co/400x250/E0F7FA/000?text=PromptBase",
  //     coverImage:
  //       "https://pbs.twimg.com/profile_images/1530371993001791494/MNIbX9hf_400x400.jpg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "34-repo",
  //     name: "RepoCloud",
  //     subheading: "Self hosting OfficeX for your company.",
  //     coverImage: "https://placehold.co/400x250/E0F7FA/000?text=RepoCloud",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "35-Ghostcut",
  //     name: "Ghostcut",
  //     subheading: "Repurpose video content, hide text, blur faces.",
  //     coverImage: "https://placehold.co/400x250/E0F7FA/000?text=Ghostcut",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "36-capcut",
  //     name: "CapCut",
  //     subheading:
  //       "Video editing app for mobile and desktop.\nCreate stunning videos.",
  //     coverImage:
  //       "https://cdn.icon-icons.com/icons2/3389/PNG/512/capcut_logo_icon_213601.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "37-ebay",
  //     name: "eBay",
  //     subheading: "Online marketplace for buying and selling.\nFind great deals.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/1200px-EBay_logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "38-amazon",
  //     name: "Amazon",
  //     subheading: "E-commerce giant for shopping and more.\nEverything you need.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "39-shein",
  //     name: "SHEIN",
  //     subheading:
  //       "Online fashion retailer.\nTrendy clothes at affordable prices.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Shein_logo.svg/1200px-Shein_logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "40-osint",
  //     name: "OSINT Framework",
  //     subheading:
  //       "Open-source intelligence gathering tools.\nResearch and analyze public data.",
  //     coverImage: "https://osintframework.com/assets/img/logo.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "41-bluesky",
  //     name: "Bluesky",
  //     subheading:
  //       "Decentralized social networking protocol.\nNew way to connect.",
  //     coverImage:
  //       "https://pbs.twimg.com/profile_images/1647895059639537664/e_xUj_nK_400x400.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "42-facebook",
  //     name: "Facebook",
  //     subheading: "Connect with friends and family.\nShare your life.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/1200px-Facebook_f_logo_%282019%29.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "43-instagram",
  //     name: "Instagram",
  //     subheading: "Share photos and videos.\nDiscover new content.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1200px-Instagram_icon.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "44-linkedin",
  //     name: "LinkedIn",
  //     subheading: "Professional networking platform.\nGrow your career.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "45-tiktok",
  //     name: "TikTok",
  //     subheading: "Short-form mobile videos.\nExpress yourself.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "46-snapchat",
  //     name: "Snapchat",
  //     subheading: "Share moments with friends.\nFun filters and lenses.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Snapchat_logo.svg/1200px-Snapchat_logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "47-whatsapp",
  //     name: "WhatsApp",
  //     subheading: "Secure messaging and calls.\nConnect globally.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "48-discord",
  //     name: "Discord",
  //     subheading:
  //       "Voice, video, and text chat for communities.\nTalk, hang out, and create.",
  //     coverImage:
  //       "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6cc3c4800807496662_5848c187cef1014c0b5e4921.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "49-slack",
  //     name: "Slack",
  //     subheading:
  //       "Team collaboration and communication.\nWork smarter, together.",
  //     coverImage:
  //       "https://a.slack-edge.com/80588/marketing/img/meta/slack_default_sharing_image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "50-notion",
  //     name: "Notion",
  //     subheading: "All-in-one workspace.\nNotes, tasks, wikis, and databases.",
  //     coverImage:
  //       "https://images.ctfassets.net/dm4g564n1whz/6rE7a77QWqYwzK0s8M4o2E/5b7f1e7d2d1e2e1d2e1d2e1d2e1d2e1d/notion_logo.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "51-googledrive",
  //     name: "Google Drive",
  //     subheading: "Cloud storage and file sharing.\nAccess your files anywhere.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/1200px-Google_Drive_icon_%282020%29.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "52-onedrive",
  //     name: "OneDrive",
  //     subheading: "Microsoft cloud storage.\nSync and share files.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/OneDrive_logo.svg/1200px-OneDrive_logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "53-loom",
  //     name: "Loom",
  //     subheading: "Video messaging for work.\nRecord quick videos.",
  //     coverImage: "https://cdn.loom.com/images/social-sharing-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "54-tally",
  //     name: "Tally",
  //     subheading: "Simple and powerful forms.\nCreate forms in seconds.",
  //     coverImage: "https://tally.so/images/social-card.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "55-hootsuite",
  //     name: "Hootsuite",
  //     subheading: "Social media management.\nManage all your social profiles.",
  //     coverImage:
  //       "https://www.hootsuite.com/content/dam/hootsuite/images/home/hootsuite-social-share.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "56-grok",
  //     name: "Grok",
  //     subheading: "AI assistant by xAI.\nExplore and understand.",
  //     coverImage:
  //       "https://pbs.twimg.com/profile_images/1720815915724531712/9Bv_1h0a_400x400.jpg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "57-openai",
  //     name: "OpenAI",
  //     subheading: "Leading AI research and deployment.\nInnovating AI.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/OpenAI_Logo.svg/1200px-OpenAI_Logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "58-bard",
  //     name: "Google Bard (now Gemini)",
  //     subheading: "Conversational AI by Google.\nYour creative partner.",
  //     coverImage:
  //       "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Bard_blog_banner.width-1200.format-webp.webp",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "59-microsoftcopilot",
  //     name: "Microsoft Copilot",
  //     subheading: "AI-powered productivity assistant.\nBoost your work.",
  //     coverImage:
  //       "https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/MSFT-Copilot-Image-1?resMode=sharp2&op_usm=1.5,0.7,3,0&wid=1200&hei=675&qlt=95&fmt=png-alpha",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "60-clickup",
  //     name: "ClickUp",
  //     subheading:
  //       "All-in-one productivity platform.\nManage tasks, projects, and more.",
  //     coverImage: "https://clickup.com/images/clickup-logo-social.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "61-airtable",
  //     name: "Airtable",
  //     subheading: "Flexible spreadsheet-database hybrid.\nOrganize anything.",
  //     coverImage:
  //       "https://images.ctfassets.net/dm4g564n1whz/4p7X1V0p5vR0fV7w8G1X8/b2c5e7b2c5e7b2c5e7b2c5e7b2c5e7b2c5e7/Airtable_logo.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "62-otterai",
  //     name: "Otter.ai",
  //     subheading:
  //       "AI meeting assistant.\nTranscribe and summarize conversations.",
  //     coverImage: "https://otter.ai/images/social/otter-social-share-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "63-pinterest",
  //     name: "Pinterest",
  //     subheading: "Discover ideas and inspiration.\nPin what you love.",
  //     coverImage:
  //       "https://images.unsplash.com/photo-1611605697207-2f3b9777-6d6a-4b0d-9b0d-0b0d0b0d0b0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fFBpbnRlcmVzdHxlbnwwfHwwfHww&w=1000&q=80",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "64-zoom",
  //     name: "Zoom",
  //     subheading:
  //       "Video conferencing and online meetings.\nConnect with anyone, anywhere.",
  //     coverImage:
  //       "https://st2.depositphotos.com/3932201/6763/i/450/depositphotos_67634423-stock-photo-zoom-video-conferencing-app-icon.jpg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "65-figma",
  //     name: "Figma",
  //     subheading:
  //       "Collaborative interface design tool.\nDesign, prototype, and gather feedback.",
  //     coverImage: "https://s3-alpha.figma.com/social/share-v2.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "66-github",
  //     name: "GitHub",
  //     subheading:
  //       "Platform for developers to host and review code.\nBuild and collaborate.",
  //     coverImage:
  //       "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "67-spotify",
  //     name: "Spotify",
  //     subheading: "Music streaming service.\nListen to millions of songs.",
  //     coverImage: "https://www.scdn.co/i/_global/og_image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "68-netflix",
  //     name: "Netflix",
  //     subheading:
  //       "Streaming service for movies and TV shows.\nWatch your favorites.",
  //     coverImage:
  //       "https://assets.nflxext.com/us/email/social_icon_netflix_200x200.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "69-adobephotoshop",
  //     name: "Adobe Photoshop",
  //     subheading:
  //       "Industry-standard image editing software.\nCreate stunning visuals.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/1200px-Adobe_Photoshop_CC_icon.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "70-evernote",
  //     name: "Evernote",
  //     subheading:
  //       "Note-taking and organization app.\nCapture ideas and stay organized.",
  //     coverImage: "https://evernote.com/img/en/evernote-logo-share.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "71-asana",
  //     name: "Asana",
  //     subheading: "Work management platform.\nOrganize tasks and projects.",
  //     coverImage: "https://asana.com/assets/img/og/og-image-generic.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "72-jira",
  //     name: "Jira",
  //     subheading:
  //       "Issue tracking and project management for software teams.\nPlan, track, and release.",
  //     coverImage:
  //       "https://www.atlassian.com/dam/jcr:a87dd190-e55d-4f05-b7d1-e945c859d9c2/Jira-social-share.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "73-salesforce",
  //     name: "Salesforce",
  //     subheading: "Cloud-based CRM platform.\nManage customer relationships.",
  //     coverImage:
  //       "https://www.salesforce.com/content/dam/web/en_us/www/images/social-sharing/social-share-default.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "74-shopify",
  //     name: "Shopify",
  //     subheading:
  //       "E-commerce platform to start, run, and grow a business.\nBuild your online store.",
  //     coverImage:
  //       "https://cdn.shopify.com/s/files/1/0070/3666/2855/files/shopify-social-share-image.png?v=1603913076",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "75-mailchimp",
  //     name: "Mailchimp",
  //     subheading:
  //       "Email marketing and audience management platform.\nGrow your business.",
  //     coverImage: "https://eep.io/images/global/social-share-image.jpg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "76-stripe",
  //     name: "Stripe",
  //     subheading:
  //       "Online payment processing for internet businesses.\nAccept payments securely.",
  //     coverImage: "https://stripe.com/img/v3/home/social.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "77-paypal",
  //     name: "PayPal",
  //     subheading: "Online payment system.\nSend and receive money securely.",
  //     coverImage:
  //       "https://www.paypalobjects.com/digitalassets/c/website/marketing/na/en/finance/pp/og-image-en_US.jpg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "78-uber",
  //     name: "Uber",
  //     subheading:
  //       "Ride-sharing and food delivery service.\nGet where you need to go.",
  //     coverImage: "https://www.uber.com/static/images/uber-share-logo.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "79-airbnb",
  //     name: "Airbnb",
  //     subheading:
  //       "Online marketplace for lodging.\nBook unique homes and experiences.",
  //     coverImage:
  //       "https://a0.muscache.com/defaults/default_airbnb_social_image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "80-googlechrome",
  //     name: "Google Chrome",
  //     subheading:
  //       "Fast and secure web browser.\nBrowse the internet efficiently.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%282011%29.svg/1200px-Google_Chrome_icon_%282011%29.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "81-mozillafirefox",
  //     name: "Mozilla Firefox",
  //     subheading:
  //       "Private and secure web browser.\nTake control of your online experience.",
  //     coverImage:
  //       "https://www.mozilla.org/media/img/firefox/opengraph-facebook.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "82-microsoftedge",
  //     name: "Microsoft Edge",
  //     subheading: "Microsoft's modern web browser.\nBrowse with built-in tools.",
  //     coverImage:
  //       "https://www.microsoft.com/en-us/microsoft-edge/assets/og-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "83-vlcmediaplayer",
  //     name: "VLC Media Player",
  //     subheading:
  //       "Free and open-source multimedia player.\nPlay almost any format.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/VLC_Media_Player_Icon.svg/1200px-VLC_Media_Player_Icon.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "84-adobeacrobat",
  //     name: "Adobe Acrobat Reader",
  //     subheading:
  //       "View, print, sign, and annotate PDFs.\nWork with documents easily.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Adobe_Acrobat_DC_logo_2020.svg/1200px-Adobe_Acrobat_DC_logo_2020.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "85-spotifyforcreators",
  //     name: "Spotify for Creators",
  //     subheading:
  //       "Tools and resources for artists and podcasters.\nGrow your audience on Spotify.",
  //     coverImage:
  //       "https://images.ctfassets.net/lp0y0v91z4k2/5b8f7d9a1e8a4a2b9d0b8d9c0e0b9d0b/b2c5e7b2c5e7b2c5e7b2c5e7b2c5e7b2c5e7/spotify-for-artists.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "86-applepodcasts",
  //     name: "Apple Podcasts",
  //     subheading:
  //       "Discover and listen to podcasts.\nYour favorite audio stories.",
  //     coverImage: "https://developer.apple.com/news/images/og/podcasts-og.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "87-googlepodcasts",
  //     name: "Google Podcasts",
  //     subheading: "Listen to podcasts for free.\nExplore a world of audio.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Google_Podcasts_icon.svg/1200px-Google_Podcasts_icon.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "88-duolingo",
  //     name: "Duolingo",
  //     subheading: "Learn a new language for free.\nFun and effective lessons.",
  //     coverImage:
  //       "https://pbs.twimg.com/profile_images/1691238479590748160/2x2fX_Fh_400x400.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "89-coursera",
  //     name: "Coursera",
  //     subheading:
  //       "Online courses and degrees from top universities.\nLearn new skills.",
  //     coverImage:
  //       "https://images.ctfassets.net/dm4g564n1whz/3q8Y3Y8Y3Y8Y3Y8Y3Y8Y3Y8Y3Y8Y3Y8Y/3b2c5e7b2c5e7b2c5e7b2c5e7b2c5e7b2c5e7/Coursera_logo.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "90-udemy",
  //     name: "Udemy",
  //     subheading:
  //       "Online learning and teaching marketplace.\nExpand your knowledge.",
  //     coverImage:
  //       "https://www.udemy.com/staticx/udemy/images/v7/social/og-image-v7.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "91-khanacademy",
  //     name: "Khan Academy",
  //     subheading: "Free online courses, lessons, and practice.\nLearn anything.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Khan_Academy_logo.svg/1200px-Khan_Academy_logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "92-googleclassroom",
  //     name: "Google Classroom",
  //     subheading:
  //       "Streamline teaching and learning.\nManage coursework effortlessly.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Classroom_logo.svg/1200px-Google_Classroom_logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "93-microsoftteams",
  //     name: "Microsoft Teams",
  //     subheading:
  //       "Chat, meetings, calling, and collaboration.\nAll in one place.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Teams_logo.svg/1200px-Microsoft_Teams_logo.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "94-zoomwebinars",
  //     name: "Zoom Webinars",
  //     subheading: "Host and attend online events.\nReach a large audience.",
  //     coverImage:
  //       "https://assets.zoom.us/images/en-us/desktop/misc/Zoom_Webinar.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "95-webex",
  //     name: "Cisco Webex",
  //     subheading:
  //       "Video conferencing and team collaboration.\nSecure and reliable.",
  //     coverImage:
  //       "https://www.webex.com/content/dam/webex/en/us/images/misc/webex-og-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "96-trello",
  //     name: "Trello",
  //     subheading:
  //       "Visual tool for organizing your work.\nManage projects with ease.",
  //     coverImage:
  //       "https://images.ctfassets.net/dm4g564n1whz/3o7kY7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7/7b2c5e7b2c5e7b2c5e7b2c5e7b2c5e7b2c5e7/trello_logo.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "97-mondaycom",
  //     name: "monday.com",
  //     subheading: "Work OS for teams.\nManage everything in one place.",
  //     coverImage:
  //       "https://monday.com/p/wp-content/uploads/2021/08/monday-social-share.jpg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "98-basecamp",
  //     name: "Basecamp",
  //     subheading:
  //       "Project management and team communication.\nStay organized and on track.",
  //     coverImage: "https://basecamp.com/assets/social-share-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "99-todoist",
  //     name: "Todoist",
  //     subheading: "To-do list and task manager.\nOrganize your life.",
  //     coverImage:
  //       "https://todoist.com/static/social-media/todoist-social-share.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "100-anydo",
  //     name: "Any.do",
  //     subheading: "To-do list, planner, and calendar.\nKeep your life organized.",
  //     coverImage: "https://www.any.do/images/social/social-share.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "101-bearapp",
  //     name: "Bear (Notes App)",
  //     subheading:
  //       "Flexible writing app for notes and prose.\nSimple and beautiful.",
  //     coverImage: "https://bear.app/assets/img/og-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "102-simplenote",
  //     name: "Simplenote",
  //     subheading:
  //       "Easy way to take notes, lists, ideas, and more.\nStay organized.",
  //     coverImage: "https://simplenote.com/images/Simplenote-logo-social.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "103-obsidian",
  //     name: "Obsidian",
  //     subheading:
  //       "Powerful knowledge base that works on local Markdown files.\nConnect your thoughts.",
  //     coverImage: "https://obsidian.md/images/social-share.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "104-googlephotos",
  //     name: "Google Photos",
  //     subheading: "Store and share your photos and videos.\nNever lose a memory.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Google_Photos_icon_%282020%29.svg/1200px-Google_Photos_icon_%282020%29.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "105-icloudphotos",
  //     name: "iCloud Photos",
  //     subheading:
  //       "Securely store your photos and videos in iCloud.\nAccess across devices.",
  //     coverImage: "https://developer.apple.com/news/images/og/icloud-og.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "106-dropbox",
  //     name: "Dropbox",
  //     subheading:
  //       "Cloud storage, file synchronization, personal cloud, and client software.\nKeep your files safe.",
  //     coverImage:
  //       "https://assets.dropbox.com/www/en-us/static/images/social/share-image-2020.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "107-wetransfer",
  //     name: "WeTransfer",
  //     subheading: "Send large files easily.\nShare with anyone.",
  //     coverImage: "https://wetransfer.com/assets/img/wetransfer-og.jpg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "108-sendgrid",
  //     name: "SendGrid",
  //     subheading:
  //       "Email API for developers.\nSend transactional and marketing emails.",
  //     coverImage:
  //       "https://sendgrid.com/wp-content/uploads/2019/07/sendgrid-social-share.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "109-twilio",
  //     name: "Twilio",
  //     subheading:
  //       "Cloud communications platform.\nBuild powerful messaging and voice apps.",
  //     coverImage: "https://www.twilio.com/assets/social-share-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "110-stripeconnect",
  //     name: "Stripe Connect",
  //     subheading:
  //       "Payments for platforms and marketplaces.\nFacilitate payments for others.",
  //     coverImage: "https://stripe.com/img/connect/social.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "111-braintree",
  //     name: "Braintree",
  //     subheading:
  //       "Payment gateway for online and mobile payments.\nAccept payments globally.",
  //     coverImage:
  //       "https://www.braintreepayments.com/images/default-social-share-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "112-square",
  //     name: "Square",
  //     subheading:
  //       "Payment processing and business tools.\nRun your business smarter.",
  //     coverImage: "https://squareup.com/images/og-square-social.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "113-quickbooks",
  //     name: "QuickBooks",
  //     subheading:
  //       "Accounting software for small businesses.\nManage your finances.",
  //     coverImage: "https://static.intuitcdn.net/qb/images/og_image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "114-xero",
  //     name: "Xero",
  //     subheading:
  //       "Online accounting software for small business.\nBeautiful accounting software.",
  //     coverImage:
  //       "https://www.xero.com/content/dam/xero/images/social-media/xero-social-media.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "115-freshbooks",
  //     name: "FreshBooks",
  //     subheading:
  //       "Cloud accounting software for small business owners.\nSimplify invoicing and expenses.",
  //     coverImage: "https://www.freshbooks.com/assets/images/og-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "116-zendesk",
  //     name: "Zendesk",
  //     subheading:
  //       "Customer service and support platform.\nBuild better customer relationships.",
  //     coverImage:
  //       "https://www.zendesk.com/content/dam/zendesk/images/og-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "117-intercom",
  //     name: "Intercom",
  //     subheading:
  //       "Customer messaging platform for sales, marketing, and support.\nBetter customer relationships.",
  //     coverImage: "https://www.intercom.com/static/social-share-image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "118-drift",
  //     name: "Drift",
  //     subheading:
  //       "Conversational marketing and sales platform.\nEngage website visitors.",
  //     coverImage:
  //       "https://www.drift.com/wp-content/uploads/2021/08/drift-social-share.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "119-hubspot",
  //     name: "HubSpot",
  //     subheading:
  //       "CRM platform for scaling companies.\nGrow your business with inbound.",
  //     coverImage:
  //       "https://blog.hubspot.com/hubfs/assets/social/hubspot_social_image.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "120-sfdcmarketingcloud",
  //     name: "Salesforce Marketing Cloud",
  //     subheading:
  //       "Digital marketing automation and analytics.\nPersonalize customer journeys.",
  //     coverImage:
  //       "https://www.salesforce.com/content/dam/web/en_us/www/images/social-sharing/social-share-default.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "121-sqlite",
  //     name: "SQLite",
  //     subheading:
  //       "Self-contained, serverless, zero-configuration, transactional SQL database engine.\nIdeal for embedded uses.",
  //     coverImage:
  //       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/SQLite370.svg/1200px-SQLite370.svg.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "122-googlebigquery",
  //     name: "Google BigQuery",
  //     subheading:
  //       "Serverless, highly scalable, and cost-effective cloud data warehouse.\nAnalyze petabytes of data.",
  //     coverImage:
  //       "https://cloud.google.com/_static/cloud/images/social-icon-google-cloud-1200-630.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "123-supabase",
  //     name: "Supabase",
  //     subheading:
  //       "Open source Firebase alternative.\nBuild a backend in minutes.",
  //     coverImage: "https://supabase.com/images/og/supabase-social-preview.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "124-postgres",
  //     name: "PostgreSQL",
  //     subheading:
  //       "Powerful, open source object-relational database system.\nReliable and feature-rich.",
  //     coverImage: "https://www.postgresql.org/media/img/about/press/elephant.png",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "125-deepseek",
  //     name: "DeepSeek AI",
  //     subheading: "Advanced AI models and tools.\nExplore the frontier of AI.",
  //     coverImage:
  //       "https://pbs.twimg.com/profile_images/1723555239555233792/d6kX4u2e_400x400.jpg",
  //     isFeatured: Math.random() > 0.5,
  //   },
  //   {
  //     id: "1d",
  //     name: "TradingView",
  //     subheading: "Chart, analyze, and trade financial markets.",
  //     coverImage:
  //       "https://images.g2crowd.com/uploads/product/image/social_share/social_share_1f621e2c90e0e0a0a0a0a0a0a0a0a0a0/tradingview.png", // Placeholder, find actual
  //     isFeatured: true,
  //   },
  //   {
  //     id: "2d",
  //     name: "Dexscreener",
  //     subheading:
  //       "Real-time crypto price charts and decentralized exchange data.",
  //     coverImage: "https://dexscreener.com/favicon.png", // Placeholder, find actual
  //     isFeatured: false,
  //   },
  //   {
  //     id: "3d",
  //     name: "RunwayML",
  //     subheading:
  //       "AI magic tools for creators. Generate videos, images, and more.",
  //     coverImage: "https://www.runwayml.com/static/images/opengraph.png", // Placeholder, find actual
  //     isFeatured: true,
  //   },
  //   {
  //     id: "d4",
  //     name: "Huailuo AI",
  //     subheading:
  //       "Your personal AI assistant for daily tasks and creative writing.",
  //     coverImage: "https://example.com/huailuo_ai_cover.png", // Placeholder, you might need to find or create this
  //     isFeatured: false,
  //   },
  //   {
  //     id: "d5",
  //     name: "Airbnb",
  //     subheading: "Book unique homes and experiences around the world.",
  //     coverImage:
  //       "https://images.g2crowd.com/uploads/product/image/social_share/social_share_97e42d7637841c73c8868c2ee03e7e22/airbnb.png", // Placeholder, find actual
  //     isFeatured: true,
  //   },
  //   {
  //     id: "6d",
  //     name: "Discord",
  //     subheading: "Voice, video, and text chat for gamers and communities.",
  //     coverImage:
  //       "https://images.g2crowd.com/uploads/product/image/social_share/social_share_97e42d7637841c73c8868c2ee03e7e22/discord.png", // Placeholder, find actual
  //     isFeatured: true,
  //   },
  //   {
  //     id: "7d",
  //     name: "Facebook Groups",
  //     subheading: "Connect with friends and the world around you.",
  //     coverImage:
  //       "https://images.g2crowd.com/uploads/product/image/social_share/social_share_97e42d7637841c73c8868c2ee03e7e22/facebook.png", // Placeholder, find actual
  //     isFeatured: true,
  //   },
  //   {
  //     id: "8d",
  //     name: "Upwork",
  //     subheading: "Find freelance purchases and connect with top talent.",
  //     coverImage:
  //       "https://images.g2crowd.com/uploads/product/image/social_share/social_share_97e42d7637841c73c8868c2ee03e7e22/upwork.png", // Placeholder, find actual
  //     isFeatured: false,
  //   },
  //   {
  //     id: "9d",
  //     name: "SproutGigs",
  //     subheading: "Micro-task platform for earning and hiring.",
  //     coverImage: "https://sproutgigs.com/images/sproutgigs_logo.png", // Placeholder, find actual
  //     isFeatured: false,
  //   },
  //   {
  //     id: "1d0",
  //     name: "Calendly",
  //     subheading:
  //       "Schedule meetings and appointments effortlessly. Streamline your calendar.",
  //     coverImage:
  //       "https://images.g2crowd.com/uploads/product/image/social_share/social_share_97e42d7637841c73c8868c2ee03e7e22/calendly.png",
  //     isFeatured: false,
  //   },
  //   {
  //     id: "11d",
  //     name: "Anthropic MCP Server",
  //     subheading:
  //       "Standardized protocol for AI models to interact with data and tools.",
  //     coverImage:
  //       "https://www.docker.com/wp-content/uploads/2024/01/Model_Context_Protocol_Social-20240117.png", // A general image related to MCP
  //     isFeatured: true,
  //   },
  //   {
  //     id: "1d2",
  //     name: "Windmill Dev",
  //     subheading:
  //       "Open-source workflow engine and developer platform for internal tools.",
  //     coverImage: "https://www.windmill.dev/logo.svg", // Official logo from their website
  //     isFeatured: true,
  //   },
  //   {
  //     id: "133s",
  //     name: "USA Census",
  //     subheading: "Official data on the American people and economy.",
  //     coverImage:
  //       "https://www.census.gov/content/dam/Census/home/logo-us-census-bureau.png", // Official Census Bureau logo
  //     isFeatured: true,
  //   },
  //   {
  //     id: "14d",
  //     name: "Crime Stats (FBI UCR)",
  //     subheading: "Official crime data from the Uniform Crime Reporting Program.",
  //     coverImage: "https://www.fbi.gov/++theme++fbi.gov/images/fbi_logo.png", // FBI logo
  //     isFeatured: true,
  //   },
  //   {
  //     id: "15d",
  //     name: "Import Genius",
  //     subheading:
  //       "Global import and export data for competitive analysis and sourcing.",
  //     coverImage: "https://www.importgenius.com/img/import-genius-logo.png", // Placeholder, find actual
  //     isFeatured: true,
  //   },
  //   {
  //     id: "16d",
  //     name: "Jungle Scout",
  //     subheading: "Product research and FBA sales data for Amazon sellers.",
  //     coverImage: "https://cdn.junglescout.com/js-site-assets/images/logo.png", // Placeholder, find actual
  //     isFeatured: true,
  //   },
  //   {
  //     id: "17d",
  //     name: "Open Supply Hub",
  //     subheading: "A global, open-source map of supply chain facilities.",
  //     coverImage: "https://opensupplyhub.org/assets/images/osh_logo.svg", // Placeholder, find actual
  //     isFeatured: true,
  //   },
  //   {
  //     id: "18d",
  //     name: "Trade Commerce Dept",
  //     subheading:
  //       "Official reports and statistics on international trade and commerce.",
  //     coverImage:
  //       "https://www.trade.gov/sites/default/files/2023-01/trade-logo.png", // Placeholder, find actual for Dept of Commerce
  //     isFeatured: false,
  //   },
  //   {
  //     id: "19d",
  //     name: "Flexport",
  //     subheading: "Track packages and shipments from various carriers.",
  //     coverImage: "https://example.com/shipping_info_cover.png", // Generic placeholder
  //     isFeatured: false,
  //   },
];

// const appstore_apps_dev: ServiceWithOffersFromVendors[] = [
//   {
//     id: "19",
//     name: "Amazon Cloud",
//     subheading: "Add storage to OfficeX with giftcards for $1 per 100GB/month",
//     cover_image:
//       "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
//     is_featured: false,
//     offers: [
//       {
//         id: "offer1-aws-s3-ai-csv-expodrt",
//         title: "100GB Storage Giftcard",
//         images: [],
//         description:
//           "<p>Purchase a 100GB gift card for secure, scalable cloud storage on Amazon Cloud. Your data is protected by AWS S3's industry-leading durability and availability, ensuring high reliability and performance. This gift card adds funds to your storage account with usage based pricing.</p><p>We offer fast and affordable storage thanks to AWS S3 Intelligent-Tiering, which automatically moves data to the most cost-effective storage tier without impacting performance. This provides high availability at wholesale pricing.</p><ul><li>Infrequently accessed files: Automatically moved to colder storage for as low as $0.0054/GB per month.</li><li>Frequently accessed files: Kept in standard storage for $0.03128/GB per month.</li></ul><p>Please note that data egress (downloading data from the cloud) is charged at $0.1224 per GB.</p><p>Expand your OfficeX storage capacity with this convenient 100GB gift card, ensuring all your important documents are safely stored in the cloud.</p>",
//         price: 0.01,
//         price_unit: "/GB",
//         price_explanation: "per month for storage and processing, min $1",
//         bookmarks: 180,
//         bookmarked_demand: 0,
//         cumulative_sales: 105000,
//         bookmark_url: "",
//         call_to_action: "Buy Giftcard",
//         vendors: [
//           {
//             id: "vendorA",
//             name: "Cloud Solutions Inc.",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
//             checkout_video:
//               "https://www.youtube.com/embed/ecv-19sYL3w?si=4jQ6W1YuYaK7Q4-k",
//             uptime_score: 99.99,
//             reviews_score: 4.8,
//             community_links: [
//               {
//                 label: "Forum",
//                 url: "#",
//               },
//               {
//                 label: "Discord",
//                 url: "#",
//               },
//             ],
//             price_line: "$0.01/GB/month",
//             view_page_link: "#",
//             call_to_action: "Buy Giftcard",
//             description:
//               "Expand your OfficeX storage capacity with this convenient 100GB gift card, ensuring all your important documents are safely stored in the cloud.",
//             vendor_disclaimer: "",
//             about_url: "https://vendor.com",
//             checkout_options: [
//               {
//                 offer_id: "aws-s3-storage-giftcard",
//                 checkout_flow_id:
//                   "001_amazon_storage_crypto_wallet_topup_gift_card_only",
//                 title: "USDC on Base",
//                 note: "To initialize the vendor (Note: Actual deposit address and details would be provided by the backend after initiating this checkout option)",
//                 checkout_init_endpoint:
//                   "https://vendorofficex.otterpad.cc/v1/checkout/initiate",
//                 checkout_pattern: CartCheckoutPatternEnum.CRYPTO_WALLET_TOPUP,
//                 vendor_notes: "You will receive a giftcard for AWS S3",
//                 vendor_disclaimer:
//                   "Immediate access. Your storage giftcard will have a crypto balance that pays for storage and bandwidth. You can top it up any time you need more.",
//                 terms_of_service_url: "https://google.com",
//                 requires_email_for_init: true,
//                 about_url: "https://vendor.com",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "17",
//     name: "The Pirate Bay",
//     subheading: "Upload to your storage. Delegate torrenting to cloud vendors",
//     cover_image:
//       "https://www.prsformusic.com/-/media/images/mmagazine/images/2017/08/piratebayresize.ashx?h=358&w=637&la=en&hash=0C7EFCAF4BED538A4A2E8A0D855333CD",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-piratebay-data-scraping",
//         title: "Delegate Torrent Download",
//         images: [],
//         description:
//           "<p>Delegate torrent downloads to cloud vendors for seamless integration with your Anonymous OfficeX storage. This service allows you to initiate torrent downloads remotely, with the downloaded content automatically saved to your designated cloud storage. Free up your local resources and ensure efficient, secure file acquisition for your projects.</p><p>Key features:</p><ul><li><strong>Cloud-Based Torrenting:</strong> Delegate torrent downloads to high-speed cloud servers.</li><li><strong>Direct to Storage:</strong> Automatically save downloaded files directly to your OfficeX integrated cloud storage (e.g., AWS S3).</li><li><strong>Bandwidth Efficiency:</strong> Utilize vendor's bandwidth for faster downloads without impacting your local network.</li><li><strong>Privacy & Security:</strong> Enhance privacy by offloading torrent activity from your personal devices.</li><li><strong>Automated & Scheduled:</strong> Option to schedule downloads or set up automated processes for new torrents.</li></ul><p>Streamline your file acquisition process by delegating torrent downloads to secure cloud vendors, ensuring direct delivery to your OfficeX storage.</p>",
//         price: 0.05,
//         price_unit: "/GB",
//         price_explanation: "per GB of data downloaded",
//         bookmarks: 350,
//         bookmarked_demand: 100,
//         cumulative_sales: 35000,
//         bookmark_url: "#",
//         call_to_action: "Book Service",
//         vendors: [
//           {
//             id: "tpb-vendor1",
//             name: "Data Harvest Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DHS",
//             checkout_video: undefined,
//             uptime_score: 99.5,
//             reviews_score: 4.1,
//             community_links: [
//               {
//                 label: "Support Forum",
//                 url: "#",
//               },
//             ],
//             price_line: "$0.05/record",
//             view_page_link: "#",
//             call_to_action: "Book Service",
//             description:
//               "We promise the best results and have a 30 day money back guarantee.",
//             vendor_disclaimer: undefined,
//             about_url: "#",
//             checkout_options: [
//               {
//                 offer_id: "offer-piratebay-data-scraping",
//                 checkout_flow_id: "tpb-vendor1-checkout-flow",
//                 title: "USDC on Base",
//                 note: "To initialize the vendor",
//                 checkout_init_endpoint:
//                   "http://localhost:3001/v1/checkout/initiate",
//                 checkout_pattern:
//                   CartCheckoutPatternEnum.CRYPTO_DIRECT_TRANSFER,
//                 vendor_notes: undefined,
//                 vendor_disclaimer: undefined,
//                 terms_of_service_url: undefined,
//                 requires_email_for_init: undefined,
//                 about_url: "#",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "21-t",
//     name: "Tornado Cash",
//     subheading: "Decentralized crypto mixer for enhanced transaction privacy.",
//     cover_image:
//       "https://img.freepik.com/premium-vector/tornado-cash-torn-coin-cryptocurrency-concept-banner-background_32996-2281.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-tornado-cash-0-1-eth",
//         title: "Mix 0.1 ETH",
//         images: [],
//         description:
//           "<p>Deposit <strong>0.1 ETH</strong> into the Tornado Cash privacy pool to break the on-chain link between your deposit and withdrawal addresses. This service enhances transaction anonymity by mixing your funds with those of other users in a large liquidity pool.</p><p>Key benefits:</p><ul><li><strong>Enhanced Privacy:</strong> Obfuscates transaction history.</li><li><strong>Decentralized:</strong> Operated by smart contracts, not a central entity.</li><li><strong>Permissionless:</strong> Accessible to anyone with an Ethereum wallet.</li><li><strong>Fixed Denomination:</strong> Standardized pool sizes for consistent mixing.</li></ul><p>Please ensure you understand the mechanics of crypto mixers and the associated risks before proceeding. A 'note' (secret) is generated upon deposit, which is required for withdrawal.</p>",
//         price: 0.1,
//         price_unit: "ETH",
//         price_explanation:
//           "The fixed denomination for this mixing pool. A small relayer fee (paid in ETH) is typically required for withdrawal.",
//         bookmarks: 500000,
//         bookmarked_demand: 10,
//         cumulative_sales: 50000,
//         bookmark_url: "https://dune.com/queries/100000/200000",
//         call_to_action: "Deposit 0.1 ETH",
//         vendors: [
//           {
//             id: "tornado-cash-protocol",
//             name: "Tornado Cash Protocol",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TCP",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 5,
//             community_links: [
//               {
//                 label: "GitHub (Archived)",
//                 url: "https://github.com/tornadocash",
//               },
//               {
//                 label: "Audit Reports",
//                 url: "https://tornado-cash.info/audits/",
//               },
//             ],
//             price_line: "Variable relayer fees for withdrawal",
//             view_page_link: "https://tornado-cash.info/",
//             call_to_action: "Access Mixer Interface",
//             description:
//               "Tornado Cash is a fully decentralized, non-custodial protocol that improves transaction privacy on Ethereum by breaking the on-chain link between sender and receiver addresses.",
//             vendor_disclaimer: undefined,
//             about_url: "https://tornado-cash.info/",
//             checkout_options: [
//               {
//                 offer_id: "offer-tornado-cash-0-1-eth",
//                 checkout_flow_id: "tornado-cash-0-1-eth-flow",
//                 title: "Deposit 0.1 ETH",
//                 note: "Deposit 0.1 ETH into the privacy pool.",
//                 checkout_init_endpoint:
//                   "http://localhost:3001/v1/checkout/initiate",
//                 checkout_pattern:
//                   CartCheckoutPatternEnum.CRYPTO_DIRECT_TRANSFER,
//                 vendor_notes: undefined,
//                 vendor_disclaimer: undefined,
//                 terms_of_service_url: undefined,
//                 requires_email_for_init: undefined,
//                 about_url: "https://tornado-cash.info/",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         id: "offer-tornado-cash-1-eth",
//         title: "Mix 1 ETH",
//         images: [],
//         description:
//           "<p>Utilize the <strong>1 ETH</strong> Tornado Cash pool for enhanced privacy of larger Ethereum transactions. Similar to other denominations, this pool allows you to deposit 1 ETH and withdraw it to a new address, breaking the on-chain link and improving your financial anonymity.</p><p>Key benefits:</p><ul><li><strong>Higher Denomination:</strong> Suitable for larger amounts of ETH.</li><li><strong>Proven Mechanism:</strong> Operates on the same audited smart contract principles.</li><li><strong>Community Supported:</strong> Relayers and interfaces maintained by the community.</li><li><strong>Non-Custodial:</strong> You retain control of your funds throughout the process.</li></ul><p>Remember to securely store your generated 'note' (secret) as it is essential for withdrawing your funds. Consider using a relayer for withdrawal to maximize privacy.</p>",
//         price: 1,
//         price_unit: "ETH",
//         price_explanation:
//           "The fixed denomination for this mixing pool. A small relayer fee (paid in ETH) is typically required for withdrawal.",
//         bookmarks: 200000,
//         bookmarked_demand: 10,
//         cumulative_sales: 200000,
//         bookmark_url: "https://dune.com/queries/100000/200000",
//         call_to_action: "Deposit 1 ETH",
//         vendors: [
//           {
//             id: "tornado-cash-protocol",
//             name: "Tornado Cash Protocol",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TCP",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 5,
//             community_links: [
//               {
//                 label: "GitHub (Archived)",
//                 url: "https://github.com/tornadocash",
//               },
//               {
//                 label: "Audit Reports",
//                 url: "https://tornado-cash.info/audits/",
//               },
//             ],
//             price_line: "Variable relayer fees for withdrawal",
//             view_page_link: "https://tornado-cash.info/",
//             call_to_action: "Access Mixer Interface",
//             description:
//               "Tornado Cash is a fully decentralized, non-custodial protocol that improves transaction privacy on Ethereum by breaking the on-chain link between sender and receiver addresses.",
//             vendor_disclaimer: undefined,
//             about_url: "https://tornado-cash.info/",
//             checkout_options: [
//               {
//                 offer_id: "offer-tornado-cash-1-eth",
//                 checkout_flow_id: "tornado-cash-1-eth-flow",
//                 title: "Deposit 1 ETH",
//                 note: "Deposit 1 ETH into the privacy pool.",
//                 checkout_init_endpoint:
//                   "http://localhost:3001/v1/checkout/initiate",
//                 checkout_pattern:
//                   CartCheckoutPatternEnum.CRYPTO_DIRECT_TRANSFER,
//                 vendor_notes: undefined,
//                 vendor_disclaimer: undefined,
//                 terms_of_service_url: undefined,
//                 requires_email_for_init: undefined,
//                 about_url: "https://tornado-cash.info/",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "20",
//     name: "Clickworker",
//     subheading: "Bulk volunteers for online gigwork & microtasks.",
//     cover_image:
//       "https://static.vecteezy.com/system/resources/previews/029/182/639/non_2x/black-corporate-id-card-template-clean-id-card-design-with-realistic-lanyard-mockup-free-vector.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-clickworker-100-simple-task",
//         title: "25 Volunteers for Simple Task",
//         images: [],
//         description:
//           "<p>Quickly complete 25 simple, repetitive microtasks using the Clickworker crowd. This offer is perfect for large-volume, straightforward assignments such as data entry, image tagging, sentiment analysis of short texts, or basic data validation. Get fast and accurate results for tasks that don't require complex decision-making.</p><p>Key benefits:</p><ul><li><strong>High Volume, Fast Turnaround:</strong> Ideal for large datasets and quick completion.</li><li><strong>Cost-Effective:</strong> Efficiently process many simple tasks at a lower unit cost.</li><li><strong>Scalable Workforce:</strong> Access a massive pool of Clickworkers.</li><li><strong>Automated Quality Checks:</strong> Benefit from Clickworker's streamlined quality assurance for microtasks.</li><li><strong>Seamless Integration:</strong> Easily integrate task submission and result retrieval.</li></ul><p>Automate your microtask workflows with the power of the Clickworker crowd.</p>",
//         price: 25,
//         price_unit: "/project",
//         price_explanation:
//           "Starting price for 25 simple tasks, varies by task type",
//         bookmarks: 300,
//         bookmarked_demand: 1000,
//         cumulative_sales: 100000,
//         bookmark_url: "#",
//         call_to_action: "Configure Project",
//         vendors: [
//           {
//             id: "clickworker-vendor1",
//             name: "Clickworker GmbH",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CWG",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.6,
//             community_links: [
//               {
//                 label: "API Docs",
//                 url: "http://docs.clickworker.com/swagger.html",
//               },
//             ],
//             price_line: "Pricing varies by task",
//             view_page_link: "https://www.clickworker.com/",
//             call_to_action: "Access Platform",
//             description:
//               "Clickworker is a leading crowdsourcing platform providing human intelligence for diverse tasks.",
//             vendor_disclaimer: undefined,
//             about_url: "https://www.clickworker.com/how-it-works/",
//             checkout_options: [
//               {
//                 offer_id: "offer-clickworker-100-simple-task",
//                 checkout_flow_id: "clickworker-simple-task-flow",
//                 title: "USDC on Base",
//                 note: "Deposit USDC to fund your Clickworker projects",
//                 checkout_init_endpoint:
//                   "http://localhost:3000/officex/install/click-worker-simple-task",
//                 checkout_pattern: CartCheckoutPatternEnum.EXTERNAL_PAYMENT_LINK,
//                 vendor_notes: undefined,
//                 vendor_disclaimer: undefined,
//                 terms_of_service_url: undefined,
//                 requires_email_for_init: undefined,
//                 about_url: "https://www.clickworker.com/how-it-works/",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         id: "offer-clickworker-25-complex-task",
//         title: "10 Volunteers for Complex Task",
//         images: [],
//         description:
//           "<p>Leverage the Clickworker crowd to tackle 25 complex tasks requiring human intelligence and nuanced understanding. This offer is ideal for projects such as detailed web research, content creation, data categorization with intricate rules, or in-depth data verification. Clickworkers are qualified based on your specific requirements to ensure high-quality results for challenging assignments.</p><p>Key benefits:</p><ul><li><strong>High-Quality Output:</strong> Access Clickworkers trained for complex tasks.</li><li><strong>Scalable Workforce:</strong> Get tasks completed efficiently by a large crowd.</li><li><strong>Customizable Requirements:</strong> Define specific skills or qualifications needed.</li><li><strong>Integrated Quality Control:</strong> Benefit from Clickworker's quality assurance processes.</li><li><strong>Flexible & On-Demand:</strong> Hire exactly when and how many you need.</li></ul><p>Empower your business with human intelligence for tasks that AI can't handle alone.</p>",
//         price: 30,
//         price_unit: "/project",
//         price_explanation:
//           "Starting price for 25 complex tasks, varies by task type and complexity",
//         bookmarks: 120,
//         bookmarked_demand: 2500,
//         cumulative_sales: 62500,
//         bookmark_url: "#",
//         call_to_action: "Configure Project",
//         vendors: [
//           {
//             id: "clickworker-vendor1",
//             name: "Clickworker GmbH",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CWG",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.6,
//             community_links: [
//               {
//                 label: "API Docs",
//                 url: "http://docs.clickworker.com/swagger.html",
//               },
//             ],
//             price_line: "Pricing varies by task",
//             view_page_link: "https://www.clickworker.com/",
//             call_to_action: "Access Platform",
//             description:
//               "Clickworker is a leading crowdsourcing platform providing human intelligence for diverse tasks.",
//             vendor_disclaimer: undefined,
//             about_url: "https://www.clickworker.com/how-it-works/",
//             checkout_options: [
//               {
//                 offer_id: "offer-clickworker-25-complex-task",
//                 checkout_flow_id: "clickworker-complex-task-flow",
//                 title: "USDC on Base",
//                 note: "Deposit USDC to fund your Clickworker projects",
//                 checkout_init_endpoint:
//                   "http://localhost:3000/officex/install/click-worker-complex-task",
//                 checkout_pattern: CartCheckoutPatternEnum.EXTERNAL_PAYMENT_LINK,
//                 vendor_notes: undefined,
//                 vendor_disclaimer: undefined,
//                 terms_of_service_url: undefined,
//                 requires_email_for_init: undefined,
//                 about_url: "https://www.clickworker.com/how-it-works/",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "american-express",
//     name: "American Express",
//     subheading: "Global financial services. Credit card points.",
//     cover_image:
//       "https://icm.aexp-static.com/Internet/internationalcardshop/en_in/images/cards/Gold_Card.png",
//     is_featured: false,
//     offers: [
//       {
//         id: "offer-amex-transaction-csv",
//         title: "Signup Bonus $100",
//         images: [],
//         description:
//           "<p>Sign up for a new American Express card through this offer and receive a $100 signup bonus! This exclusive promotion provides a direct incentive for new cardmembers, giving you a valuable boost when you join the American Express family. Enjoy the benefits and services of an Amex card along with this special bonus.</p><p>Key features of this offer:</p><ul><li><strong>$100 Signup Bonus:</strong> Receive a $100 bonus credited to your account after meeting initial spending requirements.</li><li><strong>Access to American Express Benefits:</strong> Enjoy premium customer service, purchase protection, and travel perks.</li><li><strong>Global Acceptance:</strong> Use your American Express card worldwide.</li><li><strong>Flexible Rewards Programs:</strong> Earn points on your spending, redeemable for travel, gift cards, or statement credits.</li><li><strong>Secure Transactions:</strong> Benefit from American Express's robust security features for peace of mind.</li></ul><p>Take advantage of this limited-time offer to earn a $100 signup bonus and experience the premium services of American Express.</p>",
//         price: 120,
//         price_unit: "/year",
//         price_explanation:
//           "American Express Gold Card starting at $10k/month credit limit",
//         bookmarks: 100,
//         bookmarked_demand: 600,
//         cumulative_sales: 60000,
//         bookmark_url: "#",
//         call_to_action: "Signup Free",
//         vendors: [
//           {
//             id: "amex-vendor1",
//             name: "Financial Data Solutions Inc.",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FDSI",
//             checkout_video:
//               "https://www.youtube.com/embed/EbLmCRuoW1w?si=YHaM5gX1MgbFhmTG",
//             uptime_score: 99.9,
//             reviews_score: 4.8,
//             community_links: [
//               {
//                 label: "Support",
//                 url: "#",
//               },
//             ],
//             price_line: "$90/month",
//             view_page_link: "#",
//             call_to_action: "Signup Free",
//             description:
//               "We promise the best results and have a 30 day money back guarantee.",
//             vendor_disclaimer: undefined,
//             about_url: "#",
//             checkout_options: [
//               {
//                 offer_id: "offer-amex-transaction-csv",
//                 checkout_flow_id: "amex-vendor1-checkout-flow",
//                 title: "Signup via Webhook",
//                 note: "Redirects to vendor for signup",
//                 checkout_init_endpoint:
//                   "https://obedient-airline-13.webhook.cool",
//                 checkout_pattern: CartCheckoutPatternEnum.EXTERNAL_PAYMENT_LINK,
//                 vendor_notes: undefined,
//                 vendor_disclaimer: undefined,
//                 terms_of_service_url: undefined,
//                 requires_email_for_init: true,
//                 about_url: "#",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "30",
//     name: "Gemini Agent",
//     subheading: "Enable AI features on OfficeX with powerful Gemini models.",
//     cover_image:
//       "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/final_keyword_header.width-1200.format-webp.webp",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-gemini-ai-dobrowser",
//         title: "Gemini AI on DoBrowser",
//         images: [],
//         description:
//           "<p>Integrate Gemini's powerful AI capabilities directly into your Anonymous OfficeX DoBrowser for intelligent web Browse, content summarization, and interactive assistance. This offer provides API access to Gemini, allowing you to use AI to enhance your Browse experience, extract key information from web pages, and get instant answers without leaving your browser environment.</p><p>Key benefits:</p><ul><li><strong>Intelligent Web Browse:</strong> Ask natural language questions about web content and get AI-driven answers.</li><li><strong>Content Summarization:</strong> Quickly summarize lengthy articles or documents directly within your browser.</li><li><strong>Interactive Assistance:</strong> Get real-time help with research, data extraction, and content generation.</li><li><strong>Secure & Private:</strong> Your Browse data is processed securely to maintain privacy within your Anonymous OfficeX platform.</li><li><strong>Seamless Integration:</strong> Easy setup to link Gemini AI with your DoBrowser instance.</li></ul><p>Transform your DoBrowser into a powerful AI-powered research and productivity tool with Gemini AI.</p>",
//         price: 0.007,
//         price_unit: "/1K tokens",
//         price_explanation: "for AI processing and generation",
//         bookmarks: 250,
//         bookmarked_demand: 1500,
//         cumulative_sales: 187500,
//         bookmark_url: "#",
//         call_to_action: "Install App",
//         vendors: [
//           {
//             id: "gemini-vendor1",
//             name: "AI Innovators Hub",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AIH",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 4.9,
//             community_links: [
//               {
//                 label: "Docs",
//                 url: "#",
//               },
//             ],
//             price_line: "Starting from $0.007/1K tokens",
//             view_page_link: "#",
//             call_to_action: "Install App",
//             description:
//               "We specialize in cutting-edge AI integrations and offer unparalleled support for our solutions.",
//             vendor_disclaimer: undefined,
//             about_url: "#",
//             checkout_options: [
//               {
//                 offer_id: "offer-gemini-ai-dobrowser",
//                 checkout_flow_id: "gemini-vendor1-checkout-flow",
//                 title: "USDC on Base",
//                 note: "Deposit USDC to purchase API credits",
//                 checkout_init_endpoint:
//                   "https://obedient-airline-13.webhook.cool",
//                 checkout_pattern: CartCheckoutPatternEnum.EXTERNAL_PAYMENT_LINK,
//                 vendor_notes: undefined,
//                 vendor_disclaimer: undefined,
//                 terms_of_service_url: undefined,
//                 requires_email_for_init: true,
//                 about_url: "#",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "31",
//     name: "Gnosis Multi-Sig",
//     subheading: "Secure your workspace with multiple admin voting rights",
//     cover_image:
//       "https://cdn.prod.website-files.com/67ed326db9d26b1dc1df7929/68017edea825224b44cfb0c7_6653f8d50a4daf8c4066b928_Gnosis%2520Safe%2520Explained.webp",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-gnosis-secure-folders",
//         title:
//           "Gnosis Safe Integration for Secure Cloud Folder Access (Multisig)",
//         images: [],
//         description: `
//           <p>Integrate Gnosis Safe with your Anonymous OfficeX cloud storage to create multi-signature protected secret folders and documents. This offer provides a robust security layer, requiring multiple authorized signatures (e.g., from team members or specific roles) to access, modify, or download sensitive files. Ideal for highly confidential documents, financial records, or strategic plans that demand an extra layer of access control.</p>
//           <p>Services include:</p>
//           <ul>
//             <li><strong>Multi-sig Folder Setup:</strong> Configure specific cloud folders to require Gnosis Safe multi-signature approval for access.</li>
//             <li><strong>Granular Access Control:</strong> Define 'M of N' signature requirements for different levels of access (read-only, edit, download).</li>
//             <li><strong>Activity Logging & Auditing:</strong> Track all access attempts and modifications to multisig-protected content.</li>
//             <li><strong>Secure Key Management Consultation:</strong> Best practices for securing the private keys of the signers.</li>
//             <li><strong>Integration with OfficeX:</strong> Seamlessly grant/revoke access directly from your OfficeX environment.</li>
//           </ul>
//           <p>Add an unparalleled level of security to your most sensitive OfficeX documents with Gnosis Safe multi-signature protection.</p>
//         `,
//         price: 750,
//         price_unit: "/setup",
//         price_explanation: "One-time setup fee for folder integration",
//         bookmarks: 120,
//         bookmarked_demand: 1000,
//         cumulative_sales: 60000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "gnosis-vendor1",
//             name: "SecureDocs Blockchain",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDBC",
//             checkout_video: undefined,
//             uptime_score: 99.99,
//             reviews_score: 4.8,
//             community_links: [{ label: "Consultation", url: "#" }],
//             price_line: "$750 (setup)",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "16",
//     name: "YouTube Downloader",
//     subheading: "Bulk download entire channels and playlists to your storage.",
//     cover_image:
//       "https://static1.anpoimages.com/wordpress/wp-content/uploads/2022/09/youtube-ap-hero-2.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-youtubedl-bulk-archive",
//         title: "Bulk YouTube Content Archiving to OfficeX Cloud Storage",
//         images: [],
//         description: `
//           <p>This offer provides a service for bulk downloading and archiving YouTube video and audio content directly into your Anonymous OfficeX cloud storage. Ideal for researchers, content creators, or businesses needing to retain large volumes of public YouTube data (e.g., competitor analysis, public sentiment, trend analysis) in a structured and accessible format. We can provide accompanying metadata in CSV format.</p>
//           <p>Features include:</p>
//           <ul>
//             <li><strong>Bulk Video/Audio Downloads:</strong> Download entire YouTube channels, playlists, or specific video lists.</li>
//             <li><strong>OfficeX Cloud Integration:</strong> Directly save downloaded content to your designated OfficeX cloud storage folders.</li>
//             <li><strong>Metadata CSV Export:</strong> Receive a CSV file with video titles, descriptions, upload dates, views, and other relevant data.</li>
//             <li><strong>Custom Quality & Format:</strong> Specify desired video quality (up to 4K) and audio formats (MP3, WAV).</li>
//             <li><strong>Automated Archiving:</strong> Set up recurring downloads for continuously updated content.</li>
//           </ul>
//           <p>Build a comprehensive archive of YouTube content within your OfficeX ecosystem for research, analysis, or internal use. Ensure compliance with YouTube's terms of service and copyright laws.</p>
//         `,
//         price: 10,
//         price_unit: "/GB",
//         price_explanation: "per GB of downloaded and stored content",
//         bookmarks: 250,
//         bookmarked_demand: 50,
//         cumulative_sales: 12500,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "youtubedl-vendor1",
//             name: "Video Archiving Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VAS",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.3,
//             community_links: [{ label: "FAQ", url: "#" }],
//             price_line: "$10/GB",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "tiktok",
//     name: "Buy TikTok Accounts",
//     subheading: "Scale social marketing with warmed healthy accounts",
//     cover_image: "https://img-c.udemycdn.com/course/750x422/4890032_95a9_2.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-tiktok-analytics-csv",
//         title: "Bulk Download TikTok Videos",
//         images: [],
//         description: `
//           <p>This service allows you to extract detailed analytics and trend data from TikTok, delivering it as structured CSV files for analysis within your Anonymous OfficeX environment. Gain insights into video performance, hashtag trends, audience demographics, and popular sounds to inform your content strategy or market research.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Video Performance Data:</strong> Export metrics like views, likes, shares, comments, and watch time for your TikTok content.</li>
//             <li><strong>Hashtag & Trend Analysis:</strong> Get CSVs on trending hashtags, popular sounds, and viral challenges.</li>
//             <li><strong>Audience Demographics:</strong> Access aggregated audience data to understand your viewers better.</li>
//             <li><strong>Competitor Analysis:</strong> Monitor and export data from public competitor profiles.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs ready for import into OfficeX Sheets for reporting and analysis.</li>
//           </ul>
//           <p>Leverage TikTok's vast dataset to drive your marketing decisions, all within your OfficeX suite.</p>
//         `,
//         price: 1,
//         price_unit: "/channel",
//         price_explanation:
//           "monthly subscription for data extraction and reporting",
//         bookmarks: 90,
//         bookmarked_demand: 800,
//         cumulative_sales: 72000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "tiktok-vendor1",
//             name: "Social Data Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDI",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.5,
//             community_links: [{ label: "Case Studies", url: "#" }],
//             price_line: "$250/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "exa-ai",
//     name: "Exa AI Search",
//     subheading: "Hyper-relevant lead prospecting using AI search & compilation",
//     cover_image: "https://pbs.twimg.com/media/GwkR4Q6bUAAJKUR?format=png",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-exa-ai-web-data-csv",
//         title: "Exa AI Web Data Extraction & CSV Export",
//         images: [],
//         description: `
//           <p>Integrate exa.ai's advanced AI-powered search capabilities with your Anonymous OfficeX environment to perform highly targeted web data extraction and receive results as structured CSV files. This service leverages exa.ai's ability to find and understand hyper-relevant information across the web, making it ideal for market research, competitive analysis, trend identification, and gathering specific data points for your OfficeX spreadsheets.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>AI-Powered Targeted Search:</strong> Utilize exa.ai to conduct deep, semantic searches across the web for specific information.</li>
//             <li><strong>Automated Data Extraction:</strong> Automatically pull relevant text, numbers, links, and other data points from search results.</li>
//             <li><strong>Structured CSV Output:</strong> Receive clean, organized CSV files tailored for easy import and analysis in OfficeX Sheets.</li>
//             <li><strong>Customizable Search Queries:</strong> Define precise search parameters and criteria to get the exact data you need.</li>
//             <li><strong>Scheduled Data Pulls:</strong> Set up recurring data extraction tasks to keep your datasets updated.</li>
//           </ul>
//           <p>Enhance your data intelligence by transforming the vastness of the web into actionable, structured CSV data, seamlessly integrated with your OfficeX suite.</p>
//         `,
//         price: 0.02,
//         price_unit: "/query",
//         price_explanation: "per AI-powered search query with data extraction",
//         bookmarks: 80,
//         bookmarked_demand: 300,
//         cumulative_sales: 24000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "exa-ai-vendor1",
//             name: "AI Search Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ASS",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 4.7,
//             community_links: [{ label: "API Docs", url: "#" }],
//             price_line: "$0.02/query",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "sproutgigs",
//     name: "SproutGigs",
//     subheading:
//       "Earn money by completing micro-purchases like social media engagement.",
//     cover_image:
//       "https://prabumulihpos.bacakoran.co/upload/02dbaa6f8e781dc7585fb835dccf2abb.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-sproutgigs-microtask-fulfillment",
//         title: "Human Microtasks",
//         images: [],
//         description: `
//           <p>This service offers fulfillment of various microtasks on SproutGigs, delivering structured data or completed tasks directly to your Anonymous OfficeX. Ideal for businesses needing rapid completion of repetitive digital tasks, data collection, content moderation, or simple verification processes.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Diverse Task Categories:</strong> Fulfill tasks like data entry, categorization, image tagging, content moderation, surveys, and more.</li>
//             <li><strong>Scalable Workforce:</strong> Leverage a large pool of micro-taskers for high-volume task completion.</li>
//             <li><strong>Quality Assurance:</strong> Implement checks to ensure accuracy and adherence to task instructions.</li>
//             <li><strong>Rapid Turnaround:</strong> Achieve quick completion for time-sensitive projects.</li>
//             <li><strong>Data Delivery to OfficeX:</strong> Receive clean, organized data or results directly in your OfficeX Sheets for further analysis, integration, or reporting.</li>
//           </ul>
//           <p>Streamline your workflows and gather valuable data efficiently by integrating SproutGigs microtask fulfillment into your OfficeX operations.</p>
//         `,
//         price: 0.03,
//         price_unit: "/task",
//         price_explanation: "per completed microtask",
//         bookmarks: 120,
//         bookmarked_demand: 300,
//         cumulative_sales: 35000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "sproutgigs-vendor1",
//             name: "TaskFlow Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TFS",
//             checkout_video: undefined,
//             uptime_score: 98.9,
//             reviews_score: 4.3,
//             community_links: [{ label: "FAQs", url: "#" }],
//             price_line: "$0.01/task",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "facebook-marketplace",
//     name: "Facebook Marketplace",
//     subheading: "Pay someone to post more for you. Posting as a service.",
//     cover_image: "https://juphy.com/wp-content/uploads/2023/05/image-51.png",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-fb-marketplace-listings-csv",
//         title: "Facebook Marketplace Listing Data Extraction (CSV Export)",
//         images: [],
//         description: `
//           <p>This service enables extraction of public listing data from Facebook Marketplace, providing it to your Anonymous OfficeX as structured CSV files. Ideal for market researchers, resellers, or businesses looking to analyze product trends, pricing strategies, or inventory availability within local or specific regions.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Targeted Listing Search:</strong> Extract data based on keywords, categories, price range, and location.</li>
//             <li><strong>Detailed Listing Data:</strong> Capture product title, description, price, seller information, and condition.</li>
//             <li><strong>Image URL Export:</strong> Include URLs to listing images for visual analysis.</li>
//             <li><strong>Trend & Pricing Analysis:</strong> Use extracted data to identify pricing trends and popular items.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for detailed analysis.</li>
//           </ul>
//           <p>Gain a competitive edge by leveraging real-time marketplace data, formatted for easy use in your OfficeX spreadsheets.</p>
//         `,
//         price: 0.1,
//         price_unit: "/listing",
//         price_explanation: "per extracted listing record",
//         bookmarks: 85,
//         bookmarked_demand: 200,
//         cumulative_sales: 17000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "fb-marketplace-vendor1",
//             name: "E-commerce Data Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ECDS",
//             checkout_video: undefined,
//             uptime_score: 99.4,
//             reviews_score: 4.2,
//             community_links: [{ label: "Client Portal", url: "#" }],
//             price_line: "$0.10/listing",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "linkedin",
//     name: "LinkedIn Delegation",
//     subheading: "Rent professional accounts to scale outreach & connections",
//     cover_image:
//       "https://www.codeur.com/blog/wp-content/uploads/2024/02/linkedin-top-voices-1-740x416.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-linkedin-lead-gen-csv",
//         title: "Rent LinkedIn Accounts",
//         images: [],
//         description: `
//           <p>This service focuses on extracting targeted lead and company data from LinkedIn for your Anonymous OfficeX, delivered as organized CSV files. Ideal for sales teams, recruiters, and market researchers looking to build prospect lists, analyze industry trends, or gather competitive intelligence from the world's largest professional network.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Targeted Lead Extraction:</strong> Identify and extract professional profiles based on industry, role, location, and seniority.</li>
//             <li><strong>Company Data Enrichment:</strong> Gather public company information including size, industry, location, and key employees.</li>
//             <li><strong>Purchase Posting Data:</strong> Extract data from purchase postings for talent market analysis.</li>
//             <li><strong>Network Mapping:</strong> Visualize connections and influence within specific professional networks (optional add-on).</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, structured CSVs ready for CRM import or analysis in OfficeX Sheets.</li>
//           </ul>
//           <p>Supercharge your outreach and market research efforts with precisely targeted LinkedIn data, seamlessly integrated into your OfficeX platform.</p>
//         `,
//         price: 30,
//         price_unit: "/month",
//         price_explanation: "per verified professional",
//         bookmarks: 140,
//         bookmarked_demand: 600,
//         cumulative_sales: 84000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "linkedin-vendor1",
//             name: "Professional Data Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PDS",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.7,
//             community_links: [{ label: "Success Stories", url: "#" }],
//             price_line: "$0.20/lead",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "uma-protocol",
//     name: "UMA Protocol",
//     subheading: "Verify marketplace purchases with decentralized oracles.",
//     cover_image:
//       "https://public.bnbstatic.com/static/academy/uploads-original/fc76576af82644fca04b60a46ad9dd39.png",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-uma-transaction-verification",
//         title: "Marketplace Transaction Verification",
//         images: [],
//         description: `
//           <p>Leverage the UMA Protocol's Optimistic Oracle for robust and decentralized verification of marketplace transactions within your Anonymous OfficeX ecosystem. This service provides a crowd-sourced mechanism to ensure the accuracy and integrity of transaction data, minimizing disputes and building trust.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Optimistic Verification:</strong> Transactions are optimistically assumed correct, with a challenge period for disputes.</li>
//             <li><strong>Decentralized Dispute Resolution:</strong> UMA token holders vote to resolve disputed assertions, ensuring unbiased outcomes.</li>
//             <li><strong>Cost-Efficient:</strong> Verifications are only escalated to the full dispute mechanism when challenged, saving on gas fees.</li>
//             <li><strong>Enhanced Trust:</strong> Provides a transparent and verifiable layer of security for your marketplace transactions.</li>
//             <li><strong>Integration with OfficeX:</strong> Receive verification statuses and dispute outcomes directly within your OfficeX applications.</li>
//           </ul>
//           <p>Build a more secure and trustworthy marketplace with UMA Protocol's decentralized verification capabilities.</p>
//         `,
//         price: 2,
//         price_unit: "/verification",
//         price_explanation: "per crowd verification via Optimistic Oracle",
//         bookmarks: 60,
//         bookmarked_demand: 450,
//         cumulative_sales: 33750,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "uma-vendor1",
//             name: "VeriTrust Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VTS",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 4.8,
//             community_links: [
//               { label: "UMA Docs", url: "https://docs.uma.xyz/" },
//             ],
//             price_line: "$2/verification",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "tiktok-downloader",
//     name: "TikTok Downloader",
//     subheading:
//       "Short-form video platform.\nCreate and discover viral content.",
//     cover_image: "https://img-c.udemycdn.com/course/750x422/4890032_95a9_2.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-tiktok-analytics-csv",
//         title: "Bulk Download TikTok Videos",
//         images: [],
//         description: `
//           <p>This service allows you to extract detailed analytics and trend data from TikTok, delivering it as structured CSV files for analysis within your Anonymous OfficeX environment. Gain insights into video performance, hashtag trends, audience demographics, and popular sounds to inform your content strategy or market research.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Video Performance Data:</strong> Export metrics like views, likes, shares, comments, and watch time for your TikTok content.</li>
//             <li><strong>Hashtag & Trend Analysis:</strong> Get CSVs on trending hashtags, popular sounds, and viral challenges.</li>
//             <li><strong>Audience Demographics:</strong> Access aggregated audience data to understand your viewers better.</li>
//             <li><strong>Competitor Analysis:</strong> Monitor and export data from public competitor profiles.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs ready for import into OfficeX Sheets for reporting and analysis.</li>
//           </ul>
//           <p>Leverage TikTok's vast dataset to drive your marketing decisions, all within your OfficeX suite.</p>
//         `,
//         price: 1,
//         price_unit: "/channel",
//         price_explanation:
//           "monthly subscription for data extraction and reporting",
//         bookmarks: 90,
//         bookmarked_demand: 800,
//         cumulative_sales: 72000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "tiktok-vendor1",
//             name: "Social Data Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDI",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.5,
//             community_links: [{ label: "Case Studies", url: "#" }],
//             price_line: "$250/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "13",
//     name: "Spreadsheets",
//     subheading: "Powerful tool for data organization and analysis. CSV dumps",
//     cover_image:
//       "https://static1.howtogeekimages.com/wordpress/wp-content/uploads/2024/08/an-excel-spreadsheet-displaying-a-heat-map-with-the-excel-logo-in-front-of-it.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-spreadsheet-ai-csv-workflows",
//         title:
//           "AI-Driven Workflows for CSV Uploads in Anonymous OfficeX Sheets",
//         images: [],
//         description: `
//           <p>This offer provides advanced services to build AI-driven workflows directly within Anonymous OfficeX Spreadsheets, specifically designed for handling CSV data uploads. Automate tasks like data cleaning, categorization, enrichment via web scraping, or even trigger AI models for predictive analysis immediately after a CSV is uploaded to your cloud storage or imported into a sheet.</p>
//           <p>Services include:</p>
//           <ul>
//             <li><strong>Automated CSV Data Cleaning:</strong> AI identifies and corrects inconsistencies, duplicates, or missing values upon upload.</li>
//             <li><strong>Data Enrichment (Web Scraping):</strong> Automatically pull additional data from the web based on CSV content (e.g., company details from names).</li>
//             <li><strong>AI Categorization & Tagging:</strong> Use AI to classify data points within your CSVs for better organization.</li>
//             <li><strong>Custom Macro/Script Development:</strong> Build powerful automation scripts (e.g., Google Apps Script, VBA for compatibility) to react to CSV changes.</li>
//             <li><strong>Dashboard Integration:</strong> Update interactive dashboards automatically with newly uploaded CSV data.</li>
//           </ul>
//           <p>Transform your spreadsheets into intelligent, automated data processing hubs for all your CSV-based workflows.</p>
//         `,
//         price: 400,
//         price_unit: "/workflow",
//         price_explanation: "starting price for custom AI-powered CSV workflows",
//         bookmarks: 150,
//         bookmarked_demand: 1200,
//         cumulative_sales: 180000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "spreadsheet-vendor1",
//             name: "Data Flow Gurus",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DFG",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.6,
//             community_links: [{ label: "Samples", url: "#" }],
//             price_line: "From $400",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "15",
//     name: "Telegram Agent",
//     subheading:
//       "Secure messaging and voice calls.\nConnect with friends and family.",
//     cover_image:
//       "https://mir-s3-cdn-cf.behance.net/project_modules/1400/3d89aa78088397.5c9a9eb73dabf.png",
//     is_featured: false,
//     offers: [
//       {
//         id: "offer-telegram-csv-notifications",
//         title: "Telegram Media Archive Bot",
//         images: [],
//         description:
//           "<p>This offer provides a custom Telegram bot designed to help you archive media and files from your Telegram chats directly to your OfficeX cloud storage. Never lose important photos, videos, or documents shared in your Telegram conversations. The bot automates the process of saving media to your designated OfficeX-connected cloud folders, keeping your valuable data organized and accessible.</p><p>Features include:</p><ul><li><strong>Automated Media Archiving:</strong> Automatically save photos, videos, and documents from Telegram chats to OfficeX storage.</li><li><strong>Configurable Storage Locations:</strong> Choose specific OfficeX cloud folders for different types of media or chats.</li><li><strong>Real-time Sync:</strong> Media is archived as it's shared, ensuring you have the latest content.</li><li><strong>Secure & Private:</strong> Ensures your media is securely transferred and stored in your private OfficeX environment.</li><li><strong>Easy Setup:</strong> Simple installation and configuration to link your Telegram with OfficeX storage.</li></ul><p>Transform your Telegram into a powerful media archiving tool, securing all your shared content within your Anonymous OfficeX platform.</p>",
//         price: 10,
//         price_unit: "/month",
//         price_explanation:
//           "starting price for custom bot development and integration",
//         bookmarks: 150,
//         bookmarked_demand: 750,
//         cumulative_sales: 112500,
//         bookmark_url: "#",
//         call_to_action: "Install App",
//         vendors: [
//           {
//             id: "telegram-vendor1",
//             name: "Bot Builders Co.",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BBC",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.5,
//             community_links: [
//               {
//                 label: "Portfolio",
//                 url: "#",
//               },
//             ],
//             price_line: "From $10/month",
//             view_page_link: "#",
//             call_to_action: "Install App",
//             description:
//               "We promise the best results and have a 30 day money back guarantee.",
//             vendor_disclaimer: undefined,
//             about_url: "#",
//             checkout_options: [
//               {
//                 offer_id: "offer-telegram-csv-notifications",
//                 checkout_flow_id: "telegram-vendor1-checkout-flow",
//                 title: "USDC on Base",
//                 note: "Deposit USDC to purchase the app",
//                 checkout_init_endpoint:
//                   "https://obedient-airline-13.webhook.cool",
//                 checkout_pattern: CartCheckoutPatternEnum.EXTERNAL_PAYMENT_LINK,
//                 vendor_notes: undefined,
//                 vendor_disclaimer: undefined,
//                 terms_of_service_url: undefined,
//                 requires_email_for_init: true,
//                 about_url: "#",
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "5",
//     name: "Uniswap",
//     subheading:
//       "Decentralized exchange for cryptocurrency trading.\nSwap tokens securely.",
//     cover_image:
//       "https://www.newsbtc.com/wp-content/uploads/2024/11/Uniswap-from-LinkedIn.jpg?fit=800%2C450",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-uniswap-data-analytics",
//         title:
//           "DeFi Data Analytics for OfficeX: Uniswap Trading & LP CSV Exports",
//         images: [],
//         description: `
//           <p>This offer provides specialized data analytics services focused on Decentralized Finance (DeFi) platforms like Uniswap. We help you scrape and organize your on-chain transaction data, liquidity provision activities, and yield farming metrics into comprehensive CSV files, ready for detailed analysis within your Anonymous OfficeX spreadsheets. Understand your crypto portfolio performance, impermanent loss, and fee generation with clear, structured data.</p>
//           <p>What you'll get:</p>
//           <ul>
//             <li><strong>Uniswap Transaction CSVs:</strong> Export detailed records of your swaps, liquidity additions, and removals.</li>
//             <li><strong>Yield Farming Performance Reports:</strong> Generate CSVs outlining your earnings and impermanent loss from various liquidity pools.</li>
//             <li><strong>Custom Data Queries:</strong> Request specific on-chain data to be pulled and formatted into CSV.</li>
//             <li><strong>Integration Readiness:</strong> CSV outputs are optimized for easy import and analysis in OfficeX Sheets.</li>
//             <li><strong>Expert Analysis & Insights:</strong> Optional add-on for a human analyst to provide insights from your data.</li>
//           </ul>
//           <p>Gain a clearer financial picture of your DeFi activities with structured data for your OfficeX cloud office suite.</p>
//         `,
//         price: 199,
//         price_unit: "/report",
//         price_explanation: "per custom data report/CSV export",
//         bookmarks: 180,
//         bookmarked_demand: 250,
//         cumulative_sales: 45000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "uniswap-vendor1",
//             name: "DeFi Data Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DDI",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 4.7,
//             community_links: [{ label: "Webinars", url: "#" }],
//             price_line: "$199/report",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "3",
//     name: "n8n",
//     subheading:
//       "Workflow automation for developers.\nIntegrate apps and services.",
//     cover_image:
//       "https://blog.n8n.io/content/images/size/w1200/2024/10/ai-workflow-automationA--1-.png",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-n8n-ai-csv-integration",
//         title: "n8n Automation for AI Web Scraping & CSV Processing in OfficeX",
//         images: [],
//         description: `
//           <p>This offer provides expert development of custom n8n workflows specifically tailored for your Anonymous OfficeX environment, focusing on AI-powered web scraping, automated CSV data dumps, and actions triggered by CSV uploads. Build complex, multi-step automations that interact with websites, extract data, transform it into CSVs, and then use that data to update or trigger actions within your OfficeX documents and cloud storage.</p>
//           <p>Services include:</p>
//           <ul>
//             <li><strong>AI Web Scraping Workflows:</strong> Design n8n workflows that use AI to intelligently extract data from websites, even complex or unstructured content.</li>
//             <li><strong>Automated CSV Generation:</strong> Convert scraped data or other inputs into clean, formatted CSV files for OfficeX import.</li>
//             <li><strong>CSV Upload Triggers:</strong> Create workflows that automatically run (e.g., data validation, processing, notification) when a CSV is uploaded to OfficeX cloud storage.</li>
//             <li><strong>Bulk Data Actions:</strong> Implement workflows for bulk downloading specific documents or data sets from OfficeX, based on CSV instructions.</li>
//             <li><strong>Integration with OfficeX APIs:</strong> Connect n8n directly with OfficeX's underlying APIs for seamless data flow.</li>
//           </ul>
//           <p>Supercharge your OfficeX operations with custom n8n automations for intelligent data acquisition and processing.</p>
//         `,
//         price: 600,
//         price_unit: "/workflow",
//         price_explanation: "starting price per custom advanced workflow",
//         bookmarks: 100,
//         bookmarked_demand: 1500,
//         cumulative_sales: 150000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "n8n-vendor1",
//             name: "Automation Architects",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AA",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 4.8,
//             community_links: [{ label: "Case Studies", url: "#" }],
//             price_line: "From $600",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "32-places",
//     name: "Google Maps Reviews",
//     subheading:
//       "Prospect leads from local businesses and places.\nExplore your city.",
//     cover_image:
//       "https://cdn.mappr.co/wp-content/uploads/2022/03/google-places-api-alternatives.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-gmaps-ai-lead-generation",
//         title: "AI-Powered Google Maps Business Lead Generation & CSV Export",
//         images: [],
//         description: `
//           <p>This offer provides an AI-enhanced service for generating targeted business leads from Google Maps, delivering them directly to your Anonymous OfficeX as organized CSV dumps. Leverage AI to refine search criteria, filter for high-potential leads, and extract richer data points (e.g., website contact info, social media links) beyond standard listings, all formatted for immediate use in your OfficeX spreadsheets or CRM.</p>
//           <p>What you'll get:</p>
//           <ul>
//             <li><strong>AI-Optimized Lead Filtering:</strong> Use AI to identify businesses matching complex criteria (e.g., specific keywords in reviews, business activity signals).</li>
//             <li><strong>Comprehensive Data Points:</strong> Extract business name, address, phone, website, email (if publicly available), social media links, reviews count, and ratings.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, structured CSV files ready for import into OfficeX Sheets for sales outreach or market analysis.</li>
//             <li><strong>Bulk Download & Automation:</strong> Option to schedule recurring lead generation and automated CSV delivery to your cloud storage.</li>
//             <li><strong>Geospatial Data Visualization (Add-on):</strong> Integrate extracted lead data with mapping tools (optional).</li>
//           </ul>
//           <p>Fill your sales pipeline with high-quality, AI-curated local business leads, delivered in a convenient CSV format for your OfficeX platform.</p>
//         `,
//         price: 0.15,
//         price_unit: "/lead",
//         price_explanation: "per verified and AI-enriched lead record",
//         bookmarks: 180,
//         bookmarked_demand: 400,
//         cumulative_sales: 72000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "gmaps-vendor1",
//             name: "AI Lead Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ALS",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.7,
//             community_links: [{ label: "Testimonials", url: "#" }],
//             price_line: "$0.15/lead",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "1",
//     name: "Dmail",
//     subheading:
//       "Secure and decentralized email communication.\nProtect your privacy.",
//     cover_image: "https://dmail.ai/assets/2-6c029453.png",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-dmail-csv-email-automation",
//         title: "Dmail Integration for CSV-Driven Bulk Email Campaigns",
//         images: [],
//         description: `
//           <p>Integrate Dmail's secure, decentralized email capabilities with your Anonymous OfficeX platform to launch CSV-driven bulk email campaigns. This offer allows you to upload recipient lists and email content via CSV files, then leverage Dmail for secure, privacy-focused outreach. Ideal for newsletters, transactional emails, or secure communications where privacy and decentralization are paramount.</p>
//           <p>Benefits include:</p>
//           <ul>
//             <li><strong>CSV-to-Email Automation:</strong> Use recipient lists and personalized content from OfficeX CSVs to send bulk emails via Dmail.</li>
//             <li><strong>Decentralized & Secure Sending:</strong> Leverage Dmail's Web3 infrastructure for enhanced privacy and censorship resistance.</li>
//             <li><strong>Personalized Campaigns:</strong> Dynamically insert data from your CSV into email templates for personalized outreach.</li>
//             <li><strong>Attachment Support:</strong> Attach documents from your OfficeX cloud storage to Dmail emails.</li>
//             <li><strong>Delivery Reports (CSV):</strong> Receive analytics and delivery statuses in CSV format for performance tracking.</li>
//           </ul>
//           <p>Execute secure and privacy-centric email campaigns directly from your OfficeX data, powered by Dmail.</p>
//         `,
//         price: 0.01,
//         price_unit: "/email",
//         price_explanation: "per bulk email sent via Dmail",
//         bookmarks: 130,
//         bookmarked_demand: 100,
//         cumulative_sales: 13000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "dmail-vendor1",
//             name: "Dmail Official",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DO",
//             checkout_video: undefined,
//             uptime_score: 99.99,
//             reviews_score: 4.9,
//             community_links: [{ label: "Docs", url: "#" }],
//             price_line: "$0.01/email",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "instagram",
//     name: "Instagram",
//     subheading: "Photo and video sharing social network.\nConnect visually.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-instagram-data-scraper-csv",
//         title: "Instagram Profile & Engagement Data Scraper (CSV Export)",
//         images: [],
//         description: `
//           <p>This service provides tools for extracting public data from Instagram profiles, posts, and engagement metrics, delivering the insights directly to your Anonymous OfficeX as structured CSV files. Ideal for social media marketers, influencers, or businesses looking to analyze trends, monitor competitor activity, or identify potential collaborators.</p>
//           <p>Features include:</p>
//           <ul>
//             <li><strong>Profile Data Export:</strong> Scrape public profile information like follower count, following count, bio, and contact details.</li>
//             <li><strong>Post Engagement Metrics:</strong> Extract likes, comments, and shares for specified posts.</li>
//             <li><strong>Hashtag & Location Data:</strong> Gather data related to posts using specific hashtags or geotags.</li>
//             <li><strong>Comment & Mention Analysis:</strong> Export comments and mentions for sentiment analysis or trend identification.</li>
//             <li><strong>CSV Output for OfficeX:</strong> Receive clean, formatted CSVs for easy import into OfficeX Sheets.</li>
//           </ul>
//           <p>Transform raw Instagram data into actionable insights for your marketing and content strategies within OfficeX.</p>
//         `,
//         price: 0.08,
//         price_unit: "/record",
//         price_explanation: "per data record (e.g., profile, post, comment)",
//         bookmarks: 110,
//         bookmarked_demand: 300,
//         cumulative_sales: 33000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "instagram-vendor1",
//             name: "Social Metrics Pro",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SMP",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.4,
//             community_links: [{ label: "Blog", url: "#" }],
//             price_line: "$0.08/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "4",
//     name: "ChatGPT",
//     subheading: "AI-powered conversational assistant.\nGet instant answers.",
//     cover_image:
//       "https://www.designmantic.com/blog/wp-content/uploads/2023/04/ChatGPT-1280x720.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-chatgpt-csv-prompting",
//         title: "ChatGPT for CSV-Driven Document Generation & AI Actions",
//         images: [],
//         description: `
//           <p>Integrate ChatGPT's advanced AI capabilities with your Anonymous OfficeX workflows to enable document generation and AI actions driven by CSV data uploads. This service allows you to use content from your spreadsheets as prompts for ChatGPT, generating reports, drafting emails, summarizing data, or performing complex text-based tasks directly within your cloud office environment. Upload a CSV, and let AI generate structured documents or perform bulk text operations.</p>
//           <p>Benefits include:</p>
//           <ul>
//             <li><strong>CSV-to-Document Automation:</strong> Generate reports, contracts, or personalized emails by feeding data from OfficeX CSVs to ChatGPT.</li>
//             <li><strong>Bulk Content Generation:</strong> Create multiple variations of text content based on rows in a spreadsheet (e.g., product descriptions, marketing copy).</li>
//             <li><strong>AI-Powered Data Summarization:</strong> Summarize large textual datasets within your CSVs into concise reports or overviews.</li>
//             <li><strong>Semantic Search & Q&A:</strong> Use natural language to query your CSV data, leveraging ChatGPT's understanding.</li>
//             <li><strong>Content Refinement & Editing:</strong> Leverage AI to improve grammar, style, or tone of documents generated from data.</li>
//           </ul>
//           <p>Transform your OfficeX CSV data into dynamic, AI-generated text and documents, enhancing productivity and content creation.</p>
//         `,
//         price: 30,
//         price_unit: "/month",
//         price_explanation: "flat rate for API access and integrated workflows",
//         bookmarks: 400,
//         bookmarked_demand: 360,
//         cumulative_sales: 144000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "chat-vendor1",
//             name: "AI Solutions Direct",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ASD",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.6,
//             community_links: [{ label: "FAQ", url: "#" }],
//             price_line: "$30/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "lastpass",
//     name: "LastPass",
//     subheading:
//       "Password manager.\nSecurely store and access your credentials.",
//     cover_image: "https://images.unsplash.com/photo-1629744415843-0b0b0b0b0b0b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-lastpass-secure-csv-import",
//         title: "Secure LastPass CSV Password Import & Audit",
//         images: [],
//         description: `
//           <p>This offer facilitates secure import and auditing of LastPass-exported CSV password data into a protected environment linked with your Anonymous OfficeX. We help you securely migrate, organize, and analyze your password vault data (e.g., for compliance, identifying weak passwords, or consolidating logins) while ensuring maximum privacy and security.</p>
//           <p>Services include:</p>
//           <ul>
//             <li><strong>Secure CSV Import:</strong> Guided process for safely importing LastPass CSV exports.</li>
//             <li><strong>Password Audit & Analysis:</strong> Identify weak, duplicate, or compromised passwords within your dataset.</li>
//             <li><strong>Categorization & Organization:</strong> Help structure your password data within OfficeX for easy management.</li>
//             <li><strong>Security Best Practices:</strong> Consultation on best practices for managing sensitive credential data.</li>
//             <li><strong>Encrypted Storage Options:</strong> Advise on and implement highly encrypted storage solutions for your credential CSVs.</li>
//           </ul>
//           <p>Enhance your organization's digital security by efficiently managing and auditing your LastPass credential data in a secure OfficeX-compatible format.</p>
//         `,
//         price: 150,
//         price_unit: "/audit",
//         price_explanation: "per secure import and audit session",
//         bookmarks: 70,
//         bookmarked_demand: 400,
//         cumulative_sales: 28000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "lastpass-vendor1",
//             name: "CyberSafe Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CSS",
//             checkout_video: undefined,
//             uptime_score: 99.99,
//             reviews_score: 4.8,
//             community_links: [{ label: "Security Whitepapers", url: "#" }],
//             price_line: "$150/audit",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "reddit",
//     name: "Reddit",
//     subheading:
//       "Community-driven news and discussion platform.\nExplore diverse topics.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-reddit-sentiment-csv",
//         title: "Reddit Sentiment Analysis & Trend Data (CSV Export)",
//         images: [],
//         description: `
//           <p>This service offers in-depth sentiment analysis and trend data extraction from Reddit, delivering valuable insights as structured CSV files to your Anonymous OfficeX. Monitor brand mentions, public opinion, trending topics, and community discussions to inform your marketing, product development, or public relations strategies.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Keyword & Subreddit Monitoring:</strong> Track specific keywords, phrases, or subreddits for relevant discussions.</li>
//             <li><strong>Sentiment Analysis:</strong> Categorize public sentiment (positive, negative, neutral) regarding your brand, products, or topics.</li>
//             <li><strong>Trend Identification:</strong> Identify emerging trends and viral content across Reddit communities.</li>
//             <li><strong>User Engagement Metrics:</strong> Extract upvotes, comments, and share counts for posts and comments.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive organized CSVs for easy import into OfficeX Sheets for further analysis and reporting.</li>
//           </ul>
//           <p>Uncover the pulse of online communities and gain competitive intelligence by integrating Reddit data into your OfficeX workflows.</p>
//         `,
//         price: 300,
//         price_unit: "/month",
//         price_explanation:
//           "monthly subscription for Reddit data monitoring and export",
//         bookmarks: 100,
//         bookmarked_demand: 900,
//         cumulative_sales: 90000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "reddit-vendor1",
//             name: "Community Insights Lab",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CIL",
//             checkout_video: undefined,
//             uptime_score: 99.5,
//             reviews_score: 4.3,
//             community_links: [{ label: "API Docs", url: "#" }],
//             price_line: "$300/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "discord",
//     name: "Discord",
//     subheading:
//       "Voice, video, and text chat for communities.\nConnect with groups.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-discord-community-csv",
//         title: "Discord Community Activity & Sentiment Analysis (CSV Export)",
//         images: [],
//         description: `
//           <p>This service provides tools for extracting and analyzing public activity and sentiment from Discord servers, delivering the insights as structured CSV files to your Anonymous OfficeX. Monitor discussions, identify key community members, track sentiment around specific topics or products, and understand engagement patterns for community management, market research, or brand monitoring.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Server & Channel Monitoring:</strong> Track activity within specified public Discord servers and channels.</li>
//             <li><strong>Message & User Data:</strong> Extract message content, user IDs, timestamps, and reaction counts.</li>
//             <li><strong>Sentiment Analysis:</strong> Apply AI to categorize the sentiment of messages (positive, negative, neutral).</li>
//             <li><strong>Keyword & Topic Tracking:</strong> Monitor discussions around specific keywords or emerging topics.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for detailed reporting.</li>
//           </ul>
//           <p>Turn raw Discord chatter into actionable data points for your strategic planning within the OfficeX environment.</p>
//         `,
//         price: 400,
//         price_unit: "/month",
//         price_explanation:
//           "monthly subscription for Discord data monitoring and export",
//         bookmarks: 60,
//         bookmarked_demand: 1200,
//         cumulative_sales: 72000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "discord-vendor1",
//             name: "Community Data Experts",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CDE",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.4,
//             community_links: [{ label: "Support Chat", url: "#" }],
//             price_line: "$400/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "pinterest",
//     name: "Pinterest",
//     subheading: "Visual discovery engine.\nFind ideas and inspiration.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-pinterest-trend-csv",
//         title: "Pinterest Trend & Idea Pin Data Extraction (CSV Export)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting trending visual content data and idea pin insights from Pinterest, delivering them as structured CSV files to your Anonymous OfficeX. Ideal for content creators, marketers, and product developers to identify visual trends, popular product ideas, and user preferences to inform their creative and business strategies.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Trending Topic Extraction:</strong> Identify popular and emerging visual trends across Pinterest categories.</li>
//             <li><strong>Idea Pin Data:</strong> Extract data from Idea Pins, including titles, descriptions, and engagement metrics.</li>
//             <li><strong>Keyword & Category Analysis:</strong> Gather data related to specific keywords, themes, and product categories.</li>
//             <li><strong>Image & Video URLs:</strong> Include URLs to pins for visual reference and content analysis.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for visual trend analysis.</li>
//           </ul>
//           <p>Unlock the power of visual trends and consumer inspiration by integrating Pinterest data into your OfficeX workflows.</p>
//         `,
//         price: 0.05,
//         price_unit: "/pin",
//         price_explanation: "per extracted trending pin or idea pin record",
//         bookmarks: 75,
//         bookmarked_demand: 250,
//         cumulative_sales: 18750,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "pinterest-vendor1",
//             name: "Visual Trend Analytics",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VTA",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.5,
//             community_links: [{ label: "Portfolio", url: "#" }],
//             price_line: "$0.05/pin",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "github",
//     name: "GitHub",
//     subheading:
//       "Developer platform for version control and collaboration.\nBuild software.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-github-repo-data-csv",
//         title: "GitHub Repository & Developer Data Extraction (CSV Export)",
//         images: [],
//         description: `
//           <p>This service provides tools for extracting public data from GitHub repositories and developer profiles, delivering insights as structured CSV files to your Anonymous OfficeX. Ideal for recruiters, researchers, or project managers to analyze open-source projects, track developer activity, or identify potential collaborators and talent.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Repository Metrics:</strong> Extract data on stars, forks, issues, pull requests, and commit activity for public repos.</li>
//             <li><strong>Developer Profile Data:</strong> Gather public information on developers, their contributions, and spoken languages.</li>
//             <li><strong>Codebase Analysis (Metadata):</strong> Extract metadata about code languages used and file structures.</li>
//             <li><strong>Issue & Pull Request Tracking:</strong> Monitor and export data on open/closed issues and pull requests.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for project management or talent sourcing.</li>
//           </ul>
//           <p>Gain a data-driven perspective on the open-source world by integrating GitHub data into your OfficeX environment.</p>
//         `,
//         price: 0.12,
//         price_unit: "/record",
//         price_explanation: "per extracted repository or developer record",
//         bookmarks: 95,
//         bookmarked_demand: 400,
//         cumulative_sales: 38000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "github-vendor1",
//             name: "DevData Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DDS",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.6,
//             community_links: [{ label: "Documentation", url: "#" }],
//             price_line: "$0.12/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "sendgrid",
//     name: "SendGrid",
//     subheading:
//       "Email marketing and transactional email service.\nDeliver emails reliably.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-sendgrid-email-logs-csv",
//         title: "SendGrid Email Log & Analytics Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of detailed email logs and analytics from SendGrid, delivering them as structured CSV files to your Anonymous OfficeX. Gain comprehensive insights into your email campaign performance, delivery rates, bounces, clicks, and opens for in-depth analysis and reporting within your spreadsheets.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Detailed Email Event Logs:</strong> Export data on delivered, opened, clicked, bounced, and unsubscribed emails.</li>
//             <li><strong>Campaign Performance Metrics:</strong> Gather aggregated data for specific email campaigns or automation.</li>
//             <li><strong>Recipient Engagement Data:</strong> Track individual recipient activity for personalized follow-ups.</li>
//             <li><strong>Error & Bounce Analysis:</strong> Identify reasons for non-delivery and improve email deliverability.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for reporting and optimization.</li>
//           </ul>
//           <p>Optimize your email marketing and transactional communications with granular SendGrid data, seamlessly integrated into your OfficeX analytics.</p>
//         `,
//         price: 200,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for SendGrid data export",
//         bookmarks: 80,
//         bookmarked_demand: 500,
//         cumulative_sales: 40000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "sendgrid-vendor1",
//             name: "Email Analytics Hub",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EAH",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 4.7,
//             community_links: [{ label: "Help Center", url: "#" }],
//             price_line: "$200/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "twilio",
//     name: "Twilio",
//     subheading:
//       "Cloud communications platform.\nAdd messaging, voice, and video.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-twilio-cdr-csv",
//         title: "Twilio Call & SMS Log (CDR) Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of detailed Call Detail Records (CDRs) and SMS logs from Twilio, delivering them as structured CSV files to your Anonymous OfficeX. Analyze your communication patterns, track call durations, message statuses, costs, and identify trends for optimizing your customer interactions and communication workflows.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Call Log Export:</strong> Extract data on incoming/outgoing calls, duration, status, and associated numbers.</li>
//             <li><strong>SMS Log Export:</strong> Gather data on sent/received messages, status, and content (metadata only for privacy).</li>
//             <li><strong>Cost Analysis:</strong> Track communication costs per call or message for budget management.</li>
//             <li><strong>Communication Pattern Analysis:</strong> Identify peak usage times, common destinations, or frequent contacts.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for reporting and optimization.</li>
//           </ul>
//           <p>Gain a clear overview of your Twilio-powered communications with granular data, seamlessly integrated into your OfficeX analytics.</p>
//         `,
//         price: 0.01,
//         price_unit: "/record",
//         price_explanation: "per call or SMS record extracted",
//         bookmarks: 65,
//         bookmarked_demand: 300,
//         cumulative_sales: 19500,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "twilio-vendor1",
//             name: "CommData Integrators",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CDI",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.6,
//             community_links: [{ label: "Case Studies", url: "#" }],
//             price_line: "$0.01/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "deepseek",
//     name: "Deepseek AI",
//     subheading:
//       "Advanced AI models for code and chat.\nBoost your productivity.",
//     cover_image:
//       "https://hbr.org/resources/images/article_assets/2025/03/Apr25_02_1144347670.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-deepseek-ai-code-analysis-csv",
//         title:
//           "Deepseek AI for Codebase Analysis & Data Export (CSV) to OfficeX",
//         images: [],
//         description: `
//           <p>This offer integrates Deepseek AI's advanced code analysis capabilities with your Anonymous OfficeX environment, enabling the processing of code repositories and delivering insights as structured CSV files. Ideal for software development teams, auditors, or researchers needing to analyze codebase structure, identify vulnerabilities, extract function lists, or track code quality metrics.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Codebase Structure Analysis:</strong> Generate CSVs outlining file structure, module dependencies, and function calls.</li>
//             <li><strong>Vulnerability Scanning (Metadata):</strong> Identify potential security hotspots and list them in CSV reports.</li>
//             <li><strong>Code Quality Metrics:</strong> Extract data on code complexity, maintainability, and test coverage.</li>
//             <li><strong>Function & Variable Extraction:</strong> Create CSV lists of functions, variables, and their usage within the codebase.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for project management or auditing.</li>
//           </ul>
//           <p>Gain deep, AI-driven insights into your codebases, transforming raw code into actionable data for your OfficeX development workflows.</p>
//         `,
//         price: 0.03,
//         price_unit: "/1K tokens",
//         price_explanation: "for AI processing of code tokens",
//         bookmarks: 55,
//         bookmarked_demand: 800,
//         cumulative_sales: 44000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "deepseek-vendor1",
//             name: "AI Code Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ACI",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 4.8,
//             community_links: [{ label: "API Docs", url: "#" }],
//             price_line: "$0.03/1K tokens",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "semrush",
//     name: "Semrush",
//     subheading:
//       "Online visibility management and content marketing SaaS platform.\nImprove your SEO.",
//     cover_image:
//       "https://www.pagetraffic.in/wp-content/uploads/2022/05/semrush-review-adn-guide.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-semrush-seo-data-csv",
//         title: "Semrush SEO & Competitor Data Export (CSV) to OfficeX",
//         images: [],
//         description: `
//           <p>This service provides extraction of comprehensive SEO and competitor data from Semrush, delivering it as structured CSV files to your Anonymous OfficeX. Gain deep insights into keyword rankings, organic traffic, backlink profiles, competitor strategies, and content performance for in-depth analysis and reporting within your spreadsheets.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Keyword Ranking & Traffic Data:</strong> Export current and historical keyword positions and estimated organic traffic.</li>
//             <li><strong>Competitor Analysis:</strong> Gather data on competitor keywords, backlinks, and content performance.</li>
//             <li><strong>Backlink Profile Data:</strong> Export detailed backlink information for specific domains.</li>
//             <li><strong>Content Gap Analysis:</strong> Identify content opportunities by comparing your site to competitors.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for strategic planning and reporting.</li>
//           </ul>
//           <p>Supercharge your SEO and content marketing strategies with granular Semrush data, seamlessly integrated into your OfficeX analytics.</p>
//         `,
//         price: 350,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for Semrush data export",
//         bookmarks: 105,
//         bookmarked_demand: 1500,
//         cumulative_sales: 157500,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "semrush-vendor1",
//             name: "SEO Data Specialists",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDS",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.6,
//             community_links: [{ label: "Case Studies", url: "#" }],
//             price_line: "$350/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "ebay",
//     name: "eBay",
//     subheading: "Online auction and shopping website.\nBuy and sell goods.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-ebay-listing-data-csv",
//         title: "eBay Listing & Sales Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public listing and sales data from eBay, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for e-commerce businesses, resellers, and market researchers to analyze product trends, pricing strategies, competitor activity, and sales performance on the eBay platform.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Active & Completed Listings:</strong> Extract data on product titles, descriptions, prices, seller info, and condition.</li>
//             <li><strong>Sales History & Price Trends:</strong> Gather data on sold items, final sale prices, and historical pricing trends.</li>
//             <li><strong>Category & Keyword Filtering:</strong> Target specific product categories or search terms for data extraction.</li>
//             <li><strong>Seller Performance Metrics:</strong> Analyze public seller ratings and feedback.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for inventory management or market analysis.</li>
//           </ul>
//           <p>Gain a competitive edge in e-commerce by leveraging real-time and historical eBay data, seamlessly integrated into your OfficeX spreadsheets.</p>
//         `,
//         price: 0.07,
//         price_unit: "/listing",
//         price_explanation: "per extracted listing or sold item record",
//         bookmarks: 90,
//         bookmarked_demand: 300,
//         cumulative_sales: 27000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "ebay-vendor1",
//             name: "E-commerce Data Analysts",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ECDA",
//             checkout_video: undefined,
//             uptime_score: 99.5,
//             reviews_score: 4.3,
//             community_links: [{ label: "Client Portal", url: "#" }],
//             price_line: "$0.07/listing",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "amazon",
//     name: "Amazon",
//     subheading:
//       "E-commerce giant and cloud services provider.\nShop and innovate.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-amazon-product-data-csv",
//         title: "Amazon Product & Review Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public product and customer review data from Amazon, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for product developers, market researchers, and e-commerce businesses to analyze product trends, competitor offerings, customer sentiment, and optimize their Amazon listings.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Product Listing Data:</strong> Extract product titles, descriptions, ASINs, prices, and availability.</li>
//             <li><strong>Customer Review Analysis:</strong> Gather review text, ratings, and reviewer demographics for sentiment analysis.</li>
//             <li><strong>Best Seller & New Release Tracking:</strong> Monitor trending products within specific categories.</li>
//             <li><strong>Competitor Product Monitoring:</strong> Track competitor pricing and product changes.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis and product strategy.</li>
//           </ul>
//           <p>Gain a significant competitive advantage in the e-commerce landscape by integrating granular Amazon data into your OfficeX analytics.</p>
//         `,
//         price: 0.09,
//         price_unit: "/record",
//         price_explanation: "per extracted product or review record",
//         bookmarks: 120,
//         bookmarked_demand: 500,
//         cumulative_sales: 60000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "amazon-vendor1",
//             name: "E-commerce Intelligence",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EI",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.5,
//             community_links: [{ label: "Webinars", url: "#" }],
//             price_line: "$0.09/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "producthunt",
//     name: "Product Hunt",
//     subheading:
//       "Platform for new product discovery.\nFind the latest innovations.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-producthunt-data-csv",
//         title: "Product Hunt Launch & Trend Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public launch data, trend information, and user comments from Product Hunt, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for product managers, investors, and entrepreneurs to monitor new product launches, identify emerging trends, analyze market reception, and discover potential competitors or collaborators.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Product Launch Data:</strong> Extract product names, descriptions, creators, upvotes, and comments from launches.</li>
//             <li><strong>Trending Product Analysis:</strong> Identify daily, weekly, or monthly trending products and categories.</li>
//             <li><strong>User Comment & Review Export:</strong> Gather public comments and reviews for sentiment analysis and feedback.</li>
//             <li><strong>Creator & Company Data:</strong> Extract public information about the creators and companies behind new products.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for competitive analysis or market research.</li>
//           </ul>
//           <p>Stay ahead of the innovation curve by integrating real-time Product Hunt data into your OfficeX strategic planning and analysis.</p>
//         `,
//         price: 0.06,
//         price_unit: "/product",
//         price_explanation: "per extracted product launch record",
//         bookmarks: 70,
//         bookmarked_demand: 350,
//         cumulative_sales: 24500,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "producthunt-vendor1",
//             name: "Innovation Data Labs",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=IDL",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.6,
//             community_links: [{ label: "Blog", url: "#" }],
//             price_line: "$0.06/product",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "crunchbase",
//     name: "Crunchbase",
//     subheading:
//       "Platform for business information and insights.\nTrack startups and investments.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-crunchbase-company-data-csv",
//         title: "Crunchbase Company & Funding Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public company, funding, and M&A data from Crunchbase, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for investors, sales teams, and market researchers to build target lists, analyze industry landscapes, track funding rounds, and monitor competitive activity.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Company Profile Data:</strong> Extract company name, industry, location, description, and founding date.</li>
//             <li><strong>Funding Round Details:</strong> Gather data on investment rounds, investors, and funding amounts.</li>
//             <li><strong>Acquisition & IPO Data:</strong> Track M&A activities and public offerings.</li>
//             <li><strong>Key Personnel Data:</strong> Extract public information about executives and board members.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for financial analysis or lead generation.</li>
//           </ul>
//           <p>Gain a comprehensive overview of the private and public company landscape by integrating Crunchbase data into your OfficeX strategic planning.</p>
//         `,
//         price: 0.25,
//         price_unit: "/record",
//         price_explanation: "per extracted company or funding record",
//         bookmarks: 115,
//         bookmarked_demand: 700,
//         cumulative_sales: 80500,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "crunchbase-vendor1",
//             name: "Business Intelligence Co.",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BIC",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.7,
//             community_links: [{ label: "Solutions Page", url: "#" }],
//             price_line: "$0.25/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "bitly",
//     name: "Bitly",
//     subheading:
//       "Link management platform.\nShorten, track, and optimize your links.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-bitly-link-analytics-csv",
//         title: "Bitly Link Click & Analytics Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of detailed click data and analytics from your Bitly links, delivering them as structured CSV files to your Anonymous OfficeX. Gain comprehensive insights into link performance, geographic clicks, referral sources, and more for in-depth analysis and reporting within your spreadsheets.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Link Performance Metrics:</strong> Export total clicks, unique clicks, and click-through rates for your Bitly links.</li>
//             <li><strong>Geographic Data:</strong> Analyze clicks by country, region, and city to understand audience distribution.</li>
//             <li><strong>Referral Source Analysis:</strong> Identify where your clicks are coming from (e.g., social media, websites).</li>
//             <li><strong>Custom Date Range Reporting:</strong> Generate reports for specific periods to track campaign performance.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for marketing analysis.</li>
//           </ul>
//           <p>Optimize your digital campaigns with granular Bitly link data, seamlessly integrated into your OfficeX analytics.</p>
//         `,
//         price: 150,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for Bitly data export",
//         bookmarks: 80,
//         bookmarked_demand: 600,
//         cumulative_sales: 48000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "bitly-vendor1",
//             name: "Link Analytics Pro",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LAP",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.6,
//             community_links: [{ label: "Support Docs", url: "#" }],
//             price_line: "$150/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "veo3",
//     name: "Veo3",
//     subheading: "Advanced video analysis for sports.\nUnderstand performance.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-veo3-match-data-csv",
//         title: "Veo3 Match Event & Player Performance Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of detailed match events and player performance data from Veo3 footage, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for sports coaches, analysts, and recruiters to analyze game strategies, individual player statistics, and team performance for in-depth tactical planning and scouting.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Match Event Data:</strong> Export timestamps and descriptions of key events (goals, fouls, passes, shots).</li>
//             <li><strong>Player Performance Metrics:</strong> Gather data on touches, passes, distance covered, and other customizable metrics for each player.</li>
//             <li><strong>Team Statistics:</strong> Analyze overall team possession, shots on target, and defensive actions.</li>
//             <li><strong>Custom Tagging & Filtering:</strong> Export data based on custom tags applied within Veo3 or specific match criteria.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for statistical analysis and reporting.</li>
//           </ul>
//           <p>Transform raw sports footage into actionable data with Veo3 integration, seamlessly enhancing your OfficeX performance analysis.</p>
//         `,
//         price: 500,
//         price_unit: "/match",
//         price_explanation: "per analyzed match and data export",
//         bookmarks: 45,
//         bookmarked_demand: 2000,
//         cumulative_sales: 90000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "veo3-vendor1",
//             name: "Sports Analytics Pro",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SAP",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.7,
//             community_links: [{ label: "Consultation", url: "#" }],
//             price_line: "$500/match",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "taskrabbit",
//     name: "TaskRabbit",
//     subheading:
//       "Platform connecting people with local taskers.\nGet help with everyday tasks.",
//     cover_image:
//       "https://www.taskrabbit.com/blog/wp-content/uploads/2023/11/Hero_Taskers-1024x683.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-taskrabbit-task-data-csv",
//         title: "TaskRabbit Task & Tasker Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public task listings and tasker profile data from TaskRabbit, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for market researchers, businesses analyzing gig economy trends, or individuals tracking service availability and pricing in specific regions.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Task Listing Data:</strong> Extract task descriptions, requested skills, estimated duration, and pricing (if public).</li>
//             <li><strong>Tasker Profile Data:</strong> Gather public information on tasker skills, hourly rates, reviews, and availability.</li>
//             <li><strong>Geographic & Category Filtering:</strong> Extract data based on specific locations or task categories.</li>
//             <li><strong>Pricing & Demand Analysis:</strong> Analyze trends in task pricing and service demand.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis or competitive benchmarking.</li>
//           </ul>
//           <p>Gain insights into the local service economy by integrating TaskRabbit data into your OfficeX analytical workflows.</p>
//         `,
//         price: 0.04,
//         price_unit: "/record",
//         price_explanation: "per extracted task or tasker record",
//         bookmarks: 50,
//         bookmarked_demand: 200,
//         cumulative_sales: 10000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "taskrabbit-vendor1",
//             name: "Gig Economy Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=GEI",
//             checkout_video: undefined,
//             uptime_score: 99.4,
//             reviews_score: 4.2,
//             community_links: [{ label: "Research Blog", url: "#" }],
//             price_line: "$0.04/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "shopee",
//     name: "Shopee",
//     subheading:
//       "Leading e-commerce platform in Southeast Asia and Taiwan.\nShop and sell with ease.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-shopee-product-data-csv",
//         title: "Shopee Product & Seller Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public product listings and seller information from Shopee, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for e-commerce businesses, market researchers, and competitive analysts looking to understand product trends, pricing strategies, and seller performance in the Southeast Asian and Taiwanese markets.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Product Listing Data:</strong> Extract product names, descriptions, prices, categories, and stock availability.</li>
//             <li><strong>Seller Information:</strong> Gather public data on seller ratings, shop location, and number of products.</li>
//             <li><strong>Sales & Review Data:</strong> Analyze sales volume (if publicly available) and customer reviews for specific products.</li>
//             <li><strong>Keyword & Category Filtering:</strong> Target specific product categories or search terms for data extraction.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, inventory planning, or competitive intelligence.</li>
//           </ul>
//           <p>Gain a significant competitive advantage in the Southeast Asian e-commerce market by integrating granular Shopee data into your OfficeX analytics.</p>
//         `,
//         price: 0.08,
//         price_unit: "/record",
//         price_explanation: "per extracted product or seller record",
//         bookmarks: 100,
//         bookmarked_demand: 400,
//         cumulative_sales: 40000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "shopee-vendor1",
//             name: "SEA E-commerce Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SEI",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.5,
//             community_links: [{ label: "Client Portal", url: "#" }],
//             price_line: "$0.08/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "taobao",
//     name: "Taobao",
//     subheading:
//       "Largest e-commerce platform in China.\nDiscover a vast array of products.",
//     cover_image:
//       "https://tiengtrungcamxu.com/wp-content/uploads/2018/01/krupnejshij-marketplejs-taobao-news.jpg",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-taobao-product-data-csv",
//         title: "Taobao Product & Pricing Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public product listings and pricing information from Taobao, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for e-commerce businesses, sourcing agents, and market researchers looking to understand product availability, pricing trends, and supplier information within the Chinese e-commerce market.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Product Listing Data:</strong> Extract product names, descriptions, prices, and available variations.</li>
//             <li><strong>Seller/Shop Information:</strong> Gather public data on seller ratings, location, and sales volume (if publicly available).</li>
//             <li><strong>Image & Video URLs:</strong> Include URLs to product images and videos for visual reference.</li>
//             <li><strong>Trend & Price Analysis:</strong> Analyze historical pricing data and identify trending products.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for competitive pricing, sourcing, or market entry analysis.</li>
//           </ul>
//           <p>Gain a significant competitive advantage in the Chinese e-commerce market by integrating granular Taobao data into your OfficeX analytics.</p>
//         `,
//         price: 0.1,
//         price_unit: "/record",
//         price_explanation: "per extracted product or seller record",
//         bookmarks: 95,
//         bookmarked_demand: 600,
//         cumulative_sales: 57000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "taobao-vendor1",
//             name: "China E-commerce Data",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CED",
//             checkout_video: undefined,
//             uptime_score: 99.5,
//             reviews_score: 4.4,
//             community_links: [{ label: "Consultation", url: "#" }],
//             price_line: "$0.10/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "uber",
//     name: "Uber",
//     subheading:
//       "Ride-sharing and food delivery service.\nTravel and order food with ease.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-uber-ride-data-csv",
//         title: "Uber Ride & Expense Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of your Uber ride history and associated expense data, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for business professionals, accountants, or individuals looking to track transportation expenses, analyze travel patterns, or reconcile company spending.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Ride History Export:</strong> Extract date, time, pickup/dropoff locations, distance, and trip cost.</li>
//             <li><strong>Expense Categorization:</strong> Option to categorize rides for business vs. personal expense tracking.</li>
//             <li><strong>Invoice Data (Metadata):</strong> Export metadata related to trip invoices for easy reconciliation.</li>
//             <li><strong>Travel Pattern Analysis:</strong> Analyze frequently used routes, times, and associated costs.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for expense reporting and budgeting.</li>
//           </ul>
//           <p>Streamline your travel expense management by integrating detailed Uber ride data into your OfficeX financial workflows.</p>
//         `,
//         price: 50,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for automated data export",
//         bookmarks: 60,
//         bookmarked_demand: 300,
//         cumulative_sales: 18000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "uber-vendor1",
//             name: "Travel Expense Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TES",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.5,
//             community_links: [{ label: "FAQ", url: "#" }],
//             price_line: "$50/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "grab",
//     name: "Grab",
//     subheading:
//       "Leading super-app in Southeast Asia for ride-hailing, food delivery, and payments.\nYour everyday everything.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-grab-transaction-data-csv",
//         title: "Grab Ride, Food, & Payment Transaction Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of your Grab transaction history, including rides, food deliveries, and payments, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals and businesses in Southeast Asia to track expenses, analyze spending patterns across different services, or reconcile financial records.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Comprehensive Transaction History:</strong> Export data on Grab rides, GrabFood orders, GrabMart purchases, and GrabPay transactions.</li>
//             <li><strong>Detailed Expense Breakdown:</strong> Capture date, time, service type, amount, and associated notes for each transaction.</li>
//             <li><strong>Spending Pattern Analysis:</strong> Identify trends in your Grab usage and allocate spending across categories.</li>
//             <li><strong>Receipt Data (Metadata):</strong> Export metadata related to digital receipts for easy record-keeping.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for personal budgeting or business expense management.</li>
//           </ul>
//           <p>Gain complete visibility into your Grab ecosystem spending by integrating detailed transaction data into your OfficeX financial workflows.</p>
//         `,
//         price: 75,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for automated data export",
//         bookmarks: 70,
//         bookmarked_demand: 400,
//         cumulative_sales: 28000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "grab-vendor1",
//             name: "Southeast Asia Data Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SEADS",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.6,
//             community_links: [{ label: "Help Docs", url: "#" }],
//             price_line: "$75/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "brex",
//     name: "Brex",
//     subheading:
//       "Financial operating system for growing businesses.\nManage corporate spend.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-brex-transaction-csv",
//         title: "Brex Transaction & Expense Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of detailed transaction and expense data from your Brex account, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for finance teams, accountants, and business owners looking to reconcile corporate spending, manage budgets, and perform in-depth financial analysis directly within their spreadsheets.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Transaction History Export:</strong> Extract date, merchant, amount, category, and associated notes for all Brex transactions.</li>
//             <li><strong>Expense Report Data:</strong> Pull data from submitted expense reports, including attachments (metadata) and approvals.</li>
//             <li><strong>Budget Tracking:</strong> Monitor spending against departmental or project budgets with granular data.</li>
//             <li><strong>Vendor Analysis:</strong> Analyze spending patterns with specific vendors for negotiation or optimization.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for financial reporting, auditing, and reconciliation.</li>
//           </ul>
//           <p>Automate your financial reporting and gain deep insights into corporate spend by integrating Brex data into your OfficeX financial workflows.</p>
//         `,
//         price: 100,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for automated data export",
//         bookmarks: 85,
//         bookmarked_demand: 1200,
//         cumulative_sales: 102000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "brex-vendor1",
//             name: "Corporate Finance Data",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CFD",
//             checkout_video: undefined,
//             uptime_score: 99.9,
//             reviews_score: 4.8,
//             community_links: [{ label: "API Docs", url: "#" }],
//             price_line: "$100/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "paypal",
//     name: "PayPal",
//     subheading: "Online payment system.\nSend and receive money securely.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-paypal-transaction-csv",
//         title: "PayPal Transaction History & Fee Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of your detailed PayPal transaction history, including payments sent, received, and associated fees, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals and businesses to reconcile financial records, track income and expenses, and analyze payment processing costs directly within their spreadsheets.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Transaction History Export:</strong> Extract date, type, status, gross amount, fees, and net amount for all transactions.</li>
//             <li><strong>Sender/Recipient Details:</strong> Gather information on the parties involved in each transaction.</li>
//             <li><strong>Currency Conversion Data:</strong> Track details for transactions involving currency conversions.</li>
//             <li><strong>Fee Analysis:</strong> Analyze PayPal fees incurred over time for cost optimization.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for financial tracking, accounting, and reporting.</li>
//           </ul>
//           <p>Streamline your financial record-keeping and gain deep insights into your PayPal activities by integrating transaction data into your OfficeX financial workflows.</p>
//         `,
//         price: 70,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for automated data export",
//         bookmarks: 90,
//         bookmarked_demand: 500,
//         cumulative_sales: 45000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "paypal-vendor1",
//             name: "Payment Data Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PDS",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.7,
//             community_links: [{ label: "Help Center", url: "#" }],
//             price_line: "$70/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "cashapp",
//     name: "Cash App",
//     subheading: "Mobile payment service.\nSend, spend, save, and invest money.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-cashapp-transaction-csv",
//         title: "Cash App Transaction History Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of your Cash App transaction history, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals to track personal spending, manage budgets, and reconcile financial records from their Cash App activities.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Transaction History Export:</strong> Extract date, type (sent/received), amount, and transaction description for all activities.</li>
//             <li><strong>Bitcoin & Stock Activity (Metadata):</strong> Include metadata for any linked Bitcoin or stock purchase/sale activities.</li>
//             <li><strong>Spending Categorization:</strong> Option to categorize transactions for personal budgeting.</li>
//             <li><strong>Custom Date Range Reporting:</strong> Generate reports for specific periods for financial overview.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for personal finance tracking.</li>
//           </ul>
//           <p>Gain clarity on your Cash App spending and investments by integrating detailed transaction data into your OfficeX financial workflows.</p>
//         `,
//         price: 40,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for automated data export",
//         bookmarks: 55,
//         bookmarked_demand: 250,
//         cumulative_sales: 13750,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "cashapp-vendor1",
//             name: "Personal Finance Data Co.",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PFDC",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.5,
//             community_links: [{ label: "User Guide", url: "#" }],
//             price_line: "$40/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "google-drive",
//     name: "Google Drive",
//     subheading:
//       "Cloud storage and file synchronization service.\nStore and share your files.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-google-drive-file-metadata-csv",
//         title: "Google Drive File Metadata & Usage Report Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of detailed file metadata and usage reports from your Google Drive, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for organizations and individuals managing large Drive accounts to audit file access, track storage usage, organize documents, and manage permissions efficiently.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>File Metadata Export:</strong> Extract file names, types, sizes, creation/modification dates, and owner information.</li>
//             <li><strong>Sharing & Permissions Audit:</strong> Track sharing settings, collaborators, and public/private access for files and folders.</li>
//             <li><strong>Storage Usage Analysis:</strong> Generate reports on storage consumption by file type, owner, or folder.</li>
//             <li><strong>Activity Log (Metadata):</strong> Export metadata on file views, edits, and downloads for auditing purposes.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for data governance and organization.</li>
//           </ul>
//           <p>Gain comprehensive control and insights over your Google Drive assets by integrating detailed metadata into your OfficeX management workflows.</p>
//         `,
//         price: 80,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for automated data export",
//         bookmarks: 110,
//         bookmarked_demand: 700,
//         cumulative_sales: 77000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "google-drive-vendor1",
//             name: "Cloud Data Organizers",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CDO",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.7,
//             community_links: [{ label: "Solutions", url: "#" }],
//             price_line: "$80/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "agoda",
//     name: "Agoda",
//     subheading:
//       "Online travel agency for accommodations.\nBook hotels and flights worldwide.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-agoda-hotel-data-csv",
//         title: "Agoda Hotel Listing & Pricing Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public hotel listings, pricing, and review data from Agoda, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for hospitality businesses, travel agencies, and market researchers to analyze accommodation trends, competitive pricing, customer feedback, and optimize their online presence.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Hotel Listing Data:</strong> Extract hotel names, locations, star ratings, amenities, and image URLs.</li>
//             <li><strong>Pricing & Availability:</strong> Gather real-time or historical pricing data for specific dates and room types.</li>
//             <li><strong>Customer Review Analysis:</strong> Export review text and scores for sentiment analysis and feedback.</li>
//             <li><strong>Destination & Property Type Filtering:</strong> Target specific regions, cities, or accommodation types for data extraction.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, revenue management, or competitive benchmarking.</li>
//           </ul>
//           <p>Gain a significant competitive advantage in the travel industry by integrating granular Agoda data into your OfficeX analytics.</p>
//         `,
//         price: 0.15,
//         price_unit: "/record",
//         price_explanation: "per extracted hotel or review record",
//         bookmarks: 75,
//         bookmarked_demand: 450,
//         cumulative_sales: 33750,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "agoda-vendor1",
//             name: "Travel Data Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TDI",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.5,
//             community_links: [{ label: "Client Support", url: "#" }],
//             price_line: "$0.15/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "donotpay",
//     name: "Do Not Pay",
//     subheading:
//       "AI-powered legal bot.\nFight corporations, beat bureaucracy, and sue anyone at the press of a button.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-donotpay-legal-doc-csv",
//         title: "Do Not Pay Case & Document Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of your own Do Not Pay case data and generated document metadata, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals tracking their legal disputes, managing appeals, or organizing generated legal documents for personal record-keeping or further analysis.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Case Status Export:</strong> Extract data on case type, current status, and relevant deadlines.</li>
//             <li><strong>Document Metadata:</strong> Gather metadata on generated legal documents (e.g., date generated, document type, associated case).</li>
//             <li><strong>Fine & Fee Tracking:</strong> Analyze the amounts of fines or fees disputed and their outcomes.</li>
//             <li><strong>Correspondence Log (Metadata):</strong> Export metadata related to communications generated or received through the platform.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for personal legal tracking and record management.</li>
//           </ul>
//           <p>Organize and analyze your Do Not Pay activities by integrating detailed case and document data into your OfficeX personal archives.</p>
//         `,
//         price: 60,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for automated data export",
//         bookmarks: 40,
//         bookmarked_demand: 300,
//         cumulative_sales: 12000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "donotpay-vendor1",
//             name: "Legal Data Organizers",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LDO",
//             checkout_video: undefined,
//             uptime_score: 99.5,
//             reviews_score: 4.3,
//             community_links: [{ label: "FAQs", url: "#" }],
//             price_line: "$60/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "fedex",
//     name: "FedEx",
//     subheading:
//       "Global shipping and logistics services.\nDeliver packages worldwide.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-fedex-shipping-data-csv",
//         title: "FedEx Shipping & Tracking Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of your FedEx shipping history and tracking data, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for businesses and individuals managing high volumes of shipments to analyze shipping costs, delivery performance, track packages, and reconcile logistics records.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Shipment History Export:</strong> Extract data on package details, origin/destination, service type, and shipping costs.</li>
//             <li><strong>Tracking Status Updates:</strong> Gather real-time or historical tracking updates for specific packages.</li>
//             <li><strong>Delivery Performance Analysis:</strong> Analyze on-time delivery rates and identify potential delays.</li>
//             <li><strong>Cost Allocation:</strong> Categorize shipping expenses by department, project, or client.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for logistics management, expense tracking, and reporting.</li>
//           </ul>
//           <p>Optimize your shipping operations and gain clear visibility into your logistics with granular FedEx data, seamlessly integrated into your OfficeX workflows.</p>
//         `,
//         price: 180,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for automated data export",
//         bookmarks: 95,
//         bookmarked_demand: 800,
//         cumulative_sales: 76000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "fedex-vendor1",
//             name: "Logistics Data Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LDS",
//             checkout_video: undefined,
//             uptime_score: 99.8,
//             reviews_score: 4.7,
//             community_links: [{ label: "API Docs", url: "#" }],
//             price_line: "$180/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "airbnb",
//     name: "Airbnb",
//     subheading:
//       "Online marketplace for lodging, primarily homestays, and tourism experiences.\nFind unique stays.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-airbnb-listing-data-csv",
//         title: "Airbnb Listing & Market Trend Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public Airbnb listing data and market trend insights, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for property managers, real estate investors, and market researchers to analyze occupancy rates, pricing strategies, competitor listings, and identify profitable investment opportunities in specific regions.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Listing Details Export:</strong> Extract property type, number of bedrooms/bathrooms, amenities, and host information.</li>
//             <li><strong>Pricing & Availability Data:</strong> Gather real-time or historical pricing and calendar availability for specific dates.</li>
//             <li><strong>Review & Rating Analysis:</strong> Export customer reviews and overall ratings for sentiment analysis and feedback.</li>
//             <li><strong>Geographic & Property Type Filtering:</strong> Target specific cities, neighborhoods, or property types for data extraction.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, revenue optimization, and competitive benchmarking.</li>
//           </ul>
//           <p>Gain a significant competitive advantage in the short-term rental market by integrating granular Airbnb data into your OfficeX analytics and decision-making.</p>
//         `,
//         price: 0.2,
//         price_unit: "/listing",
//         price_explanation: "per extracted listing record",
//         bookmarks: 130,
//         bookmarked_demand: 800,
//         cumulative_sales: 104000,
//         bookmark_url: "#",
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "airbnb-vendor1",
//             name: "Rental Market Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RMI",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.6,
//             community_links: [{ label: "Case Studies", url: "#" }],
//             price_line: "$0.20/listing",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "makerworld",
//     name: "MakerWorld",
//     subheading:
//       "3D model platform for 3D printing.\nShare and download designs.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-makerworld-design-data-csv",
//         title: "MakerWorld 3D Model & Creator Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of public 3D model data and creator statistics from MakerWorld, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for 3D printing businesses, designers, and market researchers to analyze trending designs, popular creators, model specifications, and user engagement for product development or content strategy.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>3D Model Metadata:</strong> Extract model names, descriptions, categories, download counts, and print statistics.</li>
//             <li><strong>Creator Insights:</strong> Gather public data on creator followers, print counts, and popular models.</li>
//             <li><strong>User Engagement Data:</strong> Analyze likes, comments, and collections for specific designs.</li>
//             <li><strong>Keyword & Category Analysis:</strong> Identify trending keywords and popular design categories.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for trend analysis, content planning, or competitive benchmarking.</li>
//           </ul>
//           <p>Gain deep insights into the 3D printing community and market by integrating MakerWorld data into your OfficeX analytical workflows.</p>
//         `,
//         price: 0.1,
//         price_unit: "/record",
//         price_explanation: "per extracted model or creator record",
//         bookmarks: 60,
//         bookmarked_demand: 300,
//         cumulative_sales: 18000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "makerworld-vendor1",
//             name: "3D Print Data Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=3DPDS",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.4,
//             community_links: [{ label: "Forum", url: "#" }],
//             price_line: "$0.10/record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "home-depot",
//     name: "Home Depot",
//     subheading:
//       "Home improvement and appliance retailer.\nFind tools and materials for your projects.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-home-depot-product-data-csv",
//         title: "Home Depot Product Inventory & Pricing Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public product inventory, pricing, and specification data from Home Depot, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for contractors, resellers, and market researchers to analyze product availability, competitive pricing, and trending home improvement items across various locations.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Product Catalog Export:</strong> Extract product names, descriptions, categories, SKUs, and online availability.</li>
//             <li><strong>Pricing & Promotions:</strong> Gather current pricing data, sale prices, and active promotions.</li>
//             <li><strong>In-Store Inventory (Limited):</strong> Provide insights into approximate in-store stock levels for specific products and locations (where publicly accessible).</li>
//             <li><strong>Product Specifications:</strong> Extract technical specifications and attributes for detailed analysis.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for inventory management, competitive pricing, or procurement planning.</li>
//           </ul>
//           <p>Gain a significant competitive edge in the home improvement market by integrating granular Lowe's data into your OfficeX operations and analysis.</p>
//         `,
//         price: 0.12,
//         price_unit: "/product",
//         price_explanation: "per extracted product record",
//         bookmarks: 80,
//         bookmarked_demand: 400,
//         cumulative_sales: 32000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "home-depot-vendor1",
//             name: "Retail Data Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RDS",
//             checkout_video: undefined,
//             uptime_score: 99.5,
//             reviews_score: 4.3,
//             community_links: [{ label: "Client Support", url: "#" }],
//             price_line: "$0.12/product",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "shopify",
//     name: "Shopify",
//     subheading:
//       "E-commerce platform for online stores and retail point-of-sale systems.\nBuild and grow your business.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-shopify-store-data-csv",
//         title: "Shopify Store & Product Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public product listings, pricing, and store information from Shopify-powered online stores, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for competitive analysis, market research, or dropshippers looking to identify trending products, pricing strategies, and successful store setups.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Product Listing Data:</strong> Extract product titles, descriptions, images, prices, and inventory levels (if publicly available).</li>
//             <li><strong>Storefront Analysis:</strong> Gather data on shop themes, app integrations (visible), and general product offerings.</li>
//             <li><strong>Pricing Trends:</strong> Monitor pricing changes for specific products or categories across multiple Shopify stores.</li>
//             <li><strong>Competitor Product Research:</strong> Identify popular products and successful strategies of competitors.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, product sourcing, or business strategy.</li>
//           </ul>
//           <p>Gain a significant competitive advantage in the e-commerce landscape by integrating granular Shopify store data into your OfficeX analytics.</p>
//         `,
//         price: 0.15,
//         price_unit: "/product_record",
//         price_explanation: "per extracted product record from public stores",
//         bookmarks: 110,
//         bookmarked_demand: 700,
//         cumulative_sales: 77000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "shopify-vendor1",
//             name: "Ecom Data Solutions",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EDS",
//             checkout_video: undefined,
//             uptime_score: 99.7,
//             reviews_score: 4.6,
//             community_links: [{ label: "Client Portal", url: "#" }],
//             price_line: "$0.15/product_record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "draftkings",
//     name: "DraftKings",
//     subheading:
//       "Daily fantasy sports contest and sports betting operator.\nPlay and win big.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-draftkings-data-csv",
//         title: "DraftKings Contest & Player Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public contest details, player statistics, and outcome data from DraftKings, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for sports analysts, data scientists, or serious players looking to optimize strategies, identify trends, and perform in-depth statistical analysis on player performance and contest outcomes.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Contest Details:</strong> Export data on contest types, entry fees, prize pools, and number of entries.</li>
//             <li><strong>Player Statistics:</strong> Gather detailed player performance data for various sports and contests.</li>
//             <li><strong>Historical Outcome Data:</strong> Analyze past contest results and winning lineups (if publicly available).</li>
//             <li><strong>Trend Identification:</strong> Identify patterns in player performance, scoring, and winning strategies.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for predictive modeling or strategy optimization.</li>
//           </ul>
//           <p>Gain a competitive edge in daily fantasy sports and sports betting by integrating granular DraftKings data into your OfficeX analytical workflows.</p>
//         `,
//         price: 300,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for data export and analysis",
//         bookmarks: 70,
//         bookmarked_demand: 1000,
//         cumulative_sales: 70000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "draftkings-vendor1",
//             name: "Fantasy Sports Data Labs",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FSDL",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.5,
//             community_links: [{ label: "Research Papers", url: "#" }],
//             price_line: "$300/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "geeksquad",
//     name: "Geek Squad",
//     subheading:
//       "Tech support and repair services by Best Buy.\nGet help with your electronics.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-geeksquad-service-log-csv",
//         title: "Geek Squad Service History Export (CSV)",
//         images: [],
//         description: `
//           <p>This service provides extraction of your Geek Squad service history and associated details, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for individuals and businesses managing multiple devices or tech assets to track repair history, warranty information, service costs, and maintenance schedules directly within their spreadsheets.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Service History Export:</strong> Extract date of service, service type, device serviced, issue description, and resolution.</li>
//             <li><strong>Cost & Warranty Tracking:</strong> Log service charges and link them to device warranty periods.</li>
//             <li><strong>Device Inventory Management:</strong> Maintain a detailed record of all serviced devices and their repair history.</li>
//             <li><strong>Problem Pattern Analysis:</strong> Identify recurring issues across devices or specific product types.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for asset management and maintenance planning.</li>
//           </ul>
//           <p>Efficiently manage your tech support and device maintenance by integrating detailed Geek Squad service data into your OfficeX records.</p>
//         `,
//         price: 50,
//         price_unit: "/year",
//         price_explanation: "annual fee for data export and organization",
//         bookmarks: 30,
//         bookmarked_demand: 150,
//         cumulative_sales: 4500,
//         vendors: [
//           {
//             id: "geeksquad-vendor1",
//             name: "Tech Records Management",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TRM",
//             checkout_video: undefined,
//             uptime_score: 99.5,
//             reviews_score: 4.2,
//             community_links: [{ label: "Help Guide", url: "#" }],
//             price_line: "$50/year",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "turo",
//     name: "Turo Car Rental",
//     subheading:
//       "Peer-to-peer car sharing marketplace.\nRent unique cars from local hosts.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-turo-rental-data-csv",
//         title: "Turo Rental & Host Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public Turo car rental listing data and host performance metrics, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for car owners considering Turo, rental market analysts, or competitors looking to understand rental trends, pricing strategies, and successful host practices.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Vehicle Listing Data:</strong> Extract car make/model, year, location, daily rate, and availability details.</li>
//             <li><strong>Host Performance Metrics:</strong> Gather public data on host ratings, response rates, and number of trips.</li>
//             <li><strong>Pricing & Demand Analysis:</strong> Analyze rental pricing trends and demand for specific vehicle types or locations.</li>
//             <li><strong>Booking Calendar Data (Metadata):</strong> Include metadata related to booking availability for optimal scheduling.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for revenue optimization, competitive analysis, or investment planning.</li>
//           </ul>
//           <p>Gain a significant competitive edge in the peer-to-peer car rental market by integrating granular Turo data into your OfficeX analytical workflows.</p>
//         `,
//         price: 0.18,
//         price_unit: "/rental_record",
//         price_explanation: "per extracted rental listing record",
//         bookmarks: 65,
//         bookmarked_demand: 400,
//         cumulative_sales: 26000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "turo-vendor1",
//             name: "Car Rental Data Insights",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CRDI",
//             checkout_video: undefined,
//             uptime_score: 99.6,
//             reviews_score: 4.5,
//             community_links: [{ label: "Host Resources", url: "#" }],
//             price_line: "$0.18/rental_record",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "timeleft",
//     name: "Timeleft",
//     subheading:
//       "App for anonymous dinner parties with strangers.\nMeet new people.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-timeleft-event-data-csv",
//         title: "Timeleft Event & User Interaction Data Export (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public event details and aggregated, anonymized user interaction data from Timeleft, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for social researchers, event organizers, or businesses interested in networking trends, social preferences, and group dynamics.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Event Details:</strong> Export data on event dates, locations (general), participant counts (anonymized), and themes.</li>
//             <li><strong>Aggregated Interaction Data:</strong> Analyze trends in user matching preferences, common interests, and feedback (anonymized).</li>
//             <li><strong>Demographic Trends (Anonymized):</strong> Identify broad demographic participation patterns in events.</li>
//             <li><strong>Topic & Conversation Analysis:</strong> Extract aggregated keywords from anonymized conversations to identify popular topics.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for social trend analysis or event planning insights.</li>
//           </ul>
//           <p>Gain insights into social networking and event dynamics by integrating aggregated Timeleft data into your OfficeX analytical workflows, with full respect for user privacy.</p>
//         `,
//         price: 200,
//         price_unit: "/month",
//         price_explanation: "monthly subscription for aggregated data export",
//         bookmarks: 25,
//         bookmarked_demand: 800,
//         cumulative_sales: 20000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "timeleft-vendor1",
//             name: "Social Dynamics Lab",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDL",
//             checkout_video: undefined,
//             uptime_score: 99.5,
//             reviews_score: 4.3,
//             community_links: [{ label: "Research Blog", url: "#" }],
//             price_line: "$200/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "craigslist",
//     name: "Craigslist",
//     subheading:
//       "Centralized network of online communities, featuring classified advertisements and forums.\nFind anything locally.",
//     cover_image: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-craigslist-listings-csv",
//         title: "Craigslist Classifieds & Listings Data Extraction (CSV)",
//         images: [],
//         description: `
//           <p>This service focuses on extracting public classified advertisements and listings from Craigslist, delivering it as structured CSV files to your Anonymous OfficeX. Ideal for market researchers, resellers, or businesses tracking local demand, pricing trends, and product/service availability in specific geographical areas.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Categorized Listing Export:</strong> Extract data on titles, descriptions, prices, categories, and posting dates for various sections (e.g., for sale, housing, services).</li>
//             <li><strong>Geographic Filtering:</strong> Target specific cities or regions for highly localized data extraction.</li>
//             <li><strong>Keyword & Price Range Search:</strong> Filter listings based on keywords and price parameters.</li>
//             <li><strong>Trend Analysis:</strong> Identify emerging trends in local buying, selling, or service demands.</li>
//             <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis, inventory sourcing, or competitive intelligence.</li>
//           </ul>
//           <p>Gain valuable insights into local markets and consumer behavior by integrating granular Craigslist data into your OfficeX analytical workflows.</p>
//         `,
//         price: 0.05,
//         price_unit: "/listing",
//         price_explanation: "per extracted classified listing record",
//         bookmarks: 80,
//         bookmarked_demand: 250,
//         cumulative_sales: 20000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "craigslist-vendor1",
//             name: "Local Market Data",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=LMD",
//             checkout_video: undefined,
//             uptime_score: 99.4,
//             reviews_score: 4.1,
//             community_links: [{ label: "FAQs", url: "#" }],
//             price_line: "$0.05/listing",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "anyone-farm",
//     name: "Anyone Farm",
//     subheading:
//       "A marketplace for acquiring aged social media accounts, including Telegram, Facebook, and others. Specializes in providing accounts with history and established presence.",
//     cover_image: "https://images.unsplash.com/photo-1516259020967-159b3f3a8b4b",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-anyonefarm-aged-social-accounts",
//         title: "Aged Social Media Accounts (Telegram, Facebook, etc.)",
//         images: [],
//         description: `
//           <p>This service provides access to a catalog of aged social media accounts for various platforms like Telegram, Facebook, and more, delivered with credentials suitable for integration into your Anonymous OfficeX workflows. These accounts are presented as having a history of activity, which can be desirable for specific digital marketing or engagement strategies.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Diverse Platform Availability:</strong> Access accounts for popular platforms including Telegram, Facebook, Instagram, and potentially others.</li>
//             <li><strong>Account Age & Activity:</strong> Accounts are presented as having varying degrees of age and prior activity to appear more established.</li>
//             <li><strong>Bulk Acquisition:</strong> Options for purchasing single accounts or larger quantities to scale operations.</li>
//             <li><strong>Credential Delivery to OfficeX:</strong> Receive account login details and associated information in structured formats for easy import into OfficeX Sheets.</li>
//           </ul>
//           <p>Utilize these aged accounts for various digital engagement purposes, carefully considering platform terms of service and best practices.</p>
//         `,
//         price: 5.0,
//         price_unit: "/account",
//         price_explanation: "per aged social media account",
//         bookmarks: 150,
//         bookmarked_demand: 400,
//         cumulative_sales: 50000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "anyonefarm-vendor1",
//             name: "Digital Footprint Co.",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DFC",
//             checkout_video: undefined,
//             uptime_score: 97.2,
//             reviews_score: 3.8,
//             community_links: [{ label: "Usage Guidelines", url: "#" }],
//             price_line: "$5.00/account",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "ads-tiger",
//     name: "Ads Tiger",
//     subheading:
//       "Provider of agency-level Facebook Ads accounts with high spending limits",
//     cover_image: "https://images.unsplash.com/photo-1516252726392-4d22162a8d1a",
//     is_featured: true,
//     offers: [
//       {
//         id: "offer-adstiger-high-spend-fb-ads",
//         title: "High-Spend Facebook Agency Ads Accounts",
//         images: [],
//         description: `
//           <p>This service offers agency-level Facebook Ads accounts with significantly higher spending limits and enhanced stability, delivered for seamless integration into your Anonymous OfficeX advertising management. These accounts are designed for advertisers running large-scale campaigns or those who frequently face spending limits or restrictions with standard ad accounts.</p>
//           <p>Key features:</p>
//           <ul>
//             <li><strong>Elevated Spending Limits:</strong> Access accounts pre-configured with high daily or monthly spending capacities.</li>
//             <li><strong>Increased Stability & Trust Score:</strong> Accounts are presented as having a higher trust score within the Facebook advertising ecosystem, potentially reducing ban rates.</li>
//             <li><strong>Direct Business Manager Access:</strong> Accounts are shared with your Facebook Business Manager for full control and integration with your existing assets (pixels, pages, etc.).</li>
//             <li><strong>Dedicated Support:</strong> Access to support for account issues and operational guidance.</li>
//             <li><strong>Scalability for OfficeX Workflows:</strong> Manage and monitor high-volume ad campaigns directly from OfficeX, leveraging the provided account infrastructure.</li>
//           </ul>
//           <p>Optimize your large-scale Facebook advertising efforts and overcome common limitations by utilizing high-spend agency accounts, managed efficiently through your OfficeX ecosystem.</p>
//         `,
//         price: 500.0,
//         price_unit: "/month",
//         price_explanation: "monthly fee per high-spend agency ad account",
//         bookmarks: 200,
//         bookmarked_demand: 1500,
//         cumulative_sales: 100000,
//         bookmark_url: undefined,
//         call_to_action: undefined,
//         vendors: [
//           {
//             id: "adstiger-vendor1",
//             name: "AdScale Pro",
//             avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ASP",
//             checkout_video: undefined,
//             uptime_score: 99.1,
//             reviews_score: 4.5,
//             community_links: [{ label: "Policy Guidelines", url: "#" }],
//             price_line: "$500/month",
//             view_page_link: "#",
//             call_to_action: undefined,
//             description: undefined,
//             vendor_disclaimer: undefined,
//             about_url: undefined,
//             checkout_options: [],
//           },
//         ],
//       },
//     ],
//   },
// ];

export const appstore_apps = LOCAL_DEV_MODE
  ? appstore_apps_dev
  : appstore_apps_prod;
