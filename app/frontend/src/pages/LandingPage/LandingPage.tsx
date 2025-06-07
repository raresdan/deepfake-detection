import React from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, Cpu } from "lucide-react";
import styles from "./LandingPage.module.css";
import Button from "../../components/Button/Button";

const LandingPage: React.FC = () => (
  <div className={styles.background}>
    <div className={styles.glow}></div>
    <main className={styles.hero}>
      <h1 className={styles.title}>
        <span className={styles.highlight}>Deepfakes</span> Detection
      </h1>
      <p className={styles.subtitle}>
        Use state-of-the-art AI to reveal facial deepfakes.<br />
        Simple, powerful, and privacy-first.<br />
        Upload an image, select a model, and get instant results.
      </p>
      <div className={styles.buttonWrapper}>
        <Link to="/login" aria-label="Get Started">
          <Button className={styles.ctaButton}>Get Started</Button>
        </Link>
      </div>
    </main>
    <section className={styles.features}>
      <div className={styles.feature}>
        <Shield className={styles.featureIcon} />
        <h3>Privacy-first</h3>
        <p>Your data stays secure and private.</p>
      </div>
      <div className={styles.feature}>
        <Eye className={styles.featureIcon} />
        <h3>Real-time</h3>
        <p>Get instant results with cutting-edge AI.</p>
      </div>
      <div className={styles.feature}>
        <Cpu className={styles.featureIcon} />
        <h3>Explainable AI</h3>
        <p>Understand how the detection works.</p>
      </div>
    </section>
    <footer className={styles.footer}>
      <p>Made by Rares Dan Goia</p>
      <a href="https://github.com/raresdan" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
      <a href="https://www.linkedin.com/in/rares-dan-tiago-goia/" target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
    </footer>
  </div>
);

export default LandingPage;
