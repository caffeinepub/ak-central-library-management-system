import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLibrary } from "@/lib/LibraryContext";
import { type Fine, formatDate, storage } from "@/lib/storage";
import { Printer, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReceiptData {
  fine: Fine;
  userName: string;
  userId: string;
}

export default function FinesScreen() {
  const { fines, session, users, circulations, refresh } = useLibrary();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const isAdmin = session?.role === "Admin" || session?.role === "Librarian";

  const displayFines = isAdmin
    ? fines
    : fines.filter((f) => f.userId === session?.userId);

  function handlePay(fine: Fine) {
    const user = users.find((u) => u.id === fine.userId);
    const paymentDate = new Date().toISOString().split("T")[0];
    storage.updateFine({ ...fine, paid: true, paymentDate });
    refresh();
    toast.success(`Fine of ₹${fine.amount} marked as paid`);

    if (user) {
      setReceiptData({
        fine: { ...fine, paid: true, paymentDate },
        userName: user.name,
        userId: user.username,
      });
    }
  }

  function openReceipt(fine: Fine) {
    const user = users.find((u) => u.id === fine.userId);
    if (user)
      setReceiptData({ fine, userName: user.name, userId: user.username });
  }

  const unpaidTotal = displayFines
    .filter((f) => !f.paid)
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="lib-content">
      {/* Summary */}
      {unpaidTotal > 0 && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-600 font-medium">
              Total Unpaid Fines
            </p>
            <p className="font-display font-bold text-xl text-orange-700">
              ₹{unpaidTotal}
            </p>
          </div>
          <Receipt size={24} className="text-orange-400" />
        </div>
      )}

      <div data-ocid="fines.list" className="px-4 py-3 space-y-2">
        {displayFines.length === 0 ? (
          <div className="text-center py-16">
            <Receipt size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">
              No fines
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdmin
                ? "No fines recorded in the system"
                : "You have no outstanding fines!"}
            </p>
          </div>
        ) : (
          displayFines.map((fine, idx) => (
            <div
              key={fine.id}
              data-ocid={`fines.item.${idx + 1}`}
              className="lib-card p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground line-clamp-2">
                    {fine.bookTitle}
                  </p>
                  {isAdmin && (
                    <p className="text-xs text-muted-foreground">
                      {fine.userName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{fine.reason}</p>
                  {fine.overduedays > 0 && (
                    <p className="text-xs text-orange-600 font-semibold">
                      {fine.overduedays} days overdue
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-lg text-lib-red">
                    ₹{fine.amount}
                  </p>
                  <Badge
                    className={`text-xs ${
                      fine.paid
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-orange-50 text-orange-700 border-orange-200"
                    }`}
                    variant="outline"
                  >
                    {fine.paid ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              </div>

              {fine.paid && fine.paymentDate && (
                <p className="text-xs text-muted-foreground mb-2">
                  Paid on: {formatDate(fine.paymentDate)}
                </p>
              )}

              <div className="flex gap-2">
                {!fine.paid && isAdmin && (
                  <Button
                    data-ocid={`fines.pay_button.${idx + 1}`}
                    size="sm"
                    className="flex-1 bg-lib-red hover:bg-lib-red-dark text-white text-xs"
                    onClick={() => handlePay(fine)}
                  >
                    Mark as Paid
                  </Button>
                )}
                {fine.paid && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-lib-red text-lib-red text-xs"
                    onClick={() => openReceipt(fine)}
                  >
                    <Receipt size={12} className="mr-1" />
                    View Receipt
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Receipt Modal */}
      <Dialog
        open={!!receiptData}
        onOpenChange={(o) => !o && setReceiptData(null)}
      >
        <DialogContent
          data-ocid="fines.receipt.modal"
          className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden"
        >
          {receiptData && (
            <FineReceipt
              data={receiptData}
              circulations={circulations}
              onClose={() => setReceiptData(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FineReceipt({
  data,
  circulations,
  onClose,
}: {
  data: ReceiptData;
  circulations: ReturnType<typeof storage.getCirculations>;
  onClose: () => void;
}) {
  const { fine, userName, userId } = data;
  const circ = circulations.find((c) => c.id === fine.circulationId);

  return (
    <div>
      {/* Receipt header */}
      <div className="bg-lib-red p-4 text-center">
        <p className="text-lib-gold font-display font-bold text-lg">
          AK Central Library
        </p>
        <p className="text-white/80 text-xs mt-1">FINE RECEIPT</p>
      </div>

      <div className="p-4 space-y-3 print-content">
        <div className="border border-dashed border-border rounded-xl p-3 space-y-2">
          <ReceiptRow label="Name" value={userName} />
          <ReceiptRow label="Register No." value={userId} />
          <ReceiptRow label="Book" value={fine.bookTitle ?? "—"} />
          {circ && (
            <>
              <ReceiptRow
                label="Borrow Date"
                value={formatDate(circ.issueDate)}
              />
              <ReceiptRow label="Due Date" value={formatDate(circ.dueDate)} />
              {circ.returnDate && (
                <ReceiptRow
                  label="Return Date"
                  value={formatDate(circ.returnDate)}
                />
              )}
            </>
          )}
          <ReceiptRow label="Overdue Days" value={`${fine.overduedays} days`} />
          <div className="border-t border-dashed border-border pt-2 mt-2">
            <ReceiptRow label="Fine Amount" value={`₹${fine.amount}`} bold />
            <ReceiptRow label="Status" value="PAID ✓" bold />
            {fine.paymentDate && (
              <ReceiptRow
                label="Payment Date"
                value={formatDate(fine.paymentDate)}
              />
            )}
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Thank you for using AK Central Library
        </p>

        <div className="flex gap-2">
          <Button
            data-ocid="fines.receipt.print_button"
            size="sm"
            className="flex-1 bg-lib-red hover:bg-lib-red-dark text-white text-xs"
            onClick={() => window.print()}
          >
            <Printer size={12} className="mr-1" />
            Print / Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  bold = false,
}: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs ${bold ? "font-bold text-foreground" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
