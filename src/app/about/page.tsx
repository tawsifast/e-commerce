"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Handshake,
  Globe2,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function About() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Our story
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] text-balance sm:text-6xl">
            A marketplace for the <em className="italic text-primary">makers</em>,
            not just the goods.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Marketa was born from a simple frustration: great independent
            crafters deserved a storefront as considered as their work. So we
            built one.
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <motion.div {...fadeUp}>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              How it started
            </span>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
              Made by hand, sold with care
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Marketa began in 2021 with three sellers, a shared studio table,
                and a conviction that online shopping should feel less like a
                warehouse and more like a well-kept shop. We focused on a small
                catalogue, honest pricing, and packaging worth keeping.
              </p>
              <p>
                Since then we have grown into a community of hundreds of
                independent sellers across four continents — ceramicists,
                leatherworkers, perfumers, weavers, and small-batch food
                producers — each one hand-vetted before they open their shop.
              </p>
              <p>
                Today every order on Marketa still comes directly from the
                maker who created it. We handle the payments, the trust, and
                the returns, so they can spend their time doing what they do
                best.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <Button className="rounded-full bg-gradient-hero text-primary-foreground hover:opacity-90">
                  Shop the makers <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="rounded-full">
                  Become a seller
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex flex-col justify-between gap-8 rounded-2xl border border-border/60 bg-card p-6 shadow-elegant">
              <span className="font-serif text-6xl text-primary">12k+</span>
              <p className="text-sm text-muted-foreground">
                Orders delivered worldwide since our first sale.
              </p>
            </div>
            <div className="mt-8 flex flex-col justify-between gap-8 rounded-2xl border border-border/60 bg-gradient-cream p-6">
              <span className="font-serif text-6xl text-gold">480</span>
              <p className="text-sm text-muted-foreground">
                Independent makers selling on Marketa today.
              </p>
            </div>
            <div className="flex flex-col justify-between gap-8 rounded-2xl border border-border/60 bg-gradient-cream p-6">
              <span className="font-serif text-6xl text-gold">4.9</span>
              <p className="text-sm text-muted-foreground">
                Average buyer rating across every listed product.
              </p>
            </div>
            <div className="mt-8 flex flex-col justify-between gap-8 rounded-2xl border border-border/60 bg-card p-6 shadow-elegant">
              <span className="font-serif text-6xl text-primary">38</span>
              <p className="text-sm text-muted-foreground">
                Countries our sellers ship to, with tracking included.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            What we believe
          </span>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
            Four values, no exceptions
          </h2>
        </motion.div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Heart,
              title: "Craft first",
              body: "Every product is made or curated by a human with standards. If it would not impress us, it does not ship.",
            },
            {
              icon: Handshake,
              title: "Fair to makers",
              body: "Sellers keep more of every sale than on any major platform — because their work deserves it.",
            },
            {
              icon: Globe2,
              title: "Small over big",
              body: "We would rather help a studio ship ten orders than a factory ship ten thousand.",
            },
            {
              icon: Leaf,
              title: "Waste less",
              body: "Plastic-free packaging, carbon-neutral shipping offsets, and repairs before replacements.",
            },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-2xl">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {v.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <span className="text-xs font-medium uppercase tracking-widest text-gold">
              How it works
            </span>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
              From studio to doorstep
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Discover",
                body: "Browse a curated catalogue of handmade goods, each with the maker's story attached.",
              },
              {
                step: "02",
                title: "Order directly",
                body: "Checkout is handled by Marketa, but every parcel ships straight from the maker.",
              },
              {
                step: "03",
                title: "Track everything",
                body: "You get tracking on every order and a direct line to the seller when you need it.",
              },
              {
                step: "04",
                title: "Buy with trust",
                body: "30-day returns and our purchase protection cover every single order, no hoops.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur"
              >
                <span className="font-serif text-3xl text-gold">{s.step}</span>
                <h3 className="mt-3 font-serif text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm text-primary-foreground/75">
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-cream p-10 text-center shadow-md sm:p-14"
        >
          <Sparkles className="h-8 w-8 text-gold" />
          <h2 className="font-serif text-4xl text-balance sm:text-5xl">
            Come see what we are keeping
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            New drops land every week — hand-picked pieces from sellers we
            would buy from ourselves.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products">
              <Button className="rounded-full bg-gradient-hero text-primary-foreground hover:opacity-90">
                Browse products <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="rounded-full">
                Talk to us
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
