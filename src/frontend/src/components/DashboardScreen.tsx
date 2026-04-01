import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLibrary } from "@/lib/LibraryContext";
import { formatDate } from "@/lib/storage";
import {
  AlertTriangle,
  Bell,
  BookMarked,
  BookOpen,
  DollarSign,
  PlusCircle,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AppPage } from "./BottomNav";

interface DashboardProps {
  onNavigate: (page: AppPage) => void;
  userName: string;
}

export default function DashboardScreen({
  onNavigate,
  userName,
}: DashboardProps) {
  const { session, books, circulations, users, fines, announcements } =
    useLibrary();
  const role = session?.role ?? "Student";

  const isAdmin = role === "Admin" || role === "Librarian";
  const today = new Date().toISOString().split("T")[0];

  const totalBooks = books.length;
  const availableBooks = books.filter((b) => b.availableCopies > 0).length;
  const issuedToday = circulations.filter(
    (c) =>
      c.issueDate === today &&
      (c.status === "issued" || c.status === "renewed"),
  ).length;
  const overdueCount = circulations.filter(
    (c) => c.status === "overdue",
  ).length;
  const registeredUsers = users.filter((u) => u.approved).length;
  const unpaidFines = fines.filter((f) => !f.paid);

  const myCirculations = circulations.filter(
    (c) =>
      c.borrowerId === session?.userId &&
      (c.status === "issued" ||
        c.status === "renewed" ||
        c.status === "overdue"),
  );
  const myFines = fines.filter((f) => f.userId === session?.userId && !f.paid);
  const myFineTotal = myFines.reduce((acc, f) => acc + f.amount, 0);

  const recentActivity = circulations
    .filter(
      (c) =>
        c.status === "issued" ||
        c.status === "returned" ||
        c.status === "renewed",
    )
    .sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    )
    .slice(0, 5);

  const adminStats = [
    {
      label: "Total Books",
      value: totalBooks,
      icon: BookOpen,
      color: "text-lib-violet",
      bg: "bg-lib-violet/10",
    },
    {
      label: "Issued Today",
      value: issuedToday,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Overdue",
      value: overdueCount,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Members",
      value: registeredUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  const studentStats = [
    {
      label: "Books Borrowed",
      value: myCirculations.length,
      icon: BookMarked,
      color: "text-lib-violet",
      bg: "bg-lib-violet/10",
    },
    {
      label: "Fines Due",
      value: `₹${myFineTotal}`,
      icon: DollarSign,
      color: myFineTotal > 0 ? "text-orange-600" : "text-lib-success",
      bg: myFineTotal > 0 ? "bg-orange-50" : "bg-green-50",
    },
    {
      label: "Books Available",
      value: availableBooks,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  const stats = isAdmin ? adminStats : studentStats;

  const firstNameDisplay = userName.split(" ")[0];

  return (
    <div data-ocid="dashboard.page" className="lib-content">
      {/* Welcome bar */}
      <div className="px-4 py-3 bg-white border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Good {getGreeting()},
            </p>
            <p className="font-display font-bold text-foreground text-base">
              {firstNameDisplay} 👋
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </p>
            <Badge
              variant="outline"
              className="text-xs border-lib-violet text-lib-violet mt-0.5"
            >
              {role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className={`grid ${stats.length === 4 ? "grid-cols-2" : "grid-cols-3"} gap-3 p-4`}
      >
        {stats.map((stat, idx) => (
          <Card
            key={stat.label}
            data-ocid={`dashboard.stat.card.${idx + 1}`}
            className="lib-card overflow-hidden"
          >
            <CardContent className="p-3">
              <div
                className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}
              >
                <stat.icon size={18} className={stat.color} />
              </div>
              <p
                className={`font-display font-bold text-xl leading-none ${stat.color}`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin: Unpaid fines alert */}
      {isAdmin && unpaidFines.length > 0 && (
        <div className="mx-4 mb-3 rounded-xl bg-orange-50 border border-orange-200 p-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-600 flex-shrink-0" />
          <p className="text-sm text-orange-700 font-medium">
            {unpaidFines.length} unpaid fine
            {unpaidFines.length !== 1 ? "s" : ""} pending collection
          </p>
        </div>
      )}

      {/* Student: My borrowed books preview */}
      {!isAdmin && myCirculations.length > 0 && (
        <div className="mx-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-semibold text-sm text-foreground">
              My Borrowed Books
            </p>
            <button
              type="button"
              onClick={() => onNavigate("circulation")}
              className="text-xs text-lib-violet font-semibold"
            >
              See All
            </button>
          </div>
          <div className="space-y-2">
            {myCirculations.slice(0, 2).map((c) => (
              <div key={c.id} className="lib-card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-lib-violet/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} className="text-lib-violet" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {c.bookTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {formatDate(c.dueDate)}
                  </p>
                </div>
                {c.status === "overdue" && (
                  <Badge className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    Overdue
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 mb-4">
        <p className="font-display font-semibold text-sm text-foreground mb-2">
          Quick Actions
        </p>
        <div className="grid grid-cols-3 gap-2">
          {isAdmin ? (
            <>
              <QuickAction
                data-ocid="dashboard.quick_action.1"
                icon={PlusCircle}
                label="Issue Book"
                color="bg-lib-violet"
                onClick={() => onNavigate("circulation")}
              />
              <QuickAction
                data-ocid="dashboard.quick_action.2"
                icon={RefreshCw}
                label="Return Book"
                color="bg-blue-600"
                onClick={() => onNavigate("circulation")}
              />
              <QuickAction
                data-ocid="dashboard.quick_action.3"
                icon={Users}
                label="Manage Users"
                color="bg-purple-600"
                onClick={() => onNavigate("users")}
              />
            </>
          ) : (
            <>
              <QuickAction
                data-ocid="dashboard.quick_action.1"
                icon={Search}
                label="Search Books"
                color="bg-lib-violet"
                onClick={() => onNavigate("books")}
              />
              <QuickAction
                data-ocid="dashboard.quick_action.2"
                icon={BookMarked}
                label="My Books"
                color="bg-blue-600"
                onClick={() => onNavigate("circulation")}
              />
              <QuickAction
                data-ocid="dashboard.quick_action.3"
                icon={DollarSign}
                label="My Fines"
                color="bg-orange-500"
                onClick={() => onNavigate("fines")}
              />
            </>
          )}
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={14} className="text-lib-violet" />
            <p className="font-display font-semibold text-sm text-foreground">
              Announcements
            </p>
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="lib-card p-3 border-l-4 border-l-lib-violet"
              >
                <p className="text-sm text-foreground leading-relaxed">
                  {a.text}
                </p>
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-muted-foreground">{a.postedBy}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(a.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity (admin/librarian) */}
      {isAdmin && recentActivity.length > 0 && (
        <div className="px-4 mb-4">
          <p className="font-display font-semibold text-sm text-foreground mb-2">
            Recent Activity
          </p>
          <div className="lib-card overflow-hidden">
            {recentActivity.map((c, idx) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 px-3 py-2.5 ${idx < recentActivity.length - 1 ? "border-b border-border" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    c.status === "issued"
                      ? "bg-blue-500"
                      : c.status === "returned"
                        ? "bg-lib-success"
                        : "bg-amber-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {c.bookTitle}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.borrowerName} · {formatDate(c.issueDate)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs capitalize ${
                    c.status === "issued"
                      ? "border-blue-200 text-blue-700 bg-blue-50"
                      : c.status === "returned"
                        ? "border-green-200 text-green-700 bg-green-50"
                        : "border-amber-200 text-amber-700 bg-amber-50"
                  }`}
                >
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lib-violet font-semibold"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  color,
  onClick,
  "data-ocid": ocid,
}: {
  icon: React.FC<{ size: number; className?: string }>;
  label: string;
  color: string;
  onClick: () => void;
  "data-ocid"?: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={`${color} rounded-2xl p-3 flex flex-col items-center gap-2 active:opacity-80 transition-opacity`}
    >
      <Icon size={20} className="text-white" />
      <span className="text-white text-xs font-semibold leading-none text-center">
        {label}
      </span>
    </button>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}
