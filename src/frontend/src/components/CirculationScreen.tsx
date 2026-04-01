import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLibrary } from "@/lib/LibraryContext";
import {
  type Circulation,
  calculateFine,
  formatDate,
  generateId,
  storage,
} from "@/lib/storage";
import { AlertTriangle, BookOpen, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CirculationScreen() {
  const { session, circulations, books, users, refresh } = useLibrary();
  const role = session?.role ?? "Student";
  const isAdmin = role === "Admin" || role === "Librarian";

  if (!isAdmin) {
    return <MyBooksView />;
  }

  return (
    <div className="lib-content">
      <Tabs defaultValue="issue">
        <TabsList className="w-full rounded-none border-b border-border bg-white h-10">
          <TabsTrigger
            data-ocid="circulation.tab.1"
            value="issue"
            className="flex-1 data-[state=active]:text-lib-violet data-[state=active]:border-b-2 data-[state=active]:border-lib-violet rounded-none text-xs font-semibold"
          >
            Issue
          </TabsTrigger>
          <TabsTrigger
            data-ocid="circulation.tab.2"
            value="return"
            className="flex-1 data-[state=active]:text-lib-violet data-[state=active]:border-b-2 data-[state=active]:border-lib-violet rounded-none text-xs font-semibold"
          >
            Return/Renew
          </TabsTrigger>
          <TabsTrigger
            data-ocid="circulation.tab.3"
            value="overdue"
            className="flex-1 data-[state=active]:text-lib-violet data-[state=active]:border-b-2 data-[state=active]:border-lib-violet rounded-none text-xs font-semibold"
          >
            Overdue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issue" className="p-4">
          <IssueTab books={books} users={users} onSuccess={refresh} />
        </TabsContent>
        <TabsContent value="return" className="p-4">
          <ReturnTab circulations={circulations} onSuccess={refresh} />
        </TabsContent>
        <TabsContent value="overdue" className="p-4">
          <OverdueTab circulations={circulations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IssueTab({
  books,
  users,
  onSuccess,
}: {
  books: ReturnType<typeof storage.getBooks>;
  users: ReturnType<typeof storage.getUsers>;
  onSuccess: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const approvedUsers = users.filter((u) => u.approved);
  const selectedUser = approvedUsers.find(
    (u) => u.username.toLowerCase() === userId.toLowerCase() || u.id === userId,
  );

  const matchingBooks = books.filter(
    (b) =>
      b.availableCopies > 0 &&
      (b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.isbn.includes(bookSearch)),
  );

  const handleIssue = async () => {
    if (!selectedUser) {
      toast.error("User not found. Enter a valid Username or ID.");
      return;
    }
    if (!selectedBook) {
      toast.error("Please select a book to issue");
      return;
    }
    const book = books.find((b) => b.id === selectedBook);
    if (!book || book.availableCopies <= 0) {
      toast.error("Book not available");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const circ: Circulation = {
      id: generateId(),
      bookId: book.id,
      borrowerId: selectedUser.id,
      borrowerName: selectedUser.name,
      bookTitle: book.title,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      status: "issued",
      renewalCount: 0,
    };
    storage.addCirculation(circ);
    storage.updateBook({ ...book, availableCopies: book.availableCopies - 1 });

    toast.success(`"${book.title}" issued to ${selectedUser.name}`);
    setUserId("");
    setBookSearch("");
    setSelectedBook("");
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold text-foreground">
          Search User by ID/Username
        </Label>
        <Input
          data-ocid="circulation.issue.user_input"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter username or Register ID"
          className="mt-1"
        />
        {selectedUser && (
          <div className="mt-2 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-lib-success/20 flex items-center justify-center">
              <span className="text-xs font-bold text-lib-success">
                {selectedUser.name[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedUser.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedUser.role} · {selectedUser.department}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <Label className="text-xs font-semibold text-foreground">
          Search Book by Title/ISBN
        </Label>
        <div className="relative mt-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            data-ocid="circulation.issue.book_input"
            value={bookSearch}
            onChange={(e) => {
              setBookSearch(e.target.value);
              setSelectedBook("");
            }}
            placeholder="Search available books…"
            className="pl-8"
          />
        </div>
        {bookSearch && matchingBooks.length > 0 && (
          <div className="mt-2 lib-card overflow-hidden max-h-48 overflow-y-auto">
            {matchingBooks.slice(0, 8).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBook(b.id);
                  setBookSearch(b.title);
                }}
                className={`w-full text-left px-3 py-2.5 border-b border-border last:border-0 hover:bg-secondary transition-colors ${selectedBook === b.id ? "bg-lib-violet/5" : ""}`}
              >
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {b.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.author} · DDC {b.ddcNumber} · {b.availableCopies} available
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground">
        <p>
          📅 Due date:{" "}
          <strong className="text-foreground">
            14 days from today (
            {new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            )
          </strong>
        </p>
        <p className="mt-1">💰 Late fine: ₹2 per day after due date</p>
      </div>

      <Button
        data-ocid="circulation.issue.submit_button"
        onClick={handleIssue}
        disabled={loading || !selectedUser || !selectedBook}
        className="w-full bg-lib-violet hover:bg-lib-violet-dark text-white font-bold"
      >
        {loading ? "Issuing…" : "Issue Book"}
      </Button>
    </div>
  );
}

function ReturnTab({
  circulations,
  onSuccess,
}: {
  circulations: Circulation[];
  onSuccess: () => void;
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const activeCirculations = circulations.filter(
    (c) =>
      c.status === "issued" || c.status === "renewed" || c.status === "overdue",
  );

  const filtered = search
    ? activeCirculations.filter(
        (c) =>
          c.id.includes(search) ||
          (c.borrowerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.borrowerId ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : activeCirculations;

  const handleReturn = async (circ: Circulation) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const returnDate = new Date().toISOString().split("T")[0];
    const fine = calculateFine(circ.dueDate);

    storage.updateCirculation({ ...circ, status: "returned", returnDate });
    const book = storage.getBookById(circ.bookId);
    if (book)
      storage.updateBook({
        ...book,
        availableCopies: book.availableCopies + 1,
      });

    if (fine > 0) {
      storage.addFine({
        id: generateId(),
        circulationId: circ.id,
        userId: circ.borrowerId,
        userName: circ.borrowerName,
        bookTitle: circ.bookTitle,
        amount: fine,
        paid: false,
        reason: "Book overdue",
        overduedays: Math.floor(
          (Date.now() - new Date(circ.dueDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      });
      toast.success(`Book returned. Fine of ₹${fine} generated.`);
    } else {
      toast.success("Book returned successfully!");
    }
    setLoading(false);
    onSuccess();
  };

  const handleRenew = async (circ: Circulation) => {
    if (circ.renewalCount >= 2) {
      toast.error("Maximum renewals (2) reached for this book");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const newDue = new Date(circ.dueDate);
    newDue.setDate(newDue.getDate() + 14);
    storage.updateCirculation({
      ...circ,
      status: "renewed",
      dueDate: newDue.toISOString().split("T")[0],
      renewalCount: circ.renewalCount + 1,
    });
    toast.success(
      `Book renewed. New due date: ${newDue.toLocaleDateString("en-IN")}`,
    );
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="space-y-3">
      <div>
        <Input
          data-ocid="circulation.return.search_input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by borrower name or ID…"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No active borrowings found
          </p>
        </div>
      ) : (
        filtered.map((c) => {
          const fine = calculateFine(c.dueDate);
          const isOverdue = fine > 0;
          return (
            <div key={c.id} className="lib-card p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground line-clamp-1">
                    {c.bookTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.borrowerName} · Issued {formatDate(c.issueDate)}
                  </p>
                </div>
                {isOverdue ? (
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs flex-shrink-0">
                    ₹{fine} fine
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs text-blue-700 border-blue-200 bg-blue-50 flex-shrink-0"
                  >
                    {c.renewalCount > 0
                      ? `Renewed ×${c.renewalCount}`
                      : "Issued"}
                  </Badge>
                )}
              </div>
              <p
                className={`text-xs font-semibold mb-2 ${isOverdue ? "text-orange-600" : "text-muted-foreground"}`}
              >
                {isOverdue
                  ? `⚠️ Overdue since ${formatDate(c.dueDate)}`
                  : `Due: ${formatDate(c.dueDate)}`}
              </p>
              <div className="flex gap-2">
                <Button
                  data-ocid="circulation.return.submit_button"
                  size="sm"
                  className="flex-1 bg-lib-violet hover:bg-lib-violet-dark text-white text-xs"
                  onClick={() => handleReturn(c)}
                  disabled={loading}
                >
                  Return
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
                  onClick={() => handleRenew(c)}
                  disabled={loading || c.renewalCount >= 2}
                >
                  Renew {c.renewalCount > 0 ? `(${c.renewalCount}/2)` : ""}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function OverdueTab({ circulations }: { circulations: Circulation[] }) {
  const overdue = circulations.filter((c) => {
    if (c.status === "returned") return false;
    const fine = calculateFine(c.dueDate);
    return fine > 0;
  });

  if (overdue.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
          <BookOpen size={24} className="text-lib-success" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          No overdue books!
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          All borrowings are within due date
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
        <AlertTriangle size={16} className="text-orange-600" />
        <p className="text-sm font-semibold text-orange-700">
          {overdue.length} overdue book{overdue.length !== 1 ? "s" : ""}
        </p>
      </div>
      {overdue.map((c, idx) => {
        const fine = calculateFine(c.dueDate);
        const days = Math.floor(
          (Date.now() - new Date(c.dueDate).getTime()) / (1000 * 60 * 60 * 24),
        );
        return (
          <div
            key={c.id}
            data-ocid={`circulation.overdue.item.${idx + 1}`}
            className="lib-card p-3 border-l-4 border-l-orange-400"
          >
            <p className="text-sm font-bold text-foreground line-clamp-1">
              {c.bookTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {c.borrowerName} · {c.borrowerId}
            </p>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-orange-600 font-semibold">
                {days} days overdue
              </span>
              <span className="text-xs font-bold text-lib-violet">
                Fine: ₹{fine}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MyBooksView() {
  const { session, circulations, refresh } = useLibrary();
  const [loading, setLoading] = useState(false);

  const myBooks = circulations.filter(
    (c) =>
      c.borrowerId === session?.userId &&
      (c.status === "issued" ||
        c.status === "renewed" ||
        c.status === "overdue"),
  );

  const handleRenew = async (circ: Circulation) => {
    if (circ.renewalCount >= 2) {
      toast.error("Maximum renewals reached");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const newDue = new Date(circ.dueDate);
    newDue.setDate(newDue.getDate() + 14);
    storage.updateCirculation({
      ...circ,
      status: "renewed",
      dueDate: newDue.toISOString().split("T")[0],
      renewalCount: circ.renewalCount + 1,
    });
    toast.success(`Renewed! New due: ${newDue.toLocaleDateString("en-IN")}`);
    setLoading(false);
    refresh();
  };

  return (
    <div
      data-ocid="circulation.my_books.list"
      className="lib-content px-4 py-3 space-y-3"
    >
      {myBooks.length === 0 ? (
        <div
          data-ocid="circulation.my_books.empty_state"
          className="text-center py-16"
        >
          <BookOpen size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            No books currently borrowed
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Visit the Books section to browse available titles
          </p>
        </div>
      ) : (
        myBooks.map((c, idx) => {
          const fine = calculateFine(c.dueDate);
          const isOverdue = fine > 0;
          return (
            <div
              key={c.id}
              data-ocid={`circulation.my_books.item.${idx + 1}`}
              className={`lib-card p-3 border-l-4 ${isOverdue ? "border-l-orange-400" : "border-l-blue-400"}`}
            >
              <p className="text-sm font-bold text-foreground line-clamp-2">
                {c.bookTitle}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Issued: {formatDate(c.issueDate)}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-xs font-semibold ${isOverdue ? "text-orange-600" : "text-muted-foreground"}`}
                >
                  {isOverdue
                    ? `⚠️ Overdue! Fine: ₹${fine}`
                    : `Due: ${formatDate(c.dueDate)}`}
                </span>
                {c.renewalCount < 2 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-lib-violet text-lib-violet hover:bg-lib-violet/5"
                    onClick={() => handleRenew(c)}
                    disabled={loading}
                  >
                    Renew
                  </Button>
                )}
              </div>
              {c.renewalCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Renewed {c.renewalCount}/2 times
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
