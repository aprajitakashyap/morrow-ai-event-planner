import type { EventType, Idea } from "@/lib/types";

type IdeaSeed = Omit<Idea, "id"> & { eventType: EventType };

const IDEA_SEEDS: IdeaSeed[] = [
  {
    eventType: "wedding",
    title: "A welcome table that tells your story",
    description:
      "Use a few framed photographs, hometown postcards, and a short note from each of you instead of a traditional guest book.",
    category: "Personal detail",
    costLevel: "low",
    tags: ["personal", "decor", "guest", "intimate"],
  },
  {
    eventType: "wedding",
    title: "A late-night comfort cart",
    description:
      "Send guests home with something warm and unfussy — chai, small sandwiches, or a local sweet — right before the last song.",
    category: "Food",
    costLevel: "medium",
    tags: ["food", "guest", "fun", "cultural"],
  },
  {
    eventType: "wedding",
    title: "A living floral backdrop",
    description:
      "Use potted herbs and local plants for the ceremony, then let guests take them home. The flowers get a second life and the photos stay full.",
    category: "Decor",
    costLevel: "medium",
    tags: ["decor", "sustainable", "photography", "outdoor"],
  },
  {
    eventType: "wedding",
    title: "A golden-hour portrait trail",
    description:
      "Pick three nearby backdrops and give your photographer a 20-minute route. You get variety without disappearing from the party.",
    category: "Photography",
    costLevel: "low",
    tags: ["photography", "outdoor", "intimate", "venue"],
  },
  {
    eventType: "wedding",
    title: "A first dance in two parts",
    description:
      "Start with a quiet acoustic song, then invite everyone to the floor as the track shifts into something joyful. No choreography required.",
    category: "Music",
    costLevel: "low",
    tags: ["music", "fun", "guest", "intimate"],
  },
  {
    eventType: "wedding",
    title: "A quiet first look",
    description:
      "Build ten unhurried minutes into the schedule before the ceremony. It calms the nerves and gives your photographer soft, private light.",
    category: "Experience",
    costLevel: "low",
    tags: ["photography", "intimate", "calm", "modern"],
  },
  {
    eventType: "wedding",
    title: "Local craft welcome gifts",
    description:
      "Skip the tiny trinkets. Choose one useful local item — a small candle, tea, or handmade snack — with a handwritten tag.",
    category: "Favours",
    costLevel: "medium",
    tags: ["favors", "local", "guest", "sustainable"],
  },
  {
    eventType: "wedding",
    title: "A voice-note guestbook",
    description:
      "Leave a phone or a simple recording station where guests can leave a 30-second wish. It is easier than writing and lovely to revisit.",
    category: "Keepsake",
    costLevel: "low",
    tags: ["personal", "keepsake", "guest", "modern"],
  },
  {
    eventType: "wedding",
    title: "A menu with a memory",
    description:
      "Name one course after a place or person that matters, and add a short line on the menu explaining why. Personal, not performative.",
    category: "Food",
    costLevel: "low",
    tags: ["food", "personal", "cultural", "intimate"],
  },
  {
    eventType: "wedding",
    title: "A live ceremony soundtrack",
    description:
      "One or two local musicians can make a small ceremony feel considered. Ask for a short processional, a quiet interlude, and a joyful exit.",
    category: "Music",
    costLevel: "medium",
    tags: ["music", "ceremony", "intimate", "cultural"],
  },
  {
    eventType: "birthday",
    title: "A story wall of small moments",
    description:
      "Print a handful of candid photos and one-line memories from the year. Hang them loosely — it becomes decor and conversation.",
    category: "Personal detail",
    costLevel: "low",
    tags: ["personal", "decor", "guest", "intimate"],
  },
  {
    eventType: "birthday",
    title: "Build-your-own dessert bar",
    description:
      "A small cake for the moment plus bowls of toppings and something easy to scoop. Guests get choice and you get fewer leftovers.",
    category: "Food",
    costLevel: "medium",
    tags: ["food", "fun", "guest", "theme"],
  },
  {
    eventType: "birthday",
    title: "A playlist takeover",
    description:
      "Ask three guests to own a 20-minute block each. The music becomes a group gift and you do not have to DJ your own party.",
    category: "Music",
    costLevel: "low",
    tags: ["music", "guest", "fun", "personal"],
  },
  {
    eventType: "birthday",
    title: "A hobby-themed activity corner",
    description:
      "Turn the birthday person's current obsession into one simple activity — a sketch wall, a trivia round, or a tiny workshop.",
    category: "Activity",
    costLevel: "low",
    tags: ["activities", "personal", "fun", "theme"],
  },
  {
    eventType: "birthday",
    title: "A photo booth with a twist",
    description:
      "Use a instant camera, three prompt cards, and a plain wall. Ask guests to leave one photo in a keepsake box and take one home.",
    category: "Photos",
    costLevel: "low",
    tags: ["photography", "guest", "fun", "keepsake"],
  },
  {
    eventType: "birthday",
    title: "One genuinely good surprise",
    description:
      "Instead of a packed schedule, plan one thoughtful reveal: a video from a faraway friend, a favourite dessert, or a surprise guest.",
    category: "Entertainment",
    costLevel: "low",
    tags: ["entertainment", "personal", "intimate", "fun"],
  },
  {
    eventType: "birthday",
    title: "A gratitude toast circle",
    description:
      "Set aside five minutes for anyone who wants to share one thing they love about the guest of honour. Keep it optional and warm.",
    category: "Experience",
    costLevel: "low",
    tags: ["intimate", "guest", "personal", "calm"],
  },
  {
    eventType: "birthday",
    title: "A keepsake zine",
    description:
      "Collect a few photos and quotes beforehand, print a small zine, and leave one on each table. A better favour than another keychain.",
    category: "Favours",
    costLevel: "medium",
    tags: ["favors", "personal", "keepsake", "design"],
  },
  {
    eventType: "birthday",
    title: "A signature welcome drink",
    description:
      "One simple drink, named after the birthday person, with an alcohol-free version that tastes just as considered.",
    category: "Food",
    costLevel: "low",
    tags: ["food", "theme", "guest", "fun"],
  },
  {
    eventType: "community",
    title: "A quiet room that actually feels calm",
    description:
      "Reserve a low-stimulation space with soft seating, water, and clear signage. A quiet room is not an afterthought; it is part of the welcome.",
    category: "Accessibility",
    costLevel: "low",
    tags: ["accessibility", "inclusion", "calm", "guest"],
  },
  {
    eventType: "community",
    title: "A community story booth",
    description:
      "Invite people to record a two-minute story or write a postcard about the neighbourhood. Share the collection afterwards.",
    category: "Programme",
    costLevel: "medium",
    tags: ["programming", "story", "guest", "local"],
  },
  {
    eventType: "community",
    title: "A local maker table",
    description:
      "Offer a small, free table to two local makers or groups. It supports the community and gives people another reason to stay.",
    category: "Partnerships",
    costLevel: "low",
    tags: ["local", "programming", "outreach", "guest"],
  },
  {
    eventType: "community",
    title: "A volunteer buddy system",
    description:
      "Pair every first-time volunteer with someone who knows the venue. Fewer people get lost and the whole event feels calmer.",
    category: "Logistics",
    costLevel: "low",
    tags: ["volunteers", "logistics", "inclusion", "calm"],
  },
  {
    eventType: "community",
    title: "An access guide before the day",
    description:
      "Publish transport, step-free routes, toilets, quiet space, and who to ask for help. Sending it early changes who feels able to come.",
    category: "Accessibility",
    costLevel: "low",
    tags: ["accessibility", "inclusion", "marketing", "guest"],
  },
  {
    eventType: "community",
    title: "A living agenda wall",
    description:
      "Use one visible board for the run of show, changes, and where to find things. Update it during the event instead of printing a booklet.",
    category: "Programme",
    costLevel: "low",
    tags: ["programming", "logistics", "guest", "sustainable"],
  },
  {
    eventType: "community",
    title: "A shared table lunch",
    description:
      "Arrange long tables and simple, labelled food. Shared tables make it easier for strangers to talk and for volunteers to serve.",
    category: "Food",
    costLevel: "medium",
    tags: ["food", "guest", "inclusion", "local"],
  },
  {
    eventType: "community",
    title: "A transport buddy sign-up",
    description:
      "Let attendees offer or request a lift in one simple form. Make the meeting point obvious and share it before the event.",
    category: "Accessibility",
    costLevel: "low",
    tags: ["accessibility", "logistics", "inclusion", "guest"],
  },
  {
    eventType: "community",
    title: "A kids' corner with real thought",
    description:
      "A small, supervised area with a quiet activity and a visible return point. It helps families stay longer without turning the event into a creche.",
    category: "Experience",
    costLevel: "medium",
    tags: ["guest", "inclusion", "activities", "calm"],
  },
  {
    eventType: "community",
    title: "A follow-up that keeps momentum",
    description:
      "Decide before the event what happens next: a photo album, a mailing list, or one clear ask. Momentum is easier to keep than to rebuild.",
    category: "Outreach",
    costLevel: "low",
    tags: ["outreach", "marketing", "local", "programming"],
  },
];

export const LOCAL_IDEAS: IdeaSeed[] = IDEA_SEEDS;

export function ideaId(eventType: EventType, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return `idea-${eventType}-${slug}`;
}
