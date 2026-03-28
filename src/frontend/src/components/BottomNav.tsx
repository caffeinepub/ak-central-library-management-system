import type { LibraryRole } from "@/lib/storage";
import { BookOpen, Grid, Home, RefreshCw, User } from "lucide-react";

export type AppPage =
  | "dashboard"
  | "books"
  | "circulation"
  | "more"
  | "account"
  | "gate"
  | "journals"
  | "magazines"
  | "eresources"
  | "fines"
  | "analytics"
  | "users"
  | "rules";

interface BottomNavProps {
  current: AppPage;
  onNavigate: (page: AppPage) => void;
  role: LibraryRole;
}

const tabs = [
  { id: "dashboard" as AppPage, label: "Home", Icon: Home },
  { id: "books" as AppPage, label: "Books", Icon: BookOpen },
  { id: "circulation" as AppPage, label: "Circ.", Icon: RefreshCw },
  { id: "more" as AppPage, label: "More", Icon: Grid },
  { id: "account" as AppPage, label: "Account", Icon: User },
];

export default function BottomNav({
  current,
  onNavigate,
  role: _role,
}: BottomNavProps) {
  return (
    <nav className="lib-bottom-nav no-print" aria-label="Main navigation">
      <div className="flex h-16">
        {tabs.map(({ id, label, Icon }) => {
          const isActive =
            current === id ||
            (id === "more" &&
              !["dashboard", "books", "circulation", "account"].includes(
                current,
              ));
          return (
            <button
              key={id}
              type="button"
              data-ocid={`nav.${id}.link`}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "text-lib-red"
                  : "text-muted-foreground hover:text-lib-red-light"
              }`}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-lib-red/10" : ""}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-semibold leading-none ${isActive ? "text-lib-red" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
