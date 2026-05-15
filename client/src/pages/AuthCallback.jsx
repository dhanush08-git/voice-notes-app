import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Fetch user info using the token
      axios
        .get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          login(token, res.data);
          navigate("/");
        })
        .catch(() => navigate("/auth"));
    } else {
      navigate("/auth");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  );
}