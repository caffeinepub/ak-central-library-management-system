import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/LibraryContext";
import { calculateFine, formatDate, generateId, storage } from "@/lib/storage";
import {
  AlertTriangle,
  DollarSign,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DEPARTMENTS = [
  "Computer Science",
  "Physics",
  "Tamil",
  "History",
  "Engineering",
  "Science",
  "Arts",
  "Social Science",
];

export default function AnalyticsScreen() {
  const { circulations, users, fines, announcements, session, refresh } =
    useLibrary();
  const [newAnnouncement, setNewAnnouncement] = useState("");

  const isAdmin = session?.role === "Admin" || session?.role === "Librarian";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const issuedThisMonth = circulations.filter(
    (c) =>
      c.issueDate >= monthStart &&
      (c.status === "issued" ||
        c.status === "renewed" ||
        c.status === "returned"),
  ).length;

  const activeMembers = users.filter(
    (u) => u.approved && u.role !== "Admin",
  ).length;

  const overdueCount = circulations.filter((c) => {
    if (c.status === "returned") return false;
    return calculateFine(c.dueDate) > 0;
  }).length;

  const finesCollected = fines
    .filter((f) => f.paid)
    .reduce((acc, f) => acc + f.amount, 0);

  // Department-wise circulation
  const deptCirc: Record<string, number> = Object.fromEntries(
    DEPARTMENTS.map((d) => [d, 0]),
  );
  for (const c of circulations) {
    const book = storage.getBookById(c.bookId);
    if (book && deptCirc[book.department] !== undefined) {
      deptCirc[book.department]++;
    }
  }
  const maxCirc = Math.max(...Object.values(deptCirc), 1);

  // Top users
  const userCircCount: Record<string, number> = {};
  for (const c of circulations) {
    userCircCount[c.borrowerId] = (userCircCount[c.borrowerId] ?? 0) + 1;
  }
  const topUsers = Object.entries(userCircCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([uid, count]) => ({ user: storage.getUserById(uid), count }))
    .filter((e) => e.user !== null);

  // Overdue list
  const overdueList = circulations.filter((c) => {
    if (c.status === "returned") return false;
    return calculateFine(c.dueDate) > 0;
  });

  function postAnnouncement() {
    if (!newAnnouncement.trim()) return;
    storage.addAnnouncement({
      id: generateId(),
      text: newAnnouncement.trim(),
      postedBy: session?.name ?? "Librarian",
      date: new Date().toISOString().split("T")[0],
    });
    setNewAnnouncement("");
    refresh();
    toast.success("Announcement posted");
  }

  function deleteAnnouncement(id: string) {
    storage.deleteAnnouncement(id);
    refresh();
    toast.success("Announcement removed");
  }

  const statCards = [
    {
      label: "Issued This Month",
      value: issuedThisMonth,
      Icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Members",
      value: activeMembers,
      Icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Overdue Books",
      value: overdueCount,
      Icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Fines Collected",
      value: `₹${finesCollected}`,
      Icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div data-ocid="analytics.page" className="lib-content px-4 py-3 space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s, idx) => (
          <Card
            key={s.label}
            data-ocid={`analytics.stat.card.${idx + 1}`}
            className="lib-card overflow-hidden"
          >
            <CardContent className="p-3">
              <div
                className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}
              >
                <s.Icon size={18} className={s.color} />
              </div>
              <p className={`font-display font-bold text-xl ${s.color}`}>
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dept-wise chart */}
      <div data-ocid="analytics.dept_chart" className="lib-card p-3">
        <p className="font-display font-bold text-sm text-foreground mb-3">
          Department-wise Circulation
        </p>
        <div className="space-y-2">
          {Object.entries(deptCirc).map(([dept, count]) => (
            <div key={dept} className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground w-28 truncate">
                {dept}
              </p>
              <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-lib-red rounded-full transition-all"
                  style={{
                    width: `${(count / maxCirc) * 100}%`,
                    minWidth: count > 0 ? "8px" : "0",
                  }}
                />
              </div>
              <span className="text-xs font-bold text-foreground w-6 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top users */}
      <div>
        <p className="font-display font-bold text-sm text-foreground mb-2">
          Top 5 Most Active Users
        </p>
        <div
          data-ocid="analytics.top_users.list"
          className="lib-card overflow-hidden"
        >
          {topUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No activity yet
            </p>
          ) : (
            topUsers.map(({ user, count }, idx) => (
              <div
                key={user!.id}
                className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0
                      ? "bg-amber-100 text-amber-700"
                      : idx === 1
                        ? "bg-gray-100 text-gray-600"
                        : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user!.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user!.role} · {user!.department}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {count} books
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overdue table */}
      {overdueList.length > 0 && (
        <div>
          <p className="font-display font-bold text-sm text-foreground mb-2">
            Overdue Books
          </p>
          <div
            data-ocid="analytics.overdue.list"
            className="lib-card overflow-hidden"
          >
            {overdueList.map((c) => {
              const fine = calculateFine(c.dueDate);
              const days = Math.floor(
                (Date.now() - new Date(c.dueDate).getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <div
                  key={c.id}
                  className="px-3 py-2.5 border-b border-border last:border-0 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {c.bookTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.borrowerName} · {days}d overdue
                    </p>
                  </div>
                  <span className="text-xs font-bold text-lib-red">
                    ₹{fine}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Announcements */}
      <div>
        <p className="font-display font-bold text-sm text-foreground mb-2">
          Announcements
        </p>

        {isAdmin && (
          <div className="flex gap-2 mb-3">
            <Input
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Post an announcement…"
              className="flex-1 text-sm"
              onKeyDown={(e) => e.key === "Enter" && postAnnouncement()}
            />
            <Button
              size="sm"
              className="bg-lib-red hover:bg-lib-red-dark text-white px-3"
              onClick={postAnnouncement}
            >
              <Plus size={16} />
            </Button>
          </div>
        )}

        <div data-ocid="analytics.announcements.list" className="space-y-2">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No announcements
            </p>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                className="lib-card p-3 border-l-4 border-l-lib-gold"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    {a.text}
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(a.id)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-muted-foreground">{a.postedBy}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(a.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
