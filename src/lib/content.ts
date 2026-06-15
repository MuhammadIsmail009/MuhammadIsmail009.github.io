/**
 * Single source of truth for all site content.
 * Real content per the brief (§5). Project links currently point to the GitHub
 * profile (decision: swap exact repo URLs in later).
 */

export const SITE = {
  name: 'Muhammad Ismail',
  firstName: 'Muhammad',
  lastName: 'Ismail',
  role: 'Cybersecurity Engineer',
  kicker: 'Cybersecurity Engineer · SOC & Detection Engineering',
  tagline: "Attacker's mindset. Defender's discipline.",
  // Two halves, colour-coded red-team (warm) / blue-team (cool) in the hero.
  taglineRed: "Attacker's mindset.",
  taglineBlue: "Defender's discipline.",
  url: 'https://muhammadismail009.github.io/',
  location: 'Pakistan',
} as const

export const CONTACT = {
  email: 'ismailwaqar28@gmail.com',
  linkedin: 'https://linkedin.com/in/muhammad-ismail-0a7a763a6',
  linkedinLabel: 'muhammad-ismail',
  github: 'https://github.com/MuhammadIsmail009',
  githubLabel: 'MuhammadIsmail009',
} as const

export const STATUS = {
  available: true,
  label: 'Available for internships',
} as const

export const CTA = {
  headline: "Let's build something secure",
  sub: 'Detection that holds, automation that scales, and an engineer who sweats the details.',
} as const

/** All project links resolve here until exact repo URLs are confirmed. */
const PROFILE = CONTACT.github

export interface NavLink {
  label: string
  href: string
}

export const NAV: NavLink[] = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
  { label: 'Contact', href: '#contact' },
]

export interface Project {
  id: string
  title: string
  meta: string
  description: string
  tags: string[]
  link: string | null
  linkLabel: string
}

export const PROJECTS: Project[] = [
  {
    id: '01',
    title: 'SOC Central',
    meta: 'Final-Year Project · Lead',
    description:
      'AI-driven Security Operations Center platform. Real-time threat detection fusing eBPF + Osquery telemetry with YARA rules and an XGBoost + SHAP ML pipeline, prioritized via EPSS + CISA KEV, deployed on K3s.',
    tags: ['eBPF', 'Osquery', 'YARA', 'XGBoost', 'SHAP', 'K3s', 'Python'],
    link: PROFILE,
    linkLabel: 'GitHub',
  },
  {
    id: '02',
    title: 'DQN-PLS-MISO',
    meta: 'Research · Solo',
    description:
      'Deep Reinforcement Learning (DQN) for artificial-noise power allocation in physical-layer security (MISO wiretap channel, imperfect CSI). The agent outperforms a classical optimizer under noisy CSI at mid-to-high SNR.',
    tags: ['Python', 'TensorFlow 2', 'NumPy', 'SciPy', 'DRL'],
    link: 'https://github.com/MuhammadIsmail009/pls-dqn-miso',
    linkLabel: 'GitHub',
  },
  {
    id: '03',
    title: 'Secure DevSecOps Pipeline',
    meta: 'Solo',
    description:
      'End-to-end CI/CD security for a Flask app: SAST / DAST / SCA gates, Gitleaks secret scanning, and Dependabot — fully automated with GitHub Actions.',
    tags: ['GitHub Actions', 'SAST', 'DAST', 'SCA', 'Gitleaks', 'Flask'],
    link: 'https://github.com/kryptbakar/Secure-DevSecOps-CI-CD-Pipeline-Implementation',
    linkLabel: 'GitHub',
  },
  {
    id: '04',
    title: 'AI-IDS',
    meta: 'Solo',
    description:
      'Network Intrusion Detection System pairing CatBoost with a Local Outlier Factor model for combined supervised and anomaly-based detection.',
    tags: ['CatBoost', 'LOF', 'Anomaly Detection', 'Python'],
    link: PROFILE,
    linkLabel: 'GitHub',
  },
  {
    id: '05',
    title: 'Sportify / TurfBook',
    meta: 'Co-founder',
    description:
      'Full-stack turf-booking platform with ELO matchmaking and role-based access. React 18 + TypeScript front end, Express API, PostgreSQL/Neon + Drizzle ORM, OIDC RBAC.',
    tags: ['React 18', 'TypeScript', 'Express', 'PostgreSQL', 'Drizzle', 'OIDC'],
    link: 'https://github.com/kryptbakar/sportify',
    linkLabel: 'GitHub',
  },
  {
    id: '06',
    title: 'Secure IoT / Zero-Trust Network',
    meta: 'Coursework',
    description:
      'Zero-trust segmented IoT network modeled in Cisco Packet Tracer to the NIST SP 800-207 architecture — least-privilege segmentation and policy enforcement points.',
    tags: ['Zero Trust', 'NIST 800-207', 'Packet Tracer'],
    link: null,
    linkLabel: 'Coursework',
  },
]

/** Factual decompositions of each project, for the expand panel. */
export const PROJECT_HIGHLIGHTS: Record<string, string[]> = {
  '01': [
    'eBPF + Osquery host & network telemetry',
    'YARA detection rule engine',
    'XGBoost scoring with SHAP explainability',
    'EPSS + CISA KEV risk prioritization',
    'Deployed on K3s (lightweight Kubernetes)',
  ],
  '02': [
    'DQN agent for artificial-noise power allocation',
    'MISO wiretap channel under imperfect CSI',
    'Beats a classical optimizer at mid-to-high SNR',
    'TensorFlow 2 + NumPy / SciPy simulation',
  ],
  '03': [
    'SAST, DAST & SCA quality gates',
    'Gitleaks secret scanning',
    'Dependabot dependency hygiene',
    'Fully automated in GitHub Actions',
  ],
  '04': [
    'CatBoost supervised classifier',
    'Local Outlier Factor anomaly detection',
    'Combined signature + behavioral coverage',
  ],
  '05': [
    'ELO-based matchmaking',
    'OIDC role-based access control',
    'Express API + PostgreSQL / Neon + Drizzle ORM',
    'React 18 + TypeScript front end',
  ],
  '06': [
    'NIST SP 800-207 zero-trust architecture',
    'Least-privilege network segmentation',
    'Policy enforcement points modeled in Packet Tracer',
  ],
}

export interface ExperienceItem {
  role: string
  org: string
  period: string
  summary: string
  upcoming?: boolean
}

export const EXPERIENCE: ExperienceItem[] = [
  {
    role: 'Incoming Security Intern',
    org: 'Ebryx',
    period: 'Upcoming',
    summary:
      'Joining a specialist security team — extending hands-on offensive/defensive security practice beyond the SOC.',
    upcoming: true,
  },
  {
    role: 'SOC Analyst Intern',
    org: 'PITB · Punjab Information Technology Board',
    period: 'Summer 2025',
    summary:
      'Detection engineering and SOC operations — triage, tuning, and turning raw telemetry into signal. The anchor of my blue-team experience.',
  },
]

export interface StackGroup {
  label: string
  items: string[]
}

export const STACK_GROUPS: StackGroup[] = [
  {
    label: 'Security & Blue-Team',
    items: [
      'SOC Operations',
      'Detection Engineering',
      'SIEM (Splunk / ELK)',
      'YARA',
      'Threat Intel',
      'MITRE ATT&CK',
      'EPSS',
      'CISA KEV',
      'DFIR',
    ],
  },
  { label: 'GRC', items: ['ISO 27001', 'NIST CSF'] },
  { label: 'Languages', items: ['Python', 'C / C++', 'JavaScript / TypeScript', 'Bash'] },
  { label: 'ML / Data', items: ['XGBoost', 'CatBoost', 'TensorFlow', 'SHAP'] },
  {
    label: 'Infra / DevSecOps',
    items: ['Linux / Kali', 'Docker', 'Kubernetes (K3s)', 'GitHub Actions'],
  },
  { label: 'Web', items: ['React', 'Node / Express', 'PostgreSQL'] },
  { label: 'Tools', items: ['Wireshark', 'Burp Suite', 'Nmap'] },
]

/** Flat ticker for the kinetic marquee. */
export const MARQUEE: string[] = [
  'Detection Engineering',
  'SOC Operations',
  'YARA',
  'MITRE ATT&CK',
  'Splunk',
  'ELK',
  'eBPF',
  'Osquery',
  'Threat Intel',
  'EPSS',
  'CISA KEV',
  'Python',
  'XGBoost',
  'CatBoost',
  'TensorFlow',
  'Docker',
  'Kubernetes',
  'GitHub Actions',
  'Wireshark',
  'Burp Suite',
  'Nmap',
  'ISO 27001',
  'NIST CSF',
  'Zero Trust',
]

export interface Stat {
  value: number
  label: string
  pad2?: boolean
}

export const STATS: Stat[] = [
  { value: 6, label: 'Security & full-stack projects', pad2: true },
  { value: 2, label: 'SOC & security internships, incl. incoming', pad2: true },
  { value: 2027, label: 'Graduating · BS Cybersecurity, GIK' },
  { value: 7, label: 'Domains in the toolbelt', pad2: true },
]

export const ABOUT = {
  lead: 'Blue-team by instinct.',
  paragraphs: [
    'BS Cybersecurity at GIK Institute (FCSE ’23), graduating 2027. I live in logs, detections, and the gap between an alert and an answer.',
    'PITB SOC alum, currently building SOC Central — an AI-driven SOC platform — as my final-year project. I complement detection with GRC (ISO 27001, NIST CSF) and ship full-stack when the job calls for it.',
  ],
  interests: ['Formula 1', 'Anime', 'Tennis — GIK team Vice-Captain'],
} as const

/* ------------------------------------------------------------------ */
/* Terminal easter egg — the ONLY place personality/humor lives.       */
/* ------------------------------------------------------------------ */

export interface TerminalCommand {
  desc: string
  out: string[]
}

export const TERMINAL_PROMPT = 'ismail@soc:~$'

export const TERMINAL_INTRO: string[] = [
  'kryptctl 1.0.0 — interactive shell',
  "Type 'help' for commands. Try: whoami · stack · f1",
]

export const TERMINAL_COMMANDS: Record<string, TerminalCommand> = {
  help: {
    desc: 'list available commands',
    out: [
      'available commands:',
      '  whoami      who is this',
      '  stack       the toolbelt',
      '  skills      what i do',
      '  projects    selected work',
      '  experience  where i have worked',
      '  contact     reach me',
      '  f1          off the record',
      '  anime       off the record',
      '  tennis      off the record',
      '  clear       clear the screen',
    ],
  },
  whoami: {
    desc: 'who is this',
    out: [
      'Muhammad Ismail — cybersecurity engineer.',
      'Blue-team by instinct: detection engineering, SOC automation,',
      'and the gap between an alert and an answer.',
    ],
  },
  stack: {
    desc: 'the toolbelt',
    out: [
      'blue-team : SOC ops · detection eng · SIEM (Splunk/ELK) · YARA · MITRE ATT&CK · EPSS · CISA KEV',
      'grc       : ISO 27001 · NIST CSF',
      'langs     : Python · C/C++ · JS/TS · Bash',
      'ml/data   : XGBoost · CatBoost · TensorFlow · SHAP',
      'infra     : Linux/Kali · Docker · K3s · GitHub Actions',
      'tools     : Wireshark · Burp Suite · Nmap',
    ],
  },
  skills: {
    desc: 'what i do',
    out: [
      'detection engineering — write it, tune it, prove it.',
      'SOC automation — turn telemetry into signal, signal into response.',
      'GRC — map the controls (ISO 27001, NIST CSF) so the work survives an audit.',
      'and full-stack when the job calls for it.',
    ],
  },
  projects: {
    desc: 'selected work',
    out: [
      '01  SOC Central        — AI-driven SOC platform (eBPF/Osquery/YARA/ML on K3s)',
      '02  DQN-PLS-MISO       — DRL for physical-layer security',
      '03  Secure DevSecOps   — SAST/DAST/SCA pipeline (GitHub Actions)',
      '04  AI-IDS             — CatBoost + LOF intrusion detection',
      '05  Sportify/TurfBook  — full-stack turf booking platform',
      '06  Zero-Trust IoT     — NIST 800-207 segmented network',
    ],
  },
  experience: {
    desc: 'where i have worked',
    out: [
      'PITB — SOC Analyst Intern (Summer 2025): detection eng + SOC ops.',
      'Ebryx — Incoming Security Intern.',
    ],
  },
  contact: {
    desc: 'reach me',
    out: [
      `email    : ${CONTACT.email}`,
      `linkedin : ${CONTACT.linkedin}`,
      `github   : ${CONTACT.github}`,
    ],
  },
  f1: {
    desc: 'off the record',
    out: ['Lights out and away we go. 🏎️', 'I debug race strategy harder than I debug prod.'],
  },
  anime: {
    desc: 'off the record',
    out: ['Currently re-watching something I will deny in the interview.', 'Ask me off the record.'],
  },
  tennis: {
    desc: 'off the record',
    out: ['GIK Tennis — Vice-Captain. 🎾', 'I serve aces and patch CVEs.'],
  },
  sudo: {
    desc: 'elevate',
    out: ['Nice try. You do not have the clearance for that.', '(Neither do most attackers.)'],
  },
  ls: {
    desc: 'list',
    out: ['about/  work/  stack/  contact/  secrets.txt'],
  },
}
