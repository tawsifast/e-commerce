import { Mail, MessageSquare, MapPin, Clock } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { FaqAccordion } from "@/components/site/FaqAccordion";

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
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal y={30} className="mx-auto max-w-3xl text-center">
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
        </Reveal>
      </section>

      {/* Contact grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-5">
          <ContactForm />

          <Reveal delay={0.15} className="flex flex-col gap-6 lg:col-span-2">
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
              <Reveal key={c.title} delay={0.1 * i}>
                <div className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5">
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
                </div>
              </Reveal>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Good to know
            </span>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
              Frequently asked questions
            </h2>
          </Reveal>
          <div className="mt-10">
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}