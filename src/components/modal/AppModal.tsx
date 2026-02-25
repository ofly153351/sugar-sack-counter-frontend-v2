"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  hideCloseButton?: boolean;
}

const DEFAULT_HEADER_CLASS =
  "border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-blue-50";
const DEFAULT_BODY_CLASS = "p-5";

export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-2xl",
  headerClassName = DEFAULT_HEADER_CLASS,
  bodyClassName = DEFAULT_BODY_CLASS,
  hideCloseButton = false,
}: AppModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: 12, scale: 0.98 },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.24, ease: "easeOut" }}
            className={`w-full ${maxWidthClassName} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)]`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-5 py-4 ${headerClassName}`}>
              <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
              {!hideCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-slate-500 hover:bg-white/80 hover:text-slate-700 transition"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className={bodyClassName}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
