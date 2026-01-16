import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "./services/authService";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      const { token, user } = response.data;

      login(token, user);

      switch (user.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "TEACHER":
          navigate("/teacher");
          break;
        case "STUDENT":
          navigate("/student");
          break;
        default:
          navigate("/");
      }
    } catch (err: any) {
      console.error("Login failed", err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen min-h-dvh p-6 bg-[#1a1d21] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(26,29,33,0.85)] to-[rgba(0,0,0,0.75)] z-0"></div>

      {/* Login Form - Center */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="text-center mb-7">
          <h1 className="text-[28px] font-semibold text-white mb-2">
            Connexion
          </h1>
          <p className="text-sm text-white/70">
            Accédez à votre espace personnel
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="flex items-start gap-2.5 p-3 bg-red-500/15 border border-red-400/30 mb-6 backdrop-blur-sm"
            role="alert"
          >
            <AlertCircle
              size={16}
              className="text-red-400 flex-shrink-0 mt-0.5"
            />
            <span className="text-[13px] text-red-200 leading-relaxed">
              {error}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium text-white/90 uppercase tracking-wider"
            >
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 max-md:py-2 text-sm bg-transparent border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:border-white/60 rounded-sm"
              placeholder="nom@edacademy.ma"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium text-white/90 uppercase tracking-wider"
            >
              Mot de passe
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 max-md:py-2 pr-12 text-sm bg-transparent border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:border-white/60 rounded-sm"
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 flex items-center justify-center w-10 h-10 bg-transparent border-none text-white/60 cursor-pointer hover:text-white/90 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-white/85">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#c41e3a] cursor-pointer"
              />
              <span>Rester connecté</span>
            </label>
            <a
              href="#"
              className="text-[13px] text-white/85 font-medium no-underline hover:text-white transition-colors"
            >
              Mot de passe oublié ?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 max-md:py-2 mt-2 bg-red-800 hover:bg-[#800000] text-white text-[13px] font-semibold uppercase tracking-wider rounded-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <span>CONNEXION...</span> : <span>SE CONNECTER</span>}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/15">
          <p className="text-xs text-white/50 text-center">
            © {new Date().getFullYear()} ED Academy. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};
