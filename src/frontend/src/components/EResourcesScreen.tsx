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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLibrary } from "@/lib/LibraryContext";
import { type EResource, formatDate, generateId, storage } from "@/lib/storage";
import { BookOpen, Download, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ResourceType = EResource["resourceType"];

const empty: Omit<EResource, "id"> = {
  title: "",
  resourceType: "E-Book",
  department: "",
  uploadDate: new Date().toISOString().split("T")[0],
  uploadedBy: "",
  fileUrl: "",
};

export default function EResourcesScreen() {
  const { eresources, session, refresh } = useLibrary();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<EResource, "id">>(empty);

  const isAdmin = session?.role === "Admin" || session?.role === "Librarian";

  const ebooks = eresources.filter((e) => e.resourceType === "E-Book");
  const ejournals = eresources.filter((e) => e.resourceType === "E-Journal");
  const dmags = eresources.filter((e) => e.resourceType === "Digital Magazine");

  function openAdd() {
    setForm({ ...empty, uploadedBy: session?.name ?? "" });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title || !form.department || !form.fileUrl) {
      toast.error("Please fill title, department, and file URL");
      return;
    }
    storage.addEResource({ ...form, id: generateId() });
    toast.success("Resource added");
    refresh();
    setShowForm(false);
  }

  function handleDelete(id: string) {
    storage.deleteEResource(id);
    refresh();
    toast.success("Resource removed");
  }

  function ResourceList({
    items,
    tabIdx: _tabIdx,
  }: { items: EResource[]; tabIdx: number }) {
    return (
      <div data-ocid="eresources.list" className="px-4 py-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen
              size={32}
              className="text-muted-foreground mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">No resources yet</p>
          </div>
        ) : (
          items.map((e, idx) => (
            <div
              key={e.id}
              data-ocid={`eresources.item.${idx + 1}`}
              className="lib-card p-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-lib-red/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-lib-red" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground leading-snug">
                    {e.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {e.department}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(e.uploadDate)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Uploaded by {e.uploadedBy}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="flex-1 bg-lib-red hover:bg-lib-red-dark text-white text-xs"
                  onClick={() => window.open(e.fileUrl, "_blank")}
                >
                  <Download size={12} className="mr-1" />
                  View/Download
                </Button>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-destructive text-destructive"
                    onClick={() => handleDelete(e.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="lib-content">
      <Tabs defaultValue="ebooks">
        <TabsList className="w-full rounded-none border-b border-border bg-white h-10">
          <TabsTrigger
            data-ocid="eresources.tab.1"
            value="ebooks"
            className="flex-1 data-[state=active]:text-lib-red data-[state=active]:border-b-2 data-[state=active]:border-lib-red rounded-none text-xs font-semibold"
          >
            E-Books ({ebooks.length})
          </TabsTrigger>
          <TabsTrigger
            data-ocid="eresources.tab.2"
            value="ejournals"
            className="flex-1 data-[state=active]:text-lib-red data-[state=active]:border-b-2 data-[state=active]:border-lib-red rounded-none text-xs font-semibold"
          >
            E-Journals ({ejournals.length})
          </TabsTrigger>
          <TabsTrigger
            data-ocid="eresources.tab.3"
            value="dmags"
            className="flex-1 data-[state=active]:text-lib-red data-[state=active]:border-b-2 data-[state=active]:border-lib-red rounded-none text-xs font-semibold"
          >
            Digital ({dmags.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ebooks">
          <ResourceList items={ebooks} tabIdx={1} />
        </TabsContent>
        <TabsContent value="ejournals">
          <ResourceList items={ejournals} tabIdx={2} />
        </TabsContent>
        <TabsContent value="dmags">
          <ResourceList items={dmags} tabIdx={3} />
        </TabsContent>
      </Tabs>

      {isAdmin && (
        <button
          type="button"
          data-ocid="eresources.add_button"
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
              Add E-Resource
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
              <Label className="text-xs font-semibold">Type</Label>
              <Select
                value={form.resourceType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, resourceType: v as ResourceType }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-Book">E-Book</SelectItem>
                  <SelectItem value="E-Journal">E-Journal</SelectItem>
                  <SelectItem value="Digital Magazine">
                    Digital Magazine
                  </SelectItem>
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
              <Label className="text-xs font-semibold">File URL *</Label>
              <Input
                value={form.fileUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fileUrl: e.target.value }))
                }
                placeholder="https://..."
                className="mt-1"
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
              className="flex-1 bg-lib-red hover:bg-lib-red-dark text-white"
              onClick={handleSave}
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
