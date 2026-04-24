import { FormEvent, useState } from "react";
import type { Category, EventItem } from "../api/types";

export interface EventFormValues {
  title: string;
  description: string;
  category: string;
  venue: string;
  startAt: string;
  endAt: string;
  capacity: number;
  posterUrl: string;
}

interface Props {
  initial?: EventItem;
  categories: Category[];
  onSubmit: (values: EventFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
}

function toInputDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export function EventForm({
  initial,
  categories,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: Props) {
  const [values, setValues] = useState<EventFormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: (initial?.category as Category | null)?.id ?? "",
    venue: initial?.venue ?? "",
    startAt: toInputDate(initial?.startAt),
    endAt: toInputDate(initial?.endAt),
    capacity: initial?.capacity ?? 50,
    posterUrl: initial?.posterUrl ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          required
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input min-h-[100px]"
          required
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({ ...v, description: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={values.category}
            onChange={(e) =>
              setValues((v) => ({ ...v, category: e.target.value }))
            }
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Capacity</label>
          <input
            type="number"
            min={1}
            className="input"
            required
            value={values.capacity}
            onChange={(e) =>
              setValues((v) => ({ ...v, capacity: Number(e.target.value) }))
            }
          />
        </div>
      </div>
      <div>
        <label className="label">Venue</label>
        <input
          className="input"
          required
          value={values.venue}
          onChange={(e) => setValues((v) => ({ ...v, venue: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Starts at</label>
          <input
            type="datetime-local"
            required
            className="input"
            value={values.startAt}
            onChange={(e) =>
              setValues((v) => ({ ...v, startAt: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="label">Ends at</label>
          <input
            type="datetime-local"
            required
            className="input"
            value={values.endAt}
            onChange={(e) =>
              setValues((v) => ({ ...v, endAt: e.target.value }))
            }
          />
        </div>
      </div>
      <div>
        <label className="label">Poster image URL (optional)</label>
        <input
          type="url"
          className="input"
          placeholder="https://..."
          value={values.posterUrl}
          onChange={(e) =>
            setValues((v) => ({ ...v, posterUrl: e.target.value }))
          }
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" disabled={submitting} type="submit">
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
