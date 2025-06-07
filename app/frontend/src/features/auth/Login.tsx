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
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
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
        <Button type="submit" disabled={loading} className={styles.buttonFullWidth}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleLogin}
          className={`${styles.buttonFullWidth} ${styles.buttonGoogle}`}
          disabled={loading}
        >
          <FcGoogle size={22} className={styles.googleIcon} />
          Login with Google
        </Button>
        {error && <div className={`${styles.statusMsg} ${styles.errorMsg}`}>{error}</div>}
        <div className={styles.switchLine}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.switchLink}>
            Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
