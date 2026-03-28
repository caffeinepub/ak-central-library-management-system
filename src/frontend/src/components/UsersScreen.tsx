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
import {
  type LibraryRole,
  type User,
  generateId,
  storage,
} from "@/lib/storage";
import { Plus, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ROLES: LibraryRole[] = ["Student", "Staff", "Librarian", "Admin"];
const DEPTS = [
  "Computer Science",
  "Physics",
  "Tamil",
  "History",
  "Engineering",
  "Science",
  "Arts",
  "Social Science",
  "Library",
  "Administration",
  "General",
];

const emptyUser: Omit<User, "id"> = {
  username: "",
  password: "",
  name: "",
  role: "Student",
  department: "",
  phone: "",
  approved: true,
};

export default function UsersScreen() {
  const { users, refresh } = useLibrary();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<User, "id">>(emptyUser);

  const approvedUsers = users.filter((u) => u.approved && !u.pending);
  const pendingUsers = users.filter((u) => !u.approved || u.pending);

  function handleApprove(u: User) {
    storage.updateUser({ ...u, approved: true, pending: false });
    refresh();
    toast.success(`${u.name} approved successfully`);
  }

  function handleReject(u: User) {
    storage.deleteUser(u.id);
    refresh();
    toast.success("Registration request rejected");
  }

  function handleAdd() {
    if (!form.username || !form.name || !form.department) {
      toast.error("Please fill username, name, and department");
      return;
    }
    const exists = storage.getUserByUsername(form.username);
    if (exists) {
      toast.error("Username already exists");
      return;
    }
    const newUser: User = {
      ...form,
      id: generateId(),
      password: form.password || form.username,
    };
    storage.addUser(newUser);
    refresh();
    setShowForm(false);
    toast.success(`User ${form.name} created`);
  }

  function handleDelete(u: User) {
    storage.deleteUser(u.id);
    refresh();
    toast.success("User removed");
  }

  function getRoleBadgeStyle(role: LibraryRole): string {
    switch (role) {
      case "Admin":
        return "bg-lib-red/10 text-lib-red border-lib-red/20";
      case "Librarian":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Staff":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  }

  return (
    <div className="lib-content">
      <Tabs defaultValue="all">
        <TabsList className="w-full rounded-none border-b border-border bg-white h-10">
          <TabsTrigger
            value="all"
            className="flex-1 data-[state=active]:text-lib-red data-[state=active]:border-b-2 data-[state=active]:border-lib-red rounded-none text-xs font-semibold"
          >
            All Users ({approvedUsers.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="flex-1 data-[state=active]:text-lib-red data-[state=active]:border-b-2 data-[state=active]:border-lib-red rounded-none text-xs font-semibold"
          >
            Pending {pendingUsers.length > 0 ? `(${pendingUsers.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="px-4 py-3">
          <div data-ocid="users.list" className="space-y-2">
            {approvedUsers.map((u, idx) => (
              <div
                key={u.id}
                data-ocid={`users.item.${idx + 1}`}
                className="lib-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-lib-red/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lib-red font-bold text-sm">
                        {u.name[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.username} · {u.department}
                      </p>
                      {u.phone && (
                        <p className="text-xs text-muted-foreground">
                          {u.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge
                      className={`text-xs ${getRoleBadgeStyle(u.role)}`}
                      variant="outline"
                    >
                      {u.role}
                    </Badge>
                    {u.role !== "Admin" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="px-4 py-3">
          <div data-ocid="users.pending.list" className="space-y-2">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck
                  size={32}
                  className="text-muted-foreground mx-auto mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  No pending requests
                </p>
              </div>
            ) : (
              pendingUsers.map((u, idx) => (
                <div
                  key={u.id}
                  className="lib-card p-3 border-l-4 border-l-amber-400"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 font-bold text-sm">
                        {u.name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        {u.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.username} · {u.department}
                      </p>
                      {u.year && (
                        <p className="text-xs text-muted-foreground">
                          Year: {u.year}
                        </p>
                      )}
                      {u.phone && (
                        <p className="text-xs text-muted-foreground">
                          {u.phone}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                    >
                      Pending
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-ocid={`users.pending.approve_button.${idx + 1}`}
                      size="sm"
                      className="flex-1 bg-lib-success/10 hover:bg-lib-success/20 text-lib-success border border-lib-success/30 text-xs"
                      variant="outline"
                      onClick={() => handleApprove(u)}
                    >
                      <UserCheck size={12} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      data-ocid={`users.pending.reject_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-destructive text-destructive text-xs"
                      onClick={() => handleReject(u)}
                    >
                      <UserX size={12} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* FAB */}
      <button
        type="button"
        data-ocid="users.add_button"
        onClick={() => {
          setForm(emptyUser);
          setShowForm(true);
        }}
        className="fixed bottom-20 right-4 w-14 h-14 bg-lib-red hover:bg-lib-red-dark text-white rounded-full shadow-lg flex items-center justify-center no-print"
        style={{ zIndex: 40 }}
      >
        <Plus size={24} />
      </button>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className="font-display font-bold">
              Add New User
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-3 space-y-3 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Username / Register ID *
              </Label>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                className="mt-1"
                placeholder="e.g. 23LS001"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Password (default: username)
              </Label>
              <Input
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="mt-1"
                placeholder="Leave blank for username as password"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, role: v as LibraryRole }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Department *</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm((p) => ({ ...p, department: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="mt-1"
                maxLength={10}
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
              data-ocid="users.add_button"
              className="flex-1 bg-lib-red hover:bg-lib-red-dark text-white"
              onClick={handleAdd}
            >
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
