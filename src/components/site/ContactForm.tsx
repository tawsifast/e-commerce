"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent — we'll reply within one business day");
    }, 800);
  };

  return (
    <Reveal className="lg:col-span-3">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border/60 bg-card p-6 shadow-elegant sm:p-8"
      >
        <h2 className="font-serif text-3xl">Send us a message</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the form and we will get back to you by email.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              required
              placeholder="How can we help?"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              required
              rows={6}
              placeholder="Tell us a little more…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={sending}
          className="mt-6 rounded-full bg-gradient-hero px-6 text-primary-foreground hover:opacity-90"
        >
          <Send className="mr-2 h-4 w-4" />
          {sending ? "Sending…" : "Send message"}
        </Button>
      </form>
    </Reveal>
  );
}