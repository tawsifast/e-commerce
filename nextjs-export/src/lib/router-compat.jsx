"use client";
/**
 * Compat shim so components originally written for @tanstack/react-router
 * keep working under Next.js App Router without rewriting every file.
 *
 * Supported (translated to Next equivalents):
 *   - <Link to="/path" params={{id}} search={{q}}> -> next/link <Link href=...>
 *   - useNavigate() -> returns ({to, params, search, replace}) => router.push/replace
 *   - useRouter() -> Next.js router (compatible-ish)
 *
 * NOT supported (intentional — Next.js has its own primitives):
 *   - createFileRoute / createRootRoute / Route.useSearch / validateSearch
 *     Replace those with Next.js file conventions + useSearchParams().
 */
import NextLink from "next/link";
import { useRouter as useNextRouter, usePathname, useSearchParams } from "next/navigation";
import { forwardRef, useMemo } from "react";

// Convert a `to` template like "/products/$id" + params {id: "abc"} to a real path
function resolveHref(to, params, search) {
  let path = to || "/";
  if (params && typeof path === "string") {
    for (const [k, v] of Object.entries(params)) {
      path = path.replaceAll(`$${k}`, encodeURIComponent(String(v)));
    }
  }
  if (search && typeof search === "object") {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(search)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const s = qs.toString();
    if (s) path += `?${s}`;
  }
  return path;
}

export const Link = forwardRef(function CompatLink(
  { to, href, params, search, activeProps, activeOptions, preload, replace, ...rest },
  ref,
) {
  const finalHref = href ?? resolveHref(to, params, search);
  return <NextLink ref={ref} href={finalHref} replace={replace} {...rest} />;
});

export function useNavigate() {
  const router = useNextRouter();
  return ({ to, params, search, replace, from } = {}) => {
    // support functional search (patch fn) — resolve against current search params via URL
    let resolvedSearch = search;
    if (typeof search === "function") {
      const url = new URL(window.location.href);
      const current = Object.fromEntries(url.searchParams.entries());
      resolvedSearch = search(current);
    }
    const href = resolveHref(to ?? window.location.pathname, params, resolvedSearch);
    if (replace) router.replace(href);
    else router.push(href);
  };
}

// Best-effort useRouter — matches the pieces our app uses (invalidate is a no-op)
export function useRouter() {
  const nextRouter = useNextRouter();
  return useMemo(
    () => ({
      ...nextRouter,
      invalidate: () => nextRouter.refresh(),
    }),
    [nextRouter],
  );
}

// Convenience re-exports for consumers using next hooks directly
export { usePathname, useSearchParams };

// Stubs — these should be replaced with Next.js equivalents in page files.
// Left here so accidental imports fail loudly instead of silently rendering broken UI.
export function createFileRoute() {
  throw new Error(
    "createFileRoute is not supported under Next.js App Router. " +
      "Move the route body into app/**/page.jsx and remove the createFileRoute wrapper.",
  );
}
export const createRootRouteWithContext = createFileRoute;
export const HeadContent = () => null;
export const Scripts = () => null;
export function Outlet() {
  return null;
}
