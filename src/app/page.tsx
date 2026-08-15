import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import { getBestSellingProducts, getCategories, getFeaturedProducts, getLatestReviews } from "@/lib/server-api";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { HeroSearch } from "@/components/site/HeroSearch";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.jpg";

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const [featured, bestSellers, categories, reviews] = await Promise.all([
      getFeaturedProducts(),
      getBestSellingProducts(),
      getCategories(),
      getLatestReviews(),
    ]);
    return { featured, bestSellers, categories, reviews };
  } catch {
    return { featured: [], bestSellers: [], categories: [], reviews: [] };
  }
}

export default async function Home() {
  const { featured, bestSellers, categories, reviews } = await getHomeData();
  const reviewItems =
    reviews.length >= 4
      ? reviews.slice(0, 4)
      : [1, 2, 3, 4].map((n) => ({
          _id: `s${n}`,
          rating: 5,
          comment: [
            "The quality genuinely surprised me. The packaging alone felt like a gift.",
            "Fast shipping, exactly as described. This is now my go-to shop.",
            "I've bought three things here and every one has become a favourite.",
            "Really thoughtful curation. You can tell someone actually chose these.",
          ][n - 1],
          user: {
            _id: `u${n}`,
            name: ["Anika J.", "Marcus O.", "Priya S.", "Elena V."][n - 1],
          },
          createdAt: new Date().toISOString(),
        }));

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt=""
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-32">
          <Reveal y={30} className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> A curated
              marketplace
            </span>
            <h1 className="font-serif text-5xl leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
              Things worth <em className="italic text-primary">keeping</em>,
              from people who <em className="italic text-primary">make them</em>
              .
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Marketa connects independent sellers with buyers who care about
              quality, story, and craft.
            </p>
            <div className="mt-8 max-w-lg">
              <HeroSearch />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <Button variant="outline" className="rounded-full">
                  Shop all products <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="ghost" className="rounded-full">
                  Sell on Marketa
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Explore" title="Top categories" />
          <Reveal className="mt-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.name}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-gradient-cream p-5 text-left transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 20vw, 50vw"
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-background/10" />
                  <div className="relative flex h-full flex-col justify-between">
                    <span className="w-fit rounded-full bg-card/80 px-2 py-0.5 text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur">
                      {cat.count} items
                    </span>
                    <span className="font-serif text-xl leading-tight text-foreground drop-shadow-sm">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* Featured */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <SectionHeader eyebrow="Featured" title="Handpicked this week" />
            <Link
              href="/products"
              className="hidden text-sm font-medium underline-offset-4 hover:underline sm:inline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-3">
            {featured.slice(0, 6).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
            {featured.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
                No featured products yet — check back soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Loved by many" title="Best sellers" />
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {bestSellers.slice(0, 4).map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
          {bestSellers.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
              No best sellers yet.
            </div>
          )}
        </div>
      </section>

      {/* Why shop */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why Marketa"
            title="Considered from checkout to doorstep"
            light
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Secure payments",
                body: "Every checkout is protected with bank-grade encryption and Stripe fraud tools.",
              },
              {
                icon: Truck,
                title: "Fast, tracked delivery",
                body: "Orders ship within 48 hours from our sellers with tracking on every parcel.",
              },
              {
                icon: RotateCcw,
                title: "Easy 30-day returns",
                body: "Not right? Return it. No hoops, no paperwork — just a refund.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur">
                  <f.icon className="h-6 w-6 text-gold" />
                  <h3 className="mt-4 font-serif text-2xl">{f.title}</h3>
                  <p className="mt-2 text-sm text-primary-foreground/75">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Word of mouth" title="What buyers are saying" />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {reviewItems.map((r, i) => (
            <Reveal key={r._id} delay={i * 0.08}>
              <blockquote className="rounded-2xl border border-border/60 bg-card p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < r.rating ? "fill-gold text-gold" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/85">
                  &quot;{r.comment}&quot;
                </p>
                <footer className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  — {r.user.name}
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-3xl bg-gradient-cream p-10 text-center shadow-md">
            <h2 className="font-serif text-4xl">Get first look</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Join our letter for new drops, seller stories, and quiet sales —
              twice a month, never more.
            </p>
            <NewsletterForm />
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  light = false,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
}) {
  return (
    <div>
      <span
        className={`text-xs font-medium uppercase tracking-widest ${light ? "text-gold" : "text-muted-foreground"}`}
      >
        {eyebrow}
      </span>
      <h2 className="mt-2 font-serif text-4xl sm:text-5xl">{title}</h2>
    </div>
  );
}