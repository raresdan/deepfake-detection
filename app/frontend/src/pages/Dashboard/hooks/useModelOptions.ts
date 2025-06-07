import { useEffect, useState } from "react";
import axios from "axios";

export interface ModelOption {
  value: string;
  label: string;
  desc: string;
}


export function useModelOptions() {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/models");
        setModels(response.data.models || []);
      } catch (e) {
        setError("Failed to load models.");
      }
      setLoading(false);
    }
    fetchModels();
  }, []);

  return { models, loading, error };
}
