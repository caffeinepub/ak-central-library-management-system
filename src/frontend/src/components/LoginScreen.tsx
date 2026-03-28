import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLibrary } from "@/lib/LibraryContext";
import { isWorkingHours } from "@/lib/storage";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginScreen() {
  const { login, session } = useLibrary();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({
    registerId: "",
    name: "",
    department: "",
    phone: "",
    year: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = login(username.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      if (!isWorkingHours()) {
        toast.warning(
          "Library hours: 8 AM – 8 PM. You are logging in outside working hours.",
        );
      } else {
        toast.success("Welcome back!");
      }
    } else {
      toast.error(result.error ?? "Login failed");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.registerId || !regForm.name || !regForm.department) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Registration request submitted! Await librarian approval.");
    setShowRegister(false);
    setRegForm({
      registerId: "",
      name: "",
      department: "",
      phone: "",
      year: "",
    });
  };

  // Suppress unused warning
  void session;

  if (showRegister) {
    return (
      <div className="min-h-screen min-h-dvh flex flex-col bg-lib-red">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 bg-lib-red-dark">
          <button
            type="button"
            onClick={() => setShowRegister(false)}
            className="text-white font-bold text-lg"
          >
            ←
          </button>
          <span className="text-white font-semibold">Request Registration</span>
        </div>

        <div className="flex-1 bg-white rounded-t-3xl mt-2 p-6 overflow-y-auto">
          <h2 className="font-display text-xl font-bold text-lib-red mb-1">
            New Student Registration
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Fill in your details to request library access
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label
                htmlFor="reg-id"
                className="text-sm font-semibold text-foreground"
              >
                Register ID *
              </Label>
              <Input
                id="reg-id"
                value={regForm.registerId}
                onChange={(e) =>
                  setRegForm((p) => ({ ...p, registerId: e.target.value }))
                }
                placeholder="e.g. 23LS001"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="reg-name"
                className="text-sm font-semibold text-foreground"
              >
                Full Name *
              </Label>
              <Input
                id="reg-name"
                value={regForm.name}
                onChange={(e) =>
                  setRegForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Your full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="reg-dept"
                className="text-sm font-semibold text-foreground"
              >
                Department *
              </Label>
              <Input
                id="reg-dept"
                value={regForm.department}
                onChange={(e) =>
                  setRegForm((p) => ({ ...p, department: e.target.value }))
                }
                placeholder="e.g. Computer Science"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="reg-year"
                className="text-sm font-semibold text-foreground"
              >
                Year of Study
              </Label>
              <Input
                id="reg-year"
                value={regForm.year}
                onChange={(e) =>
                  setRegForm((p) => ({ ...p, year: e.target.value }))
                }
                placeholder="e.g. 2024"
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="reg-phone"
                className="text-sm font-semibold text-foreground"
              >
                Phone Number
              </Label>
              <Input
                id="reg-phone"
                value={regForm.phone}
                onChange={(e) =>
                  setRegForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="10-digit mobile number"
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-lib-red hover:bg-lib-red-dark text-white font-bold py-3"
            >
              Submit Registration Request
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen min-h-dvh flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #990000 0%, #CC0000 45%, #DD2222 100%)",
      }}
    >
      {/* Logo section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8 gap-4">
        <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/20">
          <img
            src="/assets/generated/ak-library-logo-transparent.dim_200x200.png"
            alt="AK Library"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <BookOpen
            size={48}
            className="text-yellow-400 absolute"
            style={{ display: "none" }}
          />
        </div>

        <div className="text-center">
          <h1
            className="font-display font-bold text-3xl leading-tight tracking-wide"
            style={{
              color: "#FFD700",
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            AK Central Library
          </h1>
          <p className="text-white/70 text-sm mt-1 tracking-widest uppercase font-medium">
            Knowledge Portal
          </p>
        </div>
      </div>

      {/* Login card */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          Welcome Back
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to access your library account
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label
              htmlFor="username"
              className="text-sm font-semibold text-foreground"
            >
              Username / Register ID
            </Label>
            <Input
              id="username"
              data-ocid="login.username_input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              className="mt-1 h-12 bg-white border-border focus:border-lib-red focus-visible:ring-lib-red/20"
              disabled={loading}
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                data-ocid="login.password_input"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-12 pr-12 bg-white border-border focus:border-lib-red focus-visible:ring-lib-red/20"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            data-ocid="login.submit_button"
            disabled={loading}
            className="w-full h-12 font-bold text-base mt-2"
            style={{
              backgroundColor: "#FFD700",
              color: "#CC0000",
              border: "none",
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : null}
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            data-ocid="login.register_link"
            onClick={() => setShowRegister(true)}
            className="text-sm text-lib-red font-semibold underline underline-offset-2"
          >
            Request Registration (New Students)
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Library Hours: 8:00 AM – 8:00 PM
        </p>
      </div>
    </div>
  );
}
