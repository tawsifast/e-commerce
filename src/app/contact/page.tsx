"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const faqs = [
  {
    q: "How fast is shipping?",
    a: "Sellers ship within 48 hours of your order. Most domestic orders arrive in 2–5 business days, and international orders in 7–14 days. You will receive a tracking number the moment your parcel leaves the studio.",
  },
  {
    q: "Can I return something I don't love?",
    a: "Yes — every order is covered by our 30-day returns policy. Start a return from your dashboard and we will handle the label and refund, no questions asked.",
  },
  {
    q: "How do I become a seller?",
    a: "Register for an account, choose the seller role, and tell us what you make. Our team reviews every application personally — most sellers hear back within 5 business days.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. All payments are processed by Stripe with bank-grade encryption. We never see or store your card details.",
  },
  {
    q: "Do you ship internationally?",
    a: "We do. Our sellers ship to 38 countries, and every international order includes customs-friendly packaging and carbon-neutral shipping.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <div className="bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> We reply fast
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] text-balance sm:text-6xl">
            Questions? <em className="italic text-primary">Say hello.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Whether it is an order question, a maker application, or just a
            compliment — our support team answers within one business day.
          </p>
        </motion.div>
      </section>

      {/* Contact grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border/60 bg-card p-6 shadow-elegant sm:p-8 lg:col-span-3"
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
          </motion.form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col gap-6 lg:col-span-2"
          >
            {[
              {
                icon: Mail,
                title: "Email us",
                lines: ["hello@marketa.dev", "Replies within 1 business day"],
              },
              {
                icon: MessageSquare,
                title: "Order support",
                lines: ["support@marketa.dev", "Include your order number"],
              },
              {
                icon: MapPin,
                title: "Studio",
                lines: ["14 Workshop Lane, Portland", "United States"],
              },
              {
                icon: Clock,
                title: "Hours",
                lines: ["Mon–Fri, 9am–6pm EST", "Closed on holidays"],
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.1 * i }}
                className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-cream text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl">{c.title}</h3>
                  {c.lines.map((l, j) => (
                    <p
                      key={j}
                      className={`mt-0.5 text-sm ${j === 0 ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {l}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Good to know
            </span>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
              Frequently asked questions
            </h2>
          </motion.div>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="font-serif text-xl">{f.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
