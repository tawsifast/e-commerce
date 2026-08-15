import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero text-2xl font-bold text-primary-foreground">
          M
        </span>
        <h1 className="mt-4 font-serif text-2xl tracking-tight text-foreground">Marketa</h1>
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </p>
      </div>
    </div>
  );
}