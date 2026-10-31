import type { EventType } from "@/lib/types";

export type AllocationDefinition = {
  id: string;
  label: string;
  description: string;
  weight: number;
  tip: string;
};

export const ALLOCATIONS: Record<EventType, AllocationDefinition[]> = {
  wedding: [
    {
      id: "venue",
      label: "Venue",
      description: "Site hire, ceremony fee, and included basics.",
      weight: 22,
      tip: "Ask what is already included before comparing venue quotes.",
    },
    {
      id: "catering",
      label: "Food & drink",
      description: "Catering, bar, service, and tasting.",
      weight: 26,
      tip: "Confirm service charge, staffing, and corkage in writing.",
    },
    {
      id: "photography",
      label: "Photography",
      description: "Coverage, second shooter, and edited gallery.",
      weight: 10,
      tip: "Check how many hours and delivered images are included.",
    },
    {
      id: "decor",
      label: "Florals & decor",
      description: "Flowers, rentals, lighting, and styling.",
      weight: 9,
      tip: "Reuse ceremony flowers at the reception to stretch the budget.",
    },
    {
      id: "entertainment",
      label: "Music & entertainment",
      description: "Ceremony music, DJ or band, and sound.",
      weight: 6,
      tip: "Ask whether sound equipment and a backup playlist are included.",
    },
    {
      id: "attire",
      label: "Attire & beauty",
      description: "Outfits, alterations, hair, and makeup.",
      weight: 8,
      tip: "Keep alterations and trials in the budget from day one.",
    },
    {
      id: "stationery",
      label: "Invitations",
      description: "Save-the-dates, invitations, and signage.",
      weight: 3,
      tip: "A digital RSVP can save money and make the guest list easier.",
    },
    {
      id: "rings",
      label: "Rings",
      description: "Wedding bands and engraving.",
      weight: 4,
      tip: "Leave time for resizing and engraving before the date.",
    },
    {
      id: "transport",
      label: "Transport",
      description: "Couple, family, and guest transfers.",
      weight: 3,
      tip: "Price a shuttle against the cost of parking and taxis.",
    },
    {
      id: "contingency",
      label: "Contingency",
      description: "A quiet cushion for the unexpected.",
      weight: 9,
      tip: "Protect this until the final invoices arrive.",
    },
  ],
  birthday: [
    {
      id: "venue",
      label: "Venue",
      description: "Room hire, setup time, and included furniture.",
      weight: 18,
      tip: "Check the curfew, kitchen access, and setup window.",
    },
    {
      id: "catering",
      label: "Food & drink",
      description: "Menu, drinks, service, and dietary options.",
      weight: 24,
      tip: "Ask for a per-head price that includes service and cleanup.",
    },
    {
      id: "cake",
      label: "Cake",
      description: "The centrepiece dessert and candles.",
      weight: 7,
      tip: "Order a smaller display cake and supplement with sheet cake.",
    },
    {
      id: "decor",
      label: "Decor",
      description: "Theme details, balloons, flowers, and lighting.",
      weight: 15,
      tip: "Choose two statement areas instead of decorating every corner.",
    },
    {
      id: "entertainment",
      label: "Entertainment",
      description: "Music, host, games, or a performer.",
      weight: 13,
      tip: "A great playlist and one good host can do more than a full lineup.",
    },
    {
      id: "photography",
      label: "Photos",
      description: "Photos, video, or a keepsake camera moment.",
      weight: 8,
      tip: "Ask for a short highlight set rather than full-day coverage.",
    },
    {
      id: "favors",
      label: "Favors",
      description: "Small take-home touches and wrapping.",
      weight: 5,
      tip: "Useful gifts get taken home; tiny trinkets often do not.",
    },
    {
      id: "stationery",
      label: "Invitations",
      description: "Invites, reminders, and printable details.",
      weight: 3,
      tip: "Digital invitations free up budget for the guest experience.",
    },
    {
      id: "contingency",
      label: "Contingency",
      description: "A little room for the plan to change.",
      weight: 7,
      tip: "Keep this untouched until the final vendor payments.",
    },
  ],
  community: [
    {
      id: "venue",
      label: "Venue",
      description: "Space, insurance, power, and site staff.",
      weight: 12,
      tip: "Confirm accessibility, insurance, and wet-weather options.",
    },
    {
      id: "logistics",
      label: "Logistics",
      description: "Transport, signage, supplies, and volunteers.",
      weight: 15,
      tip: "Write one run of show that every volunteer can access.",
    },
    {
      id: "programming",
      label: "Programme",
      description: "Speakers, workshops, performers, and facilitation.",
      weight: 20,
      tip: "Leave breathing room between sessions; good events need pauses.",
    },
    {
      id: "marketing",
      label: "Outreach",
      description: "Design, printing, community partners, and promotion.",
      weight: 12,
      tip: "Start with trusted local partners before paying for ads.",
    },
    {
      id: "catering",
      label: "Food",
      description: "Refreshments, dietary options, and service.",
      weight: 16,
      tip: "Ask for allergens and dietary labels in writing.",
    },
    {
      id: "equipment",
      label: "Equipment",
      description: "Sound, lighting, staging, and rentals.",
      weight: 10,
      tip: "Test the microphone and backup power before doors open.",
    },
    {
      id: "accessibility",
      label: "Accessibility",
      description: "Access, interpreters, quiet space, and inclusion.",
      weight: 6,
      tip: "Publish access details before registration opens, not after.",
    },
    {
      id: "contingency",
      label: "Contingency",
      description: "A reserve for the unexpected.",
      weight: 9,
      tip: "Protect a reserve for weather, extra volunteers, or last-minute access needs.",
    },
  ],
};

export const PRIORITY_BOOSTS: Record<EventType, Record<string, Record<string, number>>> = {
  wedding: {
    food: { catering: 9 },
    photography: { photography: 8 },
    music: { entertainment: 7 },
    decor: { decor: 8 },
    guest: { catering: 4, entertainment: 2, stationery: 1 },
    attire: { attire: 7 },
    venue: { venue: 8 },
    buffer: { contingency: 7 },
  },
  birthday: {
    food: { catering: 5, cake: 3 },
    theme: { decor: 9 },
    entertainment: { entertainment: 9 },
    activities: { entertainment: 5 },
    photography: { photography: 7 },
    favors: { favors: 8 },
    venue: { venue: 8 },
    buffer: { contingency: 7 },
  },
  community: {
    accessibility: { accessibility: 9 },
    programming: { programming: 9 },
    outreach: { marketing: 9 },
    food: { catering: 8 },
    production: { equipment: 8 },
    volunteers: { logistics: 7 },
    venue: { venue: 8 },
    buffer: { contingency: 7 },
  },
};

export type VendorDefinition = {
  name: string;
  description: string;
  leadWeeks: number;
};

export const VENDOR_DEFINITIONS: Record<EventType, Record<string, VendorDefinition>> = {
  wedding: {
    venue: {
      name: "Venue",
      description: "Capacity, access, wet-weather plan, curfew, and what is included.",
      leadWeeks: 30,
    },
    catering: {
      name: "Caterer",
      description: "Menu, service style, dietary handling, staffing, and bar terms.",
      leadWeeks: 24,
    },
    photography: {
      name: "Photographer",
      description: "Hours, second shooter, gallery size, and a clear shot list.",
      leadWeeks: 24,
    },
    decor: {
      name: "Florist & decorator",
      description: "Install time, reusable pieces, lighting, and breakdown.",
      leadWeeks: 16,
    },
    entertainment: {
      name: "Music & entertainment",
      description: "Ceremony sound, reception sets, power, and backup plan.",
      leadWeeks: 16,
    },
    attire: {
      name: "Attire & beauty",
      description: "Trials, alterations, travel, and getting-ready timing.",
      leadWeeks: 16,
    },
    stationery: {
      name: "Stationery designer",
      description: "Print deadline, mailing, digital RSVP, and signage.",
      leadWeeks: 10,
    },
    rings: {
      name: "Jeweller",
      description: "Sizing, engraving, and collection date.",
      leadWeeks: 12,
    },
    transport: {
      name: "Transport",
      description: "Pickup times, guest capacity, and a late-night plan.",
      leadWeeks: 6,
    },
  },
  birthday: {
    venue: {
      name: "Venue",
      description: "Capacity, setup window, curfew, and kitchen access.",
      leadWeeks: 12,
    },
    catering: {
      name: "Caterer",
      description: "Per-head price, service, dietary options, and cleanup.",
      leadWeeks: 8,
    },
    cake: {
      name: "Cake maker",
      description: "Serves, flavours, allergens, delivery, and candles.",
      leadWeeks: 5,
    },
    decor: {
      name: "Decorator",
      description: "Install time, statement areas, and removal.",
      leadWeeks: 8,
    },
    entertainment: {
      name: "Entertainer",
      description: "Set length, audience fit, sound, and backup plan.",
      leadWeeks: 8,
    },
    photography: {
      name: "Photographer",
      description: "Coverage window, group shots, and delivery time.",
      leadWeeks: 8,
    },
    favors: {
      name: "Favours maker",
      description: "Quantity, personalisation, and delivery date.",
      leadWeeks: 6,
    },
    stationery: {
      name: "Invitation designer",
      description: "Digital or print, RSVP tracking, and reminder copy.",
      leadWeeks: 6,
    },
  },
  community: {
    venue: {
      name: "Venue",
      description: "Access, insurance, power, capacity, and insurance certificates.",
      leadWeeks: 16,
    },
    logistics: {
      name: "Logistics lead",
      description: "Volunteer rota, supplies, transport, and signage.",
      leadWeeks: 12,
    },
    programming: {
      name: "Programme partners",
      description: "Speakers, workshops, sessions, and confirmation dates.",
      leadWeeks: 12,
    },
    marketing: {
      name: "Outreach partner",
      description: "Audience reach, translations, print, and registration.",
      leadWeeks: 8,
    },
    catering: {
      name: "Food partner",
      description: "Dietary labels, service flow, waste, and water.",
      leadWeeks: 10,
    },
    equipment: {
      name: "Equipment supplier",
      description: "Sound, lighting, staging, delivery, and testing.",
      leadWeeks: 10,
    },
    accessibility: {
      name: "Accessibility lead",
      description: "Access guide, quiet space, interpreters, and seating.",
      leadWeeks: 12,
    },
  },
};

export const STYLE_PALETTES: Record<string, { colors: string[]; names: string[] }> = {
  "garden romantic": {
    colors: ["#dce5d5", "#b75d4c", "#3f5447"],
    names: ["Sage", "Terracotta", "Forest"],
  },
  "modern minimal": {
    colors: ["#f0ebe1", "#202a24", "#bd7b5a"],
    names: ["Chalk", "Ink", "Clay"],
  },
  "black-tie classic": {
    colors: ["#171a18", "#f4efe5", "#b79a5b"],
    names: ["Midnight", "Ivory", "Antique gold"],
  },
  "boho courtyard": {
    colors: ["#e8d6bb", "#a9553f", "#6f7c5d"],
    names: ["Sand", "Rust", "Olive"],
  },
  "coastal calm": {
    colors: ["#dce8e8", "#3a6570", "#d8a36c"],
    names: ["Sea glass", "Deep teal", "Shell"],
  },
  "vibrant cultural": {
    colors: ["#d94f3d", "#f2b544", "#2c6e63"],
    names: ["Vermilion", "Marigold", "Peacock"],
  },
  "playful & bright": {
    colors: ["#f6c453", "#ee7b63", "#4e8d8c"],
    names: ["Sunshine", "Coral", "Lagoon"],
  },
  "elegant dinner": {
    colors: ["#262422", "#d9c8b4", "#9a6b4f"],
    names: ["Espresso", "Linen", "Copper"],
  },
  "outdoor adventure": {
    colors: ["#d8e2c3", "#3f6b4f", "#c97a47"],
    names: ["Moss", "Pine", "Canyon"],
  },
  "retro fun": {
    colors: ["#e9b44c", "#d95d39", "#3a6b6e"],
    names: ["Butterscotch", "Tomato", "Teal"],
  },
  "cosy at home": {
    colors: ["#e8d6c3", "#8d5b4c", "#4d5a4b"],
    names: ["Oat", "Cocoa", "Rosemary"],
  },
  "big theme party": {
    colors: ["#f3b431", "#df4e6c", "#4866a6"],
    names: ["Pop yellow", "Party pink", "Cobalt"],
  },
  "neighbourhood gathering": {
    colors: ["#e9d9c2", "#c76042", "#4e6b57"],
    names: ["Paper", "Brick", "Hedge"],
  },
  "cultural festival": {
    colors: ["#e14b3b", "#f0b646", "#31706b"],
    names: ["Festival red", "Turmeric", "Peacock"],
  },
  "fundraiser gala": {
    colors: ["#1d2521", "#c7a96b", "#eee8dc"],
    names: ["Evening", "Brass", "Pearl"],
  },
  "outdoor fair": {
    colors: ["#e3e7c8", "#de7c4a", "#4b7258"],
    names: ["Meadow", "Pumpkin", "Leaf"],
  },
  "workshop series": {
    colors: ["#e7e3d8", "#4c6e73", "#d49a5b"],
    names: ["Notebook", "Slate", "Honey"],
  },
  "awareness campaign": {
    colors: ["#f0d9d7", "#b9484e", "#2f6264"],
    names: ["Blush", "Signal", "Deep teal"],
  },
};

export const FALLBACK_PALETTES: Record<EventType, { colors: string[]; names: string[] }> = {
  wedding: STYLE_PALETTES["garden romantic"],
  birthday: STYLE_PALETTES["playful & bright"],
  community: STYLE_PALETTES["neighbourhood gathering"],
};
