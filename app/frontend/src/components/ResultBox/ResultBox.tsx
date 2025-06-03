import styles from "./ResultBox.module.css";
import Button from "../../components/Button/Button";

interface DetectionResult {
  verdict: "real" | "fake";
  confidences: { label: string; score: number }[];
}

const ResultBox = ({
  result,
  onSave,
  saveSuccess,
  loading,
}: {
  result: DetectionResult;
  onSave: () => void;
  saveSuccess: boolean;
  loading: boolean;
}) => (
  <div className={styles.resultBox}>
    <div
      className={styles.resultVerdict}
      data-verdict={result.verdict}
    >
      {result.verdict === "real" ? "🟢 Real" : "🔴 Fake"}
    </div>
    <ul className={styles.confidenceList}>
      {result.confidences.map((item, idx) => (
        <li
          key={idx}
          className={styles.confidenceItem}
          style={{
            borderBottom: idx < result.confidences.length - 1 ? "1px solid #eee" : "none",
          }}
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
    <Button
      className={styles.actionBtn}
      onClick={onSave}
      disabled={saveSuccess || loading}
      variant="secondary"
    >
      {saveSuccess ? "Saved!" : "Save Result"}
    </Button>
  </div>
);

export default ResultBox;
