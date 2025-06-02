import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import styles from "./AuthForm.module.css";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import { FcGoogle } from "react-icons/fc";


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Success: Redirect or update global auth state here
      navigate("/dashboard");
    }

    setLoading(false);
  };

  // Google login handler
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: "google",options: {
      redirectTo: `${window.location.origin}/dashboard`,
    } });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className={styles.authBackground}>
      <div className={styles.glow}></div>
      <form className={styles.formContainer} onSubmit={handleLogin} autoComplete="off">
        <div className={styles.formTitle}>Welcome!</div>
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
          autoComplete="current-password"
        />
       <Button type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Logging in..." : "Login"}
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
          Login with Google
        </Button>
        {error && <div className={`${styles.statusMsg} ${styles.errorMsg}`}>{error}</div>}
        <div style={{ marginTop: "1.2rem", fontSize: "1rem", color: "#a3aed6" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#39ffa0", textDecoration: "underline" }}>
            Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
