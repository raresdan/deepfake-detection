import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import styles from "./AuthForm.module.css";
import Button from "../../components/Button/Button";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom"; // <-- add useNavigate

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // <-- add this

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) setError(error.message);
    else {
      setSuccess(true);
      navigate("/dashboard"); // <-- redirect on success
    }

    setLoading(false);
  };

  // Google sign-up/login handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setError(error.message);
    setLoading(false);
    // Supabase handles the redirect
  };

  return (
    <div className={styles.authBackground}>
      <div className={styles.glow}></div>
      <form className={styles.formContainer} onSubmit={handleRegister} autoComplete="off">
        <div className={styles.formTitle}>Register</div>
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoComplete="username"
        />
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete="new-password"
        />
        <Button type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Registering..." : "Register"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.7rem"
          }}
          disabled={loading}
        >
          <FcGoogle size={22} style={{ verticalAlign: "middle" }} />
          Register with Google
        </Button>
        {error && <div className={`${styles.statusMsg} ${styles.errorMsg}`}>{error}</div>}
        {success && <div className={`${styles.statusMsg} ${styles.successMsg}`}>Check your email for confirmation!</div>}
        <div style={{ marginTop: "1.2rem", fontSize: "1rem", color: "#a3aed6" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#39ffa0", textDecoration: "underline" }}>
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
