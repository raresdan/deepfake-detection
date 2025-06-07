import { useState } from "react";
import axios from "axios";
import { supabase } from "../../../services/supabaseClient";


interface DetectionResult {
  verdict: "real" | "fake";
  confidences: { label: string; score: number }[];
  grad_cam_url?: string;
}


export function useDeepfakeDetection() {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = async (image: File, model: string, useGradCam: boolean) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("model", model);
    formData.append("gradcam", useGradCam ? "true" : "false");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    try {
      const response = await axios.post(
        "/api/detect",
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

  return {
    detect,
    result,
    loading,
    error,
    setResult,
    setError,
  };
}
