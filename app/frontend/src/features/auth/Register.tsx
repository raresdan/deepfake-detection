import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import styles from "./AuthForm.module.css";
import Button from "../../components/Button/Button";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setError(error.message);
    setLoading(false);
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
        <Button type="submit" disabled={loading} className={styles.buttonFullWidth}>
          {loading ? "Registering..." : "Register"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleLogin}
          className={`${styles.buttonFullWidth} ${styles.buttonGoogle}`}
          disabled={loading}
        >
          <FcGoogle size={22} className={styles.googleIcon} />
          Register with Google
        </Button>
        {error && <div className={`${styles.statusMsg} ${styles.errorMsg}`}>{error}</div>}
        {success && <div className={`${styles.statusMsg} ${styles.successMsg}`}>Check your email for confirmation!</div>}
        <div className={styles.switchLine}>
          Already have an account?{" "}
          <Link to="/login" className={styles.switchLink}>
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
