import { Toaster } from "@/components/ui/sonner";
import { LibraryProvider, useLibrary } from "@/lib/LibraryContext";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

import AnalyticsScreen from "@/components/AnalyticsScreen";
import BooksScreen from "@/components/BooksScreen";
import BottomNav, { type AppPage } from "@/components/BottomNav";
import CirculationScreen from "@/components/CirculationScreen";
import DashboardScreen from "@/components/DashboardScreen";
import EResourcesScreen from "@/components/EResourcesScreen";
import FinesScreen from "@/components/FinesScreen";
import GateRegisterScreen from "@/components/GateRegisterScreen";
import JournalsScreen from "@/components/JournalsScreen";
import LibraryRulesScreen from "@/components/LibraryRulesScreen";
import LoginScreen from "@/components/LoginScreen";
import MagazinesScreen from "@/components/MagazinesScreen";
import MoreScreen from "@/components/MoreScreen";
import PageHeader from "@/components/PageHeader";
import ProfileScreen from "@/components/ProfileScreen";
import UsersScreen from "@/components/UsersScreen";

const PAGE_TITLES: Record<AppPage, string> = {
  dashboard: "AK Central Library",
  books: "Book Catalog",
  circulation: "Circulation",
  more: "More Services",
  account: "My Account",
  gate: "Gate Register",
  journals: "Journals",
  magazines: "Magazines",
  eresources: "E-Resources",
  fines: "Fines & Receipts",
  analytics: "Analytics",
  users: "User Management",
  rules: "Library Rules & Regulations",
};

const MORE_PAGES: AppPage[] = [
  "gate",
  "journals",
  "magazines",
  "eresources",
  "fines",
  "analytics",
  "users",
  "rules",
];

function MainApp() {
  const { session, fines } = useLibrary();
  const [page, setPage] = useState<AppPage>("dashboard");

  // Route guard for admin-only pages
  const role = session?.role ?? "Student";
  const isAdmin = role === "Admin" || role === "Librarian";

  useEffect(() => {
    if (!isAdmin && (page === "analytics" || page === "users")) {
      setPage("more");
    }
  }, [isAdmin, page]);

  const myUnpaidFines = session
    ? fines.filter((f) => f.userId === session.userId && !f.paid).length
    : 0;

  function navigate(p: AppPage) {
    setPage(p);
    window.scrollTo({ top: 0 });
  }

  const isMoreSubPage = MORE_PAGES.includes(page);
  const showBackArrow = isMoreSubPage;

  const headerRight = (
    <div className="flex items-center gap-2">
      {page === "dashboard" && session && (
        <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2 py-1">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {session.name[0]}
            </span>
          </div>
          <span className="text-white text-xs font-medium max-w-20 truncate">
            {session.name.split(" ")[0]}
          </span>
        </div>
      )}
      {myUnpaidFines > 0 && page !== "fines" && (
        <button
          type="button"
          onClick={() => navigate("fines")}
          className="bg-lib-gold text-lib-red-dark rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs"
        >
          {myUnpaidFines}
        </button>
      )}
    </div>
  );

  const headerTitle =
    page === "dashboard" ? "AK Central Library" : PAGE_TITLES[page];

  // Special header for dashboard — show gold brand name
  const dashboardHeader = (
    <header className="lib-header no-print px-4 py-3 flex items-center justify-between min-h-[56px]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
          <BookOpen size={18} className="text-lib-gold" />
        </div>
        <span
          className="font-display font-bold text-lg"
          style={{ color: "#FFD700" }}
        >
          AK Central Library
        </span>
      </div>
      {headerRight}
    </header>
  );

  return (
    <div className="mobile-container">
      {/* Header */}
      {page === "dashboard" ? (
        dashboardHeader
      ) : (
        <PageHeader
          title={headerTitle}
          onBack={showBackArrow ? () => navigate("more") : undefined}
          right={headerRight}
        />
      )}

      {/* Screen content */}
      <main className="flex flex-col">
        {page === "dashboard" && (
          <DashboardScreen
            onNavigate={navigate}
            userName={session?.name ?? "User"}
          />
        )}
        {page === "books" && <BooksScreen />}
        {page === "circulation" && <CirculationScreen />}
        {page === "more" && <MoreScreen onNavigate={navigate} role={role} />}
        {page === "account" && <ProfileScreen />}
        {page === "gate" && <GateRegisterScreen />}
        {page === "journals" && <JournalsScreen />}
        {page === "magazines" && <MagazinesScreen />}
        {page === "eresources" && <EResourcesScreen />}
        {page === "fines" && <FinesScreen />}
        {page === "analytics" && isAdmin && <AnalyticsScreen />}
        {page === "users" && isAdmin && <UsersScreen />}
        {page === "rules" && <LibraryRulesScreen />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav current={page} onNavigate={navigate} role={role} />

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-lib-red/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-lib-red" />
          </div>
          <p className="font-display font-bold text-lib-gold text-xl">
            AK Central Library
          </p>
        </div>
      </div>
    );
  }

  return (
    <LibraryProvider>
      <AppWithAuth />
    </LibraryProvider>
  );
}

function AppWithAuth() {
  const { session } = useLibrary();
  return session ? <MainApp /> : <LoginScreen />;
}
