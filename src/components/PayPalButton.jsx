// src/components/PayPalButton.jsx
import React, { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

/**
 * Props:
 * - amount: string | number
 * - currency: 'USD' | 'CAD' | ...
 * - onSuccess(order) {}
 * - onError(err) {}
 * - onCancel() {}
 */
export default function PayPalButton({
  amount = "1.00",
  currency = "USD",
  onSuccess,
  onError,
  onCancel,
  style,
}) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!CLIENT_ID) {
      setErr("Missing VITE_PAYPAL_CLIENT_ID in .env.local");
      return;
    }

    // If SDK already loaded, just render
    if (window.paypal) {
      setReady(true);
      return;
    }

    // Load PayPal SDK
    const script = document.createElement("script");
    const params = new URLSearchParams({
      "client-id": CLIENT_ID,
      currency,
      intent: "CAPTURE",
      components: "buttons",
    });
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => setErr("Failed to load PayPal SDK");
    document.body.appendChild(script);

    return () => {
      // optional cleanup: don’t remove the script to allow reuse
    };
  }, [currency]);

  useEffect(() => {
    if (!ready || !containerRef.current || !window.paypal) return;

    // Clear any previous renders (Vite HMR etc.)
    containerRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          shape: "rect",
          label: "paypal",
          ...style,
        },
        createOrder: function (_, actions) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: String(amount ?? "0.00"),
                  currency_code: currency || "USD",
                },
              },
            ],
          });
        },
        onApprove: async function (_, actions) {
          try {
            const order = await actions.order.capture();
            onSuccess?.(order);
          } catch (e) {
            onError?.(e);
          }
        },
        onError: function (e) {
          onError?.(e);
        },
        onCancel: function () {
          onCancel?.();
        },
      })
      .render(containerRef.current);
  }, [ready, amount, currency, style, onSuccess, onError, onCancel]);

  if (err) {
    return (
      <div className="text-sm text-red-600">
        PayPal: {err}
      </div>
    );
  }

  return <div ref={containerRef} />;
}
