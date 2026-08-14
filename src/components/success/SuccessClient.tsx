"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { confirmOrder } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";

export function SuccessClient() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}

function SuccessInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { clear } = useCart();
  const ran = useRef(false);

  const [state, setState] = useState<"checking" | "ok" | "error">(() => {
    const s = params.get("session_id");
    const o = params.get("order_id");
    return s && o ? "checking" : "error";
  });

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const sessionId = params.get("session_id");
    const orderId = params.get("order_id");
    if (!sessionId || !orderId) return;

    (async () => {
      try {
        await confirmOrder(orderId, sessionId);
        clear();
        setState("ok");
      } catch {
        setState("error");
      }
    })();
  }, [params, clear]);

  if (state === "checking") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Confirming your payment…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/15 text-destructive">
          <XCircle className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-serif text-4xl">Payment not confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn&apos;t confirm your payment. Check your orders or try again.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <Link href="/checkout"><Button variant="outline">Back to checkout</Button></Link>
          <Link href="/dashboard/buyer"><Button className="bg-gradient-hero text-primary-foreground hover:opacity-90">View my orders</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h1 className="mt-6 font-serif text-5xl">Thank you</h1>
      <p className="mt-3 text-sm text-muted-foreground">Your payment succeeded. Order details are in your dashboard.</p>
      <div className="mt-8 flex justify-center gap-2">
        <Link href="/dashboard/buyer"><Button variant="outline">View my orders</Button></Link>
        <Button onClick={() => router.push("/products")} className="bg-gradient-hero text-primary-foreground hover:opacity-90">Keep shopping</Button>
      </div>
    </div>
  );
}