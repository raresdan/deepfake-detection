import React from "react";
import styles from "./ResultModal.module.css";

interface Confidence {
  label: string;
  score: number;
}

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  verdict: string;
  model: string;
  confidences: Confidence[]; 
}

const ResultModal: React.FC<ResultModalProps> = ({
  open, onClose, imageUrl, verdict, model, confidences
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
          <ul className={styles.confidenceList}>
            {confidences.map((item, idx) => (
              <li
                key={item.label}
                className={styles.confidenceItem}
              >
                <span className={styles.confidenceLabel} title={item.label}>
                  {item.label}
                </span>
                <span className={styles.confidenceScore}>
                  {(item.score * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
