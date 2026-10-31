"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";
import { requestPlan } from "@/lib/client";
import { addDays, formatCurrency, formatDate, todayISO } from "@/lib/dates";
import { saveNewPlan, readStagedBrief, setTransientNotice } from "@/lib/storage";
import {
  CURRENCIES,
  CURRENCY_META,
  DEFAULT_BRIEF,
  EVENT_TYPES,
  EVENT_TYPE_META,
  PRIORITY_OPTIONS,
  STYLE_OPTIONS,
  type Currency,
  type EventBrief,
  type EventSetting,
  type EventType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "The occasion", label: "Occasion" },
  { title: "The shape", label: "Budget & taste" },
  { title: "The details", label: "Details" },
];

const EVENT_ICONS: Record<EventType, IconName> = {
  wedding: "heart",
  birthday: "sparkles",
  community: "users",
};

const SETTING_OPTIONS: Array<{
  id: EventSetting;
  label: string;
  description: string;
}> = [
  { id: "indoor", label: "Indoors", description: "A room that does the work" },
  { id: "outdoor", label: "Outdoors", description: "Open air, weather plan" },
  { id: "mixed", label: "A mix", description: "Inside and out" },
];

const LOADING_MESSAGES = [
  "Reading the shape of the day",
  "Weighting the budget around your priorities",
  "Building a timeline that works backwards",
  "Writing a direction that sounds like you",
  "Checking the plan against itself",
];

type FieldErrors = Partial<Record<keyof EventBrief | "form", string>>;

function defaultBrief(): EventBrief {
  return {
    ...DEFAULT_BRIEF,
    date: addDays(todayISO(), 180),
    style: STYLE_OPTIONS.wedding[0],
  };
}

function cleanBrief(brief: EventBrief): EventBrief {
  return {
    ...brief,
    eventName: brief.eventName.trim().replace(/\s+/g, " "),
    location: brief.location.trim().replace(/\s+/g, " "),
    style: brief.style.trim(),
    accessibility: brief.accessibility.trim(),
    dietary: brief.dietary.trim(),
    notes: brief.notes.trim(),
  };
}

export function PlannerWizard() {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [brief, setBrief] = useState<EventBrief>(defaultBrief);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    const staged = readStagedBrief();
    if (staged) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser storage is only readable after mount.
      setBrief(staged);
      setEditing(true);
    } else {
      setBrief(defaultBrief());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!submitting) return;
    const timer = window.setInterval(() => {
      setLoadingIndex((current) =>
        Math.min(current + 1, LOADING_MESSAGES.length - 1),
      );
    }, 1900);
    return () => window.clearInterval(timer);
  }, [submitting]);

  function update<K extends keyof EventBrief>(key: K, value: EventBrief[K]) {
    setBrief((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  }

  function changeEventType(eventType: EventType) {
    const priorities = PRIORITY_OPTIONS[eventType].slice(0, 2).map((item) => item.id);
    setBrief((current) => ({
      ...current,
      eventType,
      style: STYLE_OPTIONS[eventType][0],
      priorities,
    }));
    setErrors({});
  }

  function togglePriority(id: string) {
    setBrief((current) => {
      if (current.priorities.includes(id)) {
        return {
          ...current,
          priorities: current.priorities.filter((priority) => priority !== id),
        };
      }
      if (current.priorities.length >= 3) return current;
      return { ...current, priorities: [...current.priorities, id] };
    });
    setErrors((current) => ({ ...current, priorities: undefined, form: undefined }));
  }

  function validateStep(index: number): FieldErrors {
    const next: FieldErrors = {};

    if (index === 0) {
      if (brief.eventName.trim().length < 2) {
        next.eventName = "Give your celebration a name — even a working title is fine.";
      }
      if (!brief.date || brief.date < todayISO()) {
        next.date = "Choose a date from today onwards.";
      }
      if (brief.location.trim().length < 2) {
        next.location = "Add a city or venue so local pricing makes sense.";
      }
    }

    if (index === 1) {
      if (!Number.isInteger(brief.guestCount) || brief.guestCount < 1) {
        next.guestCount = "Add at least one guest.";
      }
      if (!Number.isInteger(brief.budget) || brief.budget < 1000) {
        next.budget = "Add a total budget of at least 1,000.";
      }
      if (!brief.style) next.style = "Choose a style to anchor the creative direction.";
      if (brief.priorities.length === 0) {
        next.priorities = "Choose at least one priority.";
      }
    }

    return next;
  }

  function nextStep() {
    const found = validateStep(step);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    setStep((current) => Math.min(2, current + 1));
    window.setTimeout(() => {
      headingRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  }

  function previousStep() {
    setErrors({});
    setStep((current) => Math.max(0, current - 1));
    window.setTimeout(() => headingRef.current?.focus(), 0);
  }

  async function submit() {
    const first = validateStep(0);
    const second = validateStep(1);
    const found = { ...first, ...second };

    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStep(Object.keys(first).length > 0 ? 0 : 1);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const result = await requestPlan(cleanBrief(brief));
      const saved = saveNewPlan(result.plan);
      if (!saved) {
        setErrors({
          form: "Your browser blocked local storage. Allow site data and try again so the plan can be saved.",
        });
        setSubmitting(false);
        return;
      }
      if (result.fallback) {
        setTransientNotice(
          "The AI service was unavailable, so Vela built a guided plan. Everything is editable.",
        );
      }
      router.push("/plan");
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "The plan could not be built. Please try again.",
      });
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="wizard-loading" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        Preparing your planner…
      </div>
    );
  }

  const meta = EVENT_TYPE_META[brief.eventType];
  const priorityOptions = PRIORITY_OPTIONS[brief.eventType];
  const perGuest = brief.guestCount > 0 ? brief.budget / brief.guestCount : 0;

  return (
    <div className="wizard-layout">
      <aside className="wizard-intro" aria-label="Planner overview">
        <div className="wizard-intro__top">
          <Link className="wizard-back" href="/">
            <Icon name="chevron-left" size={16} />
            Back to Morrow
          </Link>
          <p className="eyebrow">A plan, not a moodboard</p>
          <h2 className="display">
            Start with the <em>shape</em> of the day.
          </h2>
          <p>
            Four minutes of honest inputs gives Vela enough to build a plan you
            can actually use.
          </p>
        </div>

        <ol className="wizard-steps" aria-label="Plan progress">
          {STEPS.map((item, index) => (
            <li
              key={item.title}
              className={cn(
                "wizard-step",
                index === step && "is-current",
                index < step && "is-complete",
              )}
              aria-current={index === step ? "step" : undefined}
            >
              <span className="wizard-step__number">
                {index < step ? <Icon name="check" size={14} /> : `0${index + 1}`}
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.label}</small>
              </span>
            </li>
          ))}
        </ol>

        <div className="wizard-intro__note">
          <Icon name="shield" size={17} />
          <p>
            {editing
              ? "Saving will replace your current saved plan."
              : "No account. Your brief and plan stay in this browser."}
          </p>
        </div>
      </aside>

      <section className="wizard-card" aria-labelledby="wizard-title">
        {submitting ? (
          <div className="generating" role="status" aria-live="polite">
            <div className="generating__visual" aria-hidden="true">
              <span className="generating__sun" />
              <span className="generating__arch" />
              <span className="generating__dot generating__dot--one" />
              <span className="generating__dot generating__dot--two" />
            </div>
            <p className="eyebrow">Vela is working</p>
            <h1 className="display" id="wizard-title">
              Shaping something <em>considered.</em>
            </h1>
            <p className="generating__message">{LOADING_MESSAGES[loadingIndex]}</p>
            <div className="generating__track" aria-hidden="true">
              <span />
            </div>
            <p className="generating__note">
              Budgeting, sequencing, and writing. This usually takes a few
              seconds.
            </p>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (step < 2) nextStep();
              else void submit();
            }}
          >
            <div className="wizard-mobile-progress">
              <span>
                Step {step + 1} of {STEPS.length}
              </span>
              <strong>{STEPS[step].title}</strong>
            </div>

            {step === 0 && (
              <div className="wizard-panel">
                <header className="wizard-panel__header">
                  <p className="eyebrow">01 · The occasion</p>
                  <h1 className="display" id="wizard-title" ref={headingRef} tabIndex={-1}>
                    What are we <em>planning?</em>
                  </h1>
                  <p>
                    Start with the fundamentals. You can change every detail
                    later by refining the brief.
                  </p>
                </header>

                <fieldset className="field-group">
                  <legend className="field-label">Occasion type</legend>
                  <div className="occasion-picker">
                    {EVENT_TYPES.map((type) => (
                      <label
                        key={type}
                        className={cn(
                          "occasion-option",
                          brief.eventType === type && "is-selected",
                        )}
                      >
                        <input
                          type="radio"
                          name="eventType"
                          value={type}
                          checked={brief.eventType === type}
                          onChange={() => changeEventType(type)}
                          className="sr-only"
                        />
                        <span className="occasion-option__icon">
                          <Icon name={EVENT_ICONS[type]} size={22} />
                        </span>
                        <strong>{EVENT_TYPE_META[type].label}</strong>
                        <span>{EVENT_TYPE_META[type].description}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="field">
                  <label className="field-label" htmlFor="eventName">
                    What are we calling it?
                  </label>
                  <input
                    id="eventName"
                    className={cn("input", errors.eventName && "input--error")}
                    value={brief.eventName}
                    onChange={(event) => update("eventName", event.target.value)}
                    placeholder="Aarav & Meera, Mum's 60th, Riverside open day"
                    autoComplete="off"
                    maxLength={80}
                    aria-invalid={Boolean(errors.eventName)}
                    aria-describedby={errors.eventName ? "eventName-error" : undefined}
                  />
                  {errors.eventName && (
                    <p className="field-error" id="eventName-error" role="alert">
                      {errors.eventName}
                    </p>
                  )}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label className="field-label" htmlFor="date">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      className={cn("input", errors.date && "input--error")}
                      value={brief.date}
                      min={todayISO()}
                      onChange={(event) => update("date", event.target.value)}
                      aria-invalid={Boolean(errors.date)}
                      aria-describedby={errors.date ? "date-error" : "date-help"}
                    />
                    <p className="field-help" id="date-help">
                      A close date compresses the timeline automatically.
                    </p>
                    {errors.date && (
                      <p className="field-error" id="date-error" role="alert">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="location">
                      City or venue
                    </label>
                    <input
                      id="location"
                      className={cn("input", errors.location && "input--error")}
                      value={brief.location}
                      onChange={(event) => update("location", event.target.value)}
                      placeholder="Jaipur, London, your local hall"
                      autoComplete="address-level2"
                      maxLength={100}
                      aria-invalid={Boolean(errors.location)}
                      aria-describedby={errors.location ? "location-error" : undefined}
                    />
                    {errors.location && (
                      <p className="field-error" id="location-error" role="alert">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="wizard-panel">
                <header className="wizard-panel__header">
                  <p className="eyebrow">02 · The shape</p>
                  <h1 className="display" id="wizard-title" ref={headingRef} tabIndex={-1}>
                    The people and the <em>budget.</em>
                  </h1>
                  <p>
                    Honest numbers make the plan useful. Nothing here is locked
                    in — it is a starting position, not a verdict.
                  </p>
                </header>

                <div className="field-row">
                  <div className="field">
                    <label className="field-label" htmlFor="guestCount">
                      Guest count
                    </label>
                    <input
                      id="guestCount"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={5000}
                      step={1}
                      className={cn("input", errors.guestCount && "input--error")}
                      value={brief.guestCount || ""}
                      onChange={(event) =>
                        update("guestCount", Number.parseInt(event.target.value || "0", 10))
                      }
                      aria-invalid={Boolean(errors.guestCount)}
                      aria-describedby={errors.guestCount ? "guests-error" : "guests-help"}
                    />
                    <p className="field-help" id="guests-help">
                      Include children and plus-ones you are feeding.
                    </p>
                    {errors.guestCount && (
                      <p className="field-error" id="guests-error" role="alert">
                        {errors.guestCount}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="budget">
                      Total budget
                    </label>
                    <div className={cn("money-input", errors.budget && "input--error")}>
                      <span aria-hidden="true">
                        {CURRENCY_META[brief.currency].symbol}
                      </span>
                      <input
                        id="budget"
                        type="number"
                        inputMode="numeric"
                        min={1000}
                        max={100000000}
                        step={1000}
                        value={brief.budget || ""}
                        onChange={(event) =>
                          update(
                            "budget",
                            Number.parseInt(event.target.value || "0", 10),
                          )
                        }
                        aria-invalid={Boolean(errors.budget)}
                        aria-describedby={errors.budget ? "budget-error" : "budget-help"}
                      />
                      <select
                        aria-label="Currency"
                        value={brief.currency}
                        onChange={(event) =>
                          update("currency", event.target.value as Currency)
                        }
                      >
                        {CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="field-help" id="budget-help">
                      {perGuest > 0
                        ? `About ${formatCurrency(perGuest, brief.currency)} per guest.`
                        : "A working number is enough."}
                    </p>
                    {errors.budget && (
                      <p className="field-error" id="budget-error" role="alert">
                        {errors.budget}
                      </p>
                    )}
                  </div>
                </div>

                <fieldset className="field-group">
                  <legend className="field-label">Style</legend>
                  <p className="field-help">Choose the closest starting point.</p>
                  <div className="chip-group">
                    {STYLE_OPTIONS[brief.eventType].map((style) => (
                      <label
                        key={style}
                        className={cn("chip", brief.style === style && "is-selected")}
                      >
                        <input
                          type="radio"
                          name="style"
                          value={style}
                          checked={brief.style === style}
                          onChange={() => update("style", style)}
                          className="sr-only"
                        />
                        {style}
                      </label>
                    ))}
                  </div>
                  {errors.style && (
                    <p className="field-error" role="alert">
                      {errors.style}
                    </p>
                  )}
                </fieldset>

                <fieldset className="field-group">
                  <div className="field-group__split">
                    <legend className="field-label">What matters most?</legend>
                    <span className="field-count">{brief.priorities.length}/3</span>
                  </div>
                  <p className="field-help">
                    These reweight the budget. Choose up to three.
                  </p>
                  <div className="priority-grid">
                    {priorityOptions.map((priority) => {
                      const checked = brief.priorities.includes(priority.id);
                      const disabled = !checked && brief.priorities.length >= 3;
                      return (
                        <label
                          key={priority.id}
                          className={cn(
                            "priority-option",
                            checked && "is-selected",
                            disabled && "is-disabled",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePriority(priority.id)}
                            disabled={disabled}
                            className="sr-only"
                          />
                          <span className="priority-check" aria-hidden="true">
                            {checked && <Icon name="check" size={13} />}
                          </span>
                          {priority.label}
                        </label>
                      );
                    })}
                  </div>
                  {errors.priorities && (
                    <p className="field-error" role="alert">
                      {errors.priorities}
                    </p>
                  )}
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="wizard-panel">
                <header className="wizard-panel__header">
                  <p className="eyebrow">03 · The details</p>
                  <h1 className="display" id="wizard-title" ref={headingRef} tabIndex={-1}>
                    The details that make it <em>yours.</em>
                  </h1>
                  <p>
                    Optional, but useful. Access and dietary needs are planning
                    inputs, not footnotes.
                  </p>
                </header>

                <fieldset className="field-group">
                  <legend className="field-label">Setting</legend>
                  <div className="setting-picker">
                    {SETTING_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "setting-option",
                          brief.setting === option.id && "is-selected",
                        )}
                      >
                        <input
                          type="radio"
                          name="setting"
                          checked={brief.setting === option.id}
                          onChange={() => update("setting", option.id)}
                          className="sr-only"
                        />
                        <strong>{option.label}</strong>
                        <span>{option.description}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="field">
                  <label className="field-label" htmlFor="accessibility">
                    Access needs <span className="field-optional">Optional</span>
                  </label>
                  <textarea
                    id="accessibility"
                    className="textarea"
                    rows={3}
                    maxLength={300}
                    value={brief.accessibility}
                    onChange={(event) => update("accessibility", event.target.value)}
                    placeholder="Step-free access, quiet space, interpreters, seating, sensory needs…"
                    aria-describedby="accessibility-help"
                  />
                  <p className="field-help" id="accessibility-help">
                    Vela will keep these visible in the plan and vendor briefs.
                  </p>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="dietary">
                    Dietary needs <span className="field-optional">Optional</span>
                  </label>
                  <textarea
                    id="dietary"
                    className="textarea"
                    rows={2}
                    maxLength={240}
                    value={brief.dietary}
                    onChange={(event) => update("dietary", event.target.value)}
                    placeholder="Allergies, vegetarian or vegan guests, cultural requirements…"
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="notes">
                    Anything else? <span className="field-optional">Optional</span>
                  </label>
                  <textarea
                    id="notes"
                    className="textarea"
                    rows={3}
                    maxLength={600}
                    value={brief.notes}
                    onChange={(event) => update("notes", event.target.value)}
                    placeholder="A long dinner, no formal speeches, a family tradition you want to keep…"
                  />
                </div>

                <div className="brief-review" aria-label="Summary of your brief">
                  <div className="brief-review__top">
                    <span>Your brief</span>
                    <span>{meta.label}</span>
                  </div>
                  <div className="brief-review__grid">
                    <div>
                      <span>Name</span>
                      <strong>{brief.eventName}</strong>
                    </div>
                    <div>
                      <span>Date</span>
                      <strong>{formatDate(brief.date)}</strong>
                    </div>
                    <div>
                      <span>Location</span>
                      <strong>{brief.location}</strong>
                    </div>
                    <div>
                      <span>Guests</span>
                      <strong>{brief.guestCount}</strong>
                    </div>
                    <div>
                      <span>Budget</span>
                      <strong>{formatCurrency(brief.budget, brief.currency)}</strong>
                    </div>
                    <div>
                      <span>Priorities</span>
                      <strong>
                        {priorityOptions
                          .filter((item) => brief.priorities.includes(item.id))
                          .map((item) => item.label)
                          .join(", ")}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errors.form && (
              <p className="form-error" role="alert">
                <Icon name="alert" size={17} />
                {errors.form}
              </p>
            )}

            <div className="wizard-actions">
              {step > 0 ? (
                <button className="button button--text" type="button" onClick={previousStep}>
                  <Icon name="chevron-left" size={16} />
                  Back
                </button>
              ) : (
                <Link className="button button--text" href="/">
                  Cancel
                </Link>
              )}
              <button className="button button--primary" type="submit">
                {step < 2 ? "Continue" : "Build my plan"}
                <Icon name={step < 2 ? "arrow-right" : "sparkles"} size={17} />
              </button>
            </div>

            <p className="wizard-privacy">
              <Icon name="shield" size={14} />
              {editing
                ? "This creates a fresh plan and replaces your saved one."
                : "No account, no payment details. Plans are stored locally."}
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
