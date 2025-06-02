import React, { useState } from "react";

import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../../services/supabaseClient";
import Button from "../../components/Button/Button";


interface DetectionResult {
  verdict: "real" | "fake";
  confidences: Record<string, number>;
}

const availableModels = [
  { value: "xception", label: "XceptionNet" },
  { value: "resnet", label: "ResNet" },
  { value: "efficientnet", label: "EfficientNet" }
];

const Dashboard: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>("xception"); // Default to first model
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImage(file ?? null);
    setResult(null);
    setSaveSuccess(false);
    setError(null);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview(null);
  };

  const handleDetect = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("model", model);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/detect`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Detection failed.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!result || !image) return;
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    try {
      const saveForm = new FormData();
      saveForm.append("image", image);
      saveForm.append("verdict", result.verdict);
      saveForm.append("confidences", JSON.stringify(result.confidences));
      saveForm.append("model", model);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/save-detection`,
        saveForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSaveSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Save failed.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className={styles.dashboardBg}>
      <nav className={styles.topBar}>
        <Button
          onClick={() => navigate("/history")}
          variant="secondary"
        >
          History
        </Button>
        <Button
          onClick={handleLogout}
          variant="secondary"
        >
          Logout
        </Button>
      </nav>
      <main className={styles.mainArea}>
        <h1 className={styles.dashboardTitle}>Deepfake Detection</h1>
        <div className={styles.uploadBox}>
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className={styles.imagePreview} />
          ) : (
            <label className={styles.uploadLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.uploadInput}
                disabled={loading}
              />
              <span>Click to upload a photo</span>
            </label>
          )}
        </div>
        <select
          className={styles.modelSelector}
          value={model}
          onChange={e => setModel(e.target.value)}
          disabled={loading}
        >
          {availableModels.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <Button
          className={styles.actionBtn}
          onClick={handleDetect}
          disabled={!image || loading}
        >
          {loading ? "Checking..." : "Check Deepfake"}
        </Button>
        {result && (
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
              onClick={handleSave}
              disabled={saveSuccess || loading}
              variant="secondary"
            >
              {saveSuccess ? "Saved!" : "Save Result"}
            </Button>
          </div>
        )}
        {error && <div className={styles.errorMsg}>{error}</div>}
      </main>
    </div>
  );
};

export default Dashboard;
