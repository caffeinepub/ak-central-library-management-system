import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Custom role types for library system
  public type LibraryRole = {
    #Admin;
    #Librarian;
    #Staff;
    #Student;
  };

  public type UserProfile = {
    registerId : Text;
    username : Text;
    password : Text;
    role : LibraryRole;
    department : Text;
    year : Nat;
    phoneNumber : Text;
    approved : Bool;
  };

  public type RegistrationRequest = {
    registerId : Text;
    username : Text;
    department : Text;
    year : Nat;
    phoneNumber : Text;
    status : { #pending; #approved; #rejected };
  };

  public type Book = {
    title : Text;
    author : Text;
    isbn : Text;
    publisher : Text;
    year : Nat;
    department : Text;
    ddcNumber : Text;
    totalCopies : Nat;
    availableCopies : Nat;
    location : Location;
  };

  public type Location = {
    floor : Nat;
    hallName : Text;
    rackNumber : Text;
    shelfNumber : Text;
  };

  public type Circulation = {
    borrowerId : Text;
    bookId : Text;
    issueDate : Time.Time;
    dueDate : Time.Time;
    returnDate : ?Time.Time;
    status : CirculationStatus;
    renewalCount : Nat;
  };

  public type CirculationStatus = {
    #available;
    #issued;
    #returned;
    #renewed;
    #reserved;
    #lost;
  };

  public type Fine = {
    userId : Text;
    circulationId : Text;
    amount : Nat;
    reason : Text;
    paid : Bool;
    paymentDate : ?Time.Time;
  };

  public type Journal = {
    title : Text;
    journalType : { #Print; #EJournal };
    subscriptionCost : Nat;
    frequency : Text;
    department : Text;
    arrivedThisMonth : Bool;
  };

  public type Magazine = {
    title : Text;
    purchaseDate : Time.Time;
    cost : Nat;
    subscriptionPeriod : Nat;
    department : Text;
  };

  public type EResource = {
    title : Text;
    resourceType : Text;
    department : Text;
    uploadedBy : Text;
    uploadDate : Time.Time;
    fileUrl : Text;
  };

  public type GateEntry = {
    userId : Text;
    mobileNumber : Text;
    entryTime : Time.Time;
    exitTime : ?Time.Time;
  };

  public type Receipt = {
    userId : Text;
    userName : Text;
    registerNumber : Text;
    bookTitle : Text;
    borrowDate : Time.Time;
    returnDate : Time.Time;
    overdueDays : Int;
    amount : Nat;
    paymentDate : Time.Time;
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let usersByRegisterId = Map.empty<Text, Principal>();
  let registrationRequests = Map.empty<Text, RegistrationRequest>();
  let books = Map.empty<Text, Book>();
  let circulation = Map.empty<Text, Circulation>();
  let fines = Map.empty<Text, Fine>();
  let journals = Map.empty<Text, Journal>();
  let magazines = Map.empty<Text, Magazine>();
  let eResources = Map.empty<Text, EResource>();
  let gateRegister = Map.empty<Text, GateEntry>();
  let receipts = Map.empty<Text, Receipt>();

  // Helper functions
  func isWorkingHours() : Bool {
    let now = Time.now();
    let secondsSinceEpoch = now / 1_000_000_000;
    let hour = (secondsSinceEpoch / 3600) % 24;
    hour >= 8 and hour < 20;
  };

  func checkWorkingHours() {
    if (not isWorkingHours()) {
      Runtime.trap("Operations only allowed between 8 AM and 8 PM");
    };
  };

  func getInternalUserProfile(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  func isAdminOrLibrarian(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.approved and (profile.role == #Admin or profile.role == #Librarian);
      };
    };
  };

  func isApprovedUser(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.approved };
    };
  };

  // Add helper function for lowercase conversion
  func toLowerCase(text : Text) : Text {
    text.map(
      func(c) {
        if (c >= 'A' and c <= 'Z') {
          Char.fromNat32(c.toNat32() + 32);
        } else {
          c;
        };
      }
    );
  };

  // Initialize sample data
  func initializeSampleData() {
    // This would be called on first install
    // Sample users, books, journals, magazines would be added here
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    usersByRegisterId.add(profile.registerId, caller);
  };

  // Registration Management
  public shared ({ caller }) func submitRegistrationRequest(
    registerId : Text,
    username : Text,
    department : Text,
    year : Nat,
    phoneNumber : Text,
  ) : async () {
    let request : RegistrationRequest = {
      registerId;
      username;
      department;
      year;
      phoneNumber;
      status = #pending;
    };
    registrationRequests.add(registerId, request);
  };

  public shared ({ caller }) func approveRegistration(registerId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve registrations");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can approve registrations");
    };

    switch (registrationRequests.get(registerId)) {
      case (null) { Runtime.trap("Registration request not found") };
      case (?request) {
        let updatedRequest = {
          registerId = request.registerId;
          username = request.username;
          department = request.department;
          year = request.year;
          phoneNumber = request.phoneNumber;
          status = #approved;
        };
        registrationRequests.add(registerId, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func rejectRegistration(registerId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject registrations");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can reject registrations");
    };

    switch (registrationRequests.get(registerId)) {
      case (null) { Runtime.trap("Registration request not found") };
      case (?request) {
        let updatedRequest = {
          registerId = request.registerId;
          username = request.username;
          department = request.department;
          year = request.year;
          phoneNumber = request.phoneNumber;
          status = #rejected;
        };
        registrationRequests.add(registerId, updatedRequest);
      };
    };
  };

  // Book Management
  public shared ({ caller }) func addBook(
    bookId : Text,
    title : Text,
    author : Text,
    isbn : Text,
    publisher : Text,
    year : Nat,
    department : Text,
    ddcNumber : Text,
    totalCopies : Nat,
    floor : Nat,
    hallName : Text,
    rackNumber : Text,
    shelfNumber : Text,
  ) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can add books");
    };

    let book : Book = {
      title;
      author;
      isbn;
      publisher;
      year;
      department;
      ddcNumber;
      totalCopies;
      availableCopies = totalCopies;
      location = {
        floor;
        hallName;
        rackNumber;
        shelfNumber;
      };
    };
    books.add(bookId, book);
  };

  public shared ({ caller }) func updateBook(
    bookId : Text,
    title : Text,
    author : Text,
    isbn : Text,
    publisher : Text,
    year : Nat,
    department : Text,
    ddcNumber : Text,
    totalCopies : Nat,
    floor : Nat,
    hallName : Text,
    rackNumber : Text,
    shelfNumber : Text,
  ) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update books");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can update books");
    };

    let existingBook = switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };

    let book : Book = {
      title;
      author;
      isbn;
      publisher;
      year;
      department;
      ddcNumber;
      totalCopies;
      availableCopies = existingBook.availableCopies;
      location = {
        floor;
        hallName;
        rackNumber;
        shelfNumber;
      };
    };
    books.add(bookId, book);
  };

  public shared ({ caller }) func deleteBook(bookId : Text) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete books");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can delete books");
    };

    books.remove(bookId);
  };

  public query ({ caller }) func getBook(bookId : Text) : async Book {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view books");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view books");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  public query ({ caller }) func getAllBooks() : async [Book] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view books");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view books");
    };

    books.values().toArray();
  };

  public query ({ caller }) func searchBooks(searchText : Text) : async [Book] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search books");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can search books");
    };

    let lowerSearch = toLowerCase(searchText);
    let filteredBooks = books.values().filter(
      func(book : Book) : Bool {
        let lowerTitle = toLowerCase(book.title);
        let lowerAuthor = toLowerCase(book.author);
        lowerTitle.contains(#text lowerSearch) or lowerAuthor.contains(#text lowerSearch);
      }
    );
    filteredBooks.toArray();
  };

  // Circulation Management
  public shared ({ caller }) func issueBook(
    circulationId : Text,
    userId : Text,
    bookId : Text,
  ) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can issue books");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can issue books");
    };

    let book = switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };

    if (book.availableCopies == 0) {
      Runtime.trap("No copies available");
    };

    let circulationRecord : Circulation = {
      borrowerId = userId;
      bookId;
      issueDate = Time.now();
      dueDate = Time.now() + (14 * 24 * 60 * 60 * 1_000_000_000);
      returnDate = null;
      status = #issued;
      renewalCount = 0;
    };

    circulation.add(circulationId, circulationRecord);

    let updatedBook = {
      title = book.title;
      author = book.author;
      isbn = book.isbn;
      publisher = book.publisher;
      year = book.year;
      department = book.department;
      ddcNumber = book.ddcNumber;
      totalCopies = book.totalCopies;
      availableCopies = book.availableCopies - 1;
      location = book.location;
    };

    books.add(bookId, updatedBook);
  };

  public shared ({ caller }) func returnBook(circulationId : Text, returnDate : Time.Time) : async Nat {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can process returns");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can process returns");
    };

    let circulationRecord = switch (circulation.get(circulationId)) {
      case (null) { Runtime.trap("Circulation record not found") };
      case (?record) { record };
    };

    let overdueDays = if (returnDate > circulationRecord.dueDate) {
      Int.abs((returnDate - circulationRecord.dueDate) / (24 * 60 * 60 * 1_000_000_000));
    } else {
      0;
    };

    let fineAmount = overdueDays * 2;

    if (fineAmount > 0) {
      let fineRecord : Fine = {
        userId = circulationRecord.borrowerId;
        circulationId;
        amount = fineAmount;
        reason = "Overdue";
        paid = false;
        paymentDate = null;
      };
      fines.add(circulationId, fineRecord);
    };

    let updatedCirculation = {
      borrowerId = circulationRecord.borrowerId;
      bookId = circulationRecord.bookId;
      issueDate = circulationRecord.issueDate;
      dueDate = circulationRecord.dueDate;
      returnDate = ?returnDate;
      status = #returned;
      renewalCount = circulationRecord.renewalCount;
    };
    circulation.add(circulationId, updatedCirculation);

    let book = switch (books.get(circulationRecord.bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };

    let updatedBook = {
      title = book.title;
      author = book.author;
      isbn = book.isbn;
      publisher = book.publisher;
      year = book.year;
      department = book.department;
      ddcNumber = book.ddcNumber;
      totalCopies = book.totalCopies;
      availableCopies = book.availableCopies + 1;
      location = book.location;
    };

    books.add(circulationRecord.bookId, updatedBook);
    fineAmount;
  };

  public shared ({ caller }) func renewBook(circulationId : Text) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can renew books");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can renew books");
    };

    let circulationRecord = switch (circulation.get(circulationId)) {
      case (null) { Runtime.trap("Circulation record not found") };
      case (?record) { record };
    };

    if (circulationRecord.renewalCount >= 1) {
      Runtime.trap("Maximum renewals reached");
    };

    let updatedCirculation = {
      borrowerId = circulationRecord.borrowerId;
      bookId = circulationRecord.bookId;
      issueDate = circulationRecord.issueDate;
      dueDate = circulationRecord.dueDate + (14 * 24 * 60 * 60 * 1_000_000_000);
      returnDate = circulationRecord.returnDate;
      status = #renewed;
      renewalCount = circulationRecord.renewalCount + 1;
    };
    circulation.add(circulationId, updatedCirculation);
  };

  public query ({ caller }) func getOverdueBooks() : async [Circulation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view overdue books");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can view overdue books");
    };

    let now = Time.now();
    let overdueCirculation = circulation.values().filter(
      func(record : Circulation) : Bool {
        record.status == #issued and now > record.dueDate;
      }
    );
    overdueCirculation.toArray();
  };

  public query ({ caller }) func getUserBorrowedBooks(userId : Text) : async [Circulation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view borrowed books");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view borrowed books");
    };

    let userCirculation = circulation.values().filter(
      func(record : Circulation) : Bool {
        record.borrowerId == userId and record.status == #issued;
      }
    );
    userCirculation.toArray();
  };

  // Fine Management
  public shared ({ caller }) func payFine(fineId : Text, paymentDate : Time.Time) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can pay fines");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can pay fines");
    };

    let fine = switch (fines.get(fineId)) {
      case (null) { Runtime.trap("Fine record not found") };
      case (?fine) { fine };
    };

    let updatedFine = {
      userId = fine.userId;
      circulationId = fine.circulationId;
      amount = fine.amount;
      reason = fine.reason;
      paid = true;
      paymentDate = ?paymentDate;
    };
    fines.add(fineId, updatedFine);
  };

  public query ({ caller }) func getUserFines(userId : Text) : async [Fine] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view fines");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view fines");
    };

    let userFines = fines.values().filter(
      func(fine : Fine) : Bool {
        fine.userId == userId;
      }
    );
    userFines.toArray();
  };

  // Journal Management
  public shared ({ caller }) func addJournal(
    journalId : Text,
    title : Text,
    journalType : { #Print; #EJournal },
    subscriptionCost : Nat,
    frequency : Text,
    department : Text,
    arrivedThisMonth : Bool,
  ) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add journals");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can add journals");
    };

    let journal : Journal = {
      title;
      journalType;
      subscriptionCost;
      frequency;
      department;
      arrivedThisMonth;
    };
    journals.add(journalId, journal);
  };

  public query ({ caller }) func getAllJournals() : async [Journal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view journals");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view journals");
    };

    journals.values().toArray();
  };

  // Magazine Management
  public shared ({ caller }) func addMagazine(
    magazineId : Text,
    title : Text,
    purchaseDate : Time.Time,
    cost : Nat,
    subscriptionPeriod : Nat,
    department : Text,
  ) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add magazines");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can add magazines");
    };

    let magazine : Magazine = {
      title;
      purchaseDate;
      cost;
      subscriptionPeriod;
      department;
    };
    magazines.add(magazineId, magazine);
  };

  public query ({ caller }) func getAllMagazines() : async [Magazine] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view magazines");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view magazines");
    };

    magazines.values().toArray();
  };

  // E-Resource Management
  public shared ({ caller }) func addEResource(
    resourceId : Text,
    title : Text,
    resourceType : Text,
    department : Text,
    fileUrl : Text,
  ) : async () {
    checkWorkingHours();
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add e-resources");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can add e-resources");
    };

    let profile = getInternalUserProfile(caller);
    let eResource : EResource = {
      title;
      resourceType;
      department;
      uploadedBy = profile.registerId;
      uploadDate = Time.now();
      fileUrl;
    };
    eResources.add(resourceId, eResource);
  };

  public query ({ caller }) func getAllEResources() : async [EResource] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view e-resources");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view e-resources");
    };

    eResources.values().toArray();
  };

  // Gate Register
  public shared ({ caller }) func logEntry(
    entryId : Text,
    userId : Text,
    mobileNumber : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can log entry");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can log entry");
    };

    let entry : GateEntry = {
      userId;
      mobileNumber;
      entryTime = Time.now();
      exitTime = null;
    };
    gateRegister.add(entryId, entry);
  };

  public shared ({ caller }) func logExit(entryId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can log exit");
    };
    if (not isApprovedUser(caller)) {
      Runtime.trap("Unauthorized: Only approved users can log exit");
    };

    let entry = switch (gateRegister.get(entryId)) {
      case (null) { Runtime.trap("Entry record not found") };
      case (?entry) { entry };
    };

    let updatedEntry = {
      userId = entry.userId;
      mobileNumber = entry.mobileNumber;
      entryTime = entry.entryTime;
      exitTime = ?Time.now();
    };
    gateRegister.add(entryId, updatedEntry);
  };

  public query ({ caller }) func getDailyGateLog() : async [GateEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view gate logs");
    };
    if (not isAdminOrLibrarian(caller)) {
      Runtime.trap("Unauthorized: Only Admin or Librarian can view gate logs");
    };

    gateRegister.values().toArray();
  };

  initializeSampleData();
};
