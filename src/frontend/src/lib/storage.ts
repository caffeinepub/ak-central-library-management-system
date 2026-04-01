/**
 * AK Central Library — LocalStorage Data Layer
 * All persistence handled client-side with localStorage
 */

export type LibraryRole = "Admin" | "Librarian" | "Staff" | "Student";
export type CirculationStatus =
  | "issued"
  | "renewed"
  | "returned"
  | "overdue"
  | "lost";
export type JournalType = "Print" | "EJournal";

export interface Location {
  floor: string;
  hallName: string;
  rackNumber: string;
  shelfNumber: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: LibraryRole;
  department: string;
  phone: string;
  approved: boolean;
  year?: string;
  pending?: boolean;
  nameUpdated?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  year: number;
  department: string;
  ddcNumber: string;
  totalCopies: number;
  availableCopies: number;
  location: Location;
}

export interface Circulation {
  id: string;
  bookId: string;
  borrowerId: string;
  borrowerName?: string;
  bookTitle?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: CirculationStatus;
  renewalCount: number;
  fineAmount?: number;
}

export interface Journal {
  id: string;
  title: string;
  journalType: JournalType;
  subscriptionCost: number;
  frequency: string;
  department: string;
  arrivedThisMonth: boolean;
}

export interface Magazine {
  id: string;
  title: string;
  purchaseDate: string;
  cost: number;
  subscriptionPeriod: number;
  department: string;
}

export interface EResource {
  id: string;
  title: string;
  resourceType: "E-Book" | "E-Journal" | "Digital Magazine";
  department: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
}

export interface GateEntry {
  id: string;
  userId: string;
  userName?: string;
  mobileNumber: string;
  entryTime: string;
  exitTime?: string;
  date: string;
}

export interface Fine {
  id: string;
  circulationId: string;
  userId: string;
  userName?: string;
  bookTitle?: string;
  amount: number;
  paid: boolean;
  paymentDate?: string;
  reason: string;
  overduedays: number;
}

export interface Announcement {
  id: string;
  text: string;
  postedBy: string;
  date: string;
}

export interface Session {
  userId: string;
  role: LibraryRole;
  name: string;
  username: string;
}

// Storage keys
const KEYS = {
  USERS: "ak_users",
  BOOKS: "ak_books",
  CIRCULATIONS: "ak_circulations",
  JOURNALS: "ak_journals",
  MAGAZINES: "ak_magazines",
  ERESOURCES: "ak_eresources",
  GATE_LOG: "ak_gate_log",
  FINES: "ak_fines",
  SESSION: "ak_session",
  ANNOUNCEMENTS: "ak_announcements",
  SEEDED: "ak_seeded_v4",
} as const;

function getItem<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function setSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(KEYS.SESSION);
  }
}

// Seed data
function seedData(): void {
  if (localStorage.getItem(KEYS.SEEDED)) return;

  // Seed users
  const users: User[] = [
    {
      id: "u1",
      username: "Admin",
      password: "admin @2026",
      name: "Dr. Arjun Kumar",
      role: "Admin",
      department: "Administration",
      phone: "9876543210",
      approved: true,
    },
    {
      id: "u2",
      username: "22LS001",
      password: "22LS001",
      name: "Priya Sharma",
      role: "Student",
      department: "Computer Science",
      phone: "9876543211",
      approved: true,
      year: "2022",
    },
    {
      id: "u3",
      username: "STAFF001",
      password: "STAFF001",
      name: "Rajesh Nair",
      role: "Staff",
      department: "Physics",
      phone: "9876543212",
      approved: true,
    },
    {
      id: "u4",
      username: "librarian",
      password: "librarian@2026",
      name: "Meena Krishnan",
      role: "Librarian",
      department: "Library",
      phone: "9876543213",
      approved: true,
    },
    {
      id: "u5",
      username: "22LS002",
      password: "22LS002",
      name: "Arun Velankanni",
      role: "Student",
      department: "Tamil",
      phone: "9876543214",
      approved: true,
      year: "2022",
    },
    {
      id: "u6",
      username: "23LS001",
      password: "23LS001",
      name: "Keerthi Devi",
      role: "Student",
      department: "History",
      phone: "9876543215",
      approved: false,
      pending: true,
      year: "2023",
    },
  ];

  // Seed books
  const books: Book[] = [
    {
      id: "b1",
      title: "Introduction to Computing",
      author: "Andrew S. Tanenbaum",
      isbn: "978-0134190440",
      publisher: "Pearson Education",
      year: 2021,
      department: "Computer Science",
      ddcNumber: "004",
      totalCopies: 5,
      availableCopies: 3,
      location: {
        floor: "Ground Floor",
        hallName: "Raj Hall",
        rackNumber: "Rack 1",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b2",
      title: "Philosophy of Mind",
      author: "Jaegwon Kim",
      isbn: "978-0813344584",
      publisher: "Westview Press",
      year: 2019,
      department: "Philosophy",
      ddcNumber: "128",
      totalCopies: 3,
      availableCopies: 2,
      location: {
        floor: "1st Floor",
        hallName: "Josita Hall",
        rackNumber: "Rack 3",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b3",
      title: "World Religions: A Historical Approach",
      author: "S.A. Nigosian",
      isbn: "978-0312165925",
      publisher: "Bedford Books",
      year: 2020,
      department: "Religion",
      ddcNumber: "200",
      totalCopies: 4,
      availableCopies: 4,
      location: {
        floor: "1st Floor",
        hallName: "Josita Hall",
        rackNumber: "Rack 5",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b4",
      title: "Sociology Fundamentals",
      author: "Anthony Giddens",
      isbn: "978-0745643090",
      publisher: "Polity Press",
      year: 2022,
      department: "Social Science",
      ddcNumber: "301",
      totalCopies: 6,
      availableCopies: 5,
      location: {
        floor: "Ground Floor",
        hallName: "Raja Hall",
        rackNumber: "Rack 2",
        shelfNumber: "Shelf 3",
      },
    },
    {
      id: "b5",
      title: "Tamil Literature Anthology",
      author: "K.V. Jagannathan",
      isbn: "978-8120600515",
      publisher: "Tamil Nadu Textbook Corporation",
      year: 2018,
      department: "Tamil",
      ddcNumber: "494",
      totalCopies: 8,
      availableCopies: 7,
      location: {
        floor: "2nd Floor",
        hallName: "Tamil Hall",
        rackNumber: "Rack 4",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b6",
      title: "Physics Principles and Problems",
      author: "Paul E. Tippens",
      isbn: "978-0073524597",
      publisher: "McGraw-Hill Education",
      year: 2021,
      department: "Science",
      ddcNumber: "530",
      totalCopies: 7,
      availableCopies: 4,
      location: {
        floor: "Ground Floor",
        hallName: "Science Hall",
        rackNumber: "Rack 6",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b7",
      title: "Electronics Engineering Principles",
      author: "Albert Paul Malvino",
      isbn: "978-0073529530",
      publisher: "McGraw-Hill Education",
      year: 2020,
      department: "Engineering",
      ddcNumber: "621",
      totalCopies: 5,
      availableCopies: 3,
      location: {
        floor: "2nd Floor",
        hallName: "Tech Hall",
        rackNumber: "Rack 2",
        shelfNumber: "Shelf 4",
      },
    },
    {
      id: "b8",
      title: "History of Indian Art",
      author: "Vidya Dehejia",
      isbn: "978-0714831824",
      publisher: "Phaidon Press",
      year: 2019,
      department: "Arts",
      ddcNumber: "709",
      totalCopies: 3,
      availableCopies: 3,
      location: {
        floor: "1st Floor",
        hallName: "Arts Hall",
        rackNumber: "Rack 1",
        shelfNumber: "Shelf 3",
      },
    },
    {
      id: "b9",
      title: "Modern Tamil Poetry",
      author: "Subramania Bharati",
      isbn: "978-8120604599",
      publisher: "Sahitya Akademi",
      year: 2020,
      department: "Literature",
      ddcNumber: "894",
      totalCopies: 4,
      availableCopies: 2,
      location: {
        floor: "2nd Floor",
        hallName: "Tamil Hall",
        rackNumber: "Rack 3",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b10",
      title: "History of India",
      author: "Romila Thapar",
      isbn: "978-0143031970",
      publisher: "Penguin Books India",
      year: 2021,
      department: "History",
      ddcNumber: "954",
      totalCopies: 6,
      availableCopies: 5,
      location: {
        floor: "1st Floor",
        hallName: "History Hall",
        rackNumber: "Rack 7",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b11",
      title: "Library and Information Science: An Introduction",
      author: "C.G. Viswanathan",
      isbn: "978-8170002437",
      publisher: "Ess Ess Publications",
      year: 2020,
      department: "Library Science",
      ddcNumber: "020",
      totalCopies: 5,
      availableCopies: 4,
      location: {
        floor: "Ground Floor",
        hallName: "Reference Hall",
        rackNumber: "Rack 1",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b12",
      title: "Cataloguing and Classification",
      author: "M.P. Satija",
      isbn: "978-8170003281",
      publisher: "Ess Ess Publications",
      year: 2019,
      department: "Library Science",
      ddcNumber: "025",
      totalCopies: 4,
      availableCopies: 3,
      location: {
        floor: "Ground Floor",
        hallName: "Reference Hall",
        rackNumber: "Rack 1",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b13",
      title: "Information Retrieval Systems",
      author: "Kowalski, Gerald J.",
      isbn: "978-1441971340",
      publisher: "Springer",
      year: 2022,
      department: "Library Science",
      ddcNumber: "025",
      totalCopies: 3,
      availableCopies: 3,
      location: {
        floor: "Ground Floor",
        hallName: "Reference Hall",
        rackNumber: "Rack 2",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b14",
      title: "Digital Libraries: Principles and Practice",
      author: "Witten, Ian H.",
      isbn: "978-0123748577",
      publisher: "Morgan Kaufmann",
      year: 2021,
      department: "Library Science",
      ddcNumber: "027",
      totalCopies: 4,
      availableCopies: 4,
      location: {
        floor: "Ground Floor",
        hallName: "Reference Hall",
        rackNumber: "Rack 2",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b15",
      title: "Discrete Mathematics and Its Applications",
      author: "Kenneth H. Rosen",
      isbn: "978-0073383095",
      publisher: "McGraw-Hill",
      year: 2022,
      department: "Computer Science",
      ddcNumber: "511",
      totalCopies: 6,
      availableCopies: 5,
      location: {
        floor: "Ground Floor",
        hallName: "Raj Hall",
        rackNumber: "Rack 1",
        shelfNumber: "Shelf 3",
      },
    },
    {
      id: "b16",
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell & Peter Norvig",
      isbn: "978-0134610993",
      publisher: "Pearson Education",
      year: 2021,
      department: "Computer Science",
      ddcNumber: "006",
      totalCopies: 4,
      availableCopies: 2,
      location: {
        floor: "Ground Floor",
        hallName: "Raj Hall",
        rackNumber: "Rack 2",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b17",
      title: "Database Management Systems",
      author: "Ramakrishnan, Raghu",
      isbn: "978-0072465631",
      publisher: "McGraw-Hill",
      year: 2020,
      department: "Computer Science",
      ddcNumber: "005",
      totalCopies: 5,
      availableCopies: 4,
      location: {
        floor: "Ground Floor",
        hallName: "Raj Hall",
        rackNumber: "Rack 3",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b18",
      title: "Organic Chemistry",
      author: "Paula Yurkanis Bruice",
      isbn: "978-0134042282",
      publisher: "Pearson Education",
      year: 2022,
      department: "Science",
      ddcNumber: "547",
      totalCopies: 5,
      availableCopies: 5,
      location: {
        floor: "Ground Floor",
        hallName: "Science Hall",
        rackNumber: "Rack 5",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b19",
      title: "Cell Biology",
      author: "Gerald Karp",
      isbn: "978-1119598435",
      publisher: "Wiley",
      year: 2021,
      department: "Science",
      ddcNumber: "571",
      totalCopies: 4,
      availableCopies: 3,
      location: {
        floor: "Ground Floor",
        hallName: "Science Hall",
        rackNumber: "Rack 6",
        shelfNumber: "Shelf 3",
      },
    },
    {
      id: "b20",
      title: "Engineering Mathematics",
      author: "B.S. Grewal",
      isbn: "978-8174091955",
      publisher: "Khanna Publishers",
      year: 2023,
      department: "Engineering",
      ddcNumber: "510",
      totalCopies: 8,
      availableCopies: 6,
      location: {
        floor: "2nd Floor",
        hallName: "Tech Hall",
        rackNumber: "Rack 1",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b21",
      title: "Strength of Materials",
      author: "R.K. Bansal",
      isbn: "978-8131808146",
      publisher: "Laxmi Publications",
      year: 2020,
      department: "Engineering",
      ddcNumber: "620",
      totalCopies: 6,
      availableCopies: 5,
      location: {
        floor: "2nd Floor",
        hallName: "Tech Hall",
        rackNumber: "Rack 3",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b22",
      title: "Indian Polity",
      author: "M. Laxmikanth",
      isbn: "978-9390486946",
      publisher: "McGraw-Hill Education",
      year: 2023,
      department: "Social Science",
      ddcNumber: "320",
      totalCopies: 7,
      availableCopies: 6,
      location: {
        floor: "Ground Floor",
        hallName: "Raja Hall",
        rackNumber: "Rack 3",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b23",
      title: "Principles of Economics",
      author: "N. Gregory Mankiw",
      isbn: "978-0357038314",
      publisher: "Cengage Learning",
      year: 2021,
      department: "Social Science",
      ddcNumber: "330",
      totalCopies: 5,
      availableCopies: 4,
      location: {
        floor: "Ground Floor",
        hallName: "Raja Hall",
        rackNumber: "Rack 4",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b24",
      title: "Thirukkural with Commentary",
      author: "Thiruvalluvar (Ed. by M. Rajaram)",
      isbn: "978-8120614291",
      publisher: "Sahitya Akademi",
      year: 2019,
      department: "Tamil",
      ddcNumber: "894",
      totalCopies: 10,
      availableCopies: 8,
      location: {
        floor: "2nd Floor",
        hallName: "Tamil Hall",
        rackNumber: "Rack 1",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b25",
      title: "Tamil Grammar: Tolkappiyam",
      author: "Tolkappiyar (Trans. S. Ilakkuvanar)",
      isbn: "978-8120600386",
      publisher: "Arul Neri Publications",
      year: 2018,
      department: "Tamil",
      ddcNumber: "495",
      totalCopies: 5,
      availableCopies: 5,
      location: {
        floor: "2nd Floor",
        hallName: "Tamil Hall",
        rackNumber: "Rack 2",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b26",
      title: "The Discovery of India",
      author: "Jawaharlal Nehru",
      isbn: "978-0143031031",
      publisher: "Penguin Books India",
      year: 2020,
      department: "History",
      ddcNumber: "954",
      totalCopies: 5,
      availableCopies: 4,
      location: {
        floor: "1st Floor",
        hallName: "History Hall",
        rackNumber: "Rack 5",
        shelfNumber: "Shelf 2",
      },
    },
    {
      id: "b27",
      title: "Ancient India",
      author: "R.S. Sharma",
      isbn: "978-8171313747",
      publisher: "NCERT Publications",
      year: 2019,
      department: "History",
      ddcNumber: "934",
      totalCopies: 6,
      availableCopies: 6,
      location: {
        floor: "1st Floor",
        hallName: "History Hall",
        rackNumber: "Rack 6",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b28",
      title: "Business Communication",
      author: "Lesikar, Raymond V.",
      isbn: "978-0071289948",
      publisher: "McGraw-Hill",
      year: 2021,
      department: "General",
      ddcNumber: "651",
      totalCopies: 4,
      availableCopies: 4,
      location: {
        floor: "Ground Floor",
        hallName: "Raja Hall",
        rackNumber: "Rack 6",
        shelfNumber: "Shelf 3",
      },
    },
    {
      id: "b29",
      title: "General Knowledge 2026",
      author: "Manohar Pandey",
      isbn: "978-9391447939",
      publisher: "Arihant Publications",
      year: 2025,
      department: "General",
      ddcNumber: "030",
      totalCopies: 8,
      availableCopies: 7,
      location: {
        floor: "Ground Floor",
        hallName: "Reference Hall",
        rackNumber: "Rack 4",
        shelfNumber: "Shelf 1",
      },
    },
    {
      id: "b30",
      title: "Environmental Studies",
      author: "Rajagopalan, R.",
      isbn: "978-0198082392",
      publisher: "Oxford University Press",
      year: 2022,
      department: "Science",
      ddcNumber: "363",
      totalCopies: 6,
      availableCopies: 6,
      location: {
        floor: "Ground Floor",
        hallName: "Science Hall",
        rackNumber: "Rack 7",
        shelfNumber: "Shelf 2",
      },
    },
  ];

  // Seed circulations (some active, one overdue)
  const today = new Date();
  const pastDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
  };
  const futureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const circulations: Circulation[] = [
    {
      id: "c1",
      bookId: "b1",
      borrowerId: "u2",
      borrowerName: "Priya Sharma",
      bookTitle: "Introduction to Computing",
      issueDate: pastDate(5),
      dueDate: futureDate(9),
      status: "issued",
      renewalCount: 0,
    },
    {
      id: "c2",
      bookId: "b9",
      borrowerId: "u5",
      borrowerName: "Arun Velankanni",
      bookTitle: "Modern Tamil Poetry",
      issueDate: pastDate(20),
      dueDate: pastDate(6),
      status: "overdue",
      renewalCount: 0,
      fineAmount: 12,
    },
    {
      id: "c3",
      bookId: "b6",
      borrowerId: "u3",
      borrowerName: "Rajesh Nair",
      bookTitle: "Physics Principles and Problems",
      issueDate: pastDate(10),
      dueDate: futureDate(4),
      status: "issued",
      renewalCount: 1,
    },
    {
      id: "c4",
      bookId: "b7",
      borrowerId: "u2",
      borrowerName: "Priya Sharma",
      bookTitle: "Electronics Engineering Principles",
      issueDate: pastDate(30),
      dueDate: pastDate(16),
      returnDate: pastDate(14),
      status: "returned",
      renewalCount: 0,
    },
  ];

  // Seed journals
  const journals: Journal[] = [
    {
      id: "j1",
      title: "Journal of Computer Science and Technology",
      journalType: "Print",
      subscriptionCost: 2500,
      frequency: "Monthly",
      department: "Computer Science",
      arrivedThisMonth: true,
    },
    {
      id: "j2",
      title: "International Journal of Physics Research",
      journalType: "EJournal",
      subscriptionCost: 4500,
      frequency: "Quarterly",
      department: "Science",
      arrivedThisMonth: false,
    },
    {
      id: "j3",
      title: "Tamil Kavithai Malar",
      journalType: "Print",
      subscriptionCost: 800,
      frequency: "Monthly",
      department: "Tamil",
      arrivedThisMonth: true,
    },
  ];

  // Seed magazines
  const magazines: Magazine[] = [
    {
      id: "m1",
      title: "Science Today",
      purchaseDate: pastDate(30),
      cost: 150,
      subscriptionPeriod: 12,
      department: "Science",
    },
    {
      id: "m2",
      title: "Frontline",
      purchaseDate: pastDate(14),
      cost: 80,
      subscriptionPeriod: 12,
      department: "Political Science",
    },
    {
      id: "m3",
      title: "Competition Success Review",
      purchaseDate: pastDate(7),
      cost: 100,
      subscriptionPeriod: 6,
      department: "General",
    },
  ];

  // Seed e-resources
  const eresources: EResource[] = [
    {
      id: "er1",
      title: "Data Structures and Algorithms - Complete Guide",
      resourceType: "E-Book",
      department: "Computer Science",
      uploadDate: pastDate(10),
      uploadedBy: "Admin",
      fileUrl: "https://example.com/ebooks/dsa-guide.pdf",
    },
    {
      id: "er2",
      title: "Tamil Nadu History Journal 2024",
      resourceType: "E-Journal",
      department: "History",
      uploadDate: pastDate(5),
      uploadedBy: "LIB001",
      fileUrl: "https://example.com/ejournals/tn-history-2024.pdf",
    },
    {
      id: "er3",
      title: "Current Affairs Monthly - March 2026",
      resourceType: "Digital Magazine",
      department: "General",
      uploadDate: pastDate(2),
      uploadedBy: "LIB001",
      fileUrl: "https://example.com/magazines/ca-march-2026.pdf",
    },
  ];

  // Seed gate log
  const gateLog: GateEntry[] = [
    {
      id: "g1",
      userId: "u2",
      userName: "Priya Sharma",
      mobileNumber: "9876543211",
      entryTime: `${today.toISOString().split("T")[0]}T09:15:00`,
      exitTime: `${today.toISOString().split("T")[0]}T11:30:00`,
      date: today.toISOString().split("T")[0],
    },
    {
      id: "g2",
      userId: "u3",
      userName: "Rajesh Nair",
      mobileNumber: "9876543212",
      entryTime: `${today.toISOString().split("T")[0]}T10:00:00`,
      date: today.toISOString().split("T")[0],
    },
    {
      id: "g3",
      userId: "u5",
      userName: "Arun Velankanni",
      mobileNumber: "9876543214",
      entryTime: `${today.toISOString().split("T")[0]}T11:45:00`,
      exitTime: `${today.toISOString().split("T")[0]}T13:00:00`,
      date: today.toISOString().split("T")[0],
    },
  ];

  // Seed fines
  const fines: Fine[] = [
    {
      id: "f1",
      circulationId: "c2",
      userId: "u5",
      userName: "Arun Velankanni",
      bookTitle: "Modern Tamil Poetry",
      amount: 12,
      paid: false,
      reason: "Book overdue by 6 days",
      overduedays: 6,
    },
  ];

  // Seed announcements
  const announcements: Announcement[] = [
    {
      id: "an1",
      text: "🎉 New arrival: 50 new books added to the CS section. Visit the Ground Floor, Raj Hall to explore!",
      postedBy: "Dr. Arjun Kumar",
      date: today.toISOString().split("T")[0],
    },
    {
      id: "an2",
      text: "📚 Library will remain open on Saturday (March 7) from 9 AM to 4 PM for exam preparation support.",
      postedBy: "Meena Krishnan",
      date: pastDate(1),
    },
    {
      id: "an3",
      text: "⚠️ Reminder: All borrowed books must be returned before the end of semester examination period.",
      postedBy: "Dr. Arjun Kumar",
      date: pastDate(3),
    },
  ];

  setItem(KEYS.USERS, users);
  setItem(KEYS.BOOKS, books);
  setItem(KEYS.CIRCULATIONS, circulations);
  setItem(KEYS.JOURNALS, journals);
  setItem(KEYS.MAGAZINES, magazines);
  setItem(KEYS.ERESOURCES, eresources);
  setItem(KEYS.GATE_LOG, gateLog);
  setItem(KEYS.FINES, fines);
  setItem(KEYS.ANNOUNCEMENTS, announcements);
  localStorage.setItem(KEYS.SEEDED, "true");
}

// Storage API
export const storage = {
  seed: seedData,

  // Session
  getSession,
  setSession,

  // Users
  getUsers: () => getItem<User>(KEYS.USERS),
  setUsers: (u: User[]) => setItem(KEYS.USERS, u),
  getUserById: (id: string) =>
    getItem<User>(KEYS.USERS).find((u) => u.id === id) ?? null,
  getUserByUsername: (username: string) =>
    getItem<User>(KEYS.USERS).find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    ) ?? null,
  addUser: (u: User) => setItem(KEYS.USERS, [...getItem<User>(KEYS.USERS), u]),
  updateUser: (updated: User) =>
    setItem(
      KEYS.USERS,
      getItem<User>(KEYS.USERS).map((u) => (u.id === updated.id ? updated : u)),
    ),
  deleteUser: (id: string) =>
    setItem(
      KEYS.USERS,
      getItem<User>(KEYS.USERS).filter((u) => u.id !== id),
    ),

  // Books
  getBooks: () => getItem<Book>(KEYS.BOOKS),
  setBooks: (b: Book[]) => setItem(KEYS.BOOKS, b),
  getBookById: (id: string) =>
    getItem<Book>(KEYS.BOOKS).find((b) => b.id === id) ?? null,
  addBook: (b: Book) => setItem(KEYS.BOOKS, [...getItem<Book>(KEYS.BOOKS), b]),
  updateBook: (updated: Book) =>
    setItem(
      KEYS.BOOKS,
      getItem<Book>(KEYS.BOOKS).map((b) => (b.id === updated.id ? updated : b)),
    ),
  deleteBook: (id: string) =>
    setItem(
      KEYS.BOOKS,
      getItem<Book>(KEYS.BOOKS).filter((b) => b.id !== id),
    ),

  // Circulations
  getCirculations: () => getItem<Circulation>(KEYS.CIRCULATIONS),
  setCirculations: (c: Circulation[]) => setItem(KEYS.CIRCULATIONS, c),
  addCirculation: (c: Circulation) =>
    setItem(KEYS.CIRCULATIONS, [...getItem<Circulation>(KEYS.CIRCULATIONS), c]),
  updateCirculation: (updated: Circulation) =>
    setItem(
      KEYS.CIRCULATIONS,
      getItem<Circulation>(KEYS.CIRCULATIONS).map((c) =>
        c.id === updated.id ? updated : c,
      ),
    ),

  // Journals
  getJournals: () => getItem<Journal>(KEYS.JOURNALS),
  addJournal: (j: Journal) =>
    setItem(KEYS.JOURNALS, [...getItem<Journal>(KEYS.JOURNALS), j]),
  updateJournal: (updated: Journal) =>
    setItem(
      KEYS.JOURNALS,
      getItem<Journal>(KEYS.JOURNALS).map((j) =>
        j.id === updated.id ? updated : j,
      ),
    ),
  deleteJournal: (id: string) =>
    setItem(
      KEYS.JOURNALS,
      getItem<Journal>(KEYS.JOURNALS).filter((j) => j.id !== id),
    ),

  // Magazines
  getMagazines: () => getItem<Magazine>(KEYS.MAGAZINES),
  addMagazine: (m: Magazine) =>
    setItem(KEYS.MAGAZINES, [...getItem<Magazine>(KEYS.MAGAZINES), m]),
  updateMagazine: (updated: Magazine) =>
    setItem(
      KEYS.MAGAZINES,
      getItem<Magazine>(KEYS.MAGAZINES).map((m) =>
        m.id === updated.id ? updated : m,
      ),
    ),
  deleteMagazine: (id: string) =>
    setItem(
      KEYS.MAGAZINES,
      getItem<Magazine>(KEYS.MAGAZINES).filter((m) => m.id !== id),
    ),

  // E-Resources
  getEResources: () => getItem<EResource>(KEYS.ERESOURCES),
  addEResource: (e: EResource) =>
    setItem(KEYS.ERESOURCES, [...getItem<EResource>(KEYS.ERESOURCES), e]),
  deleteEResource: (id: string) =>
    setItem(
      KEYS.ERESOURCES,
      getItem<EResource>(KEYS.ERESOURCES).filter((e) => e.id !== id),
    ),

  // Gate Log
  getGateLog: () => getItem<GateEntry>(KEYS.GATE_LOG),
  addGateEntry: (g: GateEntry) =>
    setItem(KEYS.GATE_LOG, [...getItem<GateEntry>(KEYS.GATE_LOG), g]),
  updateGateEntry: (updated: GateEntry) =>
    setItem(
      KEYS.GATE_LOG,
      getItem<GateEntry>(KEYS.GATE_LOG).map((g) =>
        g.id === updated.id ? updated : g,
      ),
    ),

  // Fines
  getFines: () => getItem<Fine>(KEYS.FINES),
  addFine: (f: Fine) => setItem(KEYS.FINES, [...getItem<Fine>(KEYS.FINES), f]),
  updateFine: (updated: Fine) =>
    setItem(
      KEYS.FINES,
      getItem<Fine>(KEYS.FINES).map((f) => (f.id === updated.id ? updated : f)),
    ),

  // Announcements
  getAnnouncements: () => getItem<Announcement>(KEYS.ANNOUNCEMENTS),
  addAnnouncement: (a: Announcement) =>
    setItem(KEYS.ANNOUNCEMENTS, [
      ...getItem<Announcement>(KEYS.ANNOUNCEMENTS),
      a,
    ]),
  deleteAnnouncement: (id: string) =>
    setItem(
      KEYS.ANNOUNCEMENTS,
      getItem<Announcement>(KEYS.ANNOUNCEMENTS).filter((a) => a.id !== id),
    ),
};

// DDC auto-classification
export function suggestDDC(
  title: string,
): { number: string; category: string } | null {
  const t = title.toLowerCase();
  if (
    /computing|computer|programming|software|database|network|algorithm|data structure|internet/.test(
      t,
    )
  )
    return { number: "004", category: "Computer Science (004)" };
  if (
    /philosophy|logic|ethics|mind|metaphysics|epistemology|plato|kant/.test(t)
  )
    return { number: "100", category: "Philosophy (100s)" };
  if (
    /religion|theology|bible|quran|hindu|buddhism|christianity|islam|sikh/.test(
      t,
    )
  )
    return { number: "200", category: "Religion (200s)" };
  if (
    /sociology|political|economics|law|education|social|government|public/.test(
      t,
    )
  )
    return { number: "300", category: "Social Sciences (300s)" };
  if (
    /tamil|language|linguistics|grammar|sanskrit|hindi|malayalam|telugu|kannada/.test(
      t,
    )
  )
    return { number: "400", category: "Language (400s)" };
  if (
    /physics|chemistry|biology|mathematics|math|science|ecology|botany|zoology/.test(
      t,
    )
  )
    return { number: "500", category: "Natural Sciences (500s)" };
  if (
    /engineering|technology|medicine|pharmacy|electronics|mechanical|civil|electrical/.test(
      t,
    )
  )
    return { number: "600", category: "Technology (600s)" };
  if (
    /art|music|sports|photography|film|cinema|dance|architecture|painting/.test(
      t,
    )
  )
    return { number: "700", category: "Arts (700s)" };
  if (/literature|poetry|fiction|novel|drama|story|short story|poem/.test(t))
    return { number: "800", category: "Literature (800s)" };
  if (
    /history|geography|travel|biography|india|ancient|medieval|modern|war/.test(
      t,
    )
  )
    return { number: "900", category: "History & Geography (900s)" };
  return null;
}

// Calculate fine (₹2/day)
export function calculateFine(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff * 2 : 0;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function isWorkingHours(): boolean {
  const now = new Date();
  const h = now.getHours();
  return h >= 8 && h < 20;
}
