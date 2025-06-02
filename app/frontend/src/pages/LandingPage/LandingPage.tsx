import React from "react";
import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";
import Button from "../../components/Button/Button";


const LandingPage: React.FC = () => (
  <div className={styles.background}>
    <div className={styles.glow}></div>
    <main className={styles.hero}>
      <h1 className={styles.title}>Deepfakes Detection</h1>
      <p className={styles.subtitle}>
        Harness state-of-the-art AI to reveal facial deepfakes.<br />
        Simple, powerful, and privacy-first.<br />
        Upload an image, select a model, and get instant results.
      </p>
      <Link to="/login">
        <Button>Get Started</Button>
      </Link>
    </main>
  </div>
);

export default LandingPage;
