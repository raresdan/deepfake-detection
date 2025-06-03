import React from "react";
import styles from "./HistoryCard.module.css";

interface HistoryCardProps {
  imageUrl: string;
  verdict: string;
  model: string;
  onClick: () => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ imageUrl, verdict, model, onClick }) => (
  <div className={styles.card} onClick={onClick}>
    <img src={imageUrl} alt="Detected face" className={styles.cardImg} />
    <div className={styles.cardFooter}>
      <span className={verdict === "fake" ? styles.fake : styles.real}>
        {verdict.toUpperCase()}
      </span>
      <span>{model}</span>
    </div>
  </div>
);

export default HistoryCard;
