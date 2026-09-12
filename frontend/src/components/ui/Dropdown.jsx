import { useEffect, useRef, useState, cloneElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Dropdown({ trigger, children, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      {cloneElement(trigger, {
        onClick: (e) => {
          trigger.props.onClick?.(e);
          setOpen((o) => !o);
        },
        "aria-expanded": open,
        "aria-haspopup": "menu",
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            role="menu"
            className={cn(
              "absolute z-40 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white py-1.5 shadow-lg shadow-ink-900/10",
              align === "right" ? "right-0" : "left-0",
              className
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ className, icon: Icon, children, ...props }) {
  return (
    <button
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-ink-700 hover:bg-ink-50",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 text-ink-400" />}
      {children}
    </button>
  );
}
