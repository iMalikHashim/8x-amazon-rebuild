import Link from "next/link";
import { BackToTopButton } from "@/components/layout/BackToTopButton";

const COLUMNS = [
  {
    title: "Get to Know Us",
    links: ["Careers", "About Amazon Rebuild", "Investor Relations", "Amazon Devices"],
  },
  {
    title: "Make Money with Us",
    links: ["Sell on Amazon Rebuild", "Become an Affiliate", "Advertise Your Products", "Host an Amazon Hub"],
  },
  {
    title: "Payment Products",
    links: ["Business Card", "Shop with Points", "Reload Your Balance", "Currency Converter"],
  },
  {
    title: "Let Us Help You",
    links: ["Your Account", "Returns & Orders", "Shipping Rates & Policies", "Help"],
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
              {col.links.map((label) => (
                <li key={label}>
                  <Link href="#" className="text-xs text-white/80 hover:underline">
                    {label}
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
