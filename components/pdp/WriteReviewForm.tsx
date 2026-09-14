"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function WriteReviewForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <Button variant="secondary" className="w-fit px-4 py-1.5 text-sm" onClick={() => setOpen(true)}>
        Write a review
      </Button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (rating < 1) {
      setError("Choose a star rating.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      setError("Fill in a title and a few words about the product.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title: title.trim(), body: body.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }
      setOpen(false);
      setRating(0);
      setTitle("");
      setBody("");
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-sm p-4 flex flex-col gap-3 max-w-md">
      <h3 className="font-bold text-sm text-text">Write a customer review</h3>

      <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHoverRating(n)}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star
              size={22}
              className={(hoverRating || rating) >= n ? "fill-star text-star" : "text-border-strong"}
            />
          </button>
        ))}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give your review a title"
        className="border border-border-strong rounded-sm px-2 py-1.5 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you like or dislike?"
        rows={3}
        className="border border-border-strong rounded-sm px-2 py-1.5 text-sm resize-none"
      />

      {error && <p className="text-price text-xs">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="cta"
          disabled={submitting}
          aria-busy={submitting}
          className="px-4 py-1.5 text-sm font-medium disabled:opacity-70"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-4 py-1.5 text-sm"
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
