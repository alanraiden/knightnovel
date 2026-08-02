"use client";

import { useMemo, useState } from "react";
import { Filter as FilterIcon, X, ChevronDown } from "lucide-react";
import { GENRES } from "@/lib/genres";
import { demoTags } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export interface BrowseFilters {
  status: string[];
  genres: string[];
  tags: string[];
  sort: string;
  country: string[];
}

const statuses = ["ongoing", "completed", "hiatus"];
const sorts = ["Most popular", "Most rated", "Ascending", "Descending"];
const countries = ["Chinese", "Korean", "Japanese"];

export function FilterDrawer({
  filters,
  onChange,
}: {
  filters: BrowseFilters;
  onChange: (f: BrowseFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [tagOpen, setTagOpen] = useState(false);

  const filteredTags = useMemo(
    () =>
      demoTags
        .filter((t) => t.toLowerCase().includes(tagQuery.toLowerCase()))
        .filter((t) => !filters.tags.includes(t)),
    [tagQuery, filters.tags]
  );

  const toggle = (key: "status" | "genres" | "country", value: string) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) onChange({ ...filters, tags: [...filters.tags, tag] });
    setTagQuery("");
    setTagOpen(false);
  };

  const removeTag = (tag: string) =>
    onChange({ ...filters, tags: filters.tags.filter((t) => t !== tag) });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary hover:border-border-hover"
      >
        <FilterIcon size={14} /> Filter
      </button>

      {open && (
        <div className="glass fixed inset-x-4 top-20 z-30 w-auto rounded-card p-4 shadow-2xl animate-slide-up sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[320px]">
          <p className="mb-2 text-xs font-medium text-text-primary">Status</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {statuses.map((s) => (
              <Chip key={s} active={filters.status.includes(s)} onClick={() => toggle("status", s)}>
                {s[0].toUpperCase() + s.slice(1)}
              </Chip>
            ))}
          </div>

          <p className="mb-2 text-xs font-medium text-text-primary">Genre</p>
          <div className="mb-4 flex max-h-24 flex-wrap gap-2 overflow-y-auto themed-scroll">
            {GENRES.map((g) => (
              <Chip key={g} active={filters.genres.includes(g)} onClick={() => toggle("genres", g)}>
                {g}
              </Chip>
            ))}
          </div>

          <p className="mb-2 text-xs font-medium text-text-primary">Tags</p>
          <div className="relative mb-2">
            <div
              onClick={() => setTagOpen(true)}
              className="flex cursor-text items-center justify-between rounded border border-border-hover bg-card px-2.5 py-1.5"
            >
              <input
                value={tagQuery}
                onChange={(e) => {
                  setTagQuery(e.target.value);
                  setTagOpen(true);
                }}
                onFocus={() => setTagOpen(true)}
                placeholder="Search tags…"
                className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <ChevronDown size={13} className="text-text-muted" />
            </div>
            {tagOpen && filteredTags.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border border-border bg-card themed-scroll">
                {filteredTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => addTag(t)}
                    className="block w-full px-2.5 py-1.5 text-left text-xs text-text-secondary hover:bg-surface"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {filters.tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded bg-card px-2 py-1 text-[10px] text-text-secondary"
              >
                {t}
                <button onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          <p className="mb-2 text-xs font-medium text-text-primary">Sort</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {sorts.map((s) => (
              <Chip key={s} active={filters.sort === s} onClick={() => onChange({ ...filters, sort: s })}>
                {s}
              </Chip>
            ))}
          </div>

          <p className="mb-2 text-xs font-medium text-text-primary">Country</p>
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => (
              <Chip key={c} active={filters.country.includes(c)} onClick={() => toggle("country", c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded border px-2.5 py-1 text-[11px] transition-colors",
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-border text-text-secondary hover:border-border-hover"
      )}
    >
      {children}
    </button>
  );
}
