import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLibrary } from "@/lib/LibraryContext";
import {
  type Journal,
  type JournalType,
  generateId,
  storage,
} from "@/lib/storage";
import { BookOpen, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const emptyJournal: Omit<Journal, "id"> = {
  title: "",
  journalType: "Print",
  subscriptionCost: 0,
  frequency: "Monthly",
  department: "",
  arrivedThisMonth: false,
};

export default function JournalsScreen() {
  const { journals, session, refresh } = useLibrary();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Journal, "id">>(emptyJournal);

  const isAdmin = session?.role === "Admin" || session?.role === "Librarian";

  function openAdd() {
    setEditingId(null);
    setForm(emptyJournal);
    setShowForm(true);
  }

  function openEdit(j: Journal) {
    setEditingId(j.id);
    setForm({
      title: j.title,
      journalType: j.journalType,
      subscriptionCost: j.subscriptionCost,
      frequency: j.frequency,
      department: j.department,
      arrivedThisMonth: j.arrivedThisMonth,
    });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title || !form.department) {
      toast.error("Please fill title and department");
      return;
    }
    if (editingId) {
      storage.updateJournal({ ...form, id: editingId });
      toast.success("Journal updated");
    } else {
      storage.addJournal({ ...form, id: generateId() });
      toast.success("Journal added");
    }
    refresh();
    setShowForm(false);
  }

  function handleDelete(id: string) {
    storage.deleteJournal(id);
    refresh();
    toast.success("Journal removed");
  }

  return (
    <div className="lib-content">
      <div data-ocid="journals.list" className="px-4 py-3 space-y-2">
        {journals.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen
              size={32}
              className="text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              No journals added yet
            </p>
          </div>
        ) : (
          journals.map((j, idx) => (
            <div
              key={j.id}
              data-ocid={`journals.item.${idx + 1}`}
              className="lib-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {j.title}
                    </p>
                    {j.arrivedThisMonth && (
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                        New Arrival
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${j.journalType === "EJournal" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-amber-200 text-amber-700 bg-amber-50"}`}
                    >
                      {j.journalType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {j.frequency}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {j.department}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{j.subscriptionCost.toLocaleString("en-IN")}/year
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 border-lib-violet text-lib-violet"
                      onClick={() => openEdit(j)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 border-destructive text-destructive"
                      onClick={() => handleDelete(j.id)}
                    >
                      Del
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isAdmin && (
        <button
          type="button"
          data-ocid="journals.add_button"
          onClick={openAdd}
          className="fixed bottom-20 right-4 w-14 h-14 bg-lib-violet hover:bg-lib-violet-dark text-white rounded-full shadow-lg flex items-center justify-center no-print"
          style={{ zIndex: 40 }}
        >
          <Plus size={24} />
        </button>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className="font-display font-bold">
              {editingId ? "Edit Journal" : "Add Journal"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-3 space-y-3 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-xs font-semibold">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Type</Label>
              <Select
                value={form.journalType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, journalType: v as JournalType }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Print">Print</SelectItem>
                  <SelectItem value="EJournal">E-Journal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) => setForm((p) => ({ ...p, frequency: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Weekly",
                    "Monthly",
                    "Quarterly",
                    "Bi-Annual",
                    "Annual",
                  ].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Department *</Label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Subscription Cost (₹/year)
              </Label>
              <Input
                type="number"
                value={form.subscriptionCost}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    subscriptionCost: Number(e.target.value),
                  }))
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Arrived This Month
              </Label>
              <Switch
                checked={form.arrivedThisMonth}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, arrivedThisMonth: v }))
                }
              />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-lib-violet hover:bg-lib-violet-dark text-white"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
