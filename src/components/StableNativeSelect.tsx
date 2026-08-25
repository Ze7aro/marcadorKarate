import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface StableNativeSelectOption {
  value: string;
  label: string;
}

interface StableNativeSelectProps {
  className?: string;
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: StableNativeSelectOption[];
  placeholder?: string;
  value: string;
}

export default function StableNativeSelect({
  className = "",
  disabled = false,
  label,
  onChange,
  options,
  placeholder = "-",
  value,
}: StableNativeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [panelStyle, setPanelStyle] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const clickedInsideSelect = containerRef.current?.contains(target);
      const clickedInsidePanel = target?.closest("[data-stable-select-panel]");

      if (!clickedInsideSelect && !clickedInsidePanel) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) {
      return;
    }

    const updatePanelPosition = () => {
      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setPanelStyle({
        left: rect.left,
        top: Math.max(12, rect.top - 8),
        width: rect.width,
      });
    };

    updatePanelPosition();

    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1 ${className}`.trim()}
    >
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      <button
        type="button"
        disabled={disabled}
        className="flex min-h-10 items-center justify-between rounded-xl border border-[rgba(80,125,196,0.18)] bg-[rgba(8,17,32,0.72)] px-3 py-2 text-sm font-medium text-slate-300 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span
          className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {isOpen && !disabled && panelStyle
        ? createPortal(
            <div
              data-stable-select-panel="true"
              className="fixed z-[999] overflow-hidden rounded-xl border border-[rgba(80,125,196,0.18)] bg-[rgba(8,17,32,0.98)] shadow-[0_18px_48px_rgba(15,23,42,0.4)]"
              style={{
                left: panelStyle.left,
                top: panelStyle.top,
                width: panelStyle.width,
                transform: "translateY(-100%)",
              }}
            >
              <div className="app-scrollbar max-h-64 overflow-y-auto py-1">
                <button
                  type="button"
                  className={`flex w-full items-center px-3 py-2 text-left text-sm font-medium transition hover:bg-sky-500/10 ${
                    value === "" ? "bg-sky-500/12 text-slate-100" : "text-slate-300"
                  }`}
                  onClick={() => {
                    onChange("");
                    setIsOpen(false);
                  }}
                >
                  {placeholder}
                </button>
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex w-full items-center px-3 py-2 text-left text-sm font-medium transition hover:bg-sky-500/10 ${
                      option.value === value
                        ? "bg-sky-500/12 text-slate-100"
                        : "text-slate-300"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
