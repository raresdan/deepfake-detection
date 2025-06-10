import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import UploadArea from "../../components/UploadArea/UploadArea";
import ModelSelector from "../../components/ModelSelector/ModelSelector";
import ResultBox from "../../components/ResultBox/ResultBox";
import Button from "../../components/Button/Button";
import styles from "./Dashboard.module.css";

// Your custom hooks
import { useAuthGuard } from "./hooks/useAuthGuard";
import { useModelOptions } from "./hooks/useModelOptions";
import { useImageUpload } from "./hooks/useImageUpload";
import { useDeepfakeDetection } from "./hooks/useDeepfakeDetection";
import { useSaveDetection } from "./hooks/useSaveDetection";

const Dashboard: React.FC = () => {
  const { loading: authLoading } = useAuthGuard();
  const { models, loading: modelsLoading, error: modelsError } = useModelOptions();

  const {
    image,
    imagePreview,
    faceValid,
    error: uploadError,
    handleImageChange,
    handleClear,
  } = useImageUpload();

  const {
    detect,
    result,
    loading: detectLoading,
    error: detectError,
    setResult,
    setError: setDetectError,
  } = useDeepfakeDetection();

  const {
    save,
    saveSuccess,
    loading: saveLoading,
    error: saveError,
    setSaveSuccess,
    setError: setSaveError,
  } = useSaveDetection();

  // UI-only states
  const [model, setModel] = useState<string>("xception");
  const [dragActive, setDragActive] = useState(false);
  const [useGradCam, setUseGradCam] = useState(true);

  // Unified loading and error state for the action button & overlay
  const loading = detectLoading || saveLoading;
  const error = uploadError || detectError || saveError;

  // Handlers
  const handleDetect = async () => {
    setResult(null);
    setSaveSuccess(false);
    setDetectError(null);
    if (!image || faceValid === false) return;
    await detect(image, model, useGradCam);
  };

  const handleSave = async () => {
    if (!result || !image) return;
    setSaveSuccess(false);
    setSaveError(null);
    await save(image, result, model);
  };

  if (authLoading) {
    return (
      <div className={styles.fullscreenCenter}>
        Checking authentication...
      </div>
    );
  }

  return (
    <div className={styles.dashboardBg}>
      <TopBar />
      <main className={styles.mainArea}>
        <h1 className={styles.dashboardTitle}>Deepfake Detection</h1>
        <div className={styles.dashboardSubtitle}>
          Select a detection model and upload an image to get started!
        </div>

        {modelsLoading ? (
          <div>Loading models...</div>
        ) : modelsError ? (
          <div className={styles.errorMsg}>{modelsError}</div>
        ) : (
          <ModelSelector
            model={model}
            setModel={setModel}
            disabled={loading}
            models={models}
          />
        )}

        <div className={styles.gradCamCheckboxContainer}>
          <label className={styles.gradCamCheckboxLabel}>
            <input
              type="checkbox"
              checked={useGradCam}
              onChange={e => setUseGradCam(e.target.checked)}
              className={styles.gradCamCheckbox}
            />
            Advance Analysis using Grad-CAM
          </label>
          <div className={styles.gradCamCheckboxDescription}>
            See how the model takes decisions.
          </div>
        </div>

        <UploadArea
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onClear={handleClear}
          loading={loading}
          dragActive={dragActive}
          setDragActive={setDragActive}
        />

        {faceValid === false && (
          <div className={styles.errorMsg}>
            No face detected in the uploaded image. Please upload a clear face photo.
          </div>
        )}

        <Button
          className={styles.actionBtn}
          onClick={handleDetect}
          disabled={!image || loading || faceValid !== true}
        >
          {loading ? "Checking..." : "Check Deepfake"}
        </Button>

        {error && faceValid !== false && (
          <div className={styles.errorMsg}>{error}</div>
        )}

        {loading && (
          <div className={styles.loadingOverlay}>
            Loading...
          </div>
        )}

        {result && !loading && (
          <ResultBox
            result={result}
            onSave={handleSave}
            saveSuccess={saveSuccess}
            loading={loading}
            gradCamUrl={result.grad_cam_url}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
