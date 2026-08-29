import React, { useState } from "react";
import { toast } from "sonner";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Subscribed! Check your inbox for your 15% off welcome code.");
    setEmail("");
  };

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-20 lg:py-16 text-zinc-900">
      <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:text-left">
          {/* Left Heading */}
          <div className="lg:col-span-6 max-w-2xl">
            <span className="text-[12px] font-extrabold tracking-[0.25em] text-[#520618] block mb-2">
              JOIN THE CLUB
            </span>
            <h3 className="font-sans text-2xl sm:text-3xl lg:text-4xl leading-tight font-normal text-zinc-900">
              Sign up to receive our emails and enjoy 15% off your first order.
            </h3>
          </div>

          {/* Right Form */}
          <div className="w-full lg:col-span-6 mt-8 lg:mt-0 max-w-xl lg:ml-auto">
            <form onSubmit={handleSubscribe} className="w-full">
              <div className="flex items-stretch border border-zinc-300 bg-zinc-50 overflow-hidden focus-within:border-[#520618] focus-within:bg-white transition-colors shadow-xs">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address…"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-4 sm:px-5 py-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none font-sans"
                />
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-4 bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors shrink-0 cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
