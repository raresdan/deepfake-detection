import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import styles from "./History.module.css";
import HistoryCard from "../../components/HistoryCard/HistoryCard";
import ResultModal from "../../components/ResultModal/ResultModal";


const dummyGallery = [
  {
    id: 1,
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    verdict: "fake",
    confidences: { xception: 0.92, resnet: 0.85, efficientnet: 0.88 },
    model: "xception",
    date: "2025-06-02",
  },
  {
    id: 2,
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    verdict: "real",
    confidences: { xception: 0.12, resnet: 0.15, efficientnet: 0.18 },
    model: "resnet",
    date: "2025-06-01",
  }
];

const History: React.FC = () => {
  const [gallery] = useState(dummyGallery);
  const [selected, setSelected] = useState<typeof dummyGallery[0] | null>(null);

  return (
    <div className={styles.historyBg}>
      <TopBar onLogout={() => {}} userName="Rares" />
      <main className={styles.mainArea}>
        <h1 className={styles.title}>Detection History</h1>
        <div className={styles.galleryGrid}>
          {gallery.length === 0 ? (
            <div className={styles.emptyMsg}>No detections saved yet.</div>
          ) : (
            gallery.map((item) => (
              <HistoryCard
                key={item.id}
                imageUrl={item.imageUrl}
                verdict={item.verdict}
                model={item.model}
                date={item.date}
                onClick={() => setSelected(item)}
              />
            ))
          )}
        </div>
        <ResultModal
          open={!!selected}
          onClose={() => setSelected(null)}
          imageUrl={selected?.imageUrl || ""}
          verdict={selected?.verdict || ""}
          model={selected?.model || ""}
          date={selected?.date || ""}
          confidences={selected?.confidences || {}}
        />
      </main>
    </div>
  );
};

export default History;
