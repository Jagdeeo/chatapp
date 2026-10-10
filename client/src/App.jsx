
import { useEffect, useState } from "react";
import Chats from "./pages/Chats.jsx";
import {
  MessageCircle,
  Mail,
  LockKeyhole,
  User,
  AtSign,
  Eye,
  EyeOff,
  LoaderCircle,
  ArrowRight,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  registerUser,
  verifyEmail,
  resendOTP,
  loginUser,
  logoutUser,
  getMyProfile,
} from "./services/api.js";

const App = () => {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [emailForOTP, setEmailForOTP] = useState("");

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [notice, setNotice] = useState(null);

  const notify = (message, type = "error") => {
    setNotice({ message, type });
  };

  // Restore the existing cookie-based login session.
  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((response) => {
        if (active) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        // A missing session is normal for a logged-out user.
      })
      .finally(() => {
        if (active) {
          setCheckingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRegister = async (event) => {
    event.preventDefault();
    setNotice(null);
    setLoading(true);

    try {
      const response = await registerUser({
        fullname: fullname.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });

      const registeredEmail =
        response.data.email || email.trim();

      setEmailForOTP(registeredEmail);
      setEmail(registeredEmail);
      setOtp("");
      setScreen("verify");

      notify(
        response.data.message ||
          "Verification code sent to your email.",
        "success",
      );
    } catch (error) {
      notify(
        error.response?.data?.message ||
          "Registration failed. Check your server connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setNotice(null);
    setLoading(true);

    try {
      const response = await verifyEmail({
        email: emailForOTP,
        otp: otp.trim(),
      });

      setUser(response.data.user);
      setOtp("");
      setScreen("chat");

      notify(
        response.data.message || "Email verified successfully.",
        "success",
      );
    } catch (error) {
      notify(
        error.response?.data?.message ||
          "Verification failed. Please check the code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setNotice(null);
    setLoading(true);

    try {
      const response = await resendOTP({
        email: emailForOTP,
      });

      notify(
        response.data.message || "A new code has been sent.",
        "success",
      );
    } catch (error) {
      notify(
        error.response?.data?.message ||
          "Could not resend the verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setNotice(null);
    setLoading(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      setUser(response.data.user);
      setPassword("");
      setScreen("chat");

      notify(response.data.message || "Welcome back!", "success");
    } catch (error) {
      const data = error.response?.data;

      if (data?.requiresVerification) {
        setEmailForOTP(data.email || email.trim());
        setScreen("verify");
      }

      notify(
        data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setNotice(null);

    try {
      await logoutUser();
      setUser(null);
      setPassword("");
      setScreen("login");
      notify("You have logged out successfully.", "success");
    } catch (error) {
      notify(
        error.response?.data?.message ||
          "Logout failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const switchScreen = (nextScreen) => {
    setNotice(null);
    setScreen(nextScreen);
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <LoaderCircle className="animate-spin text-primary" size={34} />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/30 backdrop-blur-xl md:grid-cols-2">
        {/* Brand panel */}
        <aside className="hidden flex-col justify-between bg-gradient-to-br from-primary/30 via-slate-900 to-slate-950 p-10 md:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary p-3 text-white">
                <MessageCircle size={27} />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                D Chat
              </span>
            </div>

            <div className="mt-24">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
                Stay connected
              </p>

              <h1 className="text-4xl font-bold leading-tight">
                Conversations
                <br />
                that bring
                <br />
                people closer.
              </h1>

              <p className="mt-6 max-w-sm leading-7 text-slate-400">
                A place for your conversations, your people, and the
                moments you share.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={17} />
            Secure, cookie-based authentication
          </div>
        </aside>

        {/* Main panel */}
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="rounded-xl bg-primary p-2.5">
              <MessageCircle size={23} />
            </div>
            <span className="text-xl font-bold">D Chat</span>
          </div>

          {notice && (
            <div
              role="status"
              className={`mb-6 flex items-start gap-3 rounded-xl border p-3 text-sm ${
                notice.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              ) : (
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
              )}
              <span>{notice.message}</span>
            </div>
          )}

          {screen === "login" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold">Welcome back</h2>
                <p className="mt-2 text-slate-400">
                  Sign in to continue to your account.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <Field
                  label="Email address"
                  icon={<Mail size={18} />}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                />

                <Field
                  label="Password"
                  icon={<LockKeyhole size={18} />}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  }
                />

                <SubmitButton loading={loading}>
                  Sign in
                </SubmitButton>
              </form>

              <p className="mt-7 text-center text-sm text-slate-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchScreen("register")}
                  className="font-semibold text-secondary hover:text-white"
                >
                  Create account
                </button>
              </p>
            </>
          )}

          {screen === "register" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold">Create account</h2>
                <p className="mt-2 text-slate-400">
                  Join D Chat and stay connected.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <Field
                  label="Full name"
                  icon={<User size={18} />}
                  placeholder="Your full name"
                  value={fullname}
                  onChange={setFullname}
                  required
                />

                <Field
                  label="Username"
                  icon={<AtSign size={18} />}
                  placeholder="Choose a username"
                  value={username}
                  onChange={setUsername}
                  required
                />

                <Field
                  label="Email address"
                  icon={<Mail size={18} />}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                  required
                />

                <Field
                  label="Password"
                  icon={<LockKeyhole size={18} />}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={setPassword}
                  required
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  }
                />

                <SubmitButton loading={loading}>
                  Create account
                </SubmitButton>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => switchScreen("login")}
                  className="font-semibold text-secondary hover:text-white"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {screen === "verify" && (
            <>
              <div className="mb-8">
                <div className="mb-5 inline-flex rounded-2xl bg-primary/20 p-4 text-secondary">
                  <ShieldCheck size={30} />
                </div>

                <h2 className="text-3xl font-bold">Verify your email</h2>
                <p className="mt-3 leading-6 text-slate-400">
                  Enter the verification code sent to{" "}
                  <span className="font-medium text-slate-200">
                    {emailForOTP}
                  </span>
                  .
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Verification code
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-4 text-center text-2xl font-bold tracking-[0.65em] text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <SubmitButton loading={loading}>
                  Verify email
                </SubmitButton>
              </form>

              <button
                type="button"
                disabled={loading}
                onClick={handleResendOTP}
                className="mt-5 w-full text-center text-sm font-semibold text-secondary hover:text-white disabled:opacity-50"
              >
                Resend verification code
              </button>

              <button
                type="button"
                onClick={() => switchScreen("login")}
                className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-slate-400 hover:text-white"
              >
                Back to sign in
              </button>
            </>
          )}

          {screen === "chat" && user && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-3xl font-bold text-secondary">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (user.fullname || user.username || "U")
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <h2 className="text-3xl font-bold">
                Welcome, {user.fullname || user.username}!
              </h2>

              <p className="mt-3 text-slate-400">
                Your account is connected successfully.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-left">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Signed in as
                </p>
                <p className="mt-2 break-all font-medium">{user.email}</p>
                <p className="mt-1 text-sm text-slate-400">
                  @{user.username}
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 text-left">
                <p className="font-semibold text-secondary">
                  Authentication complete
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Next, we'll connect the real users list, conversations,
                  and messages to your backend.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/5 disabled:opacity-50"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <LogOut size={18} />
                )}
                Sign out
              </button>
            </div>
          )}

          <p className="mt-10 text-center text-xs text-slate-600">
            D Chat · Connect with your people
          </p>
        </div>
      </section>
    </main>
  );
};

const Field = ({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  trailing,
  required = true,
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-300">
      {label}
    </span>

    <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-4 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <span className="shrink-0 text-slate-500">{icon}</span>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
      />

      {trailing}
    </span>
  </label>
);

const SubmitButton = ({ children, loading }) => (
  <button
    type="submit"
    disabled={loading}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? (
      <>
        <LoaderCircle className="animate-spin" size={19} />
        Please wait...
      </>
    ) : (
      <>
        {children}
        <ArrowRight size={18} />
      </>
    )}
  </button>
);

export default App;
