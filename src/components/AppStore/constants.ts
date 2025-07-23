import { AppInfo, AppInfoWithOffers } from ".";
import { OfferWorkflow, Vendor } from "../AppStore"; // Assuming these interfaces are accessible

export const appstore_apps: AppInfoWithOffers[] = [
  {
    id: "19",
    name: "Amazon Cloud",
    subheading: "Cloud storage and computing services.\nGlobal Scale.",
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
    name: "Google Maps Business",
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
];
