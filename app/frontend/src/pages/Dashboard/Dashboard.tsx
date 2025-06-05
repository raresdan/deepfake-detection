import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import Button from "../../components/Button/Button";
import TopBar from "../../components/TopBar/TopBar";
import UploadArea from "../../components/UploadArea/UploadArea";
import ModelSelector from "../../components/ModelSelector/ModelSelector";
import ResultBox from "../../components/ResultBox/ResultBox";
import styles from "./Dashboard.module.css";

interface DetectionResult {
  verdict: "real" | "fake";
  confidences: { label: string; score: number }[];
  grad_cam_url?: string; // <-- Add this line
}

interface ModelOption {
  value: string;
  label: string;
  desc: string;
}

const Dashboard: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>("xception");
  const [dragActive, setDragActive] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [faceValid, setFaceValid] = useState<boolean | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [useGradCam, setUseGradCam] = useState(true); // Grad-CAM checkbox state
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login", { replace: true });
      } else {
        setAuthLoading(false);
      }
    };
    checkAuth();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login", { replace: true });
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    // Fetch models from API
    const fetchModels = async () => {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const response = await axios.get("/api/models");
        setAvailableModels(response.data.models || []);
      } catch (err: any) {
        setModelsError("Failed to load models.");
      }
      setModelsLoading(false);
    };
    fetchModels();
  }, [navigate]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImage(file ?? null);
    setResult(null);
    setSaveSuccess(false);
    setError(null);
    setFaceValid(null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      // Validate face
      try {
        const formData = new FormData();
        formData.append("image", file);
        const { data } = await axios.post(
          "/api/validate-face",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setFaceValid(data.valid);
        if (!data.valid) setError("No face detected in the uploaded image.");
      } catch {
        setFaceValid(false);
        setError("Failed to validate face in the image.");
      }
    } else {
      setImagePreview(null);
    }
  };

  const handleClear = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setSaveSuccess(false);
    setError(null);
  };

  const handleDetect = async () => {
    if (!image || faceValid === false) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("model", model);
    formData.append("gradcam", useGradCam ? "true" : "false"); // Send Grad-CAM preference

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    try {
      const response = await axios.post(
        '/api/detect',
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

  // Helper function to upload image to Supabase Storage
  async function uploadToSupabase(image: File, userId: string): Promise<{ path: string, url: string }> {
    const ext = image.name.split('.').pop();
    const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase
      .storage
      .from('gallery')
      .upload(filename, image);

    if (error) {
      console.error("Supabase upload error:", error);
      setError("Upload failed: " + error.message);
      throw error;
    }

    const { data: urlData } = supabase
      .storage
      .from('gallery') 
      .getPublicUrl(filename);

    return { path: filename, url: urlData.publicUrl };
  }

  const handleSave = async () => {
    if (!result || !image) return;
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const userId = data.session?.user?.id;

    if (!userId) {
      setError("User ID not found. Please re-login.");
      setLoading(false);
      return;
    }

    try {
      const { path, url } = await uploadToSupabase(image, userId);

      await axios.post(
        "/api/user/save-detection",
        {
          bucket: 'gallery',
          object_path: path,
          image_url: url,
          verdict: result.verdict,
          confidences: result.confidences,
          model: model,
          gradcam_path: result.grad_cam_url 
            ? result.grad_cam_url.split("/").pop()
            : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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

  if (authLoading) {
    return (
      <div className={styles.fullscreenCenter}>
        Checking authentication...
      </div>
    );
  }

  return (
    <div className={styles.dashboardBg}>
      <TopBar onLogout={handleLogout} userName={"Rares"} />
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
            models={availableModels}
          />
        )}
        <div className={styles.gradCamCheckboxContainer}>
          <label className={styles.gradCamCheckboxLabel}>
            <input
              type="checkbox"
              checked={useGradCam}
              onChange={e => setUseGradCam(e.target.checked)}
              style={{ accentColor: "#6a54fa", width: 18, height: 18 }}
            />
            Advance Analysis using Grad-CAM
          </label>
          <div className={styles.gradCamCheckboxDescription}>
            See how the model decides.
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
