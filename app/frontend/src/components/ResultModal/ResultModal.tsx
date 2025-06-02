import React from "react";
import styles from "./ResultModal.module.css";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  verdict: string;
  model: string;
  date: string;
  confidences: Record<string, number>;
}

const ResultModal: React.FC<ResultModalProps> = ({
  open, onClose, imageUrl, verdict, model, date, confidences
}) => {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <img src={imageUrl} alt="Detected face" className={styles.modalImg} />
        <div className={styles.report}>
          <h2>Detection Report</h2>
          <span className={verdict.toLowerCase() === "fake" ? styles.fake : styles.real}>
            {verdict.toUpperCase()}
          </span>
          <div className={styles.model}>{model}</div>
          <div className={styles.date}>{date}</div>
          <div className={styles.confidences}>
            {Object.entries(confidences).map(([model, conf], idx, arr) => (
              <span key={model}>
                {model}: {(conf * 100).toFixed(1)}%
                {idx < arr.length - 1 && <span className={styles.sep}> | </span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
