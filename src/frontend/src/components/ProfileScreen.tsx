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
import { storage } from "@/lib/storage";
import {
  Building,
  Key,
  LogOut,
  Pencil,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfileScreen() {
  const { currentUser, session, logout, refresh } = useLibrary();
  const [showChangePass, setShowChangePass] = useState(false);
  const [passForm, setPassForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  // Edit Profile state (Admin & Librarian only)
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    department: "",
  });

  const canEditProfile =
    currentUser?.role === "Admin" || currentUser?.role === "Librarian";

  function openEditProfile() {
    setEditForm({
      name: currentUser?.name ?? "",
      phone: currentUser?.phone ?? "",
      department: currentUser?.department ?? "",
    });
    setShowEditProfile(true);
  }

  function handleSaveProfile() {
    if (!editForm.name.trim() || !editForm.department.trim()) {
      toast.error("Name and Department cannot be empty");
      return;
    }
    if (!currentUser || !session) return;

    const updatedUser = {
      ...currentUser,
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      department: editForm.department.trim(),
    };
    storage.updateUser(updatedUser);

    // Update session name so header reflects the change immediately
    storage.setSession({ ...session, name: updatedUser.name });

    refresh();
    setShowEditProfile(false);
    toast.success("Profile updated successfully");
  }

  if (!currentUser || !session) return null;

  function handleChangePassword() {
    if (!passForm.current || !passForm.newPass || !passForm.confirm) {
      toast.error("Please fill all fields");
      return;
    }
    if (passForm.current !== currentUser!.password) {
      toast.error("Current password is incorrect");
      return;
    }
    if (passForm.newPass !== passForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passForm.newPass.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    storage.updateUser({ ...currentUser!, password: passForm.newPass });
    setPassForm({ current: "", newPass: "", confirm: "" });
    setShowChangePass(false);
    toast.success("Password changed successfully");
  }

  const roleColors: Record<string, string> = {
    Admin: "bg-lib-violet/10 text-lib-violet border-lib-violet/20",
    Librarian: "bg-blue-50 text-blue-700 border-blue-200",
    Staff: "bg-purple-50 text-purple-700 border-purple-200",
    Student: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div data-ocid="profile.page" className="lib-content">
      {/* Profile header */}
      <div className="bg-white border-b border-border px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-lib-violet/10 border-2 border-lib-violet/20 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-lib-violet">
              {currentUser.name[0]}
            </span>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">
              {currentUser.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentUser.username}
            </p>
            <Badge
              className={`mt-1 text-xs ${roleColors[currentUser.role] ?? ""}`}
              variant="outline"
            >
              {currentUser.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="px-4 py-4 space-y-3">
        <p className="font-display font-bold text-sm text-foreground">
          Account Details
        </p>

        <ProfileRow icon={User} label="Full Name" value={currentUser.name} />
        <ProfileRow
          icon={Shield}
          label="Register / Staff ID"
          value={currentUser.username}
        />
        <ProfileRow
          icon={Building}
          label="Department"
          value={currentUser.department}
        />
        {currentUser.phone && (
          <ProfileRow icon={Phone} label="Phone" value={currentUser.phone} />
        )}
        {currentUser.year && (
          <ProfileRow icon={User} label="Year" value={currentUser.year} />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 space-y-3">
        {canEditProfile && (
          <Button
            data-ocid="profile.edit_profile_button"
            variant="outline"
            className="w-full border-lib-gold text-lib-gold hover:bg-lib-gold/5 font-semibold"
            onClick={openEditProfile}
          >
            <Pencil size={16} className="mr-2" />
            Edit Profile
          </Button>
        )}

        <Button
          data-ocid="profile.change_password_button"
          variant="outline"
          className="w-full border-lib-violet text-lib-violet hover:bg-lib-violet/5 font-semibold"
          onClick={() => setShowChangePass(true)}
        >
          <Key size={16} className="mr-2" />
          Change Password
        </Button>

        <Button
          data-ocid="profile.logout_button"
          variant="destructive"
          className="w-full font-semibold bg-lib-violet hover:bg-lib-violet-dark"
          onClick={logout}
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>

      {/* App info */}
      <div className="px-4 py-6 mt-4 text-center border-t border-border">
        <p className="font-display font-bold text-lib-gold text-sm">
          AK Central Library
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Mobile Library Management System
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
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

      {/* Edit Profile Dialog (Admin & Librarian only) */}
      {canEditProfile && (
        <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
          <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
            <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
              <DialogTitle className="font-display font-bold">
                Edit Profile
              </DialogTitle>
            </DialogHeader>
            <div className="px-4 py-3 space-y-3">
              <div>
                <Label className="text-xs font-semibold">Full Name</Label>
                <Input
                  data-ocid="profile.edit_name_input"
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Enter full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Phone</Label>
                <Input
                  data-ocid="profile.edit_phone_input"
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="Enter phone number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Department</Label>
                <Input
                  data-ocid="profile.edit_department_input"
                  type="text"
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, department: e.target.value }))
                  }
                  placeholder="Enter department"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-border flex gap-2">
              <Button
                data-ocid="profile.edit_profile_cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="profile.edit_profile_save_button"
                className="flex-1 bg-lib-gold hover:bg-lib-gold/90 text-white"
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Change Password Dialog */}
      <Dialog open={showChangePass} onOpenChange={setShowChangePass}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className="font-display font-bold">
              Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-3 space-y-3">
            <div>
              <Label className="text-xs font-semibold">Current Password</Label>
              <Input
                type="password"
                value={passForm.current}
                onChange={(e) =>
                  setPassForm((p) => ({ ...p, current: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">New Password</Label>
              <Input
                type="password"
                value={passForm.newPass}
                onChange={(e) =>
                  setPassForm((p) => ({ ...p, newPass: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Confirm New Password
              </Label>
              <Input
                type="password"
                value={passForm.confirm}
                onChange={(e) =>
                  setPassForm((p) => ({ ...p, confirm: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowChangePass(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-lib-violet hover:bg-lib-violet-dark text-white"
              onClick={handleChangePassword}
            >
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.FC<{ size: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
      <div className="w-8 h-8 rounded-lg bg-lib-violet/10 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-lib-violet" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
