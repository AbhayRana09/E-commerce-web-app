"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  actionType,
  onConfirm,
  submitting = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] sm:w-full p-6 sm:p-8 text-center space-y-4 z-[70] min-w-0 overflow-hidden bg-[#F7F5F0] border border-[#DDD6C8]">
        <DialogHeader className="space-y-2 text-center min-w-0 w-full">
          <DialogTitle className="text-base sm:text-lg font-bold text-[#2C2A29] tracking-tight leading-snug break-words [overflow-wrap:anywhere]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-600 leading-relaxed break-words [overflow-wrap:anywhere]">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3 pt-3 w-full min-w-0">
          <button
            type="button"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
            className="flex-1 min-w-0 bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] font-medium py-2.5 rounded-xl transition text-xs cursor-pointer border border-[#D8D4CE] disabled:opacity-50 shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className={`flex-1 min-w-0 font-medium py-2.5 rounded-xl transition text-xs cursor-pointer text-white shadow-xs disabled:opacity-50 ${
              actionType === "delete"
                ? "bg-red-600 hover:bg-red-500"
                : actionType === "cancel"
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-[#1E3A5F] hover:bg-[#152843]"
            }`}
          >
            {submitting
              ? "Processing..."
              : actionType === "delete"
              ? "Delete"
              : actionType === "save"
              ? "Save Changes"
              : "Confirm"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
