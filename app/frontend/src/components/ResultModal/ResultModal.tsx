import React, { useState, useEffect, useCallback } from "react";
import styles from "./ResultModal.module.css";
import { MdZoomIn, MdZoomOut } from "react-icons/md";

interface Confidence {
  label: string;
  score: number;
}

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  onDelete?: () => void; // <-- add this
  imageUrl: string;
  verdict: string;
  model: string;
  confidences: Confidence[];
  gradcamUrl?: string;
}

const ResultModal: React.FC<ResultModalProps> = ({
  open, onClose, imageUrl, verdict, model, confidences, gradcamUrl, onDelete
}) => {
  const [zoomOriginal, setZoomOriginal] = useState(1);
  const [zoomGradcam, setZoomGradcam] = useState(1);

  // Close with ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  const ZoomControls = ({
    zoom,
    setZoom,
    label,
  }: { zoom: number; setZoom: React.Dispatch<React.SetStateAction<number>>; label: string }) => (
    <div className={styles.zoomControls}>
      <button
        className={styles.zoomBtn}
        onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
        aria-label={`Zoom out ${label}`}
        type="button"
      >
        <MdZoomOut className={styles.zoomIcon} />
      </button>
      <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
      <button
        className={styles.zoomBtn}
        onClick={() => setZoom(z => Math.min(3, z + 0.2))}
        aria-label={`Zoom in ${label}`}
        type="button"
      >
        <MdZoomIn className={styles.zoomIcon} />
      </button>
    </div>
  );

  // Add dynamic classes for zoom
  const getZoomClass = (zoom: number) => {
    if (zoom > 1.01) return styles.zoomedIn;
    if (zoom < 0.99) return styles.zoomedOut;
    return "";
  };

  return (
    <div className={styles.overlay} aria-modal="true" role="dialog">
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        {gradcamUrl ? (
          <div className={styles.dualImageContainer}>
            <div className={styles.imageSection}>
              <div className={styles.imageLabel}>Original</div>
              <div className={styles.zoomWrapper}>
                <img
                  src={imageUrl}
                  alt="Original uploaded for deepfake detection"
                  className={`${styles.modalImg} ${getZoomClass(zoomOriginal)}`}
                  data-zoom={zoomOriginal}
                  style={{ "--zoom": zoomOriginal } as React.CSSProperties}
                />
              </div>
              <ZoomControls zoom={zoomOriginal} setZoom={setZoomOriginal} label="original" />
            </div>
            <div className={styles.imageSection}>
              <div className={styles.imageLabel}>Grad-CAM</div>
              <div className={styles.zoomWrapper}>
                <img
                  src={gradcamUrl}
                  alt="GradCAM explanation"
                  className={`${styles.modalImg} ${getZoomClass(zoomGradcam)}`}
                  data-zoom={zoomGradcam}
                  style={{ "--zoom": zoomGradcam } as React.CSSProperties}
                />
              </div>
              <ZoomControls zoom={zoomGradcam} setZoom={setZoomGradcam} label="GradCAM" />
            </div>
          </div>
        ) : (
          <div className={styles.imageSectionSingle}>
            <div className={styles.imageLabel}>Original</div>
            <div className={styles.zoomWrapper}>
              <img
                src={imageUrl}
                alt="Original uploaded for deepfake detection"
                className={`${styles.modalImg} ${getZoomClass(zoomOriginal)}`}
                data-zoom={zoomOriginal}
                style={{ "--zoom": zoomOriginal } as React.CSSProperties}
              />
            </div>
            <ZoomControls zoom={zoomOriginal} setZoom={setZoomOriginal} label="original" />
          </div>
        )}
        <div className={styles.report}>
          <h2>Detection Report</h2>
          <span
            className={
              verdict.toLowerCase() === "fake" ? styles.fake : styles.real
            }
          >
            {verdict.toUpperCase()}
          </span>
          <div className={styles.model}>{model}</div>
          <ul className={styles.confidenceList}>
            {confidences.map((item) => (
              <li key={item.label} className={styles.confidenceItem}>
                <span className={styles.confidenceLabel} title={item.label}>
                  {item.label}
                </span>
                <span className={styles.confidenceScore}>
                  {(item.score * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
          {onDelete && (
            <button
              className={styles.deleteBtn}
              onClick={onDelete}
              type="button"
            >
              Delete Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
