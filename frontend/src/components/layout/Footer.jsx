import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              CS
            </span>
            <span className="text-lg">CampusShare</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-500">
            Your campus marketplace for sharing, renting, selling and giving away items with
            fellow students.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link to="/listings" className="hover:text-brand-600">Browse listings</Link></li>
            <li><Link to="/listings?listingType=Rent" className="hover:text-brand-600">Rent items</Link></li>
            <li><Link to="/listings?listingType=Sell" className="hover:text-brand-600">Buy items</Link></li>
            <li><Link to="/listings?listingType=GiveAway" className="hover:text-brand-600">Free giveaways</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link to="/login" className="hover:text-brand-600">Log in</Link></li>
            <li><Link to="/register" className="hover:text-brand-600">Sign up</Link></li>
            <li><Link to="/listings/create" className="hover:text-brand-600">Create a listing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900">About</h4>
          <p className="mt-3 text-sm text-ink-500">
            Built by students, for students — a safer, simpler way to share resources on campus.
          </p>
        </div>
      </div>
      <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} CampusShare. Made for campus communities.
      </div>
    </footer>
  );
}
