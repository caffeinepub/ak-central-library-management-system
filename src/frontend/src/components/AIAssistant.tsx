import { Button } from "@/components/ui/button";
import { Bot, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

function getAIResponse(message: string): string {
  const m = message.toLowerCase();
  if (/book|catalog|search/.test(m))
    return "You can browse our Book Catalog from the Books tab. We have 30+ books across Computer Science, Physics, Tamil, History, Engineering, and more. Use the search bar or department filter to find what you need.";
  if (/borrow|issue|checkout/.test(m))
    return "To borrow a book, visit the Circulation desk or use the Circulation screen. Students can borrow up to 3 books at a time for 14 days.";
  if (/return|due|deadline/.test(m))
    return "Books should be returned within 14 days. Late returns incur a fine of \u20b92 per day. Use the Fines screen to check your dues.";
  if (/renew|extend/.test(m))
    return "You can renew a book once for an additional 7 days, provided no one else has reserved it. Visit the Circulation screen to renew.";
  if (/fine|penalty|fee/.test(m))
    return "Fines are \u20b92 per day for overdue books. You can view and pay your fines in the Fines & Receipts screen.";
  if (/rule|regulation|policy/.test(m))
    return "Library rules are available under More > Library Rules. Key rules include: maintain silence, no food/drinks, return books on time, and handle materials with care.";
  if (/hour|timing|open|close|time/.test(m))
    return "The library is open Monday to Saturday, 9:00 AM to 5:00 PM. It is closed on Sundays and public holidays.";
  if (/ddc|classification|dewey/.test(m))
    return "We use the Dewey Decimal Classification (DDC) system. Books are organized by subject: 000s General, 100s Philosophy, 200s Religion, 300s Social Science, 400s Language, 500s Science, 600s Technology, 700s Arts, 800s Literature, 900s History.";
  if (/magazine|journal|periodical/.test(m))
    return "We have a collection of magazines and journals. Browse them under More > Magazines or More > Journals.";
  if (/e-resource|digital|online|website/.test(m))
    return "Access digital resources and online databases from More > E-Resources.";
  if (/gate|entry|register|attendance/.test(m))
    return "The gate register tracks student/staff entry and exit. Security staff manage this at the entrance.";
  if (/sign up|account|new user/.test(m))
    return "New users can register for a library account. Your registration needs approval from the Librarian before you can log in.";
  if (/password|login|forgot/.test(m))
    return "If you've forgotten your password, please contact the Librarian or Admin to reset it for you.";
  if (/contact|librarian|help|staff/.test(m))
    return "For assistance, please visit the library desk or contact the Head Librarian directly during library hours.";
  return "I'm sorry, I didn't quite understand that. You can ask me about books, borrowing, returns, fines, library rules, timings, DDC classification, or library services!";
}

const WELCOME =
  "Hello! I'm your AK Library Assistant. Ask me anything about books, fines, rules, borrowing, or library services!";

let msgCounter = 1;

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: msgCounter++, role: "user", text };
    const assistantMsg: Message = {
      id: msgCounter++,
      role: "assistant",
      text: getAIResponse(text),
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          data-ocid="ai_assistant.open_modal_button"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-lib-violet hover:bg-lib-violet-dark text-white rounded-full shadow-xl flex items-center justify-center no-print"
          style={{ zIndex: 50 }}
        >
          <Bot size={24} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          data-ocid="ai_assistant.modal"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm flex flex-col bg-white rounded-t-2xl shadow-2xl no-print"
          style={{ zIndex: 50, maxHeight: "70vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-lib-violet rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-white" />
              <span className="text-white font-bold text-sm">
                Library AI Assistant
              </span>
            </div>
            <button
              type="button"
              data-ocid="ai_assistant.close_button"
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0"
            style={{ maxHeight: "calc(70vh - 120px)" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-lib-violet text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border flex-shrink-0">
            <input
              data-ocid="ai_assistant.input"
              className="flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-lib-violet"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <Button
              data-ocid="ai_assistant.submit_button"
              size="icon"
              className="bg-lib-violet hover:bg-lib-violet-dark text-white rounded-full w-9 h-9 flex-shrink-0"
              onClick={handleSend}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
