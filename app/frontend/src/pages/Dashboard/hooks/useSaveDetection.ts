import { useState } from "react";
import axios from "axios";
import { supabase } from "../../../services/supabaseClient";


interface DetectionResult {
  verdict: "real" | "fake";
  confidences: { label: string; score: number }[];
  grad_cam_url?: string;
}

export function useSaveDetection() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadToSupabase(image: File, userId: string): Promise<{ path: string, url: string }> {
    const ext = image.name.split('.').pop();
    const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase
      .storage
      .from('gallery')
      .upload(filename, image);

    if (error) {
      setError("Upload failed: " + error.message);
      throw error;
    }

    const { data: urlData } = supabase
      .storage
      .from('gallery') 
      .getPublicUrl(filename);

    return { path: filename, url: urlData.publicUrl };
  }

  const save = async (image: File, result: DetectionResult, model: string) => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

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
        "/api/history/save-detection",
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

  return {
    save,
    saveSuccess,
    loading,
    error,
    setSaveSuccess,
    setError,
  };
}
