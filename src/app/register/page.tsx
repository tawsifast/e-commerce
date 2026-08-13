import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Reveal } from "@/components/site/Reveal";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="flex items-center justify-center order-2 lg:order-1">
        <RegisterForm />
      </div>

      <Reveal y={0} className="hidden flex-col justify-between rounded-3xl bg-gradient-hero p-10 text-primary-foreground lg:flex order-1 lg:order-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold">Marketa</span>
          <h2 className="mt-6 font-serif text-5xl leading-tight">A calmer way to shop and sell online.</h2>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/75">
            Free to browse, always. Free to list your first product. Fair fees when you make a sale.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-primary-foreground/80">
          <li>· No hidden fees</li>
          <li>· Buyer &amp; seller protection</li>
          <li>· Ships worldwide</li>
        </ul>
      </Reveal>
    </div>
  );
}