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
import { useLibrary } from "@/lib/LibraryContext";
import { type Magazine, formatDate, generateId, storage } from "@/lib/storage";
import { BookMarked, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const emptyMag: Omit<Magazine, "id"> = {
  title: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  cost: 0,
  subscriptionPeriod: 12,
  department: "",
};

export default function MagazinesScreen() {
  const { magazines, session, refresh } = useLibrary();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Magazine, "id">>(emptyMag);

  const isAdmin = session?.role === "Admin" || session?.role === "Librarian";

  function openAdd() {
    setEditingId(null);
    setForm(emptyMag);
    setShowForm(true);
  }

  function openEdit(m: Magazine) {
    setEditingId(m.id);
    setForm({
      title: m.title,
      purchaseDate: m.purchaseDate,
      cost: m.cost,
      subscriptionPeriod: m.subscriptionPeriod,
      department: m.department,
    });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title || !form.department) {
      toast.error("Please fill title and department");
      return;
    }
    if (editingId) {
      storage.updateMagazine({ ...form, id: editingId });
      toast.success("Magazine updated");
    } else {
      storage.addMagazine({ ...form, id: generateId() });
      toast.success("Magazine added");
    }
    refresh();
    setShowForm(false);
  }

  function handleDelete(id: string) {
    storage.deleteMagazine(id);
    refresh();
    toast.success("Magazine removed");
  }

  return (
    <div className="lib-content">
      <div data-ocid="magazines.list" className="px-4 py-3 space-y-2">
        {magazines.length === 0 ? (
          <div className="text-center py-12">
            <BookMarked
              size={32}
              className="text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              No magazines added yet
            </p>
          </div>
        ) : (
          magazines.map((m, idx) => (
            <div
              key={m.id}
              data-ocid={`magazines.item.${idx + 1}`}
              className="lib-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {m.department}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {m.subscriptionPeriod} months subscription
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Purchased: {formatDate(m.purchaseDate)}
                    </p>
                    <p className="text-xs font-semibold text-lib-red">
                      ₹{m.cost}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 border-lib-red text-lib-red"
                      onClick={() => openEdit(m)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 border-destructive text-destructive"
                      onClick={() => handleDelete(m.id)}
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
          data-ocid="magazines.add_button"
          onClick={openAdd}
          className="fixed bottom-20 right-4 w-14 h-14 bg-lib-red hover:bg-lib-red-dark text-white rounded-full shadow-lg flex items-center justify-center no-print"
          style={{ zIndex: 40 }}
        >
          <Plus size={24} />
        </button>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className="font-display font-bold">
              {editingId ? "Edit Magazine" : "Add Magazine"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-3 space-y-3">
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
              <Label className="text-xs font-semibold">Purchase Date</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purchaseDate: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Cost (₹)</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cost: Number(e.target.value) }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Period (months)</Label>
                <Input
                  type="number"
                  value={form.subscriptionPeriod}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      subscriptionPeriod: Number(e.target.value),
                    }))
                  }
                  className="mt-1"
                />
              </div>
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
              className="flex-1 bg-lib-red hover:bg-lib-red-dark text-white"
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
