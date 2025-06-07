import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TopBar.module.css";
import Button from "../../components/Button/Button";
import { supabase } from "../../services/supabaseClient";
import { History, UserRound, LayoutDashboard } from "lucide-react";

const TopBar: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // Sign out the user
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className={styles.topBar}>
      <div className={styles.left}>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="secondary"
          className={styles.historyBtn}
        >
          <LayoutDashboard className={styles.icon} />
          <span>Dashboard</span>
        </Button>
        <Button
          onClick={() => navigate("/history")}
          variant="secondary"
          className={styles.historyBtn}
        >
          <History className={styles.icon} />
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
          <UserRound className={styles.iconLarge} />
        </div>
        {showMenu && (
          <div className={styles.profileMenu} ref={menuRef}>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className={styles.logoutBtn}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopBar;