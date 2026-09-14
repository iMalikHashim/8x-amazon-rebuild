import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import { DepartmentMenu } from "@/components/layout/DepartmentMenu";
import { AccountFlyout } from "@/components/layout/AccountFlyout";
import { CartBadge } from "@/components/layout/CartBadge";

const SECONDARY_LINKS = [
  { label: "Prime Video", href: "#" },
  { label: "Coupons", href: "#" },
  { label: "Customer Service", href: "#" },
  { label: "Today's Deals", href: "#" },
  { label: "Registry", href: "#" },
  { label: "Gift Cards", href: "#" },
  { label: "Sell", href: "#" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-header text-white">
        <div className="mx-auto max-w-[1500px] flex flex-wrap sm:flex-nowrap items-center gap-1.5 px-2 sm:px-3 py-2">
          <div className="order-1">
            <Logo />
          </div>

          <button
            type="button"
            className="hidden lg:flex order-2 flex-col justify-center leading-tight px-2 py-1 hover:outline hover:outline-1 hover:outline-white/70 rounded-xs text-left"
          >
            <span className="flex items-center gap-1 text-xs text-white/90">
              <MapPin size={14} /> Deliver to
            </span>
            <span className="text-sm font-bold">United States</span>
          </button>

          <div className="order-4 sm:order-3 basis-full sm:basis-0 sm:flex-1 sm:min-w-0 mt-2 sm:mt-0">
            <SearchBar />
          </div>

          <button
            type="button"
            className="hidden lg:flex order-4 items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-white/70 rounded-xs text-sm font-bold"
          >
            EN <ChevronDown size={14} />
          </button>

          <div className="order-2 sm:order-5">
            <AccountFlyout />
          </div>

          <Link
            href="/account/orders"
            className="hidden md:flex order-6 flex-col justify-center leading-tight px-2 py-1 hover:outline hover:outline-1 hover:outline-white/70 rounded-xs"
          >
            <span className="text-xs text-white/90">Returns</span>
            <span className="text-sm font-bold">&amp; Orders</span>
          </Link>

          <div className="order-3 sm:order-7">
            <CartBadge />
          </div>
        </div>
      </div>

      <div className="bg-nav-secondary text-white">
        <div className="mx-auto max-w-[1500px] flex items-center gap-0.5 px-1 sm:px-3 py-1.5 overflow-x-auto no-scrollbar text-sm">
          <DepartmentMenu />
          {SECONDARY_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="whitespace-nowrap px-2 py-1 hover:outline hover:outline-1 hover:outline-white/70 rounded-xs"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
