import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  Phone,
  Shield,
  Users,
  Volume2,
  Wifi,
} from "lucide-react";

interface RuleSection {
  id: string;
  icon: React.FC<{ size: number; className?: string }>;
  title: string;
  badge?: string;
  rules: string[];
}

const RULE_SECTIONS: RuleSection[] = [
  {
    id: "membership",
    icon: Users,
    title: "Membership & Eligibility",
    rules: [
      "Library membership is open to all registered students, teaching staff, and non-teaching staff of AIKI.",
      "Students must present their valid college ID card to obtain library membership.",
      "Library cards are non-transferable and must be produced on demand by library staff.",
      "Loss of library card must be reported immediately to the librarian. A replacement card will be issued after payment of ₹50.",
      "Membership expires upon separation from the institution. All borrowed materials must be returned before issuing No-Objection Certificate (NOC).",
    ],
  },
  {
    id: "borrowing",
    icon: BookOpen,
    title: "Borrowing Policy",
    badge: "Important",
    rules: [
      "Students are permitted to borrow a maximum of 3 books at a time for a period of 14 days.",
      "Teaching staff may borrow up to 6 books for 30 days; non-teaching staff may borrow 4 books for 21 days.",
      "Books may be renewed once for an additional 14 days, provided no other member has requested the same book.",
      "Reference books, journals, magazines, and rare/special collection materials are for in-library use only and may not be taken out.",
      "Borrowers are responsible for the books from the time of issue until return. Any damage or loss must be reported to the librarian immediately.",
      "A lost book must be replaced with a new copy of the same edition, or the borrower must pay the current market price plus a ₹50 processing fee.",
      "Books should be returned at the circulation counter and a receipt obtained. Books should not be left unattended on tables or shelves.",
    ],
  },
  {
    id: "fines",
    icon: AlertTriangle,
    title: "Fine & Penalty Policy",
    badge: "Strictly Enforced",
    rules: [
      "A fine of ₹2.00 per day will be charged for every day a book is kept beyond the due date, including holidays.",
      "Books not returned within 60 days of the due date will be treated as lost, and replacement charges plus accumulated fines will apply.",
      "Members with unpaid fines will not be permitted to borrow new books until all dues are cleared.",
      "Wilful damage to books, labels, bar codes, or library property will attract a minimum penalty of ₹200 in addition to replacement cost.",
      "Fine receipts will be issued for all payments made at the circulation counter.",
    ],
  },
  {
    id: "conduct",
    icon: Shield,
    title: "General Conduct Rules",
    rules: [
      "All members must sign the gate register with name, ID number, and mobile number on entry and exit.",
      "Personal bags, large handbags, and briefcases must be deposited at the bag counter before entering the reading area.",
      "Eating, drinking, and chewing gum are strictly prohibited inside the library premises.",
      "Defacing, underlining, or writing in library books is a punishable offence.",
      "Any attempt to take a book without borrowing it through the proper procedure will be treated as theft and referred to the college disciplinary committee.",
      "Members are expected to behave courteously with library staff and fellow members at all times.",
      "Children (below 12 years) are not permitted inside the library unless accompanied by a staff member.",
    ],
  },
  {
    id: "silence",
    icon: Volume2,
    title: "Silence & Study Zone",
    rules: [
      "Strict silence must be maintained in all reading halls and the reference section.",
      "Group discussions and collaborative study must be conducted only in the designated discussion room on the 2nd Floor.",
      "Whispering and low-volume conversation are permissible only at the circulation counter and help desk.",
      "Any member found disturbing the peace will be asked to leave the library premises immediately.",
      "Library staff have the authority to ask any member to vacate the premises for misconduct.",
    ],
  },
  {
    id: "mobile",
    icon: Wifi,
    title: "Mobile Phone & Electronics",
    rules: [
      "Mobile phones must be switched to silent/vibrate mode before entering the library.",
      "Phone calls must not be taken inside the reading hall. Members must step outside to attend calls.",
      "Laptops and tablets are permitted for academic use only. Earphones/headphones must be used at low volume.",
      "Charging personal devices using library power sockets is not permitted without prior permission.",
      "Photography and audio/video recording inside the library is strictly prohibited without written permission from the Head Librarian.",
    ],
  },
  {
    id: "hours",
    icon: Clock,
    title: "Working Hours & Holidays",
    rules: [
      "Library working hours: Monday to Friday — 8:00 AM to 8:00 PM.",
      "Saturday: 9:00 AM to 5:00 PM. Library is closed on Sundays and public holidays.",
      "During examination periods, the library may operate extended hours as notified on the library notice board.",
      "The library reserves the right to close temporarily for stock verification, maintenance, or special events with due notice.",
      "Reading material must be vacated from the reading hall 10 minutes before closing time.",
    ],
  },
  {
    id: "reference",
    icon: BookOpen,
    title: "Reference Section Rules",
    rules: [
      "The reference section contains encyclopaedias, dictionaries, handbooks, almanacs, and other reference-only materials.",
      "All reference materials are strictly for in-library use and cannot be issued for home borrowing.",
      "Photocopying of reference materials is permitted subject to copyright regulations (maximum 10% of a work).",
      "Reference books must be returned to their designated location after use or handed to library staff.",
      "Requests for interlibrary loans of reference materials can be made through the Head Librarian.",
    ],
  },
];

export default function LibraryRulesScreen() {
  return (
    <div className="lib-content pb-6">
      {/* Header banner */}
      <div
        className="px-4 py-5 text-center"
        style={{ background: "linear-gradient(135deg, #990000, #CC0000)" }}
      >
        <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
          <Shield size={24} className="text-white" />
        </div>
        <h1
          className="font-display font-bold text-xl"
          style={{ color: "#FFD700" }}
        >
          AIKI Library
        </h1>
        <p className="text-white font-semibold text-sm mt-0.5">
          Rules &amp; Regulations
        </p>
        <p className="text-white/70 text-xs mt-2">
          All members are required to read and adhere to these rules.
          <br />
          Non-compliance may result in suspension of library privileges.
        </p>
      </div>

      {/* Contact strip */}
      <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
        <Phone size={15} className="text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-amber-800">
            Help Desk &amp; Complaints
          </p>
          <p className="text-xs text-amber-700">
            Speak to the Head Librarian or visit the Circulation Counter
          </p>
        </div>
      </div>

      {/* Rules accordion */}
      <div className="px-4 mt-4">
        <Accordion
          type="multiple"
          defaultValue={["membership", "borrowing", "fines"]}
          className="space-y-2"
        >
          {RULE_SECTIONS.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              data-ocid={`rules.${section.id}.panel`}
              className="lib-card overflow-hidden border-0 rounded-xl"
            >
              <AccordionTrigger
                data-ocid={`rules.${section.id}.toggle`}
                className="px-3 py-3 hover:no-underline hover:bg-secondary/50 [&[data-state=open]]:bg-lib-red/5"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                  <div className="w-8 h-8 rounded-lg bg-lib-red/10 flex items-center justify-center flex-shrink-0">
                    <section.icon size={16} className="text-lib-red" />
                  </div>
                  <span className="font-semibold text-sm text-foreground flex-1 leading-snug">
                    {section.title}
                  </span>
                  {section.badge && (
                    <Badge
                      variant="outline"
                      className="text-xs border-lib-red text-lib-red flex-shrink-0 mr-1"
                    >
                      {section.badge}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <ol
                  data-ocid={`rules.${section.id}.list`}
                  className="space-y-2 mt-1"
                >
                  {section.rules.map((rule, idx) => (
                    <li
                      key={rule.slice(0, 40)}
                      data-ocid={`rules.${section.id}.item.${idx + 1}`}
                      className="flex gap-2.5 items-start"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-lib-red text-white text-xs font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed flex-1">
                        {rule}
                      </p>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Footer note */}
      <div className="mx-4 mt-4 bg-secondary rounded-xl p-3 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          These rules are subject to revision by the Library Committee.
          <br />
          Updated rules will be displayed on the library notice board and this
          app.
        </p>
      </div>
    </div>
  );
}
