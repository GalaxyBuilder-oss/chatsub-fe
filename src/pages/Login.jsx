import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("")
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5006/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // if (!response.ok) {
      //   throw new Error("Login gagal");
      // }

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.data));
      window.location.href = "/chat";
    } catch (error) {
      setMessage(error.message)
      console.error("Error saat login:", error.message);
    }
  };

  return (
    <div className="login-container">
      <button className="home-button" onClick={() => navigate("/")}>
        ← Kembali ke Home
      </button>
      <h2>Selamat datang kembali 👋</h2>
      {message && <p>{message}</p>}
      <form className="login-form" onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="contoh@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="login-button" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
