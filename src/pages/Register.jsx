// src/pages/register.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import PayPalButton from "../components/PayPalButton";

/* ---------------------------------- Data ---------------------------------- */

// Registration products (role-based, USD)
const registrationProducts = [
  { id: "user_free", label: "User (Free Registration)", amount: 0, currency: "USD", kind: "user" },
  { id: "exhibitor", label: "Exhibitor", amount: 950, currency: "USD", kind: "exhibitor" },
  { id: "agent", label: "Agent", amount: 250, currency: "USD", kind: "agent" },
  { id: "sponsor_s", label: "Sponsor — Silver", amount: 1000, currency: "USD", kind: "sponsor", tier: "silver" },
  { id: "sponsor_g", label: "Sponsor — Gold", amount: 1500, currency: "USD", kind: "sponsor", tier: "gold" },
  { id: "sponsor_p", label: "Sponsor — Platinum", amount: 2000, currency: "USD", kind: "sponsor", tier: "platinum" }
];

// Optional add-ons (VND converted to USD for display and payment)
const tickets = [
  { id: "workshop", name: "Workshop Pass", amountVND: 150000, amountUSD: 6.25, desc: "IELTS/TOEFL sessions" },
  { id: "vip", name: "VIP Advising", amountVND: 500000, amountUSD: 20.83, desc: "1-on-1 advising slot" }
];

/* ----------------------------- Email (optional) ---------------------------- */
// Uses Firebase “Trigger Email from Firestore” extension by writing to /mail.
async function sendAcknowledgementEmail({ to, name, registrationSummary }) {
  try {
    await addDoc(collection(db, "mail"), {
      to,
      message: {
        subject: "GAIN FAIR 2025 — Registration Received",
        html: `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
            <h2 style="margin:0 0 8px;">Thanks for registering, ${name}!</h2>
            <p style="color:#475569;margin:0 0 16px;">We’ve received your registration for GAIN FAIR 2025.</p>
            <div style="background:#f8fafc;border-radius:8px;padding:12px;border-left:4px solid #0EA5E9;">
              ${registrationSummary}
            </div>
            <p style="color:#475569;margin:16px 0 0;">We’ll follow up with any next steps. See you at the event!</p>
            <p style="color:#64748B;margin:8px 0 0;">— GAIN FAIR Team</p>
          </div>`
      },
      createdAt: serverTimestamp()
    });
  } catch {
    // Swallow errors — email is “best effort” and shouldn’t block registration.
  }
}

/* --------------------------------- Page ---------------------------------- */

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    organization: "",
    registration_product_id: "user_free",
    add_ons: []
  });

  const [errors, setErrors] = React.useState({});
  const [showPayPal, setShowPayPal] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const selectedProduct = React.useMemo(
    () => registrationProducts.find(p => p.id === formData.registration_product_id),
    [formData.registration_product_id]
  );

  const requiresOrganization =
    selectedProduct && ["agent", "exhibitor", "sponsor"].includes(selectedProduct.kind);

  const addOnsTotal = React.useMemo(
    () =>
      formData.add_ons.reduce((sum, addonId) => {
        const addon = tickets.find(t => t.id === addonId);
        return sum + (addon ? addon.amountUSD : 0);
      }, 0),
    [formData.add_ons]
  );

  const totalAmount = (selectedProduct?.amount || 0) + addOnsTotal;

  /* --------------------------- Firestore mutation --------------------------- */

  const createRegistrationMutation = useMutation({
    mutationFn: async (registrationData) => {
      const docRef = await addDoc(collection(db, "registrations"), {
        ...registrationData,
        created_date: serverTimestamp()
      });
      return { id: docRef.id };
    },
    onSuccess: ({ id }) => {
      navigate(createPageUrl("RegistrationSuccess") + `?id=${id}`);
    }
  });

  /* ------------------------------ Form helpers ----------------------------- */

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (requiresOrganization && !formData.organization.trim()) {
      newErrors.organization = "Organization is required for this registration type";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  /* --------------------------------- Submit -------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (totalAmount === 0) {
      // Free registration — write immediately
      const registrationData = {
        ...formData,
        attendee_type: selectedProduct.kind,
        amount: 0,
        currency: "USD",
        payment_status: "free",
        review_status: "pending"
      };
      createRegistrationMutation.mutate(registrationData);

      // optional: send quick acknowledgement
      sendAcknowledgementEmail({
        to: formData.email,
        name: formData.name,
        registrationSummary: `<strong>Type:</strong> ${selectedProduct.label}<br/><strong>Amount:</strong> FREE`
      });
    } else {
      // Paid — proceed to PayPal
      setShowPayPal(true);
    }
  };

  /* ------------------------------ PayPal hooks ----------------------------- */

  const handlePayPalSuccess = async (paymentDetails) => {
    setIsProcessing(true);

    const registrationData = {
      ...formData,
      attendee_type: selectedProduct.kind,
      amount: Number(totalAmount.toFixed(2)),
      currency: "USD",
      payment_status: "paid",
      review_status: "pending",
      paypal_order_id: paymentDetails.orderId
    };

    try {
      await createRegistrationMutation.mutateAsync(registrationData);

      // optional: email receipt/ack
      const addOnsText =
        formData.add_ons.length > 0
          ? `<br/><strong>Add-ons:</strong> ${formData.add_ons
              .map(id => tickets.find(t => t.id === id)?.name)
              .filter(Boolean)
              .join(", ")}`
          : "";

      sendAcknowledgementEmail({
        to: formData.email,
        name: formData.name,
        registrationSummary: `<strong>Type:</strong> ${selectedProduct.label}<br/><strong>Total:</strong> $${totalAmount.toFixed(
          2
        )} USD${addOnsText}<br/><strong>PayPal Order ID:</strong> ${paymentDetails.orderId}`
      });
    } catch (error) {
      setIsProcessing(false);
      setErrors({
        payment:
          "Registration failed after payment. Please contact support with order ID: " +
          paymentDetails.orderId
      });
    }
  };

  const handlePayPalError = (error) => {
    setIsProcessing(false);
    setErrors({ payment: "Payment failed. Please try again or contact support." });
    console.error("PayPal error:", error);
  };

  const handlePayPalCancel = () => {
    setShowPayPal(false);
    setErrors({ payment: "Payment was cancelled." });
  };

  /* ---------------------------------- UI ----------------------------------- */

  if (showPayPal) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0B132B] mb-2">Complete Payment</h1>
            <p className="text-[#64748B]">Please complete your payment to finalize your registration</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#64748B]">Registration Type</span>
                  <span className="font-semibold">{selectedProduct?.label}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#64748B]">Registration Amount</span>
                  <span className="font-semibold">${selectedProduct?.amount} USD</span>
                </div>

                {formData.add_ons.length > 0 && (
                  <>
                    <div className="border-t my-2 pt-2">
                      <div className="text-sm font-semibold text-[#64748B] mb-2">Add-ons:</div>
                      {formData.add_ons.map(addonId => {
                        const addon = tickets.find(t => t.id === addonId);
                        return addon ? (
                          <div key={addonId} className="flex justify-between items-center text-sm mb-1">
                            <span className="text-[#64748B]">
                              {addon.name} ({addon.amountVND.toLocaleString()} VND)
                            </span>
                            <span className="font-medium">${addon.amountUSD.toFixed(2)} USD</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-[#64748B]">Add-ons Subtotal</span>
                      <span className="font-semibold">${addOnsTotal.toFixed(2)} USD</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#64748B]">Name</span>
                  <span className="font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#64748B]">Email</span>
                  <span className="font-semibold">{formData.email}</span>
                </div>
                <div className="border-t mt-3 pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-[#0EA5E9]">
                    ${totalAmount.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {errors.payment && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.payment}</AlertDescription>
                </Alert>
              )}

              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0EA5E9] mr-2" />
                  <span>Processing your registration...</span>
                </div>
              ) : (
                <>
                  <PayPalButton
                    amount={totalAmount}
                    currency="USD"
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                    onCancel={handlePayPalCancel}
                  />

                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setShowPayPal(false)} disabled={isProcessing}>
                      Back to Registration Form
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-[#64748B]">
            <p>Secure payment powered by PayPal</p>
            <p className="mt-1">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B132B] mb-4">
            Register for GAIN FAIR 2025
          </h1>
          <p className="text-xl text-[#64748B]">
            Secure your spot at Vietnam's premier education and immigration event
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Registration type */}
          <Card className="bg-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Registration Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="registration_product_id">Select Your Registration *</Label>
                <Select
                  value={formData.registration_product_id}
                  onValueChange={(value) => handleInputChange("registration_product_id", value)}
                >
                  <SelectTrigger id="registration_product_id">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {registrationProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.label} - {product.amount === 0 ? "Free" : `$${product.amount} ${product.currency}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-[#64748B] mt-2">
                  {selectedProduct?.amount === 0 
                    ? "Free general admission includes expo floor access and main talks" 
                    : "Paid registrations include all benefits plus exclusive sessions"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your info */}
          <Card className="bg-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+84 xxx xxx xxx"
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter your country"
                />
                {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
              </div>

              {requiresOrganization && (
                <div>
                  <Label htmlFor="organization">Organization *</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => handleInputChange("organization", e.target.value)}
                    placeholder="Enter your organization name"
                  />
                  {errors.organization && <p className="text-sm text-red-500 mt-1">{errors.organization}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card className="bg-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Optional Add-Ons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#64748B] mb-4">
                Enhance your experience with these optional workshops (prices converted to USD for payment)
              </p>
              {tickets.map(ticket => (
                <div key={ticket.id} className="flex items-start gap-3 p-4 border rounded-lg hover:border-[#0EA5E9] transition-colors">
                  <Checkbox
                    id={ticket.id}
                    checked={formData.add_ons.includes(ticket.id)}
                    onCheckedChange={(checked) => {
                      const newAddOns = checked
                        ? [...formData.add_ons, ticket.id]
                        : formData.add_ons.filter(id => id !== ticket.id);
                      handleInputChange("add_ons", newAddOns);
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor={ticket.id} className="font-semibold cursor-pointer">
                      {ticket.name}
                    </Label>
                    <p className="text-sm text-[#64748B]">{ticket.desc}</p>
                    <div className="mt-1">
                      <p className="text-sm font-medium text-[#0EA5E9]">
                        {ticket.amountVND.toLocaleString()} VND
                      </p>
                      <p className="text-xs text-[#64748B]">≈ ${ticket.amountUSD.toFixed(2)} USD</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="space-y-3">
                {selectedProduct && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Registration</span>
                    <span className="font-semibold text-[#0B132B]">
                      {selectedProduct.amount === 0 ? "FREE" : `$${selectedProduct.amount} USD`}
                    </span>
                  </div>
                )}
                {formData.add_ons.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Add-ons</span>
                    <span className="font-semibold text-[#0B132B]">${addOnsTotal.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#0B132B]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#0EA5E9]">
                    {totalAmount === 0 ? "FREE" : `$${totalAmount.toFixed(2)} USD`}
                  </span>
                </div>
              </div>

              {totalAmount > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You will be redirected to PayPal to complete your payment securely in USD.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-lg py-6"
            disabled={createRegistrationMutation.isPending || isProcessing}
          >
            {createRegistrationMutation.isPending || isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : totalAmount === 0 ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Complete Free Registration
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>

          {createRegistrationMutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Registration failed. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}
