import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLibrary } from "@/lib/LibraryContext";
import { type GateEntry, formatTime, generateId, storage } from "@/lib/storage";
import { LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GateRegisterScreen() {
  const { gateLog, users, refresh } = useLibrary();
  const [userId, setUserId] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayLog = gateLog.filter((g) => g.date === today);

  const handleEntry = async () => {
    if (!userId.trim()) {
      toast.error("Please enter User ID");
      return;
    }
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === userId.toLowerCase() || u.id === userId,
    );
    if (!user) {
      toast.error("User not found in system");
      return;
    }
    // Check if already inside
    const existing = todayLog.find((g) => g.userId === user.id && !g.exitTime);
    if (existing) {
      toast.error("User already has an active entry. Log exit first.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const entry: GateEntry = {
      id: generateId(),
      userId: user.id,
      userName: user.name,
      mobileNumber: mobile || user.phone,
      entryTime: new Date().toISOString(),
      date: today,
    };
    storage.addGateEntry(entry);
    toast.success(`Entry logged for ${user.name}`);
    setUserId("");
    setMobile("");
    setLoading(false);
    refresh();
  };

  const handleExit = async (entry: GateEntry) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    storage.updateGateEntry({ ...entry, exitTime: new Date().toISOString() });
    toast.success(`Exit logged for ${entry.userName}`);
    setLoading(false);
    refresh();
  };

  const activeEntries = todayLog.filter((g) => !g.exitTime);

  return (
    <div className="lib-content">
      {/* Entry Form */}
      <div className="p-4 bg-white border-b border-border">
        <p className="font-display font-bold text-sm text-foreground mb-3">
          Log Library Entry
        </p>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold">
              User ID / Username *
            </Label>
            <Input
              data-ocid="gate.user_input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter username or Register ID"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold">Mobile Number</Label>
            <Input
              data-ocid="gate.mobile_input"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile (optional)"
              className="mt-1"
              maxLength={10}
            />
          </div>
          <Button
            data-ocid="gate.entry_button"
            onClick={handleEntry}
            disabled={loading}
            className="w-full bg-lib-red hover:bg-lib-red-dark text-white font-bold"
          >
            <LogIn size={16} className="mr-2" />
            Log Entry
          </Button>
        </div>
      </div>

      {/* Active entries */}
      {activeEntries.length > 0 && (
        <div className="px-4 py-3 bg-green-50 border-b border-green-200">
          <p className="text-xs font-bold text-lib-success mb-2">
            Currently Inside ({activeEntries.length})
          </p>
          <div className="space-y-2">
            {activeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-green-200"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {entry.userName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    In: {formatTime(entry.entryTime)} · {entry.mobileNumber}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-lib-success text-lib-success hover:bg-green-50 text-xs h-8"
                  onClick={() => handleExit(entry)}
                  disabled={loading}
                >
                  <LogOut size={12} className="mr-1" />
                  Exit
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's log */}
      <div className="px-4 py-3">
        <p className="font-display font-bold text-sm text-foreground mb-2">
          Today's Log —{" "}
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
          })}
        </p>

        {todayLog.length === 0 ? (
          <div data-ocid="gate.log.empty_state" className="text-center py-12">
            <LogIn size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No entries today</p>
          </div>
        ) : (
          <div data-ocid="gate.log.list" className="lib-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-secondary border-b border-border">
              <p className="text-xs font-bold text-muted-foreground">Name</p>
              <p className="text-xs font-bold text-muted-foreground text-center">
                In
              </p>
              <p className="text-xs font-bold text-muted-foreground text-center">
                Out
              </p>
              <p className="text-xs font-bold text-muted-foreground text-center">
                Status
              </p>
            </div>
            {todayLog.map((entry, idx) => (
              <div
                key={entry.id}
                data-ocid={`gate.log.item.${idx + 1}`}
                className="grid grid-cols-4 gap-2 px-3 py-2.5 border-b border-border last:border-0"
              >
                <p className="text-xs font-semibold text-foreground truncate">
                  {entry.userName}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  {formatTime(entry.entryTime)}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  {entry.exitTime ? formatTime(entry.exitTime) : "—"}
                </p>
                <div className="flex justify-center">
                  <Badge
                    className={`text-xs py-0 ${entry.exitTime ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                    variant="outline"
                  >
                    {entry.exitTime ? "Left" : "Inside"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="lib-card p-3 text-center">
            <p className="font-bold text-xl text-lib-red">{todayLog.length}</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </div>
          <div className="lib-card p-3 text-center">
            <p className="font-bold text-xl text-lib-success">
              {activeEntries.length}
            </p>
            <p className="text-xs text-muted-foreground">Currently Inside</p>
          </div>
        </div>
      </div>
    </div>
  );
}
