import { AppInfo, AppInfoWithOffers } from ".";
import { OfferWorkflow, Vendor } from "../AppStore"; // Assuming these interfaces are accessible

export const appstore_apps: AppInfoWithOffers[] = [
  {
    id: "19",
    name: "Amazon Cloud",
    subheading: "Cloud storage and computing services. Global Scale.",
    coverImage:
      "https://cdn2.interfaz.io/wp-content/uploads/2023/06/Blog_AWS_cover-1.png",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer1-aws-s3-ai-csv-export",
        title: "AI-Powered CSV Data Export & Cloud Storage for OfficeX",
        images: [], // Will be populated with app.coverImage at runtime
        description: `
          <p>Seamlessly integrate your OfficeX documents and spreadsheets with AWS S3 for secure, scalable cloud storage. This offer enhances your workflow by enabling **AI-powered analysis and export of your data into CSV format**, directly from your cloud-stored documents. Whether you need to dump data for machine learning, generate reports, or integrate with other systems, this service automates the process of extracting structured data from your office files.</p>
          <p>Key features include:</p>
          <ul>
            <li><strong>Automated CSV Exports:</strong> Extract data from OfficeX documents (docs, sheets) into CSV files, optimized for AI processing.</li>
            <li><strong>Intelligent Data Recognition:</strong> AI identifies and structures relevant data fields for accurate exports.</li>
            <li><strong>Secure S3 Storage:</strong> Store your original documents and exported CSVs securely with AWS S3's industry-leading durability and availability.</li>
            <li><strong>Version Control:</strong> Maintain historical versions of your documents and data exports.</li>
            <li><strong>Scalability & Cost-Effectiveness:</strong> Adapt to any data volume with pay-as-you-go pricing.</li>
          </ul>
          <p>Streamline your data workflows by converting raw document data into actionable CSV datasets, ready for advanced analytics or database integration.</p>
        `,
        price: 0.035, // Slightly higher for AI features
        priceUnit: "/GB",
        priceExplanation: "per month for storage and processing",
        bookmarks: 180,
        avgCustomerLifetimeValue: 700,
        cumulativeSales: 105000,
        vendors: [
          {
            id: "vendorA",
            name: "Cloud Solutions Inc.",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
            uptimeScore: 99.99,
            reviewsScore: 4.8,
            communityLinks: [
              { label: "Forum", url: "#" },
              { label: "Discord", url: "#" },
            ],
            priceLine: "$0.035/GB",
            viewPageLink: "#",
          },
        ],
      },
      {
        id: "offer2-aws-ec2-bulk-processing",
        title: "AWS EC2 for Bulk Document Processing & AI Workflows",
        images: [], // Will be populated with app.coverImage at runtime
        description: `
          <p>Leverage the power of AWS EC2 to run intensive **bulk document processing tasks and AI-driven workflows** for your Anonymous OfficeX platform. This service allows you to deploy custom scripts and AI models for large-scale operations like converting numerous documents, performing OCR on scanned files, or running complex data transformations before or after CSV uploads.</p>
          <p>With EC2, you get:</p>
          <ul>
            <li><strong>On-demand Bulk Processing:</strong> Spin up powerful instances to handle large volumes of OfficeX documents and data.</li>
            <li><strong>Custom Workflow Deployment:</strong> Host and execute custom Python scripts or AI models for specific data manipulation.</li>
            <li><strong>Scalable Compute Power:</strong> Adjust computing capacity as needed for varying workload demands.</li>
            <li><strong>Integration with Cloud Storage:</strong> Seamlessly process data stored in AWS S3 or other cloud storage solutions linked to OfficeX.</li>
            <li><strong>Cost-Effective Automation:</strong> Pay only for the compute resources consumed during your bulk operations.</li>
          </ul>
          <p>Empower your OfficeX suite with backend processing capabilities for high-volume, data-intensive tasks.</p>
        `,
        price: 0.015, // Slightly higher for specialized processing
        priceUnit: "/hour",
        priceExplanation: "starting from, for specialized instances",
        bookmarks: 100,
        avgCustomerLifetimeValue: 900,
        cumulativeSales: 72000,
        vendors: [
          {
            id: "vendorC",
            name: "Compute Masters",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CM",
            uptimeScore: 99.98,
            reviewsScore: 4.7,
            communityLinks: [{ label: "Support", url: "#" }],
            priceLine: "Starting from $0.015/hour",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "17",
    name: "The Pirate Bay",
    subheading: "Browse and download torrents.\nAccess a vast content library.",
    coverImage:
      "https://www.prsformusic.com/-/media/images/mmagazine/images/2017/08/piratebayresize.ashx?h=358&w=637&la=en&hash=0C7EFCAF4BED538A4A2E8A0D855333CD",
    isFeatured: true,
    offers: [
      {
        id: "offer-piratebay-data-scraping",
        title:
          "Web Scraping & Data Extraction from Public Repositories (CSV Export)",
        images: [],
        description: `
          <p>This offer provides a specialized service for **web scraping data from public torrent indices and other open-source repositories**, transforming raw information into structured **CSV dumps** suitable for analysis within Anonymous OfficeX. While respecting legal and ethical guidelines, this service can help researchers or data analysts gather publicly available metadata, content descriptions, or other information for large-scale data projects.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Targeted Web Scraping:</strong> Extract specific data points from public indices based on your criteria.</li>
            <li><strong>CSV Data Dumps:</strong> Receive neatly organized CSV files, ready for import into OfficeX Sheets or databases.</li>
            <li><strong>Metadata Extraction:</strong> Collect information like file names, sizes, categories, and descriptions.</li>
            <li><strong>Ethical & Legal Considerations:</strong> Service adheres to robots.txt and publicly available data guidelines.</li>
            <li><strong>Automated Scheduling:</strong> Option for recurring data pulls to keep your datasets updated.</li>
          </ul>
          <p>Unlock insights from vast public datasets by converting unstructured web content into usable CSV formats for your analytical needs.</p>
        `,
        price: 0.05, // Per record for specialized scraping
        priceUnit: "/record",
        priceExplanation: "per data record extracted and formatted",
        bookmarks: 350,
        avgCustomerLifetimeValue: 100,
        cumulativeSales: 35000,
        vendors: [
          {
            id: "tpb-vendor1",
            name: "Data Harvest Solutions",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DHS",
            uptimeScore: 99.5,
            reviewsScore: 4.1,
            communityLinks: [{ label: "Support Forum", url: "#" }],
            priceLine: "$0.05/record",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "30",
    name: "Gemini AI",
    subheading: "Google AI for knowledge discovery.\nFind answers quickly.",
    coverImage:
      "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/final_keyword_header.width-1200.format-webp.webp",
    isFeatured: Math.random() > 0.7,
    offers: [
      {
        id: "offer-gemini-csv-analysis",
        title: "Gemini AI for CSV Data Analysis & Insights in OfficeX",
        images: [], // Will be populated with app.coverImage at runtime
        description: `
          <p>Integrate Gemini's powerful AI capabilities directly into your Anonymous OfficeX workflows for **advanced analysis of CSV data uploads**. This API access allows you to feed your spreadsheet data to Gemini for natural language queries, trend identification, anomaly detection, and even generating summaries or reports based on complex datasets. Transform raw data into actionable intelligence without leaving your OfficeX environment.</p>
          <p>Key benefits:</p>
          <ul>
            <li><strong>Intelligent CSV Analysis:</strong> Ask natural language questions about your data in OfficeX sheets and get AI-driven answers.</li>
            <li><strong>Pattern & Trend Discovery:</strong> Gemini can identify hidden patterns, correlations, and trends within your uploaded CSVs.</li>
            <li><strong>Automated Report Generation:</strong> Generate summaries, highlights, or even draft reports based on your data.</li>
            <li><strong>Data Cleaning Suggestions:</strong> Receive AI-powered recommendations for cleaning and structuring messy CSV data.</li>
            <li><strong>Secure Data Processing:</strong> Your uploaded data is processed securely to maintain privacy.</li>
          </ul>
          <p>Empower your data-driven decisions with Gemini's AI, making complex CSV analysis accessible and intuitive.</p>
        `,
        price: 0.007, // Slightly higher for advanced data interaction
        priceUnit: "/1K tokens",
        priceExplanation: "for data analysis and generation",
        bookmarks: 250,
        avgCustomerLifetimeValue: 1500,
        cumulativeSales: 187500,
        vendors: [
          {
            id: "gemini-vendor1",
            name: "AI Innovators Hub",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AIH",
            uptimeScore: 99.9,
            reviewsScore: 4.9,
            communityLinks: [{ label: "Docs", url: "#" }],
            priceLine: "Starting from $0.007/1K tokens",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "31",
    name: "Gnosis Multi-Sig",
    subheading:
      "Secure multi-signature wallet.\nManage your crypto assets safely.",
    coverImage:
      "https://cdn.prod.website-files.com/67ed326db9d26b1dc1df7929/68017edea825224b44cfb0c7_6653f8d50a4daf8c4066b928_Gnosis%2520Safe%2520Explained.webp",
    isFeatured: Math.random() > 0.7,
    offers: [
      {
        id: "offer-gnosis-secure-folders",
        title:
          "Gnosis Safe Integration for Secure Cloud Folder Access (Multisig)",
        images: [],
        description: `
          <p>Integrate Gnosis Safe with your Anonymous OfficeX cloud storage to create **multi-signature protected secret folders and documents**. This offer provides a robust security layer, requiring multiple authorized signatures (e.g., from team members or specific roles) to access, modify, or download sensitive files. Ideal for highly confidential documents, financial records, or strategic plans that demand an extra layer of access control.</p>
          <p>Services include:</p>
          <ul>
            <li><strong>Multi-sig Folder Setup:</strong> Configure specific cloud folders to require Gnosis Safe multi-signature approval for access.</li>
            <li><strong>Granular Access Control:</strong> Define 'M of N' signature requirements for different levels of access (read-only, edit, download).</li>
            <li><strong>Activity Logging & Auditing:</strong> Track all access attempts and modifications to multisig-protected content.</li>
            <li><strong>Secure Key Management Consultation:</strong> Best practices for securing the private keys of the signers.</li>
            <li><strong>Integration with OfficeX:</strong> Seamlessly grant/revoke access directly from your OfficeX environment.</li>
          </ul>
          <p>Add an unparalleled level of security to your most sensitive OfficeX documents with Gnosis Safe multi-signature protection.</p>
        `,
        price: 750, // Higher for advanced security integration
        priceUnit: "/setup",
        priceExplanation: "One-time setup fee for folder integration",
        bookmarks: 120,
        avgCustomerLifetimeValue: 1000,
        cumulativeSales: 60000,
        vendors: [
          {
            id: "gnosis-vendor1",
            name: "SecureDocs Blockchain",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDBC",
            uptimeScore: 99.99,
            reviewsScore: 4.8,
            communityLinks: [{ label: "Consultation", url: "#" }],
            priceLine: "$750 (setup)",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "15",
    name: "Telegram Agent",
    subheading:
      "Secure messaging and voice calls.\nConnect with friends and family.",
    coverImage:
      "https://mir-s3-cdn-cf.behance.net/project_modules/1400/3d89aa78088397.5c9a9eb73dabf.png",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-telegram-csv-notifications",
        title: "Telegram Bot for OfficeX CSV Upload Notifications & Actions",
        images: [],
        description: `
          <p>This offer provides a custom Telegram bot designed to integrate with Anonymous OfficeX, enabling **real-time notifications on CSV file uploads** and triggering automated actions based on those uploads. Set up alerts for new data, critical updates, or even initiate workflows directly from Telegram after a CSV is added to your cloud storage.</p>
          <p>Features include:</p>
          <ul>
            <li><strong>CSV Upload Alerts:</strong> Receive instant Telegram notifications when new CSVs are uploaded to designated OfficeX cloud folders.</li>
            <li><strong>Automated Workflow Triggers:</strong> Configure the bot to initiate specific actions (e.g., data validation, processing) upon CSV upload.</li>
            <li><strong>Interactive Commands:</strong> Use Telegram commands to query data from uploaded CSVs or trigger bulk downloads.</li>
            <li><strong>Secure Integration:</strong> Ensure private and secure communication between Telegram and your OfficeX platform.</li>
            <li><strong>Customizable Messages:</strong> Tailor notification content to include relevant CSV metadata.</li>
          </ul>
          <p>Enhance team collaboration and data responsiveness by linking your OfficeX CSV workflows to Telegram notifications and actions.</p>
        `,
        price: 450, // Higher for specialized integration
        priceUnit: "/project",
        priceExplanation:
          "starting price for custom bot development and integration",
        bookmarks: 150,
        avgCustomerLifetimeValue: 750,
        cumulativeSales: 112500,
        vendors: [
          {
            id: "telegram-vendor1",
            name: "Bot Builders Co.",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BBC",
            uptimeScore: 99.8,
            reviewsScore: 4.5,
            communityLinks: [{ label: "Portfolio", url: "#" }],
            priceLine: "From $450",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Uniswap",
    subheading:
      "Decentralized exchange for cryptocurrency trading.\nSwap tokens securely.",
    coverImage:
      "https://www.newsbtc.com/wp-content/uploads/2024/11/Uniswap-from-LinkedIn.jpg?fit=800%2C450",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-uniswap-data-analytics",
        title:
          "DeFi Data Analytics for OfficeX: Uniswap Trading & LP CSV Exports",
        images: [],
        description: `
          <p>This offer provides specialized data analytics services focused on Decentralized Finance (DeFi) platforms like Uniswap. We help you **scrape and organize your on-chain transaction data, liquidity provision activities, and yield farming metrics into comprehensive CSV files**, ready for detailed analysis within your Anonymous OfficeX spreadsheets. Understand your crypto portfolio performance, impermanent loss, and fee generation with clear, structured data.</p>
          <p>What you'll get:</p>
          <ul>
            <li><strong>Uniswap Transaction CSVs:</strong> Export detailed records of your swaps, liquidity additions, and removals.</li>
            <li><strong>Yield Farming Performance Reports:</strong> Generate CSVs outlining your earnings and impermanent loss from various liquidity pools.</li>
            <li><strong>Custom Data Queries:</strong> Request specific on-chain data to be pulled and formatted into CSV.</li>
            <li><strong>Integration Readiness:</strong> CSV outputs are optimized for easy import and analysis in OfficeX Sheets.</li>
            <li><strong>Expert Analysis & Insights:</strong> Optional add-on for a human analyst to provide insights from your data.</li>
          </ul>
          <p>Gain a clearer financial picture of your DeFi activities with structured data for your OfficeX cloud office suite.</p>
        `,
        price: 199, // Higher for specialized blockchain data
        priceUnit: "/report",
        priceExplanation: "per custom data report/CSV export",
        bookmarks: 180,
        avgCustomerLifetimeValue: 250,
        cumulativeSales: 45000,
        vendors: [
          {
            id: "uniswap-vendor1",
            name: "DeFi Data Insights",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DDI",
            uptimeScore: 99.9,
            reviewsScore: 4.7,
            communityLinks: [{ label: "Webinars", url: "#" }],
            priceLine: "$199/report",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "13",
    name: "Spreadsheets",
    subheading:
      "Powerful tool for data organization and analysis.\nCreate and manage tables.",
    coverImage:
      "https://static1.howtogeekimages.com/wordpress/wp-content/uploads/2024/08/an-excel-spreadsheet-displaying-a-heat-map-with-the-excel-logo-in-front-of-it.jpg",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-spreadsheet-ai-csv-workflows",
        title:
          "AI-Driven Workflows for CSV Uploads in Anonymous OfficeX Sheets",
        images: [],
        description: `
          <p>This offer provides advanced services to build **AI-driven workflows directly within Anonymous OfficeX Spreadsheets**, specifically designed for handling CSV data uploads. Automate tasks like data cleaning, categorization, enrichment via web scraping, or even trigger AI models for predictive analysis immediately after a CSV is uploaded to your cloud storage or imported into a sheet.</p>
          <p>Services include:</p>
          <ul>
            <li><strong>Automated CSV Data Cleaning:</strong> AI identifies and corrects inconsistencies, duplicates, or missing values upon upload.</li>
            <li><strong>Data Enrichment (Web Scraping):</strong> Automatically pull additional data from the web based on CSV content (e.g., company details from names).</li>
            <li><strong>AI Categorization & Tagging:</strong> Use AI to classify data points within your CSVs for better organization.</li>
            <li><strong>Custom Macro/Script Development:</strong> Build powerful automation scripts (e.g., Google Apps Script, VBA for compatibility) to react to CSV changes.</li>
            <li><strong>Dashboard Integration:</strong> Update interactive dashboards automatically with newly uploaded CSV data.</li>
          </ul>
          <p>Transform your spreadsheets into intelligent, automated data processing hubs for all your CSV-based workflows.</p>
        `,
        price: 400, // Higher for AI/automation integration
        priceUnit: "/workflow",
        priceExplanation: "starting price for custom AI-powered CSV workflows",
        bookmarks: 150,
        avgCustomerLifetimeValue: 1200,
        cumulativeSales: 180000,
        vendors: [
          {
            id: "spreadsheet-vendor1",
            name: "Data Flow Gurus",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DFG",
            uptimeScore: 99.7,
            reviewsScore: 4.6,
            communityLinks: [{ label: "Samples", url: "#" }],
            priceLine: "From $400",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "n8n",
    subheading:
      "Workflow automation for developers.\nIntegrate apps and services.",
    coverImage:
      "https://blog.n8n.io/content/images/size/w1200/2024/10/ai-workflow-automationA--1-.png",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-n8n-ai-csv-integration",
        title: "n8n Automation for AI Web Scraping & CSV Processing in OfficeX",
        images: [],
        description: `
          <p>This offer provides expert development of custom n8n workflows specifically tailored for your Anonymous OfficeX environment, focusing on **AI-powered web scraping, automated CSV data dumps, and actions triggered by CSV uploads**. Build complex, multi-step automations that interact with websites, extract data, transform it into CSVs, and then use that data to update or trigger actions within your OfficeX documents and cloud storage.</p>
          <p>Services include:</p>
          <ul>
            <li><strong>AI Web Scraping Workflows:</strong> Design n8n workflows that use AI to intelligently extract data from websites, even complex or unstructured content.</li>
            <li><strong>Automated CSV Generation:</strong> Convert scraped data or other inputs into clean, formatted CSV files for OfficeX import.</li>
            <li><strong>CSV Upload Triggers:</strong> Create workflows that automatically run (e.g., data validation, processing, notification) when a CSV is uploaded to OfficeX cloud storage.</li>
            <li><strong>Bulk Data Actions:</strong> Implement workflows for bulk downloading specific documents or data sets from OfficeX, based on CSV instructions.</li>
            <li><strong>Integration with OfficeX APIs:</strong> Connect n8n directly with OfficeX's underlying APIs for seamless data flow.</li>
          </ul>
          <p>Supercharge your OfficeX operations with custom n8n automations for intelligent data acquisition and processing.</p>
        `,
        price: 600, // Higher for complex AI/web scraping integrations
        priceUnit: "/workflow",
        priceExplanation: "starting price per custom advanced workflow",
        bookmarks: 100,
        avgCustomerLifetimeValue: 1500,
        cumulativeSales: 150000,
        vendors: [
          {
            id: "n8n-vendor1",
            name: "Automation Architects",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AA",
            uptimeScore: 99.9,
            reviewsScore: 4.8,
            communityLinks: [{ label: "Case Studies", url: "#" }],
            priceLine: "From $600",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "16",
    name: "YouTube Downloader",
    subheading:
      "Watch and share videos from around the world.\nEntertain and learn.",
    coverImage:
      "https://static1.anpoimages.com/wordpress/wp-content/uploads/2022/09/youtube-ap-hero-2.jpg",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-youtubedl-bulk-archive",
        title: "Bulk YouTube Content Archiving to OfficeX Cloud Storage",
        images: [],
        description: `
          <p>This offer provides a service for **bulk downloading and archiving YouTube video and audio content** directly into your Anonymous OfficeX cloud storage. Ideal for researchers, content creators, or businesses needing to retain large volumes of public YouTube data (e.g., competitor analysis, public sentiment, trend analysis) in a structured and accessible format. We can provide accompanying metadata in **CSV format**.</p>
          <p>Features include:</p>
          <ul>
            <li><strong>Bulk Video/Audio Downloads:</strong> Download entire YouTube channels, playlists, or specific video lists.</li>
            <li><strong>OfficeX Cloud Integration:</strong> Directly save downloaded content to your designated OfficeX cloud storage folders.</li>
            <li><strong>Metadata CSV Export:</strong> Receive a CSV file with video titles, descriptions, upload dates, views, and other relevant data.</li>
            <li><strong>Custom Quality & Format:</strong> Specify desired video quality (up to 4K) and audio formats (MP3, WAV).</li>
            <li><strong>Automated Archiving:</strong> Set up recurring downloads for continuously updated content.</li>
          </ul>
          <p>Build a comprehensive archive of YouTube content within your OfficeX ecosystem for research, analysis, or internal use. Ensure compliance with YouTube's terms of service and copyright laws.</p>
        `,
        price: 10,
        priceUnit: "/GB",
        priceExplanation: "per GB of downloaded and stored content",
        bookmarks: 250,
        avgCustomerLifetimeValue: 50,
        cumulativeSales: 12500,
        vendors: [
          {
            id: "youtubedl-vendor1",
            name: "Video Archiving Solutions",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VAS",
            uptimeScore: 99.6,
            reviewsScore: 4.3,
            communityLinks: [{ label: "FAQ", url: "#" }],
            priceLine: "$10/GB",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "32-places",
    name: "Google Maps Reviews",
    subheading:
      "Prospect leads from local businesses and places.\nExplore your city.",
    coverImage:
      "https://cdn.mappr.co/wp-content/uploads/2022/03/google-places-api-alternatives.jpg",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-gmaps-ai-lead-generation",
        title: "AI-Powered Google Maps Business Lead Generation & CSV Export",
        images: [],
        description: `
          <p>This offer provides an **AI-enhanced service for generating targeted business leads from Google Maps**, delivering them directly to your Anonymous OfficeX as organized **CSV dumps**. Leverage AI to refine search criteria, filter for high-potential leads, and extract richer data points (e.g., website contact info, social media links) beyond standard listings, all formatted for immediate use in your OfficeX spreadsheets or CRM.</p>
          <p>What you'll get:</p>
          <ul>
            <li><strong>AI-Optimized Lead Filtering:</strong> Use AI to identify businesses matching complex criteria (e.g., specific keywords in reviews, business activity signals).</li>
            <li><strong>Comprehensive Data Points:</strong> Extract business name, address, phone, website, email (if publicly available), social media links, reviews count, and ratings.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, structured CSV files ready for import into OfficeX Sheets for sales outreach or market analysis.</li>
            <li><strong>Bulk Download & Automation:</strong> Option to schedule recurring lead generation and automated CSV delivery to your cloud storage.</li>
            <li><strong>Geospatial Data Visualization (Add-on):</strong> Integrate extracted lead data with mapping tools (optional).</li>
          </ul>
          <p>Fill your sales pipeline with high-quality, AI-curated local business leads, delivered in a convenient CSV format for your OfficeX platform.</p>
        `,
        price: 0.15, // Higher for AI-enhanced extraction
        priceUnit: "/lead",
        priceExplanation: "per verified and AI-enriched lead record",
        bookmarks: 180,
        avgCustomerLifetimeValue: 400,
        cumulativeSales: 72000,
        vendors: [
          {
            id: "gmaps-vendor1",
            name: "AI Lead Solutions",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ALS",
            uptimeScore: 99.8,
            reviewsScore: 4.7,
            communityLinks: [{ label: "Testimonials", url: "#" }],
            priceLine: "$0.15/lead",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "ChatGPT",
    subheading: "AI-powered conversational assistant.\nGet instant answers.",
    coverImage:
      "https://www.designmantic.com/blog/wp-content/uploads/2023/04/ChatGPT-1280x720.jpg",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-chatgpt-csv-prompting",
        title: "ChatGPT for CSV-Driven Document Generation & AI Actions",
        images: [], // Will be populated with app.coverImage at runtime
        description: `
          <p>Integrate ChatGPT's advanced AI capabilities with your Anonymous OfficeX workflows to enable **document generation and AI actions driven by CSV data uploads**. This service allows you to use content from your spreadsheets as prompts for ChatGPT, generating reports, drafting emails, summarizing data, or performing complex text-based tasks directly within your cloud office environment. Upload a CSV, and let AI generate structured documents or perform bulk text operations.</p>
          <p>Benefits include:</p>
          <ul>
            <li><strong>CSV-to-Document Automation:</strong> Generate reports, contracts, or personalized emails by feeding data from OfficeX CSVs to ChatGPT.</li>
            <li><strong>Bulk Content Generation:</strong> Create multiple variations of text content based on rows in a spreadsheet (e.g., product descriptions, marketing copy).</li>
            <li><strong>AI-Powered Data Summarization:</strong> Summarize large textual datasets within your CSVs into concise reports or overviews.</li>
            <li><strong>Semantic Search & Q&A:</strong> Use natural language to query your CSV data, leveraging ChatGPT's understanding.</li>
            <li><strong>Content Refinement & Editing:</strong> Leverage AI to improve grammar, style, or tone of documents generated from data.</li>
          </ul>
          <p>Transform your OfficeX CSV data into dynamic, AI-generated text and documents, enhancing productivity and content creation.</p>
        `,
        price: 30, // Higher for integrated AI services
        priceUnit: "/month",
        priceExplanation: "flat rate for API access and integrated workflows",
        bookmarks: 400,
        avgCustomerLifetimeValue: 360,
        cumulativeSales: 144000,
        vendors: [
          {
            id: "chat-vendor1",
            name: "AI Solutions Direct",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ASD",
            uptimeScore: 99.8,
            reviewsScore: 4.6,
            communityLinks: [{ label: "FAQ", url: "#" }],
            priceLine: "$30/month",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "1",
    name: "Dmail",
    subheading:
      "Secure and decentralized email communication.\nProtect your privacy.",
    coverImage: "https://dmail.ai/assets/2-6c029453.png",
    isFeatured: true,
    offers: [
      {
        id: "offer-dmail-csv-email-automation",
        title: "Dmail Integration for CSV-Driven Bulk Email Campaigns",
        images: [],
        description: `
          <p>Integrate Dmail's secure, decentralized email capabilities with your Anonymous OfficeX platform to launch **CSV-driven bulk email campaigns**. This offer allows you to upload recipient lists and email content via CSV files, then leverage Dmail for secure, privacy-focused outreach. Ideal for newsletters, transactional emails, or secure communications where privacy and decentralization are paramount.</p>
          <p>Benefits include:</p>
          <ul>
            <li><strong>CSV-to-Email Automation:</strong> Use recipient lists and personalized content from OfficeX CSVs to send bulk emails via Dmail.</li>
            <li><strong>Decentralized & Secure Sending:</strong> Leverage Dmail's Web3 infrastructure for enhanced privacy and censorship resistance.</li>
            <li><strong>Personalized Campaigns:</strong> Dynamically insert data from your CSV into email templates for personalized outreach.</li>
            <li><strong>Attachment Support:</strong> Attach documents from your OfficeX cloud storage to Dmail emails.</li>
            <li><strong>Delivery Reports (CSV):</strong> Receive analytics and delivery statuses in CSV format for performance tracking.</li>
          </ul>
          <p>Execute secure and privacy-centric email campaigns directly from your OfficeX data, powered by Dmail.</p>
        `,
        price: 0.01,
        priceUnit: "/email",
        priceExplanation: "per bulk email sent via Dmail",
        bookmarks: 130,
        avgCustomerLifetimeValue: 100,
        cumulativeSales: 13000,
        vendors: [
          {
            id: "dmail-vendor1",
            name: "Dmail Official",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DO",
            uptimeScore: 99.99,
            reviewsScore: 4.9,
            communityLinks: [{ label: "Docs", url: "#" }],
            priceLine: "$0.01/email",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "exa-ai",
    name: "Exa AI Search",
    subheading: "AI-powered search engine.\nFind hyper-relevant results.",
    coverImage: "https://pbs.twimg.com/media/GwkR4Q6bUAAJKUR?format=png",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-exa-ai-web-data-csv",
        title: "exa.ai Web Data Extraction & CSV Export for OfficeX",
        images: [], // Will be populated with app.coverImage at runtime
        description: `
          <p>Integrate **exa.ai's advanced AI-powered search capabilities** with your Anonymous OfficeX environment to perform highly targeted web data extraction and receive results as structured **CSV files**. This service leverages exa.ai's ability to find and understand hyper-relevant information across the web, making it ideal for market research, competitive analysis, trend identification, and gathering specific data points for your OfficeX spreadsheets.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>AI-Powered Targeted Search:</strong> Utilize exa.ai to conduct deep, semantic searches across the web for specific information.</li>
            <li><strong>Automated Data Extraction:</strong> Automatically pull relevant text, numbers, links, and other data points from search results.</li>
            <li><strong>Structured CSV Output:</strong> Receive clean, organized CSV files tailored for easy import and analysis in OfficeX Sheets.</li>
            <li><strong>Customizable Search Queries:</strong> Define precise search parameters and criteria to get the exact data you need.</li>
            <li><strong>Scheduled Data Pulls:</strong> Set up recurring data extraction tasks to keep your datasets updated.</li>
          </ul>
          <p>Enhance your data intelligence by transforming the vastness of the web into actionable, structured CSV data, seamlessly integrated with your OfficeX suite.</p>
        `,
        price: 0.02,
        priceUnit: "/query",
        priceExplanation: "per AI-powered search query with data extraction",
        bookmarks: 80,
        avgCustomerLifetimeValue: 300,
        cumulativeSales: 24000,
        vendors: [
          {
            id: "exa-ai-vendor1",
            name: "AI Search Solutions",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ASS",
            uptimeScore: 99.9,
            reviewsScore: 4.7,
            communityLinks: [{ label: "API Docs", url: "#" }],
            priceLine: "$0.02/query",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    subheading:
      "Short-form video platform.\nCreate and discover viral content.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-tiktok-analytics-csv",
        title: "TikTok Analytics & Trend Data Export to OfficeX (CSV)",
        images: [],
        description: `
          <p>This service allows you to **extract detailed analytics and trend data from TikTok**, delivering it as structured **CSV files** for analysis within your Anonymous OfficeX environment. Gain insights into video performance, hashtag trends, audience demographics, and popular sounds to inform your content strategy or market research.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Video Performance Data:</strong> Export metrics like views, likes, shares, comments, and watch time for your TikTok content.</li>
            <li><strong>Hashtag & Trend Analysis:</strong> Get CSVs on trending hashtags, popular sounds, and viral challenges.</li>
            <li><strong>Audience Demographics:</strong> Access aggregated audience data to understand your viewers better.</li>
            <li><strong>Competitor Analysis:</strong> Monitor and export data from public competitor profiles.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs ready for import into OfficeX Sheets for reporting and analysis.</li>
          </ul>
          <p>Leverage TikTok's vast dataset to drive your marketing decisions, all within your OfficeX suite.</p>
        `,
        price: 250,
        priceUnit: "/month",
        priceExplanation:
          "monthly subscription for data extraction and reporting",
        bookmarks: 90,
        avgCustomerLifetimeValue: 800,
        cumulativeSales: 72000,
        vendors: [
          {
            id: "tiktok-vendor1",
            name: "Social Data Insights",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDI",
            uptimeScore: 99.7,
            reviewsScore: 4.5,
            communityLinks: [{ label: "Case Studies", url: "#" }],
            priceLine: "$250/month",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    subheading: "Photo and video sharing social network.\nConnect visually.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-instagram-data-scraper-csv",
        title: "Instagram Profile & Engagement Data Scraper (CSV Export)",
        images: [],
        description: `
          <p>This service provides tools for **extracting public data from Instagram profiles, posts, and engagement metrics**, delivering the insights directly to your Anonymous OfficeX as structured **CSV files**. Ideal for social media marketers, influencers, or businesses looking to analyze trends, monitor competitor activity, or identify potential collaborators.</p>
          <p>Features include:</p>
          <ul>
            <li><strong>Profile Data Export:</strong> Scrape public profile information like follower count, following count, bio, and contact details.</li>
            <li><strong>Post Engagement Metrics:</strong> Extract likes, comments, and shares for specified posts.</li>
            <li><strong>Hashtag & Location Data:</strong> Gather data related to posts using specific hashtags or geotags.</li>
            <li><strong>Comment & Mention Analysis:</strong> Export comments and mentions for sentiment analysis or trend identification.</li>
            <li><strong>CSV Output for OfficeX:</strong> Receive clean, formatted CSVs for easy import into OfficeX Sheets.</li>
          </ul>
          <p>Transform raw Instagram data into actionable insights for your marketing and content strategies within OfficeX.</p>
        `,
        price: 0.08,
        priceUnit: "/record",
        priceExplanation: "per data record (e.g., profile, post, comment)",
        bookmarks: 110,
        avgCustomerLifetimeValue: 300,
        cumulativeSales: 33000,
        vendors: [
          {
            id: "instagram-vendor1",
            name: "Social Metrics Pro",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SMP",
            uptimeScore: 99.6,
            reviewsScore: 4.4,
            communityLinks: [{ label: "Blog", url: "#" }],
            priceLine: "$0.08/record",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "lastpass",
    name: "LastPass",
    subheading:
      "Password manager.\nSecurely store and access your credentials.",
    coverImage: "https://images.unsplash.com/photo-1629744415843-0b0b0b0b0b0b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-lastpass-secure-csv-import",
        title: "Secure LastPass CSV Password Import & Audit for OfficeX",
        images: [],
        description: `
          <p>This offer facilitates **secure import and auditing of LastPass-exported CSV password data** into a protected environment linked with your Anonymous OfficeX. We help you securely migrate, organize, and analyze your password vault data (e.g., for compliance, identifying weak passwords, or consolidating logins) while ensuring maximum privacy and security.</p>
          <p>Services include:</p>
          <ul>
            <li><strong>Secure CSV Import:</strong> Guided process for safely importing LastPass CSV exports.</li>
            <li><strong>Password Audit & Analysis:</strong> Identify weak, duplicate, or compromised passwords within your dataset.</li>
            <li><strong>Categorization & Organization:</strong> Help structure your password data within OfficeX for easy management.</li>
            <li><strong>Security Best Practices:</strong> Consultation on best practices for managing sensitive credential data.</li>
            <li><strong>Encrypted Storage Options:</strong> Advise on and implement highly encrypted storage solutions for your credential CSVs.</li>
          </ul>
          <p>Enhance your organization's digital security by efficiently managing and auditing your LastPass credential data in a secure OfficeX-compatible format.</p>
        `,
        price: 150,
        priceUnit: "/audit",
        priceExplanation: "per secure import and audit session",
        bookmarks: 70,
        avgCustomerLifetimeValue: 400,
        cumulativeSales: 28000,
        vendors: [
          {
            id: "lastpass-vendor1",
            name: "CyberSafe Solutions",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CSS",
            uptimeScore: 99.99,
            reviewsScore: 4.8,
            communityLinks: [{ label: "Security Whitepapers", url: "#" }],
            priceLine: "$150/audit",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "reddit",
    name: "Reddit",
    subheading:
      "Community-driven news and discussion platform.\nExplore diverse topics.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-reddit-sentiment-csv",
        title: "Reddit Sentiment Analysis & Trend Data (CSV Export)",
        images: [],
        description: `
          <p>This service offers **in-depth sentiment analysis and trend data extraction from Reddit**, delivering valuable insights as structured **CSV files** to your Anonymous OfficeX. Monitor brand mentions, public opinion, trending topics, and community discussions to inform your marketing, product development, or public relations strategies.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Keyword & Subreddit Monitoring:</strong> Track specific keywords, phrases, or subreddits for relevant discussions.</li>
            <li><strong>Sentiment Analysis:</strong> Categorize public sentiment (positive, negative, neutral) regarding your brand, products, or topics.</li>
            <li><strong>Trend Identification:</strong> Identify emerging trends and viral content across Reddit communities.</li>
            <li><strong>User Engagement Metrics:</strong> Extract upvotes, comments, and share counts for posts and comments.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive organized CSVs for easy import into OfficeX Sheets for further analysis and reporting.</li>
          </ul>
          <p>Uncover the pulse of online communities and gain competitive intelligence by integrating Reddit data into your OfficeX workflows.</p>
        `,
        price: 300,
        priceUnit: "/month",
        priceExplanation:
          "monthly subscription for Reddit data monitoring and export",
        bookmarks: 100,
        avgCustomerLifetimeValue: 900,
        cumulativeSales: 90000,
        vendors: [
          {
            id: "reddit-vendor1",
            name: "Community Insights Lab",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CIL",
            uptimeScore: 99.5,
            reviewsScore: 4.3,
            communityLinks: [{ label: "API Docs", url: "#" }],
            priceLine: "$300/month",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "facebook-marketplace",
    name: "Facebook Marketplace",
    subheading: "Local buying and selling platform.\nDiscover deals nearby.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-fb-marketplace-listings-csv",
        title: "Facebook Marketplace Listing Data Extraction (CSV Export)",
        images: [],
        description: `
          <p>This service enables **extraction of public listing data from Facebook Marketplace**, providing it to your Anonymous OfficeX as structured **CSV files**. Ideal for market researchers, resellers, or businesses looking to analyze product trends, pricing strategies, or inventory availability within local or specific regions.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Targeted Listing Search:</strong> Extract data based on keywords, categories, price range, and location.</li>
            <li><strong>Detailed Listing Data:</strong> Capture product title, description, price, seller information, and condition.</li>
            <li><strong>Image URL Export:</strong> Include URLs to listing images for visual analysis.</li>
            <li><strong>Trend & Pricing Analysis:</strong> Use extracted data to identify pricing trends and popular items.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for detailed analysis.</li>
          </ul>
          <p>Gain a competitive edge by leveraging real-time marketplace data, formatted for easy use in your OfficeX spreadsheets.</p>
        `,
        price: 0.1,
        priceUnit: "/listing",
        priceExplanation: "per extracted listing record",
        bookmarks: 85,
        avgCustomerLifetimeValue: 200,
        cumulativeSales: 17000,
        vendors: [
          {
            id: "fb-marketplace-vendor1",
            name: "E-commerce Data Solutions",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ECDS",
            uptimeScore: 99.4,
            reviewsScore: 4.2,
            communityLinks: [{ label: "Client Portal", url: "#" }],
            priceLine: "$0.10/listing",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    subheading:
      "Professional networking and career development.\nConnect with peers.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-linkedin-lead-gen-csv",
        title: "LinkedIn Lead Generation & Company Data Export (CSV)",
        images: [],
        description: `
          <p>This service focuses on **extracting targeted lead and company data from LinkedIn** for your Anonymous OfficeX, delivered as organized **CSV files**. Ideal for sales teams, recruiters, and market researchers looking to build prospect lists, analyze industry trends, or gather competitive intelligence from the world's largest professional network.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Targeted Lead Extraction:</strong> Identify and extract professional profiles based on industry, role, location, and seniority.</li>
            <li><strong>Company Data Enrichment:</strong> Gather public company information including size, industry, location, and key employees.</li>
            <li><strong>Job Posting Data:</strong> Extract data from job postings for talent market analysis.</li>
            <li><strong>Network Mapping:</strong> Visualize connections and influence within specific professional networks (optional add-on).</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, structured CSVs ready for CRM import or analysis in OfficeX Sheets.</li>
          </ul>
          <p>Supercharge your outreach and market research efforts with precisely targeted LinkedIn data, seamlessly integrated into your OfficeX platform.</p>
        `,
        price: 0.2,
        priceUnit: "/lead",
        priceExplanation: "per verified professional or company lead record",
        bookmarks: 140,
        avgCustomerLifetimeValue: 600,
        cumulativeSales: 84000,
        vendors: [
          {
            id: "linkedin-vendor1",
            name: "Professional Data Solutions",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PDS",
            uptimeScore: 99.8,
            reviewsScore: 4.7,
            communityLinks: [{ label: "Success Stories", url: "#" }],
            priceLine: "$0.20/lead",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    subheading:
      "Voice, video, and text chat for communities.\nConnect with groups.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-discord-community-csv",
        title: "Discord Community Activity & Sentiment Analysis (CSV Export)",
        images: [],
        description: `
          <p>This service provides tools for **extracting and analyzing public activity and sentiment from Discord servers**, delivering the insights as structured **CSV files** to your Anonymous OfficeX. Monitor discussions, identify key community members, track sentiment around specific topics or products, and understand engagement patterns for community management, market research, or brand monitoring.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Server & Channel Monitoring:</strong> Track activity within specified public Discord servers and channels.</li>
            <li><strong>Message & User Data:</strong> Extract message content, user IDs, timestamps, and reaction counts.</li>
            <li><strong>Sentiment Analysis:</strong> Apply AI to categorize the sentiment of messages (positive, negative, neutral).</li>
            <li><strong>Keyword & Topic Tracking:</strong> Monitor discussions around specific keywords or emerging topics.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for detailed reporting.</li>
          </ul>
          <p>Turn raw Discord chatter into actionable data points for your strategic planning within the OfficeX environment.</p>
        `,
        price: 400,
        priceUnit: "/month",
        priceExplanation:
          "monthly subscription for Discord data monitoring and export",
        bookmarks: 60,
        avgCustomerLifetimeValue: 1200,
        cumulativeSales: 72000,
        vendors: [
          {
            id: "discord-vendor1",
            name: "Community Data Experts",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CDE",
            uptimeScore: 99.6,
            reviewsScore: 4.4,
            communityLinks: [{ label: "Support Chat", url: "#" }],
            priceLine: "$400/month",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    subheading: "Visual discovery engine.\nFind ideas and inspiration.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-pinterest-trend-csv",
        title: "Pinterest Trend & Idea Pin Data Extraction (CSV Export)",
        images: [],
        description: `
          <p>This service focuses on **extracting trending visual content data and idea pin insights from Pinterest**, delivering them as structured **CSV files** to your Anonymous OfficeX. Ideal for content creators, marketers, and product developers to identify visual trends, popular product ideas, and user preferences to inform their creative and business strategies.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Trending Topic Extraction:</strong> Identify popular and emerging visual trends across Pinterest categories.</li>
            <li><strong>Idea Pin Data:</strong> Extract data from Idea Pins, including titles, descriptions, and engagement metrics.</li>
            <li><strong>Keyword & Category Analysis:</strong> Gather data related to specific keywords, themes, and product categories.</li>
            <li><strong>Image & Video URLs:</strong> Include URLs to pins for visual reference and content analysis.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for easy import into OfficeX Sheets for visual trend analysis.</li>
          </ul>
          <p>Unlock the power of visual trends and consumer inspiration by integrating Pinterest data into your OfficeX workflows.</p>
        `,
        price: 0.05,
        priceUnit: "/pin",
        priceExplanation: "per extracted trending pin or idea pin record",
        bookmarks: 75,
        avgCustomerLifetimeValue: 250,
        cumulativeSales: 18750,
        vendors: [
          {
            id: "pinterest-vendor1",
            name: "Visual Trend Analytics",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VTA",
            uptimeScore: 99.7,
            reviewsScore: 4.5,
            communityLinks: [{ label: "Portfolio", url: "#" }],
            priceLine: "$0.05/pin",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    subheading:
      "Developer platform for version control and collaboration.\nBuild software.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-github-repo-data-csv",
        title: "GitHub Repository & Developer Data Extraction (CSV Export)",
        images: [],
        description: `
          <p>This service provides tools for **extracting public data from GitHub repositories and developer profiles**, delivering insights as structured **CSV files** to your Anonymous OfficeX. Ideal for recruiters, researchers, or project managers to analyze open-source projects, track developer activity, or identify potential collaborators and talent.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Repository Metrics:</strong> Extract data on stars, forks, issues, pull requests, and commit activity for public repos.</li>
            <li><strong>Developer Profile Data:</strong> Gather public information on developers, their contributions, and spoken languages.</li>
            <li><strong>Codebase Analysis (Metadata):</strong> Extract metadata about code languages used and file structures.</li>
            <li><strong>Issue & Pull Request Tracking:</strong> Monitor and export data on open/closed issues and pull requests.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for project management or talent sourcing.</li>
          </ul>
          <p>Gain a data-driven perspective on the open-source world by integrating GitHub data into your OfficeX environment.</p>
        `,
        price: 0.12,
        priceUnit: "/record",
        priceExplanation: "per extracted repository or developer record",
        bookmarks: 95,
        avgCustomerLifetimeValue: 400,
        cumulativeSales: 38000,
        vendors: [
          {
            id: "github-vendor1",
            name: "DevData Solutions",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DDS",
            uptimeScore: 99.8,
            reviewsScore: 4.6,
            communityLinks: [{ label: "Documentation", url: "#" }],
            priceLine: "$0.12/record",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    subheading:
      "Email marketing and transactional email service.\nDeliver emails reliably.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-sendgrid-email-logs-csv",
        title: "SendGrid Email Log & Analytics Export (CSV) for OfficeX",
        images: [],
        description: `
          <p>This service provides **extraction of detailed email logs and analytics from SendGrid**, delivering them as structured **CSV files** to your Anonymous OfficeX. Gain comprehensive insights into your email campaign performance, delivery rates, bounces, clicks, and opens for in-depth analysis and reporting within your spreadsheets.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Detailed Email Event Logs:</strong> Export data on delivered, opened, clicked, bounced, and unsubscribed emails.</li>
            <li><strong>Campaign Performance Metrics:</strong> Gather aggregated data for specific email campaigns or automation.</li>
            <li><strong>Recipient Engagement Data:</strong> Track individual recipient activity for personalized follow-ups.</li>
            <li><strong>Error & Bounce Analysis:</strong> Identify reasons for non-delivery and improve email deliverability.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for reporting and optimization.</li>
          </ul>
          <p>Optimize your email marketing and transactional communications with granular SendGrid data, seamlessly integrated into your OfficeX analytics.</p>
        `,
        price: 200,
        priceUnit: "/month",
        priceExplanation: "monthly subscription for SendGrid data export",
        bookmarks: 80,
        avgCustomerLifetimeValue: 500,
        cumulativeSales: 40000,
        vendors: [
          {
            id: "sendgrid-vendor1",
            name: "Email Analytics Hub",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EAH",
            uptimeScore: 99.9,
            reviewsScore: 4.7,
            communityLinks: [{ label: "Help Center", url: "#" }],
            priceLine: "$200/month",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "twilio",
    name: "Twilio",
    subheading:
      "Cloud communications platform.\nAdd messaging, voice, and video.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-twilio-cdr-csv",
        title: "Twilio Call & SMS Log (CDR) Export (CSV) for OfficeX",
        images: [],
        description: `
          <p>This service provides **extraction of detailed Call Detail Records (CDRs) and SMS logs from Twilio**, delivering them as structured **CSV files** to your Anonymous OfficeX. Analyze your communication patterns, track call durations, message statuses, costs, and identify trends for optimizing your customer interactions and communication workflows.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Call Log Export:</strong> Extract data on incoming/outgoing calls, duration, status, and associated numbers.</li>
            <li><strong>SMS Log Export:</strong> Gather data on sent/received messages, status, and content (metadata only for privacy).</li>
            <li><strong>Cost Analysis:</strong> Track communication costs per call or message for budget management.</li>
            <li><strong>Communication Pattern Analysis:</strong> Identify peak usage times, common destinations, or frequent contacts.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for reporting and optimization.</li>
          </ul>
          <p>Gain a clear overview of your Twilio-powered communications with granular data, seamlessly integrated into your OfficeX analytics.</p>
        `,
        price: 0.01,
        priceUnit: "/record",
        priceExplanation: "per call or SMS record extracted",
        bookmarks: 65,
        avgCustomerLifetimeValue: 300,
        cumulativeSales: 19500,
        vendors: [
          {
            id: "twilio-vendor1",
            name: "CommData Integrators",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CDI",
            uptimeScore: 99.8,
            reviewsScore: 4.6,
            communityLinks: [{ label: "Case Studies", url: "#" }],
            priceLine: "$0.01/record",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "deepseek",
    name: "Deepseek AI",
    subheading:
      "Advanced AI models for code and chat.\nBoost your productivity.",
    coverImage:
      "https://hbr.org/resources/images/article_assets/2025/03/Apr25_02_1144347670.jpg",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-deepseek-ai-code-analysis-csv",
        title:
          "Deepseek AI for Codebase Analysis & Data Export (CSV) to OfficeX",
        images: [],
        description: `
          <p>This offer integrates **Deepseek AI's advanced code analysis capabilities** with your Anonymous OfficeX environment, enabling the processing of code repositories and delivering insights as structured **CSV files**. Ideal for software development teams, auditors, or researchers needing to analyze codebase structure, identify vulnerabilities, extract function lists, or track code quality metrics.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Codebase Structure Analysis:</strong> Generate CSVs outlining file structure, module dependencies, and function calls.</li>
            <li><strong>Vulnerability Scanning (Metadata):</strong> Identify potential security hotspots and list them in CSV reports.</li>
            <li><strong>Code Quality Metrics:</strong> Extract data on code complexity, maintainability, and test coverage.</li>
            <li><strong>Function & Variable Extraction:</strong> Create CSV lists of functions, variables, and their usage within the codebase.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for project management or auditing.</li>
          </ul>
          <p>Gain deep, AI-driven insights into your codebases, transforming raw code into actionable data for your OfficeX development workflows.</p>
        `,
        price: 0.03,
        priceUnit: "/1K tokens",
        priceExplanation: "for AI processing of code tokens",
        bookmarks: 55,
        avgCustomerLifetimeValue: 800,
        cumulativeSales: 44000,
        vendors: [
          {
            id: "deepseek-vendor1",
            name: "AI Code Insights",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ACI",
            uptimeScore: 99.9,
            reviewsScore: 4.8,
            communityLinks: [{ label: "API Docs", url: "#" }],
            priceLine: "$0.03/1K tokens",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "semrush",
    name: "Semrush",
    subheading:
      "Online visibility management and content marketing SaaS platform.\nImprove your SEO.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-semrush-seo-data-csv",
        title: "Semrush SEO & Competitor Data Export (CSV) to OfficeX",
        images: [],
        description: `
          <p>This service provides **extraction of comprehensive SEO and competitor data from Semrush**, delivering it as structured **CSV files** to your Anonymous OfficeX. Gain deep insights into keyword rankings, organic traffic, backlink profiles, competitor strategies, and content performance for in-depth analysis and reporting within your spreadsheets.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Keyword Ranking & Traffic Data:</strong> Export current and historical keyword positions and estimated organic traffic.</li>
            <li><strong>Competitor Analysis:</strong> Gather data on competitor keywords, backlinks, and content performance.</li>
            <li><strong>Backlink Profile Data:</strong> Export detailed backlink information for specific domains.</li>
            <li><strong>Content Gap Analysis:</strong> Identify content opportunities by comparing your site to competitors.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for strategic planning and reporting.</li>
          </ul>
          <p>Supercharge your SEO and content marketing strategies with granular Semrush data, seamlessly integrated into your OfficeX analytics.</p>
        `,
        price: 350,
        priceUnit: "/month",
        priceExplanation: "monthly subscription for Semrush data export",
        bookmarks: 105,
        avgCustomerLifetimeValue: 1500,
        cumulativeSales: 157500,
        vendors: [
          {
            id: "semrush-vendor1",
            name: "SEO Data Specialists",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SDS",
            uptimeScore: 99.7,
            reviewsScore: 4.6,
            communityLinks: [{ label: "Case Studies", url: "#" }],
            priceLine: "$350/month",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "ebay",
    name: "eBay",
    subheading: "Online auction and shopping website.\nBuy and sell goods.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-ebay-listing-data-csv",
        title: "eBay Listing & Sales Data Extraction (CSV) for OfficeX",
        images: [],
        description: `
          <p>This service focuses on **extracting public listing and sales data from eBay**, delivering it as structured **CSV files** to your Anonymous OfficeX. Ideal for e-commerce businesses, resellers, and market researchers to analyze product trends, pricing strategies, competitor activity, and sales performance on the eBay platform.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Active & Completed Listings:</strong> Extract data on product titles, descriptions, prices, seller info, and condition.</li>
            <li><strong>Sales History & Price Trends:</strong> Gather data on sold items, final sale prices, and historical pricing trends.</li>
            <li><strong>Category & Keyword Filtering:</strong> Target specific product categories or search terms for data extraction.</li>
            <li><strong>Seller Performance Metrics:</strong> Analyze public seller ratings and feedback.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for inventory management or market analysis.</li>
          </ul>
          <p>Gain a competitive edge in e-commerce by leveraging real-time and historical eBay data, seamlessly integrated into your OfficeX spreadsheets.</p>
        `,
        price: 0.07,
        priceUnit: "/listing",
        priceExplanation: "per extracted listing or sold item record",
        bookmarks: 90,
        avgCustomerLifetimeValue: 300,
        cumulativeSales: 27000,
        vendors: [
          {
            id: "ebay-vendor1",
            name: "E-commerce Data Analysts",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ECDA",
            uptimeScore: 99.5,
            reviewsScore: 4.3,
            communityLinks: [{ label: "Client Portal", url: "#" }],
            priceLine: "$0.07/listing",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    subheading:
      "E-commerce giant and cloud services provider.\nShop and innovate.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-amazon-product-data-csv",
        title: "Amazon Product & Review Data Extraction (CSV) for OfficeX",
        images: [],
        description: `
          <p>This service focuses on **extracting public product and customer review data from Amazon**, delivering it as structured **CSV files** to your Anonymous OfficeX. Ideal for product developers, market researchers, and e-commerce businesses to analyze product trends, competitor offerings, customer sentiment, and optimize their Amazon listings.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Product Listing Data:</strong> Extract product titles, descriptions, ASINs, prices, and availability.</li>
            <li><strong>Customer Review Analysis:</strong> Gather review text, ratings, and reviewer demographics for sentiment analysis.</li>
            <li><strong>Best Seller & New Release Tracking:</strong> Monitor trending products within specific categories.</li>
            <li><strong>Competitor Product Monitoring:</strong> Track competitor pricing and product changes.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for market analysis and product strategy.</li>
          </ul>
          <p>Gain a significant competitive advantage in the e-commerce landscape by integrating granular Amazon data into your OfficeX analytics.</p>
        `,
        price: 0.09,
        priceUnit: "/record",
        priceExplanation: "per extracted product or review record",
        bookmarks: 120,
        avgCustomerLifetimeValue: 500,
        cumulativeSales: 60000,
        vendors: [
          {
            id: "amazon-vendor1",
            name: "E-commerce Intelligence",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=EI",
            uptimeScore: 99.6,
            reviewsScore: 4.5,
            communityLinks: [{ label: "Webinars", url: "#" }],
            priceLine: "$0.09/record",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    subheading:
      "Platform for new product discovery.\nFind the latest innovations.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-producthunt-data-csv",
        title: "Product Hunt Launch & Trend Data Extraction (CSV) for OfficeX",
        images: [],
        description: `
          <p>This service focuses on **extracting public launch data, trend information, and user comments from Product Hunt**, delivering it as structured **CSV files** to your Anonymous OfficeX. Ideal for product managers, investors, and entrepreneurs to monitor new product launches, identify emerging trends, analyze market reception, and discover potential competitors or collaborators.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Product Launch Data:</strong> Extract product names, descriptions, creators, upvotes, and comments from launches.</li>
            <li><strong>Trending Product Analysis:</strong> Identify daily, weekly, or monthly trending products and categories.</li>
            <li><strong>User Comment & Review Export:</strong> Gather public comments and reviews for sentiment analysis and feedback.</li>
            <li><strong>Creator & Company Data:</strong> Extract public information about the creators and companies behind new products.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for competitive analysis or market research.</li>
          </ul>
          <p>Stay ahead of the innovation curve by integrating real-time Product Hunt data into your OfficeX strategic planning and analysis.</p>
        `,
        price: 0.06,
        priceUnit: "/product",
        priceExplanation: "per extracted product launch record",
        bookmarks: 70,
        avgCustomerLifetimeValue: 350,
        cumulativeSales: 24500,
        vendors: [
          {
            id: "producthunt-vendor1",
            name: "Innovation Data Labs",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=IDL",
            uptimeScore: 99.7,
            reviewsScore: 4.6,
            communityLinks: [{ label: "Blog", url: "#" }],
            priceLine: "$0.06/product",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
  {
    id: "crunchbase",
    name: "Crunchbase",
    subheading:
      "Platform for business information and insights.\nTrack startups and investments.",
    coverImage: "https://images.unsplash.com/photo-1611605697294-84ad1f2b6e1b",
    isFeatured: Math.random() > 0.5,
    offers: [
      {
        id: "offer-crunchbase-company-data-csv",
        title: "Crunchbase Company & Funding Data Extraction (CSV) for OfficeX",
        images: [],
        description: `
          <p>This service focuses on **extracting public company, funding, and M&A data from Crunchbase**, delivering it as structured **CSV files** to your Anonymous OfficeX. Ideal for investors, sales teams, and market researchers to build target lists, analyze industry landscapes, track funding rounds, and monitor competitive activity.</p>
          <p>Key features:</p>
          <ul>
            <li><strong>Company Profile Data:</strong> Extract company name, industry, location, description, and founding date.</li>
            <li><strong>Funding Round Details:</strong> Gather data on investment rounds, investors, and funding amounts.</li>
            <li><strong>Acquisition & IPO Data:</strong> Track M&A activities and public offerings.</li>
            <li><strong>Key Personnel Data:</strong> Extract public information about executives and board members.</li>
            <li><strong>CSV Export for OfficeX:</strong> Receive clean, organized CSVs for import into OfficeX Sheets for financial analysis or lead generation.</li>
          </ul>
          <p>Gain a comprehensive overview of the private and public company landscape by integrating Crunchbase data into your OfficeX strategic planning.</p>
        `,
        price: 0.25,
        priceUnit: "/record",
        priceExplanation: "per extracted company or funding record",
        bookmarks: 115,
        avgCustomerLifetimeValue: 700,
        cumulativeSales: 80500,
        vendors: [
          {
            id: "crunchbase-vendor1",
            name: "Business Intelligence Co.",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BIC",
            uptimeScore: 99.8,
            reviewsScore: 4.7,
            communityLinks: [{ label: "Solutions Page", url: "#" }],
            priceLine: "$0.25/record",
            viewPageLink: "#",
          },
        ],
      },
    ],
  },
];

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
//     subheading: "Find freelance jobs and connect with top talent.",
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
