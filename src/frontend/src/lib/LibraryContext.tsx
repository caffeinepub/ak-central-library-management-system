import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type Announcement,
  type Book,
  type Circulation,
  type EResource,
  type Fine,
  type GateEntry,
  type Journal,
  type Magazine,
  type Session,
  type User,
  storage,
} from "./storage";

interface LibraryContextValue {
  session: Session | null;
  currentUser: User | null;
  users: User[];
  books: Book[];
  circulations: Circulation[];
  journals: Journal[];
  magazines: Magazine[];
  eresources: EResource[];
  gateLog: GateEntry[];
  fines: Fine[];
  announcements: Announcement[];

  // Auth
  login: (
    username: string,
    password: string,
  ) => { success: boolean; error?: string };
  logout: () => void;

  // Refresh
  refresh: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [circulations, setCirculations] = useState<Circulation[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [eresources, setEresources] = useState<EResource[]>([]);
  const [gateLog, setGateLog] = useState<GateEntry[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const loadAll = useCallback(() => {
    setUsers(storage.getUsers());
    setBooks(storage.getBooks());
    setCirculations(storage.getCirculations());
    setJournals(storage.getJournals());
    setMagazines(storage.getMagazines());
    setEresources(storage.getEResources());
    setGateLog(storage.getGateLog());
    setFines(storage.getFines());
    setAnnouncements(storage.getAnnouncements());
  }, []);

  useEffect(() => {
    storage.seed();
    setSessionState(storage.getSession());
    loadAll();
  }, [loadAll]);

  const login = useCallback(
    (username: string, password: string) => {
      const allUsers = storage.getUsers();
      const user = allUsers.find(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() &&
          u.password === password,
      );
      if (!user)
        return { success: false, error: "Invalid username or password" };
      if (!user.approved)
        return {
          success: false,
          error: "Your account is pending approval by the librarian",
        };

      const sess: Session = {
        userId: user.id,
        role: user.role,
        name: user.name,
        username: user.username,
      };
      storage.setSession(sess);
      setSessionState(sess);
      loadAll();
      return { success: true };
    },
    [loadAll],
  );

  const logout = useCallback(() => {
    storage.setSession(null);
    setSessionState(null);
  }, []);

  const refresh = useCallback(() => {
    loadAll();
  }, [loadAll]);

  const currentUser = session ? storage.getUserById(session.userId) : null;

  return (
    <LibraryContext.Provider
      value={{
        session,
        currentUser,
        users,
        books,
        circulations,
        journals,
        magazines,
        eresources,
        gateLog,
        fines,
        announcements,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
