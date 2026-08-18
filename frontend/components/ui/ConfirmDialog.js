"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ConfirmDialog({ open, onOpenChange, title, message, actionType, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-6 sm:p-8 text-center space-y-4">
        <DialogHeader className="space-y-1.5 text-center">
          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300 leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl transition text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-1/2 font-medium py-2.5 rounded-xl transition text-xs cursor-pointer text-white ${
              actionType === "delete"
                ? "bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20"
                : actionType === "cancel"
                ? "bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
            }`}
          >
            Confirm
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
