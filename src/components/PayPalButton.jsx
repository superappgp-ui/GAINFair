// src/components/PayPalButton.jsx
import React, { useEffect, useRef, useState } from "react";

const CLIENT_ID = (import.meta.env.VITE_PAYPAL_CLIENT_ID || "").trim();

function injectSdk(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.defer = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => (window.paypal ? resolve() : reject(new Error("SDK loaded but window.paypal undefined")));
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(script);
  });
}

export default function PayPalButton({
  amount = "1.00",
  currency = "USD",
  onSuccess,
  onError,
  onCancel,
  style,
  // Optional: control funding buttons
  enableFunding,
  disableFunding
}) {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!CLIENT_ID) {
        setErr("Missing PayPal Client ID. Set VITE_PAYPAL_CLIENT_ID.");
        return;
      }

      // Remove any stale SDK tag & namespace
      const existing = document.querySelector('script[data-paypal-sdk]');
      if (existing) existing.remove();
      delete window.paypal;

      // Use MINIMAL, highly-compatible params
      const params = new URLSearchParams({
        "client-id": CLIENT_ID,
        currency,
      });

      // NOTE: We do NOT set intent/components here to avoid 400s.
      // Funding tweaks (optional) are done via query params below.
      if (enableFunding) params.set("enable-funding", enableFunding);
      if (disableFunding) params.set("disable-funding", disableFunding);

      const sdkUrl = `https://www.paypal.com/sdk/js?${params.toString()}`;
      try {
        await injectSdk(sdkUrl);
        setReady(true);
      } catch (e) {
        setErr("Failed to load PayPal SDK.");
      }
    })();
  }, [currency, enableFunding, disableFunding]);

  useEffect(() => {
    if (!ready || !window.paypal || !containerRef.current) return;
    if (!amount || Number(amount) <= 0) {
      setErr("Invalid amount for PayPal payment.");
      return;
    }

    containerRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: style || { layout: "vertical", shape: "rect", label: "paypal" },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: currency,
                  value: String(Number(amount).toFixed(2)),
                },
              },
            ],
            application_context: { shipping_preference: "NO_SHIPPING" },
          });
        },
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture();
            onSuccess && onSuccess(details);
          } catch (e) {
            onError && onError(e);
          }
        },
        onError: (e) => onError && onError(e),
        onCancel: () => onCancel && onCancel(),
      })
      .render(containerRef.current);
  }, [ready, amount, currency, style, onSuccess, onError, onCancel]);

  if (err) return <div className="text-sm text-red-600">PayPal: {err}</div>;
  return <div ref={containerRef} />;
}
