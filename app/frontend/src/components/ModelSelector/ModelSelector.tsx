import { useState, useRef, useEffect } from "react";
import styles from "./ModelSelector.module.css";

interface ModelOption {
  value: string;
  label: string;
  desc: string;
}

const ModelSelector = ({
  model,
  setModel,
  disabled,
  models,
}: {
  model: string;
  setModel: (v: string) => void;
  disabled: boolean;
  models: ModelOption[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = models.find(m => m.value === model);

  return (
    <div className={styles.selectorWrapper} ref={ref}>
      <button
        className={styles.selectorButton}
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div>
          <div className={styles.modelLabel}>{selected?.label}</div>
          <div className={styles.modelDesc}>{selected?.desc}</div>
        </div>
        <span className={styles.arrow}>&#9662;</span>
      </button>
      {open && (
        <ul className={styles.dropdown} role="listbox">
          {models.map(m => (
            <li
              key={m.value}
              className={styles.dropdownItem}
              onClick={() => { setModel(m.value); setOpen(false); }}
              role="option"
              aria-selected={model === m.value}
            >
              <div className={styles.modelLabel}>{m.label}</div>
              <div className={styles.modelDesc}>{m.desc}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModelSelector;
