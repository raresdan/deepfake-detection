import React, { useState, useEffect } from "react";
import TopBar from "../../components/TopBar/TopBar";
import styles from "./History.module.css";
import HistoryCard from "../../components/HistoryCard/HistoryCard";
import ResultModal from "../../components/ResultModal/ResultModal";
import { supabase } from "../../services/supabaseClient";

const History: React.FC = () => {
  const [gallery, setGallery] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("/api/history/images", {
          headers,
          credentials: "include", // in case you use cookies
        });

        if (res.status === 401) {
          setGallery([]);
          setLoading(false);
          // Optionally redirect to login or show a message
          return;
        }

        const result = await res.json();
        if (result.images) {
          setGallery(
            result.images.map((img: any) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              gradcamUrl: img.gradcamUrl,
              verdict: img.results?.verdict || "",
              confidences: img.results?.confidences || {},
              model: img.results?.model || "",
            }))
          );
        } else {
          setGallery([]);
        }
      } catch (e) {
        setGallery([]);
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  return (
    <div className={styles.historyBg}>
      <TopBar onLogout={() => {}} userName="Rares" />
      <main className={styles.mainArea}>
        <h1 className={styles.title}>Detection History</h1>
        <div className={styles.galleryGrid}>
          {loading ? (
            <div className={styles.emptyMsg}>Loading...</div>
          ) : gallery.length === 0 ? (
            <div className={styles.emptyMsg}>No detections saved yet.</div>
          ) : (
            gallery.map((item) => (
              <HistoryCard
                key={item.id}
                imageUrl={item.imageUrl}
                verdict={item.verdict}
                model={item.model}
                onClick={() => setSelected(item)}
              />
            ))
          )}
        </div>
        <ResultModal
          open={!!selected}
          onClose={() => setSelected(null)}
          imageUrl={selected?.imageUrl || ""}
          gradcamUrl={selected?.gradcamUrl || ""}
          verdict={selected?.verdict || ""}
          model={selected?.model || ""}
          confidences={selected?.confidences || {}}
        />
      </main>
    </div>
  );
};

export default History;
