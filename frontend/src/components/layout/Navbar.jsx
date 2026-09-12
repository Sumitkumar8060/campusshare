import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, PlusCircle, LayoutDashboard, User, LogOut, ListChecks } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/listings", label: "Browse" },
];

const authedLinks = [
  { to: "/", label: "Home" },
  { to: "/listings", label: "Browse" },
  { to: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const links = isAuthenticated ? authedLinks : publicLinks;

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/80 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            CS
          </span>
          <span className="text-lg">CampusShare</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/listings/create">
                <Button variant="secondary" size="sm">
                  <PlusCircle className="h-4 w-4" />
                  Create Listing
                </Button>
              </Link>
              <NotificationBell />
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-ink-100">
                    <Avatar name={user?.name} src={user?.profileImage} size="sm" />
                  </button>
                }
              >
                <div className="border-b border-ink-100 px-3.5 py-2.5">
                  <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
                  <p className="truncate text-xs text-ink-500">{user?.email}</p>
                </div>
                <DropdownItem icon={LayoutDashboard} onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownItem>
                <DropdownItem icon={ListChecks} onClick={() => navigate("/my-listings")}>
                  My Listings
                </DropdownItem>
                <DropdownItem icon={User} onClick={() => navigate("/profile")}>
                  Profile
                </DropdownItem>
                <DropdownItem
                  icon={LogOut}
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50"
                >
                  Log out
                </DropdownItem>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-ink-200 bg-white md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-3">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-3.5 py-2.5 text-sm font-medium",
                      isActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-100"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/listings/create"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                  >
                    Create Listing
                  </NavLink>
                  <NavLink
                    to="/my-listings"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                  >
                    My Listings
                  </NavLink>
                  <NavLink
                    to="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                  >
                    Notifications
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="mt-2 flex gap-2 px-1">
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
