import Link from "next/link";
import { BackToTopButton } from "@/components/layout/BackToTopButton";

function outOfScope(feature: string): string {
  return `/out-of-scope?feature=${encodeURIComponent(feature)}`;
}

const COLUMNS = [
  {
    title: "Get to Know Us",
    links: [
      { label: "Careers", href: outOfScope("Careers") },
      { label: "About Amazon Rebuild", href: outOfScope("About Amazon Rebuild") },
      { label: "Investor Relations", href: outOfScope("Investor Relations") },
      { label: "Amazon Devices", href: outOfScope("Amazon Devices") },
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      { label: "Sell on Amazon Rebuild", href: outOfScope("Sell") },
      { label: "Become an Affiliate", href: outOfScope("Become an Affiliate") },
      { label: "Advertise Your Products", href: outOfScope("Advertise Your Products") },
      { label: "Host an Amazon Hub", href: outOfScope("Host an Amazon Hub") },
    ],
  },
  {
    title: "Payment Products",
    links: [
      { label: "Business Card", href: outOfScope("Business Card") },
      { label: "Shop with Points", href: outOfScope("Shop with Points") },
      { label: "Reload Your Balance", href: outOfScope("Reload Your Balance") },
      { label: "Currency Converter", href: outOfScope("Currency Converter") },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/account" },
      { label: "Returns & Orders", href: "/account/orders" },
      { label: "Shipping Rates & Policies", href: "/help" },
      { label: "Help", href: "/help" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-nav-secondary text-white mt-8">
      <BackToTopButton />

      <div className="max-w-[1000px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 px-6 py-10">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-bold text-sm mb-3">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-white/80 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/20">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center gap-3 px-6 py-6 text-xs text-white/70">
          <span className="text-lg font-bold text-white">amazon</span>
          <p className="text-center max-w-md">
            This is a portfolio rebuild built for a take-home assignment. Not affiliated with
            Amazon.com, Inc.
          </p>
          <p>&copy; {new Date().getFullYear()} 8x Amazon Rebuild</p>
        </div>
      </div>
    </footer>
  );
}
