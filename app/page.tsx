import Link from "next/link";

import { PlanPreview } from "@/components/landing/PlanPreview";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency } from "@/lib/dates";
import { buildPlan } from "@/lib/planner";
import { sampleBrief } from "@/lib/sample";
import { EVENT_TYPE_META, type EventType } from "@/lib/types";

const eventTypes: EventType[] = ["wedding", "birthday", "community"];

const featureCards = [
  {
    icon: "wallet" as const,
    className: "feature-card--wide",
    label: "Budget logic",
    title: "A budget that tells the truth.",
    body: "Your guest count, location, season, and priorities change the allocation — not a generic 30/20/10 split. Every line comes with a reason and a realistic benchmark.",
    detail: "Deterministic maths. No hallucinated totals.",
  },
  {
    icon: "calendar" as const,
    className: "",
    label: "Working backwards",
    title: "A timeline with a point of view.",
    body: "Milestones are sequenced from the event date. If the runway is short, early steps move into this week instead of becoming overdue guilt.",
    detail: "Downloadable calendar included.",
  },
  {
    icon: "users" as const,
    className: "",
    label: "Vendor order",
    title: "Know who to book, and when.",
    body: "A prioritised vendor checklist built from your plan, with the lead time, likely budget, and the questions worth asking before a deposit.",
    detail: "Track not started, shortlisted, or booked.",
  },
  {
    icon: "sparkles" as const,
    className: "feature-card--accent",
    label: "The AI layer",
    title: "Creative direction, grounded in your brief.",
    body: "Vela writes a specific concept and personal ideas, then answers questions with your budget, timeline, and vendors in view. No generic inspiration dump.",
    detail: "Works in guided mode even without an API key.",
  },
];

const questions = [
  ["Budget", "Where can I save ₹80,000 without losing the atmosphere?"],
  ["Sequence", "What actually needs to happen next?"],
  ["Vendors", "What should I ask a venue before I pay a deposit?"],
  ["Care", "How do I make the day work for my grandparents?"],
];

export default function HomePage() {
  const plan = buildPlan(sampleBrief());
  const topCategories = [...plan.budget.categories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">
                <span className="eyebrow__line" aria-hidden="true" />
                A calmer way to plan
              </p>
              <h1 className="display hero__title">
                Make room for the <em>moment.</em>
              </h1>
              <p className="hero__lede">
                Morrow turns your budget, guest list, and taste into a grounded
                plan for weddings, birthdays, and community gatherings — then
                helps you keep it moving.
              </p>
              <div className="hero__actions">
                <Link className="button button--primary" href="/create">
                  <span>Plan your celebration</span>
                  <Icon name="arrow-right" size={18} />
                </Link>
                <Link className="button button--text" href="/plan?demo=1">
                  Explore a sample plan
                  <Icon name="arrow-up-right" size={16} />
                </Link>
              </div>
              <p className="hero__note">
                No account needed. Your plan is saved in your browser.
              </p>
            </div>
            <div className="hero__visual">
              <PlanPreview plan={plan} />
            </div>
          </div>
          <div className="container hero__trust" aria-label="What Morrow does">
            <span>
              <Icon name="shield" size={17} /> Budgets checked against real
              benchmarks
            </span>
            <span>
              <Icon name="compass" size={17} /> Priorities shape every decision
            </span>
            <span>
              <Icon name="check-circle" size={17} /> Built to be used, not just
              admired
            </span>
          </div>
        </section>

        <section className="section section--cream" id="how-it-works">
          <div className="container">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">How it works</p>
                <h2 className="display section-title">
                  From loose idea to <em>clear next step.</em>
                </h2>
              </div>
              <p className="section-intro">
                Three inputs, one working plan. Morrow does the arithmetic and
                sequencing; you stay in charge of the taste.
              </p>
            </div>

            <ol className="steps">
              <li className="step-card">
                <span className="step-number">01</span>
                <div className="step-icon">
                  <Icon name="compass" size={24} />
                </div>
                <h3>Tell us the shape of it</h3>
                <p>
                  The occasion, date, guest count, budget, and the details you
                  refuse to compromise on.
                </p>
                <span className="step-detail">About four minutes</span>
              </li>
              <li className="step-card">
                <span className="step-number">02</span>
                <div className="step-icon">
                  <Icon name="sparkles" size={24} />
                </div>
                <h3>Get a grounded first plan</h3>
                <p>
                  A reasoned budget, a backwards timeline, a vendor order, and
                  creative direction that sounds like your brief.
                </p>
                <span className="step-detail">Useful from the first screen</span>
              </li>
              <li className="step-card">
                <span className="step-number">03</span>
                <div className="step-icon">
                  <Icon name="check-circle" size={24} />
                </div>
                <h3>Keep the good decisions moving</h3>
                <p>
                  Tick off milestones, track bookings, save ideas, and ask Vela
                  the question that is keeping you up at night.
                </p>
                <span className="step-detail">Everything stays with the plan</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="intelligence" id="intelligence">
          <div className="container intelligence__grid">
            <div className="intelligence__copy">
              <p className="eyebrow eyebrow--light">The intelligence</p>
              <h2 className="display section-title section-title--light">
                Not another <em>generic checklist.</em>
              </h2>
              <p>
                A wedding for 180 in Jaipur is not the same as a birthday for 30
                in Manchester. Morrow treats the context as the plan.
              </p>
              <ul className="intelligence__list">
                <li>
                  <span>01</span>
                  <div>
                    <strong>Budget logic you can inspect.</strong>
                    <p>
                      Priorities reweight the allocation. Guest count, local
                      pricing, season, and setting adjust the benchmark.
                    </p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>AI where judgement helps.</strong>
                    <p>
                      Vela writes the creative direction and answers questions.
                      Arithmetic, dates, and status stay deterministic.
                    </p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Honest when the numbers do not work.</strong>
                    <p>
                      A tight budget gets a plain warning and specific levers,
                      not a prettier pie chart.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="logic-card" aria-label="Example plan logic">
              <header>
                <span className="logic-card__dot" aria-hidden="true" />
                <span>Plan logic · sample</span>
                <span className="logic-card__badge">Garden romantic</span>
              </header>
              <div className="logic-inputs">
                <span>180 guests</span>
                <span>Jaipur · 24 weeks</span>
                <span>Food + photos + florals</span>
                <span>Outdoor</span>
              </div>
              <div className="logic-output">
                <p className="logic-output__label">Budget response</p>
                {topCategories.map((category) => (
                  <div className="logic-line" key={category.id}>
                    <div>
                      <span>{category.label}</span>
                      <strong>
                        {formatCurrency(category.amount, plan.budget.currency, {
                          compact: true,
                        })}
                      </strong>
                    </div>
                    <progress
                      className="logic-progress"
                      value={category.amount}
                      max={plan.budget.total}
                    >
                      {Math.round(category.share * 100)}%
                    </progress>
                  </div>
                ))}
                <p className="logic-output__note">
                  {plan.budget.healthLabel} at{" "}
                  {formatCurrency(plan.budget.perGuest, plan.budget.currency)} per
                  guest. A 9% contingency stays protected.
                </p>
              </div>
              <div className="logic-ai">
                <span className="logic-ai__icon">
                  <Icon name="sparkles" size={16} />
                </span>
                <div>
                  <span>Creative layer</span>
                  <strong>{plan.concept.title}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--paper">
          <div className="container">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">Inside the workspace</p>
                <h2 className="display section-title">
                  One place for the <em>whole picture.</em>
                </h2>
              </div>
              <p className="section-intro">
                No sixteen-tab spreadsheet. No inspirational screenshots you
                never open again. A living plan with a memory.
              </p>
            </div>

            <div className="feature-grid">
              {featureCards.map((card) => (
                <article className={`feature-card ${card.className}`} key={card.title}>
                  <div className="feature-card__icon">
                    <Icon name={card.icon} size={22} />
                  </div>
                  <span className="feature-card__label">{card.label}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <span className="feature-card__detail">{card.detail}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--cream">
          <div className="container occasion-grid">
            <div className="occasion-copy">
              <p className="eyebrow">Made for real occasions</p>
              <h2 className="display section-title">
                A wedding is the <em>deep end.</em> We plan for that.
              </h2>
              <p>
                Morrow was built wedding-first, where the budget, family
                logistics, and emotional stakes are highest. The same engine
                adapts cleanly to birthdays and community gatherings.
              </p>
              <div className="occasion-list">
                {eventTypes.map((type) => (
                  <div key={type}>
                    <span className="occasion-list__number">
                      0{eventTypes.indexOf(type) + 1}
                    </span>
                    <div>
                      <strong>{EVENT_TYPE_META[type].label}</strong>
                      <p>{EVENT_TYPE_META[type].description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="question-card">
              <header>
                <span className="question-card__avatar" aria-hidden="true">
                  V
                </span>
                <div>
                  <strong>Ask Vela</strong>
                  <span>It has read the whole plan</span>
                </div>
              </header>
              <div className="question-list">
                {questions.map(([label, question]) => (
                  <div className="question-row" key={question}>
                    <span>{label}</span>
                    <p>{question}</p>
                    <Icon name="arrow-up-right" size={15} />
                  </div>
                ))}
              </div>
              <footer>
                <Icon name="shield" size={16} />
                Grounded in your numbers. Never inventing a booking.
              </footer>
            </div>
          </div>
        </section>

        <section className="section accessibility-section" id="accessibility">
          <div className="container accessibility-grid">
            <div>
              <p className="eyebrow">Accessibility is a planning input</p>
              <h2 className="display section-title">
                A plan should include <em>everyone.</em>
              </h2>
            </div>
            <div className="accessibility-copy">
              <p>
                You can flag access, dietary, sensory, and family needs in the
                brief. Morrow carries them into the plan, prompts the right
                conversations, and keeps them visible in the workspace.
              </p>
              <ul className="check-list">
                <li>
                  <Icon name="check" size={16} /> Keyboard-ready controls and
                  visible focus states
                </li>
                <li>
                  <Icon name="check" size={16} /> Comfortable contrast and
                  reduced-motion support
                </li>
                <li>
                  <Icon name="check" size={16} /> Semantic labels, live regions,
                  and text alternatives for charts
                </li>
                <li>
                  <Icon name="check" size={16} /> Inline access and dietary notes
                  in the plan itself
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section section--paper">
          <div className="container privacy-grid">
            <div className="privacy-copy">
              <p className="eyebrow">A quiet kind of private</p>
              <h2 className="display section-title">
                Your plans stay <em>yours.</em>
              </h2>
              <p>
                The plan and your progress live in this browser. No account, no
                tracking pixels, no public share link. If the optional AI layer
                is configured, only the brief and plan context are sent to the
                configured provider to write your direction or answer a chat.
              </p>
              <Link className="button button--dark" href="/create">
                Start with a blank page
                <Icon name="arrow-right" size={17} />
              </Link>
            </div>
            <div className="privacy-note">
              <div className="privacy-note__mark">
                <Icon name="shield" size={28} />
              </div>
              <h3>Built for responsible use</h3>
              <p>
                Validation on both ends, a key held only on the server, bounded
                AI responses, rate limiting, and a guided mode that keeps the app
                useful when AI is unavailable.
              </p>
              <span>No payment details. No sensitive identity data.</span>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container cta-band__inner">
            <div>
              <p className="eyebrow eyebrow--light">The next small step</p>
              <h2 className="display">
                You do not need the whole plan. <em>Just a place to start.</em>
              </h2>
            </div>
            <Link className="button button--cream" href="/create">
              Build my plan
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
