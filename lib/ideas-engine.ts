import { LOCAL_IDEAS, ideaId } from "@/lib/ideas";
import {
  FALLBACK_PALETTES,
  STYLE_PALETTES,
} from "@/lib/plan-data";
import { hashString } from "@/lib/utils";
import {
  PRIORITY_OPTIONS,
  type CreativeDirection,
  type EventBrief,
  type EventType,
  type Idea,
} from "@/lib/types";

export function paletteFor(brief: EventBrief): {
  colors: string[];
  names: string[];
} {
  const exact = STYLE_PALETTES[brief.style.toLowerCase()];
  if (exact) return exact;
  return FALLBACK_PALETTES[brief.eventType];
}

const CONCEPT_TITLES: Record<EventType, string[]> = {
  wedding: [
    "Soft edges, strong memories",
    "A day that feels like you",
    "Considered, not contrived",
    "Warm light and good company",
  ],
  birthday: [
    "A little sparkle, a lot of personality",
    "The good kind of happy",
    "Made for your people",
    "Easy energy, excellent cake",
  ],
  community: [
    "A room where everyone belongs",
    "Purpose, with a pulse",
    "Good work, done warmly",
    "Come as you are",
  ],
};

function priorityLabels(brief: EventBrief): string[] {
  const options = PRIORITY_OPTIONS[brief.eventType];
  const labels = brief.priorities
    .map((id) => options.find((priority) => priority.id === id)?.label.toLowerCase())
    .filter((label): label is string => Boolean(label));

  if (labels.length === 0) return ["the details that matter most"];
  if (labels.length === 1) return labels;
  return [`${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`];
}

export function buildConcept(brief: EventBrief): CreativeDirection {
  const palette = paletteFor(brief);
  const titles = CONCEPT_TITLES[brief.eventType];
  const title = titles[hashString(`${brief.style}-${brief.location}`) % titles.length];
  const priorities = priorityLabels(brief)[0];
  const guests = brief.guestCount;

  const bodies: Record<EventType, string> = {
    wedding: `"${brief.style}" sets the visual tone, but the day should still feel like the two of you. The plan protects ${priorities} and keeps the calendar focused on decisions that unlock everything else. At ${guests} guests, the most useful luxury is a simple run of show and a venue that does some of the hosting.`,
    birthday: `"${brief.style}" gives the party a clear personality. The budget leans into ${priorities}, while the run of show stays light enough for people to enjoy each other. With ${guests} guests, two strong moments will do more than ten small ones.`,
    community: `"${brief.style}" is the frame, but the real work is making people feel expected. This plan protects ${priorities} and builds in access, feedback, and breathing room. For ${guests} people, clarity is a form of hospitality.`,
  };

  return {
    title,
    body: bodies[brief.eventType],
    source: "guided",
    palette: palette.colors,
    paletteNames: palette.names,
  };
}

export function selectLocalIdeas(brief: EventBrief): Idea[] {
  const styleWords = brief.style
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length > 2);
  const settingTags =
    brief.setting === "outdoor"
      ? ["outdoor", "sustainable"]
      : brief.setting === "indoor"
        ? ["intimate", "calm"]
        : ["guest"];
  const contextTags = [
    ...brief.priorities,
    ...styleWords,
    ...settingTags,
    ...(brief.accessibility ? ["accessibility", "inclusion", "calm"] : []),
    ...(brief.dietary ? ["food", "inclusion"] : []),
  ];
  const preferred = new Set(contextTags);

  return LOCAL_IDEAS.filter((idea) => idea.eventType === brief.eventType)
    .map((idea) => {
      const matches = idea.tags.filter((tag) => preferred.has(tag)).length;
      const jitter = (hashString(`${brief.eventName}-${idea.title}`) % 100) / 100;
      return { idea, score: matches * 10 + jitter };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ idea }) => ({
      id: ideaId(idea.eventType, idea.title),
      title: idea.title,
      description: idea.description,
      category: idea.category,
      costLevel: idea.costLevel,
      tags: idea.tags,
    }));
}
