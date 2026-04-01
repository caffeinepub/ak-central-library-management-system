import type { LibraryRole } from "@/lib/storage";
import {
  BarChart2,
  BookMarked,
  ChevronRight,
  DoorOpen,
  Monitor,
  Newspaper,
  Receipt,
  ScrollText,
  Users,
} from "lucide-react";
import type { AppPage } from "./BottomNav";

interface MoreScreenProps {
  onNavigate: (page: AppPage) => void;
  role: LibraryRole;
}

interface MenuGroup {
  title: string;
  items: {
    icon: React.FC<{ size: number; className?: string }>;
    label: string;
    desc: string;
    page: AppPage;
    adminOnly?: boolean;
  }[];
}

export default function MoreScreen({ onNavigate, role }: MoreScreenProps) {
  const isAdmin = role === "Admin" || role === "Librarian";

  const groups: MenuGroup[] = [
    {
      title: "Library Services",
      items: [
        {
          icon: DoorOpen,
          label: "Gate Register",
          desc: "Log entries & exits",
          page: "gate",
        },
        {
          icon: BookMarked,
          label: "Journals",
          desc: "Academic journals",
          page: "journals",
        },
        {
          icon: Newspaper,
          label: "Magazines",
          desc: "Periodicals & magazines",
          page: "magazines",
        },
        {
          icon: Monitor,
          label: "E-Resources",
          desc: "Digital resources",
          page: "eresources",
        },
        {
          icon: Receipt,
          label: "Fines & Receipts",
          desc: "Manage library fines",
          page: "fines",
        },
        {
          icon: ScrollText,
          label: "Library Rules",
          desc: "AIKI rules & regulations",
          page: "rules",
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          icon: BarChart2,
          label: "Analytics",
          desc: "Reports & statistics",
          page: "analytics",
          adminOnly: true,
        },
        {
          icon: Users,
          label: "User Management",
          desc: "Manage library members",
          page: "users",
          adminOnly: true,
        },
      ],
    },
  ];

  return (
    <div className="lib-content px-4 py-3 space-y-4">
      {groups.map((group) => {
        const visibleItems = group.items.filter((i) => !i.adminOnly || isAdmin);
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.title}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </p>
            <div className="lib-card overflow-hidden">
              {visibleItems.map((item, idx) => (
                <button
                  key={item.page}
                  type="button"
                  data-ocid={`more.${item.page}.button`}
                  onClick={() => onNavigate(item.page)}
                  className={`w-full flex items-center gap-3 px-3 py-3.5 text-left hover:bg-secondary active:bg-secondary/80 transition-colors ${
                    idx < visibleItems.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-lib-violet/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-lib-violet" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground flex-shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Library info */}
      <div
        className="lib-card p-4 text-center"
        style={{ background: "linear-gradient(135deg, #3B0764, #7C3AED)" }}
      >
        <p
          className="font-display font-bold text-lg"
          style={{ color: "#FFD700" }}
        >
          AK Central Library
        </p>
        <p className="text-white/80 text-xs mt-1">
          Hours: Mon–Sat, 8 AM – 8 PM
        </p>
        <p className="text-white/70 text-xs mt-0.5">
          📍 Knowledge Portal Building
        </p>
      </div>
    </div>
  );
}
