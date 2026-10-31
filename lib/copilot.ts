import { formatCurrency, formatShortDate, relativeDueLabel } from "@/lib/dates";
import type { CopilotSnapshot } from "@/lib/schemas";

function budgetReply(snapshot: CopilotSnapshot): string {
  const top = snapshot.topCategories
    .map(
      (category) =>
        `${category.label} at ${formatCurrency(category.amount, snapshot.currency)}`,
    )
    .join(", ");

  const healthNote =
    snapshot.healthLabel.toLowerCase() === "roomy"
      ? "You have some room to choose, so spend it on the part guests will remember."
      : snapshot.healthLabel.toLowerCase() === "balanced"
        ? "The budget is workable, but it will not absorb every upgrade."
        : "The budget needs a decision before you collect more quotes.";

  return `${healthNote} The biggest lines are ${top}.\n\nThree levers, in order:\n1. Reduce the guest list by 10 and price the saving at ${formatCurrency(snapshot.perGuest * 10, snapshot.currency)}.\n2. Compare a weekday or off-peak venue before cutting food or photography.\n3. Keep the contingency out of the spending plan until final invoices arrive.\n\nAsk each vendor for the full price — service, staffing, delivery, and tax — so you are comparing the same thing.`;
}

function taskReply(snapshot: CopilotSnapshot): string {
  if (snapshot.nextTasks.length === 0) {
    return "Nothing urgent is left in the timeline. Use the space to confirm final numbers, payments, and who is holding the run of show on the day.";
  }

  const tasks = snapshot.nextTasks
    .slice(0, 3)
    .map(
      (task, index) =>
        `${index + 1}. ${task.title} — ${relativeDueLabel(task.dueDate)}${task.critical ? " (critical)" : ""}`,
    )
    .join("\n");

  return `Start here:\n${tasks}\n\nDo the first one before opening another tab. Once the venue and catering are real, the rest of the plan gets easier to price.`;
}

function vendorReply(snapshot: CopilotSnapshot): string {
  const unbooked = snapshot.vendors.filter((vendor) => vendor.status !== "booked");
  const booked = snapshot.vendors.filter((vendor) => vendor.status === "booked");
  const next = unbooked[0];

  if (!next) {
    return "Every vendor in the plan is marked booked. Move your attention to final confirmation emails: arrival times, contacts, balances, access, and the wet-weather decision.";
  }

  return `${booked.length} of ${snapshot.vendors.length} vendors are booked. The next highest-value conversation is ${next.name}, with about ${formatCurrency(next.estimatedCost, snapshot.currency)} set aside.\n\nAsk for a written quote, availability, what is included, and the cancellation terms. Do not pay a full balance before you have the details in writing.`;
}

function ideaReply(snapshot: CopilotSnapshot): string {
  const ideas = snapshot.ideas.slice(0, 3);
  if (ideas.length === 0) {
    return "Choose one moment people will remember rather than trying to decorate every surface. A welcome detail, a good toast, and one thoughtful food moment usually do more than a long list of extras.";
  }

  const list = ideas
    .map((idea, index) => `${index + 1}. ${idea.title} — ${idea.description}`)
    .join("\n\n");
  return `Three ideas already tuned to your priorities:\n\n${list}\n\nPick one. A single well-executed personal touch reads as more intentional than five half-finished ones.`;
}

function guestReply(snapshot: CopilotSnapshot): string {
  return `You are planning for ${snapshot.guestCount} guests at ${formatCurrency(snapshot.perGuest, snapshot.currency)} per guest. At that size, the guest list is a budget decision, not just a social one.\n\nTry two lists: must-have and lovely-to-have. If the budget is tight, remove from the second list first. Then re-check venue capacity and catering minimums before sending invitations.`;
}

function careReply(snapshot: CopilotSnapshot): string {
  const notes: string[] = [];
  if (snapshot.accessibility) {
    notes.push(
      `You have flagged access needs: ${snapshot.accessibility}. Put them in the venue brief and publish them before guests ask.`,
    );
  }
  if (snapshot.dietary) {
    notes.push(
      `For dietary needs, ask for labelled food and one named catering contact who owns allergies. A buffet alone is not a plan.`,
    );
  }
  if (notes.length === 0) {
    notes.push(
      "Ask the venue about step-free routes, accessible toilets, quiet space, seating, and dietary labelling before you book.",
    );
  }
  return `${notes.join("\n\n")}\n\nMake one person responsible for these details on the day. Inclusion is a run-of-show item, not a paragraph on the website.`;
}

function stressReply(snapshot: CopilotSnapshot): string {
  return `You do not need to solve the whole event today. The next honest step is ${
    snapshot.nextTasks[0]?.title ?? "confirming your guest count"
  }.\n\nPut the plan away after that. A good celebration is not a test of how tired you can get.`;
}

export function guidedCopilotReply(
  message: string,
  snapshot: CopilotSnapshot,
): string {
  const value = message.toLowerCase();

  if (/(budget|cost|money|save|cheap|expensive|afford|price)/.test(value)) {
    return budgetReply(snapshot);
  }
  if (/(vendor|book|quote|contract|deposit|photographer|caterer|venue)/.test(value)) {
    return vendorReply(snapshot);
  }
  if (/(idea|personal|touch|theme|decor|creative|memorable|fun)/.test(value)) {
    return ideaReply(snapshot);
  }
  if (/(when|timeline|deadline|due|next|start|first|schedule)/.test(value)) {
    return taskReply(snapshot);
  }
  if (/(guest|invite|rsvp|list|headcount)/.test(value)) {
    return guestReply(snapshot);
  }
  if (/(access|wheelchair|diet|allerg|vegan|halal|quiet|inclus)/.test(value)) {
    return careReply(snapshot);
  }
  if (/(stress|overwhelm|anxious|behind|panic|tired)/.test(value)) {
    return stressReply(snapshot);
  }

  return `${snapshot.eventName} is on ${formatShortDate(snapshot.date)} with ${snapshot.guestCount} guests and a ${snapshot.healthLabel.toLowerCase()} budget. ${taskReply(snapshot)}\n\nYou can ask me about money, vendors, the timeline, guest count, access, or personal ideas.`;
}
