import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5006/api/appUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) throw new Error("Registrasi gagal");

      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.data));
      alert("Registrasi berhasil!");
      navigate("/login");
    } catch (err) {
      alert("Gagal mendaftar: " + err.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Buat akun baru</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <label htmlFor="name">Nama</label>
        <input
          type="text"
          id="name"
          placeholder="Nama lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="contoh@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="register-button" type="submit">
          Daftar
        </button>
      </form>

      <button className="home-button" onClick={() => navigate("/")}>
        ← Kembali ke Home
      </button>
    </div>
  );
};

export default Register;
