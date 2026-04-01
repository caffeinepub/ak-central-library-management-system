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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLibrary } from "@/lib/LibraryContext";
import { type Book, generateId, storage, suggestDDC } from "@/lib/storage";
import { BookOpen, ChevronRight, MapPin, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const DDC_FILTERS = [
  { label: "All", value: "" },
  { label: "000s", value: "0" },
  { label: "100s", value: "1" },
  { label: "200s", value: "2" },
  { label: "300s", value: "3" },
  { label: "400s", value: "4" },
  { label: "500s", value: "5" },
  { label: "600s", value: "6" },
  { label: "700s", value: "7" },
  { label: "800s", value: "8" },
  { label: "900s", value: "9" },
];

const DEPARTMENTS = [
  "All Departments",
  "Library Science",
  "Computer Science",
  "Philosophy",
  "Religion",
  "Social Science",
  "Tamil",
  "Science",
  "Engineering",
  "Arts",
  "Literature",
  "History",
  "Physics",
  "General",
];

const emptyBook: Omit<Book, "id"> = {
  title: "",
  author: "",
  isbn: "",
  publisher: "",
  year: new Date().getFullYear(),
  department: "",
  ddcNumber: "",
  totalCopies: 1,
  availableCopies: 1,
  location: {
    floor: "Ground Floor",
    hallName: "",
    rackNumber: "",
    shelfNumber: "",
  },
};

export default function BooksScreen() {
  const { books, session, refresh } = useLibrary();
  const [search, setSearch] = useState("");
  const [ddcFilter, setDdcFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<Omit<Book, "id">>(emptyBook);
  const [ddcSuggestion, setDdcSuggestion] = useState<string | null>(null);

  const isAdmin = session?.role === "Admin" || session?.role === "Librarian";

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.includes(search) ||
        b.ddcNumber.includes(search);
      const matchDDC = !ddcFilter || b.ddcNumber.startsWith(ddcFilter);
      const matchDept =
        deptFilter === "All Departments" || b.department === deptFilter;
      return matchSearch && matchDDC && matchDept;
    });
  }, [books, search, ddcFilter, deptFilter]);

  function handleTitleChange(t: string) {
    setForm((p) => ({ ...p, title: t }));
    const sug = suggestDDC(t);
    if (sug) {
      setDdcSuggestion(sug.category);
      setForm((p) => ({ ...p, ddcNumber: sug.number }));
    } else {
      setDdcSuggestion(null);
    }
  }

  function openAdd() {
    setEditingBook(null);
    setForm(emptyBook);
    setDdcSuggestion(null);
    setShowAddEdit(true);
  }

  function openEdit(b: Book) {
    setEditingBook(b);
    setForm({
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      publisher: b.publisher,
      year: b.year,
      department: b.department,
      ddcNumber: b.ddcNumber,
      totalCopies: b.totalCopies,
      availableCopies: b.availableCopies,
      location: { ...b.location },
    });
    setShowAddEdit(true);
    setSelectedBook(null);
  }

  function handleSave() {
    if (!form.title || !form.author || !form.ddcNumber) {
      toast.error("Please fill title, author, and DDC number");
      return;
    }
    if (editingBook) {
      storage.updateBook({ ...form, id: editingBook.id });
      toast.success("Book updated successfully");
    } else {
      storage.addBook({ ...form, id: generateId() });
      toast.success("Book added successfully");
    }
    refresh();
    setShowAddEdit(false);
  }

  function handleDelete(b: Book) {
    storage.deleteBook(b.id);
    refresh();
    setSelectedBook(null);
    toast.success("Book deleted");
  }

  return (
    <div className="lib-content">
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-border sticky top-0 z-10">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            data-ocid="books.search_input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author, ISBN…"
            className="pl-9 h-10 bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* DDC filters */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide bg-white border-b border-border">
        {DDC_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            data-ocid="books.filter.tab"
            onClick={() => setDdcFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              ddcFilter === f.value
                ? "bg-lib-violet text-white"
                : "bg-secondary text-muted-foreground hover:bg-lib-violet/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Department filter */}
      <div className="px-4 py-2 bg-white border-b border-border">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Books list */}
      <div data-ocid="books.list" className="px-4 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div data-ocid="books.empty_state" className="text-center py-16">
            <BookOpen
              size={40}
              className="text-muted-foreground mx-auto mb-3"
            />
            <p className="text-sm font-semibold text-muted-foreground">
              No books found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different search or filter
            </p>
          </div>
        ) : (
          filtered.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              data-ocid={`books.item.${idx + 1}`}
              onClick={() => setSelectedBook(b)}
              className="lib-card w-full text-left p-3 flex gap-3 items-start active:opacity-80 transition-opacity"
            >
              <div className="w-10 h-12 rounded-lg bg-lib-violet/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lib-violet font-bold text-xs">
                  {b.ddcNumber}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2 flex-1">
                    {b.title}
                  </p>
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground mt-0.5 flex-shrink-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.author}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-xs py-0">
                    {b.department}
                  </Badge>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      b.availableCopies > 0
                        ? "badge-available"
                        : "badge-unavailable"
                    }`}
                  >
                    {b.availableCopies > 0
                      ? `${b.availableCopies} available`
                      : "Not available"}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* FAB for admin */}
      {isAdmin && (
        <button
          type="button"
          data-ocid="books.add_button"
          onClick={openAdd}
          className="fixed bottom-20 right-4 w-14 h-14 bg-lib-violet hover:bg-lib-violet-dark text-white rounded-full shadow-lg flex items-center justify-center no-print"
          style={{ zIndex: 40 }}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Book detail sheet */}
      <Sheet
        open={!!selectedBook}
        onOpenChange={(o) => !o && setSelectedBook(null)}
      >
        <SheetContent
          data-ocid="books.detail.sheet"
          side="bottom"
          className="h-[80vh] rounded-t-2xl px-0 overflow-hidden"
        >
          {selectedBook && (
            <div className="h-full flex flex-col">
              <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0">
                <SheetTitle className="font-display text-base text-left font-bold leading-snug">
                  {selectedBook.title}
                </SheetTitle>
                <p className="text-sm text-muted-foreground text-left">
                  {selectedBook.author}
                </p>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Availability */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                      selectedBook.availableCopies > 0
                        ? "badge-available"
                        : "badge-unavailable"
                    }`}
                  >
                    {selectedBook.availableCopies} / {selectedBook.totalCopies}{" "}
                    available
                  </span>
                  <Badge variant="outline">{selectedBook.ddcNumber}</Badge>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem label="ISBN" value={selectedBook.isbn} />
                  <DetailItem
                    label="Publisher"
                    value={selectedBook.publisher}
                  />
                  <DetailItem
                    label="Year"
                    value={selectedBook.year.toString()}
                  />
                  <DetailItem
                    label="Department"
                    value={selectedBook.department}
                  />
                </div>

                {/* Location */}
                <div
                  data-ocid="books.detail.location_section"
                  className="lib-card p-3 border-l-4 border-l-lib-violet"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-lib-violet" />
                    <p className="font-display font-bold text-sm text-foreground">
                      Book Location
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Floor</p>
                      <p className="font-semibold text-foreground">
                        {selectedBook.location.floor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hall</p>
                      <p className="font-semibold text-foreground">
                        {selectedBook.location.hallName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rack</p>
                      <p className="font-semibold text-foreground">
                        {selectedBook.location.rackNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Shelf</p>
                      <p className="font-semibold text-foreground">
                        {selectedBook.location.shelfNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin actions */}
                {isAdmin && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      data-ocid="books.detail.edit_button"
                      variant="outline"
                      className="flex-1 border-lib-violet text-lib-violet hover:bg-lib-violet/5"
                      onClick={() => openEdit(selectedBook)}
                    >
                      Edit Book
                    </Button>
                    <Button
                      data-ocid="books.detail.delete_button"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDelete(selectedBook)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Book Dialog */}
      <Dialog open={showAddEdit} onOpenChange={setShowAddEdit}>
        <DialogContent className="max-w-sm mx-auto h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border flex-shrink-0">
            <DialogTitle className="font-display font-bold">
              {editingBook ? "Edit Book" : "Add New Book"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div>
              <Label className="text-xs font-semibold">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Book title"
                className="mt-1"
              />
              {ddcSuggestion && (
                <p className="text-xs text-lib-success mt-1">
                  ✓ DDC suggested: {ddcSuggestion}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs font-semibold">Author *</Label>
              <Input
                value={form.author}
                onChange={(e) =>
                  setForm((p) => ({ ...p, author: e.target.value }))
                }
                placeholder="Author name"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">DDC Number *</Label>
              <Input
                value={form.ddcNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ddcNumber: e.target.value }))
                }
                placeholder="e.g. 004, 530"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">ISBN</Label>
              <Input
                value={form.isbn}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isbn: e.target.value }))
                }
                placeholder="978-..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Publisher</Label>
              <Input
                value={form.publisher}
                onChange={(e) =>
                  setForm((p) => ({ ...p, publisher: e.target.value }))
                }
                placeholder="Publisher name"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Year</Label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, year: Number(e.target.value) }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Total Copies</Label>
                <Input
                  type="number"
                  value={form.totalCopies}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setForm((p) => ({
                      ...p,
                      totalCopies: n,
                      availableCopies: n,
                    }));
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Department</Label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department: e.target.value }))
                }
                placeholder="Department"
                className="mt-1"
              />
            </div>
            <p className="font-semibold text-xs text-lib-violet mt-2">
              Location
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Floor</Label>
                <Input
                  value={form.location.floor}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      location: { ...p.location, floor: e.target.value },
                    }))
                  }
                  placeholder="e.g. Ground Floor"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Hall Name</Label>
                <Input
                  value={form.location.hallName}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      location: { ...p.location, hallName: e.target.value },
                    }))
                  }
                  placeholder="e.g. Raj Hall"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Rack Number</Label>
                <Input
                  value={form.location.rackNumber}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      location: { ...p.location, rackNumber: e.target.value },
                    }))
                  }
                  placeholder="e.g. Rack 1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Shelf Number</Label>
                <Input
                  value={form.location.shelfNumber}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      location: { ...p.location, shelfNumber: e.target.value },
                    }))
                  }
                  placeholder="e.g. Shelf 2"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddEdit(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="books.form.submit_button"
              className="flex-1 bg-lib-violet hover:bg-lib-violet-dark text-white"
              onClick={handleSave}
            >
              {editingBook ? "Save Changes" : "Add Book"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary rounded-lg p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">
        {value || "—"}
      </p>
    </div>
  );
}
