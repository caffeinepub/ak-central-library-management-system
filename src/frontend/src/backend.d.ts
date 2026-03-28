import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    floor: bigint;
    hallName: string;
    shelfNumber: string;
    rackNumber: string;
}
export type Time = bigint;
export interface Journal {
    title: string;
    subscriptionCost: bigint;
    arrivedThisMonth: boolean;
    journalType: Variant_Print_EJournal;
    frequency: string;
    department: string;
}
export interface Fine {
    circulationId: string;
    userId: string;
    paid: boolean;
    paymentDate?: Time;
    amount: bigint;
    reason: string;
}
export interface GateEntry {
    exitTime?: Time;
    entryTime: Time;
    userId: string;
    mobileNumber: string;
}
export interface Magazine {
    title: string;
    purchaseDate: Time;
    cost: bigint;
    subscriptionPeriod: bigint;
    department: string;
}
export interface Book {
    title: string;
    availableCopies: bigint;
    isbn: string;
    publisher: string;
    year: bigint;
    author: string;
    totalCopies: bigint;
    ddcNumber: string;
    department: string;
    location: Location;
}
export interface Circulation {
    issueDate: Time;
    status: CirculationStatus;
    borrowerId: string;
    dueDate: Time;
    renewalCount: bigint;
    bookId: string;
    returnDate?: Time;
}
export interface UserProfile {
    username: string;
    password: string;
    role: LibraryRole;
    year: bigint;
    approved: boolean;
    department: string;
    phoneNumber: string;
    registerId: string;
}
export interface EResource {
    title: string;
    resourceType: string;
    department: string;
    uploadDate: Time;
    uploadedBy: string;
    fileUrl: string;
}
export enum CirculationStatus {
    lost = "lost",
    reserved = "reserved",
    available = "available",
    issued = "issued",
    renewed = "renewed",
    returned = "returned"
}
export enum LibraryRole {
    Staff = "Staff",
    Student = "Student",
    Admin = "Admin",
    Librarian = "Librarian"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_Print_EJournal {
    Print = "Print",
    EJournal = "EJournal"
}
export interface backendInterface {
    addBook(bookId: string, title: string, author: string, isbn: string, publisher: string, year: bigint, department: string, ddcNumber: string, totalCopies: bigint, floor: bigint, hallName: string, rackNumber: string, shelfNumber: string): Promise<void>;
    addEResource(resourceId: string, title: string, resourceType: string, department: string, fileUrl: string): Promise<void>;
    addJournal(journalId: string, title: string, journalType: Variant_Print_EJournal, subscriptionCost: bigint, frequency: string, department: string, arrivedThisMonth: boolean): Promise<void>;
    addMagazine(magazineId: string, title: string, purchaseDate: Time, cost: bigint, subscriptionPeriod: bigint, department: string): Promise<void>;
    approveRegistration(registerId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBook(bookId: string): Promise<void>;
    getAllBooks(): Promise<Array<Book>>;
    getAllEResources(): Promise<Array<EResource>>;
    getAllJournals(): Promise<Array<Journal>>;
    getAllMagazines(): Promise<Array<Magazine>>;
    getBook(bookId: string): Promise<Book>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyGateLog(): Promise<Array<GateEntry>>;
    getOverdueBooks(): Promise<Array<Circulation>>;
    getUserBorrowedBooks(userId: string): Promise<Array<Circulation>>;
    getUserFines(userId: string): Promise<Array<Fine>>;
    isCallerAdmin(): Promise<boolean>;
    issueBook(circulationId: string, userId: string, bookId: string): Promise<void>;
    logEntry(entryId: string, userId: string, mobileNumber: string): Promise<void>;
    logExit(entryId: string): Promise<void>;
    payFine(fineId: string, paymentDate: Time): Promise<void>;
    rejectRegistration(registerId: string): Promise<void>;
    renewBook(circulationId: string): Promise<void>;
    returnBook(circulationId: string, returnDate: Time): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchBooks(searchText: string): Promise<Array<Book>>;
    submitRegistrationRequest(registerId: string, username: string, department: string, year: bigint, phoneNumber: string): Promise<void>;
    updateBook(bookId: string, title: string, author: string, isbn: string, publisher: string, year: bigint, department: string, ddcNumber: string, totalCopies: bigint, floor: bigint, hallName: string, rackNumber: string, shelfNumber: string): Promise<void>;
}
