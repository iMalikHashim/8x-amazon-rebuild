"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ChevronRight, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { departmentMenuGroups } from "@/data/categories";
import { useAuth } from "@/lib/auth-context";

export function DepartmentMenu() {
  const { user } = useAuth();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 h-full px-2 py-2 text-sm font-medium hover:outline hover:outline-1 hover:outline-white/70 rounded-xs"
        >
          <Menu size={20} />
          <span>All</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 data-[state=open]:animate-[overlay-fade-in_150ms_ease-out]" />
        <Dialog.Content
          className="fixed left-0 top-0 bottom-0 z-50 w-[320px] max-w-[86vw] bg-white flex flex-col outline-none data-[state=open]:animate-[panel-slide-in_200ms_ease-out]"
          aria-describedby={undefined}
          aria-modal="true"
        >
          <div className="bg-header text-white px-3 py-3 flex items-center gap-3 shrink-0">
            <Dialog.Close aria-label="Close menu" className="p-1 -m-1">
              <X size={22} />
            </Dialog.Close>
            <Dialog.Title asChild>
              <h2 className="flex items-center gap-2 text-lg font-bold m-0">
                <CircleUserRound size={26} aria-hidden="true" />
                {user ? `Hello, ${user.name}` : "Hello, sign in"}
              </h2>
            </Dialog.Title>
          </div>

          <div className="flex-1 overflow-y-auto">
            {departmentMenuGroups.map((group, idx) => (
              <div key={group.title} className={`py-3 ${idx > 0 ? "border-t border-border" : ""}`}>
                <h3 className="px-4 pb-1 font-bold text-base text-text">{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Dialog.Close asChild>
                        <Link
                          href={item.href ?? "#"}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-text hover:bg-page-bg"
                        >
                          {item.label}
                          <ChevronRight size={16} className="text-text-secondary" />
                        </Link>
                      </Dialog.Close>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
