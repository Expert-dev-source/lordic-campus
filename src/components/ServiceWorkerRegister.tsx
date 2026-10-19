"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ServiceWorkerRegister() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    const serviceWorker = navigator.serviceWorker;
    const cacheCurrentPage = () => {
      serviceWorker.controller?.postMessage({
        type: "CACHE_PAGE",
        path: pathnameRef.current,
      });
    };

    const handleOfflineLink = (event: MouseEvent) => {
      if (navigator.onLine) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target.toLowerCase() !== "_self") return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.href === window.location.href) return;
      if (destination.pathname === window.location.pathname && destination.hash) return;

      // Full document navigations let the service worker serve a saved page snapshot.
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(destination.href);
    };

    serviceWorker.addEventListener("controllerchange", cacheCurrentPage);
    window.addEventListener("click", handleOfflineLink, true);

    void serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(cacheCurrentPage)
      .catch((error: unknown) => {
        console.warn("Lordic Campus offline support could not be enabled.", error);
      });

    cacheCurrentPage();

    return () => {
      serviceWorker.removeEventListener("controllerchange", cacheCurrentPage);
      window.removeEventListener("click", handleOfflineLink, true);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.controller?.postMessage({
        type: "CACHE_PAGE",
        path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
