import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const userData = localStorage.getItem("user");
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      navigate("/chat");
    }
  }, [userData, navigate]);

  return (
    <div className="home-container">
      <h1>Selamat datang di Aplikasi Chat</h1>
      <p>Silakan login untuk mulai ngobrol dengan teman-temanmu!</p>
      <div className="group-button">
        <button className="register-button" onClick={() => navigate("/register")}>
          Register
        </button>
        <button className="login-button" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Home;
