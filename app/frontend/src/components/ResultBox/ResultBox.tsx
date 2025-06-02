import styles from "./ResultBox.module.css";
import Button from "../../components/Button/Button";

interface DetectionResult {
  verdict: "real" | "fake";
  confidences: Record<string, number>;
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
    <div className={styles.resultVerdict}>
      {result.verdict === "real" ? "🟢 Real" : "🔴 Fake"}
    </div>
    <div className={styles.confidences}>
      <div>Model Confidence:</div>
      <ul>
        {Object.entries(result.confidences).map(([model, conf]) => (
          <li key={model}>
            <b>{model}</b>: {(conf * 100).toFixed(2)}%
          </li>
        ))}
      </ul>
    </div>
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
