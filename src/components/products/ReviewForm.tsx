"use client";

import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage, ProductsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  const addReview = async () => {
    setPosting(true);
    try {
      await ProductsAPI.addReview(productId, { rating, comment });
      toast.success("Review posted");
      setComment("");
      setRating(5);
      router.refresh();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't post review"));
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-medium">Share your experience</p>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Button key={i} variant="ghost" size="icon" onClick={() => setRating(i + 1)}>
            <Star className={`h-6 w-6 ${i < rating ? "fill-gold text-gold" : "text-muted"}`} />
          </Button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Only verified buyers can post — your review will be checked against your order history."
        className="mt-3"
        rows={3}
      />
      <Button
        onClick={() => addReview()}
        disabled={!comment.trim() || posting}
        className="mt-3 bg-gradient-hero text-primary-foreground hover:opacity-90"
      >
        {posting ? "Posting…" : "Post review"}
      </Button>
    </div>
  );
}