import React from "react";
import styles from "./UploadArea.module.css";
import Button from "../../components/Button/Button";
import { UploadCloud } from "lucide-react";

const UploadArea = ({
  imagePreview,
  onImageChange,
  onClear,
  loading,
  dragActive,
  setDragActive,
}: {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  loading: boolean;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
}) => (
  <div className={styles.uploadBox}>
    {imagePreview ? (
      <div style={{ position: "relative" }}>
        <img src={imagePreview} alt="preview" className={styles.imagePreview} />
        <Button
          style={{ position: "absolute", top: 8, right: 8, padding: "0.2rem 0.6rem" }}
          onClick={onClear}
          variant="secondary"
          aria-label="Clear image"
        >✕</Button>
      </div>
    ) : (
      <label
        className={styles.uploadLabel}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
        onDrop={e => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.[0]) {
            onImageChange({ target: { files: e.dataTransfer.files } } as any);
          }
        }}
        style={dragActive ? { borderColor: "#2563eb", background: "#23272f" } : {}}
        aria-label="Upload image"
      >
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className={styles.uploadInput}
          disabled={loading}
        />
        <div className={styles.uploadContent}>
          <UploadCloud size={38} color="#2563eb" style={{ marginBottom: 8 }} />
          <span>
            {dragActive ? "Drop image here..." : "Click or drag an image here to upload"}
          </span>
        </div>
      </label>
    )}
  </div>
);

export default UploadArea;
