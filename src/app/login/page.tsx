import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Reveal } from "@/components/site/Reveal";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <Reveal y={0} className="hidden flex-col justify-between rounded-3xl bg-gradient-hero p-10 text-primary-foreground lg:flex">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold">Marketa</span>
          <h2 className="mt-6 font-serif text-5xl leading-tight">Welcome back to the marketplace you helped build.</h2>
        </div>
        <blockquote className="border-l-2 border-gold pl-4 text-sm italic text-primary-foreground/80">
          &quot;Marketa is the first shop I actually enjoy opening every morning.&quot;
          <footer className="mt-2 not-italic text-primary-foreground/60">— A seller, three months in</footer>
        </blockquote>
      </Reveal>

      <div className="flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}