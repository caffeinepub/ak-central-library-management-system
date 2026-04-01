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
  const [showForgot, setShowForgot] = useState(false);
  const [forgotId, setForgotId] = useState("");
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
      <div className="min-h-screen min-h-dvh flex flex-col bg-lib-violet">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 bg-lib-violet-dark">
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
          <h2 className="font-display text-xl font-bold text-lib-violet mb-1">
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
              className="w-full bg-lib-violet hover:bg-lib-violet-dark text-white font-bold py-3"
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
          "linear-gradient(160deg, #3B0764 0%, #7C3AED 45%, #8B5CF6 100%)",
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
              className="mt-1 h-12 bg-white border-border focus:border-lib-violet focus-visible:ring-lib-violet/20"
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
                className="h-12 pr-12 bg-white border-border focus:border-lib-violet focus-visible:ring-lib-violet/20"
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
              color: "#7C3AED",
              border: "none",
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : null}
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        {/* Forgot Password */}
        {!showForgot ? (
          <div className="mt-4 text-center">
            <button
              type="button"
              data-ocid="login.forgot_password_link"
              onClick={() => setShowForgot(true)}
              className="text-sm text-lib-violet font-medium underline underline-offset-2"
            >
              Forgot Password?
            </button>
          </div>
        ) : (
          <div
            data-ocid="login.forgot_password_panel"
            className="mt-4 rounded-2xl border border-lib-violet/20 bg-lib-violet/5 p-4 space-y-3"
          >
            <h3 className="font-display font-bold text-lib-violet text-base">
              Forgot Password?
            </h3>
            <div>
              <Label htmlFor="forgot-id" className="text-xs font-semibold">
                Register ID / Username
              </Label>
              <Input
                id="forgot-id"
                data-ocid="login.forgot_password.input"
                value={forgotId}
                onChange={(e) => setForgotId(e.target.value)}
                placeholder="Enter your Register ID"
                className="mt-1 h-10 border-lib-violet/30 focus:border-lib-violet"
              />
            </div>
            <div className="rounded-xl bg-lib-violet/10 border border-lib-violet/20 px-3 py-2.5 text-xs text-lib-violet leading-relaxed">
              Please contact your Librarian or Admin with your Register ID to
              reset your password.
            </div>
            <button
              type="button"
              data-ocid="login.forgot_password.back_button"
              onClick={() => {
                setShowForgot(false);
                setForgotId("");
              }}
              className="text-xs text-lib-violet font-semibold underline underline-offset-2"
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            type="button"
            data-ocid="login.register_link"
            onClick={() => setShowRegister(true)}
            className="text-sm text-lib-violet font-semibold underline underline-offset-2"
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
