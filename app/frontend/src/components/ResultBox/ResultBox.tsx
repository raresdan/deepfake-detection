import styles from "./ResultBox.module.css";
import Button from "../../components/Button/Button";

interface DetectionResult {
  verdict: "real" | "fake";
  confidences: { label: string; score: number }[];
  grad_cam_url?: string;
}

const ResultBox = ({
  result,
  onSave,
  saveSuccess,
  loading,
  gradCamUrl,
}: {
  result: DetectionResult;
  onSave: () => void;
  saveSuccess: boolean;
  loading: boolean;
  gradCamUrl?: string;
}) => {
  return (
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
      {gradCamUrl && (
        <div className={styles.gradCamContainer}>
          <div className={styles.gradCamTitle}>Grad-CAM Visualization</div>
          <img
            src={gradCamUrl}
            alt="Grad-CAM"
            className={styles.gradCamImage}
          />
        </div>
      )}
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
};

export default ResultBox;
