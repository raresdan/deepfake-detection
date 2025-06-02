import { useState, useRef, useEffect } from "react";
import styles from "./TopBar.module.css";
import Button from "../../components/Button/Button";
import { History, UserRound } from "lucide-react"; // Changed icon

const TopBar = ({
  onHistory,
  onLogout,
}: {
  onHistory: () => void;
  onLogout: () => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  return (
    <nav className={styles.topBar}>
      <div className={styles.left}>
        <Button onClick={onHistory} variant="secondary" className={styles.historyBtn}>
          <History size={20} color="#fff" strokeWidth={2} />
          <span>History</span>
        </Button>
      </div>
      <div className={styles.right}>
        <div
          className={styles.profileCircle}
          onClick={() => setShowMenu((v) => !v)}
          tabIndex={0}
          aria-label="Open profile menu"
        >
          <UserRound size={28} color="#fff" strokeWidth={2} /> {/* Changed icon */}
        </div>
        {showMenu && (
          <div className={styles.profileMenu} ref={menuRef}>
            <Button onClick={onLogout} variant="secondary" className={styles.logoutBtn}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopBar;
