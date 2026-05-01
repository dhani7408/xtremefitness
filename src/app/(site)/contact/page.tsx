"use client";
import { useState } from "react";
import { Phone, MapPin, Clock, Mail } from "lucide-react";

export default function ContactPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <>
      <section
        className="parallax-bg relative flex h-[45vh] items-center justify-center text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,11,13,0.75), rgba(11,11,13,0.75)), url(https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1800&auto=format&fit=crop)",
        }}
      >
        <div className="section">
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">Get in Touch</h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Drop by, call, or book a free trial right here. We&apos;d love to meet you.
          </p>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="section grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-extrabold">Visit us</h2>
            <p className="mt-3 text-ink-700">
              Drop in for a tour or book a free trial. We&apos;d love to meet you.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-brand" />
                <span>SCO-5D, 2nd Floor, City Square, Sec-127, Sante Majra, Kharar, Punjab</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand" /> +91 70092 73963, +91 76968 89589
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand" /> info@xtremefitness.in
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-brand" /> Mon-Sun, 5:00 AM - 10:00 PM
              </li>
            </ul>
          </div>
          <div>
            <form className="card space-y-4 p-6" onSubmit={onSubmit}>
              <h2 className="text-xl font-bold">Book a Free Trial</h2>
              {done && (
                <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  Thanks! We&apos;ll reach out shortly.
                </div>
              )}
              <div>
                <label className="label">Name</label>
                <input className="input" name="name" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" name="phone" required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" name="email" type="email" />
                </div>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input" rows={4} name="message" />
              </div>
              <button disabled={loading} className="btn btn-primary w-full">
                {loading ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
