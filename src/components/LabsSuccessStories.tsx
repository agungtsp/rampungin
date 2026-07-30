import type { LabsStory } from "@/lib/labs-content";
import { storyBars } from "@/lib/labs-content";

function StoryVisual({ story }: { story: LabsStory }) {
  const bars = storyBars(story.audience);

  return (
    <div className="relative overflow-hidden rounded-xl bg-ink/[0.03] p-4 ring-1 ring-secondary">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Impact
          </p>
          <p className="font-display text-sm font-semibold text-ink">
            {story.metricLabel}
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="text-ink-faint">
            <span className="line-through">{story.metricBefore}</span>
            {" → "}
            <span className="font-semibold text-primary-hover">
              {story.metricAfter}
            </span>
          </p>
        </div>
      </div>
      <div className="flex h-20 items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={`${story.id}-bar-${i}`}
            className={`flex-1 rounded-t-md bg-gradient-to-t ${story.accent} opacity-90`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px] font-medium text-ink-faint">
          <span>Progress</span>
          <span>{story.metricPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${story.accent}`}
            style={{ width: `${story.metricPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function LabsSuccessStories({
  stories,
  title,
  subtitle,
  beforeLabel,
  afterLabel,
}: {
  stories: LabsStory[];
  title: string;
  subtitle: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted sm:text-base">
        {subtitle}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {stories.map((story) => (
          <article
            key={story.id}
            className="flex flex-col gap-4 rounded-2xl bg-panel p-5 shadow-card ring-1 ring-secondary sm:p-6"
          >
            <div>
              <p
                className={`inline-flex rounded-full bg-gradient-to-r ${story.accent} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white`}
              >
                {story.label}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-ink">
                {story.title}
              </h3>
              <p className="mt-0.5 text-xs text-ink-faint">{story.persona}</p>
            </div>
            <StoryVisual story={story} />
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-soft/80 p-3 ring-1 ring-secondary/60">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                  {beforeLabel}
                </p>
                <p className="mt-1 leading-relaxed text-ink-muted">
                  {story.problem}
                </p>
              </div>
              <div className="rounded-xl bg-primary/5 p-3 ring-1 ring-primary/20">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-hover">
                  {afterLabel}
                </p>
                <p className="mt-1 leading-relaxed text-ink-muted">
                  {story.result}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
