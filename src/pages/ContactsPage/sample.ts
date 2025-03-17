import { ContactFE, SystemPermissionType } from "@officexapp/types";

export const SAMPLE_CONTACTS: ContactFE[] = [
  {
    // Contact 1
    id: "UserID_1HGXPT5ABCDEF123456789",
    name: "Alice Johnson",
    avatar: "",
    email: "alice.johnson@example.com",
    notifications_url:
      "https://webhook.site/123456-abcd-efgh-ijkl-123456789abc",
    public_note: "Product Manager at TechCorp",
    private_note: "Met at DevConf 2024, interested in API integrations",
    evm_public_address: "0x1234567890123456789012345678901234567890",
    icp_principal: "rrkah-fqaaa-aaaaa-aaaaq-cai",
    groups: ["group_01HX7ZP5ABCDEF123456789", "group_01HX7ZP6ABCDEF123456789"],
    labels: ["customer", "enterprise", "priority"],
    last_online_ms: 1709911245000, // March 8, 2025
    created_at: 1677861645000, // March 3, 2023
    external_id: "CRM-12345",
    group_previews: [
      {
        group_id: "group_01HX7ZP5ABCDEF123456789",
        invite_id: "invite_01HX8ZP5ABCDEF123456789",
        is_admin: true,
        group_name: "Product Group",
        group_avatar: "",
      },
      {
        group_id: "group_01HX7ZP6ABCDEF123456789",
        invite_id: "invite_01HX8ZP6ABCDEF123456789",
        is_admin: false,
        group_name: "Marketing Group",
        group_avatar: "",
      },
    ],
    permission_previews: [SystemPermissionType.VIEW],
  },
  {
    // Contact 2
    id: "UserID_1HGXPT6ABCDEF123456789",
    name: "Bob Smith",
    avatar: "",
    email: "bob.smith@example.com",
    notifications_url:
      "https://webhook.site/234567-bcde-fghi-jklm-234567890abc",
    public_note: "Senior Developer at WebSolutions",
    private_note:
      "Prefers technical communication, follow up on integration issues",
    evm_public_address: "0x2345678901234567890123456789012345678901",
    icp_principal: "k4qsa-4aaaa-aaaaa-aaaaq-cai",
    groups: ["group_01HX7ZP7ABCDEF123456789"],
    labels: ["developer", "beta-tester"],
    last_online_ms: 1709824845000, // March 7, 2025
    created_at: 1693470845000, // August 31, 2023
    external_id: "DEV-78901",
    group_previews: [
      {
        group_id: "group_01HX7ZP7ABCDEF123456789",
        invite_id: "invite_01HX8ZP7ABCDEF123456789",
        is_admin: true,
        group_name: "Engineering",
        group_avatar: "",
      },
    ],
    permission_previews: [SystemPermissionType.VIEW, SystemPermissionType.EDIT],
  },
  {
    // Contact 3
    id: "UserID_1HGXPT7ABCDEF123456789",
    name: "Carol Davis",
    avatar: "",
    email: "carol.davis@example.com",
    notifications_url:
      "https://webhook.site/345678-cdef-ghij-klmn-345678901abc",
    public_note: "CFO at FinanceHub",
    private_note: "Requires detailed invoices for all transactions",
    evm_public_address: "0x3456789012345678901234567890123456789012",
    icp_principal: "nw4gu-4iaaa-aaaaa-aaaaq-cai",
    groups: ["group_01HX7ZP8ABCDEF123456789", "group_01HX7ZP9ABCDEF123456789"],
    labels: ["finance", "enterprise", "decision-maker"],
    last_online_ms: 1709738445000, // March 6, 2025
    created_at: 1688286845000, // July 2, 2023
    external_id: "FIN-23456",
    group_previews: [
      {
        group_id: "group_01HX7ZP8ABCDEF123456789",
        invite_id: "invite_01HX8ZP8ABCDEF123456789",
        is_admin: true,
        group_name: "Finance",
        group_avatar: "",
      },
      {
        group_id: "group_01HX7ZP9ABCDEF123456789",
        invite_id: "invite_01HX8ZP9ABCDEF123456789",
        is_admin: false,
        group_name: "Executive",
        group_avatar: "",
      },
    ],
    permission_previews: [
      SystemPermissionType.VIEW,
      SystemPermissionType.EDIT,
      SystemPermissionType.DELETE,
    ],
  },
  {
    // Contact 4
    id: "UserID_1HGXPT8ABCDEF123456789",
    name: "David Wilson",
    avatar: "",
    email: "david.wilson@example.com",
    notifications_url:
      "https://webhook.site/456789-defg-hijk-lmno-456789012abc",
    public_note: "UX Designer at DesignLab",
    private_note: "Great at providing feedback, potential case study candidate",
    evm_public_address: "0x4567890123456789012345678901234567890123",
    icp_principal: "oazcs-eqaaa-aaaaa-aaaaq-cai",
    groups: [],
    labels: [],
    last_online_ms: 1709652045000, // March 5, 2025
    created_at: 1672603245000, // January 1, 2023
    group_previews: [],
    permission_previews: [
      SystemPermissionType.VIEW,
      SystemPermissionType.EDIT,
      SystemPermissionType.DELETE,
    ],
  },
  {
    // Contact 5
    id: "UserID_1HGXPT9ABCDEF123456789",
    name: "Elena Rodriguez",
    avatar: "",
    email: "elena.rodriguez@example.com",
    notifications_url:
      "https://webhook.site/567890-efgh-ijkl-mnop-567890123abc",
    public_note: "",
    private_note:
      "Looking to scale their infrastructure, potential upsell opportunity",
    evm_public_address: "0x5678901234567890123456789012345678901234",
    icp_principal: "pfouk-5yaaa-aaaaa-aaaaq-cai",
    groups: [],
    labels: [],
    last_online_ms: 1709565645000, // March 4, 2025
    created_at: 1683125445000, // May 3, 2023
    external_id: "TECH-34567",
    group_previews: [],
    permission_previews: [
      SystemPermissionType.VIEW,
      SystemPermissionType.EDIT,
      SystemPermissionType.DELETE,
    ],
  },
  {
    // Contact 6
    id: "UserID_1HGXPTAABCDEF123456789",
    name: "Frank Lee",
    avatar: "",
    email: "frank.lee@example.com",
    notifications_url:
      "https://webhook.site/678901-fghi-jklm-nopq-678901234abc",
    public_note: "Marketing Director at BrandCo",
    private_note: "Interested in case studies and content collaborations",
    evm_public_address: "0x6789012345678901234567890123456789012345",
    icp_principal: "qnpeu-2yaaa-aaaaa-aaaaq-cai",
    groups: ["group_01HX7ZQE1BCDEF123456789"],
    labels: ["marketing", "partnership", "content"],
    last_online_ms: 1709479245000, // March 3, 2025
    created_at: 1704225645000, // January 2, 2024
    external_id: "MKT-45678",
    group_previews: [
      {
        group_id: "group_01HX7ZQE1BCDEF123456789",
        invite_id: "invite_01HX8ZQE1BCDEF123456789",
        is_admin: true,
        group_name: "Marketing",
      },
    ],
    permission_previews: [SystemPermissionType.VIEW, SystemPermissionType.EDIT],
  },
  {
    // Contact 7
    id: "UserID_1HGXPTBABCDEF123456789",
    name: "Grace Kim",
    avatar: "",
    email: "grace.kim@example.com",
    notifications_url:
      "https://webhook.site/789012-ghij-klmn-opqr-789012345abc",
    public_note: "Customer Support Lead at ServiceNow",
    private_note:
      "Great advocate for our platform, potential reference customer",
    evm_public_address: "0x7890123456789012345678901234567890123456",
    icp_principal: "rffb6-tiaaa-aaaaa-aaaaq-cai",
    groups: ["group_01HX7ZQF1BCDEF123456789", "group_01HX7ZQG1BCDEF123456789"],
    labels: ["support", "advocate", "reference"],
    last_online_ms: 1709392845000, // March 2, 2025
    created_at: 1675281645000, // February 1, 2023
    external_id: "SUP-56789",
    group_previews: [
      {
        group_id: "group_01HX7ZQF1BCDEF123456789",
        invite_id: "invite_01HX8ZQF1BCDEF123456789",
        is_admin: true,
        group_name: "Customer Success",
        group_avatar: "",
      },
      {
        group_id: "group_01HX7ZQG1BCDEF123456789",
        invite_id: "invite_01HX8ZQG1BCDEF123456789",
        is_admin: false,
        group_name: "Community",
        group_avatar: "",
      },
    ],
    permission_previews: [
      SystemPermissionType.VIEW,
      SystemPermissionType.EDIT,
      SystemPermissionType.DELETE,
    ],
  },
  {
    // Contact 8
    id: "UserID_1HGXPTCABCDEF123456789",
    name: "Henry Garcia",
    avatar: "",
    email: "henry.garcia@example.com",
    notifications_url:
      "https://webhook.site/890123-hijk-lmno-pqrs-890123456abc",
    public_note: "Sales Director at Enterprise Solutions",
    private_note: "Looking for white-label solutions, high-value prospect",
    evm_public_address: "0x8901234567890123456789012345678901234567",
    icp_principal: "ske6q-saaaa-aaaaa-aaaaq-cai",
    groups: ["group_01HX7ZQH1BCDEF123456789"],
    labels: [],
    last_online_ms: 1709306445000, // March 1, 2025
    created_at: 1696149245000, // October 1, 2023
    external_id: "SALES-67890",
    group_previews: [
      {
        group_id: "group_01HX7ZQH1BCDEF123456789",
        invite_id: "invite_01HX8ZQH1BCDEF123456789",
        is_admin: false,
        group_name: "Sales",
        group_avatar: "",
      },
    ],
    permission_previews: [
      SystemPermissionType.VIEW,
      SystemPermissionType.EDIT,
      SystemPermissionType.DELETE,
    ],
  },
  {
    // Contact 9
    id: "UserID_1HGXPTDABCDEF123456789",
    name: "Irene Thompson",
    avatar: "",
    email: "irene.thompson@example.com",
    notifications_url:
      "https://webhook.site/901234-ijkl-mnop-qrst-901234567abc",
    public_note: "HR Director at PeopleFirst",
    private_note:
      "Looking for solutions to improve employee onboarding experience",
    evm_public_address: "0x9012345678901234567890123456789012345678",
    icp_principal: "tqpzl-3qaaa-aaaaa-aaaaq-cai",
    groups: ["group_01HX7ZQI1BCDEF123456789", "group_01HX7ZQJ1BCDEF123456789"],
    labels: ["hr", "mid-market", "implementation"],
    last_online_ms: 1709220045000, // February 29, 2025
    created_at: 1704139245000, // January 1, 2024
    external_id: "HR-78901",
    group_previews: [
      {
        group_id: "group_01HX7ZQI1BCDEF123456789",
        invite_id: "invite_01HX8ZQI1BCDEF123456789",
        is_admin: true,
        group_name: "Human Resources",
      },
      {
        group_id: "group_01HX7ZQJ1BCDEF123456789",
        invite_id: "invite_01HX8ZQJ1BCDEF123456789",
        is_admin: false,
        group_name: "Operations",
        group_avatar: "",
      },
    ],
    permission_previews: [
      SystemPermissionType.VIEW,
      SystemPermissionType.EDIT,
      SystemPermissionType.DELETE,
    ],
  },
  {
    // Contact 10
    id: "UserID_1HGXPTEABCDEF123456789",
    name: "James Miller",
    avatar: "",
    email: "james.miller@example.com",
    notifications_url:
      "https://webhook.site/012345-jklm-nopq-rstu-012345678abc",
    public_note: "Security Consultant at CyberShield",
    private_note:
      "Very particular about data privacy, requires detailed compliance documentation",
    evm_public_address: "0x0123456789012345678901234567890123456789",
    icp_principal: "uuafj-uyaaa-aaaaa-aaaaq-cai",
    groups: ["group_01HX7ZQK1BCDEF123456789"],
    labels: ["security", "compliance", "consultant"],
    last_online_ms: 1709133645000, // February 28, 2025
    created_at: 1680410045000, // April 2, 2023
    external_id: "SEC-89012",
    group_previews: [
      {
        group_id: "group_01HX7ZQK1BCDEF123456789",
        invite_id: "invite_01HX8ZQK1BCDEF123456789",
        is_admin: true,
        group_name: "Security",
        group_avatar: "",
      },
    ],
    permission_previews: [
      SystemPermissionType.VIEW,
      SystemPermissionType.EDIT,
      SystemPermissionType.DELETE,
    ],
  },
];
