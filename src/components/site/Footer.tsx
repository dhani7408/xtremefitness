import Link from "next/link";
import { Dumbbell, Instagram, Facebook, Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-white/80">
      <div className="section grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xl font-extrabold text-white">
            <Dumbbell className="h-6 w-6 text-brand" />
            XTREME<span className="text-brand">FITNESS</span>
          </div>
          <p className="text-sm leading-6">
            Premium unisex gym in SCO-5D, 2nd Floor, City Square, Sec-127, Sante Majra, Kharar. Modern equipment, certified trainers, and group classes.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/classes" className="hover:text-white">Classes</Link></li>
            <li><Link href="/trainers" className="hover:text-white">Trainers</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/pricing" className="hover:text-white">Membership</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-brand" /> SCO-5D, 2nd Floor, City Square, Sec-127, Sante Majra, Kharar</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" /> +91 70092 73963, +91 76968 89589</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> 5:00 AM — 10:00 PM</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Follow</h4>
          <div className="flex gap-3">
            <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-brand"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-brand"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Xtreme Fitness Gym. All rights reserved.
      </div>
    </footer>
  );
}
