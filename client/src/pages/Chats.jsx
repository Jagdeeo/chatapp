
import { useEffect, useState } from "react";
import {
  MessageCircle,
  Mail,
  LockKeyhole,
  UserRound,
  AtSign,
  Eye,
  EyeOff,
  ArrowLeft,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import Chats from "./pages/Chats";
import {
  registerUser,
  verifyEmail,
  resendOTP,
  loginUser,
  logoutUser,
  getMyProfile,
} from "./services/api";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  fallback;

const getUserId = (user) =>
  String(user?._id || user?.id || "");

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [otpEmail, setOtpEmail] = useState("");

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    otp: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Restore the logged-in user when the app opens.
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await getMyProfile();

        if (mounted && response.data?.user) {
          setUser(response.data.user);
          setPage("chats");
        }
      } catch {
        // A missing or expired session means the user must log in.
        if (mounted) {
          setUser(null);
          setPage("login");
        }
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "otp" ? value.replace(/\D/g, "").slice(0, 4) : value,
    }));

    setError("");
    setSuccess("");
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    setError("");
    setSuccess("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const fullname = form.fullname.trim();
    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();

    if (!fullname || !username || !email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        fullname,
        username,
        email,
        password: form.password,
      });

      const requiresVerification =
        response.data?.requiresVerification !== false;

      if (requiresVerification) {
        setOtpEmail(response.data?.email || email);
        setForm((previous) => ({ ...previous, otp: "" }));
        setPage("verify");
        setSuccess(
          response.data?.message ||
            "Account created. Check your email for the verification code."
        );
      } else {
        setPage("login");
        setSuccess(
          response.data?.message ||
            "Registration successful. Please log in."
        );
      }
    } catch (err) {
      const data = err.response?.data;

      if (data?.requiresVerification && data?.email) {
        setOtpEmail(data.email);
        setPage("verify");
      }

      setError(
        getErrorMessage(err, "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!otpEmail) {
      setError("Email address is missing. Please register again.");
      return;
    }

    if (form.otp.length !== 4) {
      setError("Enter the complete 4-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyEmail({
        email: otpEmail,
        otp: form.otp,
      });

      if (response.data?.user) {
        setUser(response.data.user);
        setPage("chats");
        setSuccess("");
      } else {
        setPage("login");
        setSuccess(
          response.data?.message ||
            "Email verified. Please log in to continue."
        );
      }

      setForm((previous) => ({ ...previous, password: "", otp: "" }));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Verification failed. Check the code and try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    if (!otpEmail) {
      setError("Email address is missing. Please register again.");
      return;
    }

    setLoading(true);

    try {
      const response = await resendOTP({ email: otpEmail });

      setSuccess(
        response.data?.message ||
          "A new verification code has been requested."
      );
      setForm((previous) => ({ ...previous, otp: "" }));
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not resend the code. Please try again later."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        email,
        password: form.password,
      });

      const loggedInUser = response.data?.user;

      if (loggedInUser) {
        setUser(loggedInUser);
        setPage("chats");
        setForm((previous) => ({
          ...previous,
          password: "",
          otp: "",
        }));
      } else {
        // Some APIs return success without the user object.
        const profileResponse = await getMyProfile();

        if (profileResponse.data?.user) {
          setUser(profileResponse.data.user);
          setPage("chats");
        } else {
          setError("Login succeeded, but the user profile could not be loaded.");
        }
      }
    } catch (err) {
      const data = err.response?.data;

      if (data?.requiresVerification) {
        setOtpEmail(data.email || email);
        setForm((previous) => ({ ...previous, otp: "" }));
        setPage("verify");
      }

      setError(
        getErrorMessage(err, "Login failed. Check your credentials.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await logoutUser();
    } catch (err) {
      // If logout fails, keep the user informed rather than silently
      // pretending the server session was cleared.
      setError(
        getErrorMessage(err, "Could not log out. Please try again.")
      );
      setLoading(false);
      return;
    }

    setUser(null);
    setOtpEmail("");
    setForm({
      fullname: "",
      username: "",
      email: "",
      password: "",
      otp: "",
    });
    setPage("login");
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F5F6F2]">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#628395] text-white shadow-lg">
            <MessageCircle size={32} />
          </div>
          <LoaderCircle
            size={24}
            className="mx-auto animate-spin text-[#628395]"
          />
          <p className="mt-3 text-sm text-slate-500">
            Checking your session...
          </p>
        </div>
      </main>
    );
  }

  if (user && page === "chats") {
    return <Chats user={user} onLogout={handleLogout} />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F5F6F2] p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:min-h-[620px] md:grid-cols-2">
        {/* Branding panel */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#628395] p-10 text-white md:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <MessageCircle size={28} />
            </div>
            <span className="text-2xl font-bold">D Chat</span>
          </div>

          <div className="relative z-10">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/15">
              {page === "verify" ? (
                <ShieldCheck size={36} />
              ) : (
                <MessageCircle size={36} />
              )}
            </div>

            <h1 className="max-w-md text-4xl font-bold leading-tight">
              {page === "register"
                ? "Create connections that matter."
                : page === "verify"
                  ? "One last step."
                  : "Your conversations, all in one place."}
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-white/80">
              {page === "verify"
                ? "Verify your email to finish setting up your D Chat account."
                : "A simple, personal space to connect with people and keep your conversations close."}
            </p>
          </div>

          <p className="relative z-10 text-sm text-white/70">
            D Chat · Simple · Personal · Connected
          </p>
        </section>

        {/* Authentication panel */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#628395] text-white">
                <MessageCircle size={27} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">D Chat</h1>
                <p className="text-xs text-slate-500">Stay connected</p>
              </div>
            </div>

            {page === "verify" ? (
              <>
                <button
                  type="button"
                  onClick={() => changePage("login")}
                  className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#628395]"
                >
                  <ArrowLeft size={17} />
                  Back to login
                </button>

                <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-[#DFD5A5]/50 text-[#628395]">
                  <ShieldCheck size={30} />
                </div>

                <h2 className="text-3xl font-bold text-slate-800">
                  Verify your email
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter the 4-digit code sent to{" "}
                  <span className="font-semibold text-slate-700">
                    {otpEmail || form.email}
                  </span>
                  .
                </p>

                <form
                  onSubmit={handleVerifyOTP}
                  className="mt-8 space-y-5"
                >
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Verification code
                    </span>
                    <input
                      name="otp"
                      value={form.otp}
                      onChange={updateField}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={4}
                      placeholder="Enter 4-digit code"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none transition focus:border-[#628395] focus:ring-2 focus:ring-[#628395]/15"
                      required
                    />
                  </label>

                  <Feedback error={error} success={success} />

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#628395] px-4 py-3.5 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <LoaderCircle size={19} className="animate-spin" />
                    )}
                    Verify email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="w-full py-2 text-sm font-semibold text-[#628395] transition hover:underline disabled:opacity-60"
                  >
                    Resend verification code
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm font-semibold text-[#628395]">
                  {page === "register" ? "GET STARTED" : "WELCOME BACK"}
                </p>

                <h2 className="text-3xl font-bold text-slate-800">
                  {page === "register"
                    ? "Create an account"
                    : "Login to D Chat"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {page === "register"
                    ? "Sign up to start chatting with your people."
                    : "Enter your details to continue your conversations."}
                </p>

                <form
                  onSubmit={
                    page === "register" ? handleRegister : handleLogin
                  }
                  className="mt-7 space-y-4"
                >
                  {page === "register" && (
                    <>
                      <InputField
                        label="Full name"
                        name="fullname"
                        value={form.fullname}
                        onChange={updateField}
                        placeholder="Enter your full name"
                        icon={UserRound}
                        autoComplete="name"
                      />

                      <InputField
                        label="Username"
                        name="username"
                        value={form.username}
                        onChange={updateField}
                        placeholder="Choose a username"
                        icon={AtSign}
                        autoComplete="username"
                      />
                    </>
                  )}

                  <InputField
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    icon={Mail}
                    autoComplete="email"
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Password
                    </span>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-[#628395] focus-within:ring-2 focus-within:ring-[#628395]/15">
                      <LockKeyhole
                        size={18}
                        className="ml-4 shrink-0 text-slate-400"
                      />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={updateField}
                        placeholder="Enter your password"
                        autoComplete={
                          page === "register"
                            ? "new-password"
                            : "current-password"
                        }
                        className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="mr-2 rounded-lg p-2 text-slate-400 hover:text-slate-700"
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
                    </div>
                  </label>

                  {page === "register" && (
                    <p className="text-xs leading-5 text-slate-500">
                      Use at least 6 characters for your password.
                    </p>
                  )}

                  <Feedback error={error} success={success} />

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#628395] px-4 py-3.5 font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <LoaderCircle size={19} className="animate-spin" />
                    )}
                    {page === "register"
                      ? "Create account"
                      : "Login"}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  {page === "register"
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      changePage(
                        page === "register" ? "login" : "register"
                      )
                    }
                    className="font-semibold text-[#628395] hover:underline"
                  >
                    {page === "register" ? "Login" : "Sign up"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  autoComplete,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-[#628395] focus-within:ring-2 focus-within:ring-[#628395]/15">
        <Icon size={18} className="ml-4 shrink-0 text-slate-400" />
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm outline-none"
          required
        />
      </div>
    </label>
  );
}

function Feedback({ error, success }) {
  return (
    <>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
        >
          {success}
        </div>
      )}
    </>
  );
}
