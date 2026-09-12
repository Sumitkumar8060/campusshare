import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShoppingBag,
  Repeat,
  Gift,
  ShieldCheck,
  Search,
  MessageCircle,
  Handshake,
} from "lucide-react";
import { getItems } from "@/api/items";
import { Button } from "@/components/ui/Button";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  {
    type: "Sell",
    title: "Sell",
    desc: "Turn things you no longer need into cash.",
    icon: ShoppingBag,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    type: "Rent",
    title: "Rent",
    desc: "Borrow gear for a day, a week, or a semester.",
    icon: Repeat,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    type: "GiveAway",
    title: "Give Away",
    desc: "Pass items on to a fellow student, free.",
    icon: Gift,
    tone: "bg-emerald-50 text-emerald-600",
  },
];

const steps = [
  {
    icon: Search,
    title: "Discover",
    desc: "Browse listings from students on your campus by category and type.",
  },
  {
    icon: MessageCircle,
    title: "Request",
    desc: "Send a request with a short message to the owner of an item.",
  },
  {
    icon: Handshake,
    title: "Connect",
    desc: "Once accepted, coordinate directly to hand off the item.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  const { data: recentItems, isLoading } = useQuery({
    queryKey: ["items", "recent"],
    queryFn: () => getItems({ available: "true" }),
  });

  const featured = (recentItems || []).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              Built for your campus community
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
              Find what you need.
              <br />
              Share what you don't.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-500">
              Rent, sell, share, and give away items with students on your campus. CampusShare
              makes it simple to save money and reduce waste — together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/listings">
                <Button size="lg">
                  Browse listings <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={isAuthenticated ? "/listings/create" : "/register"}>
                <Button size="lg" variant="secondary">
                  {isAuthenticated ? "Create a listing" : "Join CampusShare"}
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              {categories.map((c) => (
                <div
                  key={c.type}
                  className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm first:col-span-2"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.tone}`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-semibold text-ink-900">{c.title}</p>
                  <p className="mt-1 text-sm text-ink-500">{c.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category CTAs (mobile-visible) */}
      <section className="container-page -mt-2 py-10 lg:hidden">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.type} to={`/listings?listingType=${c.type}`}>
              <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.tone}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-semibold text-ink-900">{c.title}</p>
                <p className="mt-1 text-sm text-ink-500">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">Recently listed</h2>
            <p className="mt-1 text-ink-500">Fresh items from students near you.</p>
          </div>
          <Link to="/listings" className="hidden text-sm font-semibold text-brand-600 hover:underline sm:block">
            View all →
          </Link>
        </div>
        <ListingGrid
          items={featured}
          isLoading={isLoading}
          emptyAction={{ label: "Browse all listings", href: "/listings" }}
        />
        <div className="mt-8 text-center sm:hidden">
          <Link to="/listings">
            <Button variant="secondary">View all listings</Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-ink-200 bg-white py-16">
        <div className="container-page">
          <h2 className="text-center text-2xl font-bold text-ink-900">How CampusShare works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / safety */}
      <section className="container-page py-16">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-ink-200 bg-brand-50/50 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-ink-900">A community you can trust</h2>
          <p className="max-w-xl text-ink-500">
            Every listing and request goes through registered students on your campus. Coordinate
            handoffs in person and keep transactions on campus grounds for a safer experience.
          </p>
          <Link to={isAuthenticated ? "/listings/create" : "/register"}>
            <Button size="lg">{isAuthenticated ? "Create your first listing" : "Get started free"}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
