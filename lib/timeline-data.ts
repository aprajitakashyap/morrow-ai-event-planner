import type { EventType } from "@/lib/types";

export type TimelineTemplate = {
  key: string;
  title: string;
  description: string;
  weeksBefore: number;
  category: string;
  critical: boolean;
};

export const TIMELINE_TEMPLATES: Record<EventType, TimelineTemplate[]> = {
  wedding: [
    {
      key: "foundation",
      title: "Lock the guest list and budget",
      description:
        "Agree on the number that matters most: guests. Then protect a contingency before you book anything.",
      weeksBefore: 26,
      category: "Foundation",
      critical: true,
    },
    {
      key: "venue",
      title: "Book the venue",
      description:
        "Compare capacity, access, weather backup, curfew, and what the site actually includes.",
      weeksBefore: 24,
      category: "Venue",
      critical: true,
    },
    {
      key: "catering",
      title: "Hire your caterer",
      description:
        "Taste, confirm dietary handling, service style, staffing, and the full price per head.",
      weeksBefore: 22,
      category: "Food",
      critical: true,
    },
    {
      key: "photography",
      title: "Book your photographer",
      description:
        "Review a full gallery, agree hours and deliverables, and share the moments you care about.",
      weeksBefore: 20,
      category: "Photos",
      critical: true,
    },
    {
      key: "attire",
      title: "Choose attire and beauty",
      description:
        "Book trials and alterations now. Leave more time than feels necessary for fittings.",
      weeksBefore: 16,
      category: "Attire",
      critical: false,
    },
    {
      key: "save-the-dates",
      title: "Send save-the-dates",
      description:
        "Give out-of-town guests the date early and point them to travel and stay information.",
      weeksBefore: 14,
      category: "Guests",
      critical: false,
    },
    {
      key: "styling",
      title: "Style the day",
      description:
        "Confirm florals, rentals, lighting, and one or two statement moments rather than everything at once.",
      weeksBefore: 12,
      category: "Decor",
      critical: false,
    },
    {
      key: "invitations",
      title: "Order invitations",
      description:
        "Finalise the guest list, RSVP method, print deadline, and digital backup.",
      weeksBefore: 10,
      category: "Stationery",
      critical: false,
    },
    {
      key: "menu",
      title: "Plan the menu and cake",
      description:
        "Include dietary labels, a tasting, cake delivery, and a plan for leftovers.",
      weeksBefore: 8,
      category: "Food",
      critical: false,
    },
    {
      key: "ceremony",
      title: "Build the ceremony and music",
      description:
        "Write the order of service, confirm readings, and give your sound team a clear cue sheet.",
      weeksBefore: 6,
      category: "Ceremony",
      critical: false,
    },
    {
      key: "numbers",
      title: "Finalise guest count and seating",
      description:
        "Chase RSVPs, confirm dietary needs, and make a seating plan the venue can actually use.",
      weeksBefore: 4,
      category: "Guests",
      critical: true,
    },
    {
      key: "vendors",
      title: "Confirm every vendor",
      description:
        "Reconfirm arrival times, contacts, balances, power, access, and the wet-weather plan.",
      weeksBefore: 2,
      category: "Logistics",
      critical: true,
    },
    {
      key: "schedule",
      title: "Write the day-of schedule",
      description:
        "Make one calm timeline for the people who need it. Add names, phone numbers, and buffer.",
      weeksBefore: 1,
      category: "Logistics",
      critical: true,
    },
    {
      key: "wedding-day",
      title: "Get married",
      description:
        "Hand the schedule to someone else. Eat something. Be where your feet are.",
      weeksBefore: 0,
      category: "The day",
      critical: true,
    },
  ],
  birthday: [
    {
      key: "vision",
      title: "Set the guest list and theme",
      description:
        "Choose the feeling first. Then decide how many people can share it comfortably.",
      weeksBefore: 10,
      category: "Foundation",
      critical: true,
    },
    {
      key: "venue",
      title: "Book the venue or reserve the space",
      description:
        "Confirm setup time, curfew, kitchen access, furniture, and weather backup.",
      weeksBefore: 8,
      category: "Venue",
      critical: true,
    },
    {
      key: "food",
      title: "Book food, cake, and entertainment",
      description:
        "Get the per-head price in writing, including service, dietary options, and cleanup.",
      weeksBefore: 6,
      category: "Food",
      critical: true,
    },
    {
      key: "invites",
      title: "Send invitations",
      description:
        "Include the practical details: start and end time, food, access, parking, and RSVP date.",
      weeksBefore: 4,
      category: "Guests",
      critical: true,
    },
    {
      key: "activities",
      title: "Plan activities and music",
      description:
        "Choose a loose flow rather than a packed schedule. One good activity beats five average ones.",
      weeksBefore: 3,
      category: "Programme",
      critical: false,
    },
    {
      key: "numbers",
      title: "Confirm numbers and dietary needs",
      description:
        "Give the caterer and cake maker a final count with allergies and access needs noted.",
      weeksBefore: 2,
      category: "Guests",
      critical: true,
    },
    {
      key: "details",
      title: "Prep the welcome details",
      description:
        "Pack candles, signage, a phone charger, a first-aid kit, and something to send leftovers home in.",
      weeksBefore: 1,
      category: "Logistics",
      critical: false,
    },
    {
      key: "birthday-day",
      title: "Celebrate",
      description:
        "Take a photo with the people who made the effort. Let someone else handle the cake cutting.",
      weeksBefore: 0,
      category: "The day",
      critical: true,
    },
  ],
  community: [
    {
      key: "purpose",
      title: "Define the purpose and audience",
      description:
        "Write one sentence about who this is for and what should be different because it happened.",
      weeksBefore: 20,
      category: "Foundation",
      critical: true,
    },
    {
      key: "team",
      title: "Form a small working team",
      description:
        "Name one owner for programme, logistics, access, and outreach. Share decision rights early.",
      weeksBefore: 18,
      category: "Team",
      critical: true,
    },
    {
      key: "venue",
      title: "Secure venue and permits",
      description:
        "Confirm insurance, access, power, capacity, and the wet-weather alternative in writing.",
      weeksBefore: 16,
      category: "Venue",
      critical: true,
    },
    {
      key: "programme",
      title: "Lock the programme",
      description:
        "Confirm speakers and sessions, then leave breathing room between them. Publish the shape early.",
      weeksBefore: 12,
      category: "Programme",
      critical: true,
    },
    {
      key: "outreach",
      title: "Open registration and outreach",
      description:
        "Write the access guide, launch with trusted partners, and make the sign-up form short.",
      weeksBefore: 10,
      category: "Outreach",
      critical: true,
    },
    {
      key: "volunteers",
      title: "Brief volunteers and partners",
      description:
        "Share one run of show, assign buddies, and make sure every volunteer knows where to send questions.",
      weeksBefore: 8,
      category: "Team",
      critical: true,
    },
    {
      key: "access",
      title: "Run an accessibility review",
      description:
        "Walk the route yourself. Check step-free access, signage, toilets, quiet space, sound, and seating.",
      weeksBefore: 6,
      category: "Access",
      critical: true,
    },
    {
      key: "run-of-show",
      title: "Share the run of show",
      description:
        "Give everyone the same one-page plan with timings, names, radio channels, and contingencies.",
      weeksBefore: 3,
      category: "Logistics",
      critical: true,
    },
    {
      key: "walkthrough",
      title: "Do the final walkthrough",
      description:
        "Test sound, label food, check the quiet room, and put signage where people will actually look.",
      weeksBefore: 1,
      category: "Logistics",
      critical: true,
    },
    {
      key: "event-day",
      title: "Host the gathering",
      description:
        "Start on time, protect the quiet room, thank the volunteers, and collect one useful story.",
      weeksBefore: 0,
      category: "The day",
      critical: true,
    },
  ],
};
