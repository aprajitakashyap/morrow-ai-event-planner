"use client";

import { Icon } from "@/components/ui/Icon";
import { formatShortDate, relativeDueLabel, todayISO } from "@/lib/dates";
import type { Plan, TimelineTask } from "@/lib/types";
import { cn } from "@/lib/utils";

type TimelinePanelProps = {
  plan: Plan;
  completedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  onDownloadCalendar: () => void;
  onPrint: () => void;
};

export function TimelinePanel({
  plan,
  completedTaskIds,
  onToggleTask,
  onDownloadCalendar,
  onPrint,
}: TimelinePanelProps) {
  const completed = new Set(completedTaskIds);
  const completedCount = plan.timeline.filter((task) => completed.has(task.id)).length;
  const progress =
    plan.timeline.length === 0 ? 0 : Math.round((completedCount / plan.timeline.length) * 100);
  const today = todayISO();

  const groups = new Map<string, TimelineTask[]>();
  for (const task of plan.timeline) {
    const list = groups.get(task.phase) ?? [];
    list.push(task);
    groups.set(task.phase, list);
  }

  return (
    <div className="panel-stack">
      <section className="timeline-hero" aria-labelledby="timeline-title">
        <div>
          <p className="eyebrow">Working backwards</p>
          <h2 className="display" id="timeline-title">
            The road to the day.
          </h2>
          <p>
            Every milestone is sequenced from {formatShortDate(plan.brief.date)}. Completed
            items stay visible so the plan keeps its memory.
          </p>
        </div>
        <div className="timeline-hero__progress">
          <div className="timeline-progress-label">
            <strong>{progress}%</strong>
            <span>
              {completedCount} of {plan.timeline.length} done
            </span>
          </div>
          <progress
            className="progress-track__bar progress-track__bar--large"
            value={progress}
            max={100}
            aria-label={`${progress}% of milestones complete`}
          >
            {progress}%
          </progress>
        </div>
      </section>

      <div className="panel-toolbar" aria-label="Timeline actions">
        <button type="button" className="button button--soft button--small" onClick={onDownloadCalendar}>
          <Icon name="download" size={16} />
          Add to calendar
        </button>
        <button type="button" className="button button--ghost button--small" onClick={onPrint}>
          <Icon name="printer" size={16} />
          Print
        </button>
        <span className="panel-toolbar__note">
          {plan.timeline.filter((task) => task.compressed).length > 0
            ? `${plan.timeline.filter((task) => task.compressed).length} milestones pulled forward to fit your runway.`
            : "The runway leaves room for considered decisions."}
        </span>
      </div>

      <div className="timeline-groups">
        {[...groups.entries()].map(([phase, tasks]) => {
          const phaseDone = tasks.filter((task) => completed.has(task.id)).length;
          return (
            <section className="timeline-group" key={phase} aria-labelledby={`phase-${slug(phase)}`}>
              <header className="timeline-group__header">
                <h3 id={`phase-${slug(phase)}`}>{phase}</h3>
                <span>
                  {phaseDone}/{tasks.length}
                </span>
              </header>
              <ol className="timeline-list">
                {tasks.map((task) => {
                  const done = completed.has(task.id);
                  const overdue = !done && task.dueDate < today;
                  return (
                    <li
                      className={cn("timeline-task", done && "is-done", overdue && "is-overdue")}
                      key={task.id}
                    >
                      <button
                        type="button"
                        className="task-check"
                        aria-pressed={done}
                        aria-label={
                          done
                            ? `Mark “${task.title}” as not complete`
                            : `Mark “${task.title}” as complete`
                        }
                        onClick={() => onToggleTask(task.id)}
                      >
                        {done && <Icon name="check" size={15} />}
                      </button>
                      <div className="timeline-task__body">
                        <div className="timeline-task__head">
                          <h4>{task.title}</h4>
                          <span className="badge-row">
                            {task.critical && <span className="tag tag--dark">Critical</span>}
                            {task.compressed && <span className="tag">Pulled forward</span>}
                          </span>
                        </div>
                        <p>{task.description}</p>
                        <div className="timeline-task__meta">
                          <span>
                            <Icon name="calendar" size={14} />
                            {formatShortDate(task.dueDate)}
                          </span>
                          <span className={overdue ? "is-alert" : undefined}>
                            {relativeDueLabel(task.dueDate)}
                          </span>
                          <span>{task.category}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
