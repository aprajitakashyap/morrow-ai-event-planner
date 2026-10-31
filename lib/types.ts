export const EVENT_TYPES = ["wedding", "birthday", "community"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SETTINGS = ["indoor", "outdoor", "mixed"] as const;
export type EventSetting = (typeof SETTINGS)[number];

export const EVENT_TYPE_META: Record<
  EventType,
  { label: string; shortLabel: string; description: string }
> = {
  wedding: {
    label: "Wedding",
    shortLabel: "Wedding",
    description: "A day that feels like the two of you — without the chaos.",
  },
  birthday: {
    label: "Birthday",
    shortLabel: "Birthday",
    description: "A celebration with the right amount of sparkle and ease.",
  },
  community: {
    label: "Community event",
    shortLabel: "Community",
    description: "A gathering that is welcoming, useful, and well run.",
  },
};

export type PriorityOption = {
  id: string;
  label: string;
  category: string;
};

export const PRIORITY_OPTIONS: Record<EventType, PriorityOption[]> = {
  wedding: [
    { id: "food", label: "Great food & drink", category: "catering" },
    { id: "photography", label: "Photography", category: "photography" },
    { id: "music", label: "Music & entertainment", category: "entertainment" },
    { id: "decor", label: "Florals & styling", category: "decor" },
    { id: "guest", label: "Guest experience", category: "catering" },
    { id: "attire", label: "Attire & beauty", category: "attire" },
    { id: "venue", label: "A standout venue", category: "venue" },
    { id: "buffer", label: "A healthy buffer", category: "contingency" },
  ],
  birthday: [
    { id: "food", label: "Food & cake", category: "catering" },
    { id: "theme", label: "Theme & decor", category: "decor" },
    { id: "entertainment", label: "Entertainment", category: "entertainment" },
    { id: "activities", label: "Activities", category: "entertainment" },
    { id: "photography", label: "Photos & keepsakes", category: "photography" },
    { id: "favors", label: "Guest favors", category: "favors" },
    { id: "venue", label: "The venue", category: "venue" },
    { id: "buffer", label: "A healthy buffer", category: "contingency" },
  ],
  community: [
    { id: "accessibility", label: "Accessibility", category: "accessibility" },
    { id: "programming", label: "Programming", category: "programming" },
    { id: "outreach", label: "Outreach", category: "marketing" },
    { id: "food", label: "Food & refreshments", category: "catering" },
    { id: "production", label: "Production quality", category: "equipment" },
    { id: "volunteers", label: "Volunteer care", category: "logistics" },
    { id: "venue", label: "The venue", category: "venue" },
    { id: "buffer", label: "Contingency", category: "contingency" },
  ],
};

export const STYLE_OPTIONS: Record<EventType, string[]> = {
  wedding: [
    "Garden romantic",
    "Modern minimal",
    "Black-tie classic",
    "Boho courtyard",
    "Coastal calm",
    "Vibrant cultural",
  ],
  birthday: [
    "Playful & bright",
    "Elegant dinner",
    "Outdoor adventure",
    "Retro fun",
    "Cosy at home",
    "Big theme party",
  ],
  community: [
    "Neighbourhood gathering",
    "Cultural festival",
    "Fundraiser gala",
    "Outdoor fair",
    "Workshop series",
    "Awareness campaign",
  ],
};

export const CURRENCY_META: Record<
  Currency,
  { symbol: string; locale: string; label: string }
> = {
  INR: { symbol: "₹", locale: "en-IN", label: "INR" },
  USD: { symbol: "$", locale: "en-US", label: "USD" },
  EUR: { symbol: "€", locale: "en-IE", label: "EUR" },
  GBP: { symbol: "£", locale: "en-GB", label: "GBP" },
};

export type EventBrief = {
  eventType: EventType;
  eventName: string;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  currency: Currency;
  style: string;
  priorities: string[];
  setting: EventSetting;
  accessibility: string;
  dietary: string;
  notes: string;
};

export type BudgetHealth = "roomy" | "balanced" | "tight" | "stretch";

export type BudgetCategory = {
  id: string;
  label: string;
  description: string;
  amount: number;
  share: number;
  priority: boolean;
  tip: string;
};

export type BudgetSummary = {
  total: number;
  currency: Currency;
  perGuest: number;
  health: BudgetHealth;
  healthLabel: string;
  healthSummary: string;
  categories: BudgetCategory[];
  targetPerGuest: number;
};

export type PlanTone = "positive" | "notice" | "warning";

export type PlanInsight = {
  id: string;
  tone: PlanTone;
  title: string;
  body: string;
};

export type TimelineTask = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  phase: string;
  category: string;
  critical: boolean;
  compressed: boolean;
};

export type VendorStatus = "not-started" | "shortlisted" | "booked";

export type Vendor = {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedCost: number;
  dueDate: string;
  priority: "high" | "normal";
};

export type IdeaCost = "low" | "medium" | "high";

export type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  costLevel: IdeaCost;
  tags: string[];
};

export type CreativeDirection = {
  title: string;
  body: string;
  source: "ai" | "guided";
  palette: string[];
  paletteNames: string[];
};

export type NextAction = {
  title: string;
  detail: string;
  taskId: string;
};

export type Plan = {
  version: 1;
  createdAt: string;
  brief: EventBrief;
  headline: string;
  concept: CreativeDirection;
  budget: BudgetSummary;
  timeline: TimelineTask[];
  vendors: Vendor[];
  ideas: Idea[];
  insights: PlanInsight[];
  nextActions: NextAction[];
  source: "ai" | "guided";
};

export type SavedPlan = {
  version: 1;
  plan: Plan;
  completedTaskIds: string[];
  vendorStatuses: Record<string, VendorStatus>;
  savedIdeaIds: string[];
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "ai" | "guided";
};

export const DEFAULT_BRIEF: EventBrief = {
  eventType: "wedding",
  eventName: "",
  date: "",
  location: "",
  guestCount: 120,
  budget: 1500000,
  currency: "INR",
  style: "Garden romantic",
  priorities: ["food", "photography"],
  setting: "outdoor",
  accessibility: "",
  dietary: "",
  notes: "",
};
