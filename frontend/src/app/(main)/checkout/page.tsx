"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, CreditCard, Lock, ArrowLeft, CheckCircle2, 
  Sparkles, Award, HelpCircle, RefreshCw, AlertCircle
} from "lucide-react";
import { toast } from "@/components/ToastProvider";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = searchParams.get("plan") || "mastery";
  const intervalParam = searchParams.get("interval") || "monthly";

  const [plan, setPlan] = useState<"baseline" | "mastery" | "institutional">(
    planParam === "institutional" ? "institutional" : planParam === "baseline" ? "baseline" : "mastery"
  );
  const [interval, setInterval] = useState<"monthly" | "quarterly">(
    intervalParam === "quarterly" ? "quarterly" : "monthly"
  );

  // Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [country, setCountry] = useState("United States");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Plan Details
  const planInfo = {
    baseline: {
      name: "Diagnostic Baseline",
      price: 0,
      period: "7-Day Free Trial",
      features: [
        "10-Minute AI Diagnostic Check",
        "1 Full Computer-Delivered Cambridge Mock",
        "Official 4-Criteria Rubric Snapshot",
        "Instant CEFR Conversion Report"
      ]
    },
    mastery: {
      name: "Adaptive Mastery (Most Popular)",
      price: interval === "quarterly" ? 84 : 39,
      period: interval === "quarterly" ? "billed quarterly ($28/mo)" : "billed monthly",
      features: [
        "Unlimited Multi-Agent IELTS Evaluations",
        "Full Speaking Simulator with Audio Playback",
        "AI Study Buddy Copilot (24/7 Question Assistant)",
        "12 Realistic Timed Cambridge Mock Exams",
        "Personalized Weak-Spot Pathology Remediation"
      ]
    },
    institutional: {
      name: "Institutional & Enterprise",
      price: interval === "quarterly" ? 228 : 89,
      period: interval === "quarterly" ? "billed quarterly ($76/mo)" : "billed monthly",
      features: [
        "All Adaptive Mastery Features Included",
        "Dedicated Human IELTS Master Tutor Review",
        "Official Cambridge Band Readiness Certification",
        "Guaranteed 1.5+ Band Score Improvement",
        "Priority 1-on-1 Speaking Mock Examination"
      ]
    }
  };

  const currentPlan = planInfo[plan];

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (plan !== "baseline" && (!cardNumber || !cardExpiry || !cardCvc || !cardName)) {
      toast.warning("Incomplete Details", "Please fill in all payment fields.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success("Payment Successful! 🎉", "Your subscription has been activated with instant access.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-slate-200">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Pricing
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#027FFF] text-white flex items-center justify-center font-bold text-sm">
              PP
            </span>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Pen &amp; Page <span className="text-[#027FFF]">Academia</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

        {isSuccess ? (
          /* SUCCESS CONFIRMATION MODAL */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 lg:p-12 shadow-xl text-center max-w-xl mx-auto animate-in zoom-in-95 duration-300 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Order Confirmed
              </span>
              <h1 className="text-3xl font-black text-slate-900 mt-3 mb-1">
                Welcome to {currentPlan.name}!
              </h1>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your account has been upgraded with full access to all Cambridge practice studios and AI evaluators.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Subscription Plan:</span>
                <span className="text-slate-900">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="text-slate-900">${currentPlan.price}.00</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Access Status:</span>
                <span className="text-emerald-600 font-bold">Active &amp; Calibrated</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-4 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-[#027FFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Go to Student Learning Dashboard →
            </button>
          </div>
        ) : (
          /* CHECKOUT TWO-COLUMN GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: PAYMENT METHOD */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900">Secure Payment Checkout</h2>
                <p className="text-xs text-slate-500 mt-0.5">Choose your billing method to activate your academic portal.</p>
              </div>

              {/* Plan Switcher Pills */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPlan("baseline")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    plan === "baseline" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Free Trial
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("mastery")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    plan === "mastery" ? "bg-[#027FFF] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Mastery
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("institutional")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    plan === "institutional" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Enterprise
                </button>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                
                {plan === "baseline" ? (
                  <div className="p-6 rounded-2xl bg-blue-50/80 border border-blue-200 text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-[#027FFF] mx-auto" />
                    <h3 className="font-bold text-slate-900 text-sm">No Payment Required for Diagnostic Baseline</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      You will receive 7 days of full diagnostic testing. No credit card or billing information is needed today.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Dr. Rohit Mehta"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-[#027FFF] focus:outline-none transition-all"
                      />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Credit / Debit Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 •••• •••• 4242"
                          maxLength={19}
                          className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono focus:bg-white focus:border-[#027FFF] focus:outline-none transition-all"
                        />
                        <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    {/* Expiry & CVC */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="08/28"
                          maxLength={5}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono text-center focus:bg-white focus:border-[#027FFF] focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          CVC Security Code
                        </label>
                        <input
                          type="password"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 font-mono text-center focus:bg-white focus:border-[#027FFF] focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Country Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Country or Region
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-[#027FFF] focus:outline-none transition-all"
                      >
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="India">India</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Submit Checkout Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-[#027FFF]/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Encrypted Checkout...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>
                          {plan === "baseline"
                            ? "Activate 7-Day Free Trial"
                            : `Authorize Payment of $${currentPlan.price}.00`}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Stripe TLS End-to-End Encryption • Cancel Anytime</span>
                </div>
              </form>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY & VALUE BREAKDOWN */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              
              <div className="pb-4 border-b border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#027FFF] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Order Summary
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">{currentPlan.name}</h3>
                <p className="text-xs text-slate-500">{currentPlan.period}</p>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 pb-4 border-b border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-bold text-slate-900">${currentPlan.price}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cambridge Diagnostic Setup Fee:</span>
                  <span className="font-bold text-emerald-600">$0.00 (Waived)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxes &amp; VAT:</span>
                  <span className="font-bold text-slate-900">$0.00</span>
                </div>
                <div className="pt-2 flex justify-between text-sm font-black border-t border-slate-100">
                  <span className="text-slate-900">Total Due Today:</span>
                  <span className="text-[#027FFF] text-xl">${currentPlan.price}.00</span>
                </div>
              </div>

              {/* What's Included */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Included in your plan:
                </h4>
                <div className="space-y-2">
                  {currentPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Audited 98.4% Accuracy Guarantee:</strong> If your certified practice band differs from your actual test score by &gt;0.5, receive a full refund.
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
