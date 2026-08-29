import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export interface Auth1Props {
  brandName?: string;
  badgeText?: string;
  heading?: string;
  subheading?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  submitLabel?: string;
  dividerText?: string;
  forgotPasswordText?: string;
  onForgotPassword?: () => void;
  onSubmit?: (data: {
    email: string;
    password: string;
    name?: string;
    mode: "login" | "signup";
  }) => Promise<void> | void;
  onGoogleSignIn?: () => Promise<void> | void;
  defaultMode?: "login" | "signup";
}

export function Auth1({
  brandName = "AOCIND",
  badgeText = "Artisan Handcrafted",
  heading,
  subheading,
  emailLabel = "Email Address",
  emailPlaceholder = "name@example.com",
  passwordLabel = "Password",
  passwordPlaceholder = "••••••••",
  nameLabel = "Full Name",
  namePlaceholder = "Priya Sharma",
  dividerText = "Or continue with",
  forgotPasswordText = "Forgot password?",
  onForgotPassword,
  onSubmit,
  onGoogleSignIn,
  defaultMode = "login",
}: Auth1Props) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Validation Errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    let isValid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setServerError("");

    if (mode === "signup" && !name.trim()) {
      setNameError("Full name is required");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email address is required");
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({
        email: email.trim(),
        password,
        name: name.trim(),
        mode,
      });
    } catch (err: any) {
      console.error("Auth Submission Error:", err);
      const code = err?.code || "";
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setServerError("Invalid email or password. Please check your credentials.");
      } else if (code === "auth/email-already-in-use") {
        setServerError("This email is already registered. Please sign in instead.");
      } else if (code === "auth/weak-password") {
        setPasswordError("Password should be at least 6 characters long.");
      } else if (code === "auth/invalid-email") {
        setEmailError("The email address provided is invalid.");
      } else {
        setServerError(
          err?.message || "Authentication failed. Please check your details and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicHeading =
    heading || (mode === "login" ? "Welcome Back" : "Create Your Account");

  return (
    <div className="w-full bg-white text-zinc-900 font-sans space-y-3.5 sm:space-y-4">
      {/* Header */}
      <div className="text-center pt-1 sm:pt-0">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900">
          {!heading && mode === "signup" ? (
            <>
              <span>Create Your</span>
              <br className="sm:hidden" />
              <span className="sm:ml-1.5">Account</span>
            </>
          ) : (
            dynamicHeading
          )}
        </h2>
      </div>

      {/* Segmented Mode Switcher */}
      <div className="relative flex bg-zinc-100/80 p-1 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 select-none">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setNameError("");
            setEmailError("");
            setPasswordError("");
            setServerError("");
          }}
          className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
            mode === "login" ? "text-zinc-900 font-extrabold" : "hover:text-zinc-900 font-semibold"
          }`}
        >
          {mode === "login" && (
            <motion.div
              layoutId="auth-tab-pill"
              className="absolute inset-0 bg-white rounded-lg shadow-xs border border-zinc-200/80"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setNameError("");
            setEmailError("");
            setPasswordError("");
            setServerError("");
          }}
          className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
            mode === "signup" ? "text-zinc-900 font-extrabold" : "hover:text-zinc-900 font-semibold"
          }`}
        >
          {mode === "signup" && (
            <motion.div
              layoutId="auth-tab-pill"
              className="absolute inset-0 bg-white rounded-lg shadow-xs border border-zinc-200/80"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">Sign Up</span>
        </button>
      </div>

      {/* Server / Auth Error Banner */}
      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium p-2.5 rounded-xl flex items-start gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
            <span className="leading-snug">{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form */}
      <form noValidate onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
        {/* Full Name Field (Sign Up Mode) */}
        <AnimatePresence initial={false}>
          {mode === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1 overflow-hidden"
            >
              <label
                htmlFor="Auth1-name"
                className="block text-xs font-semibold text-zinc-700"
              >
                {nameLabel} <span className="text-rose-500">*</span>
              </label>
              <div
                className={`relative rounded-xl border bg-zinc-50/70 transition-all duration-200 ${
                  nameError
                    ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 bg-rose-50/20"
                    : "border-zinc-200 focus-within:border-[#520618] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#520618]/10"
                }`}
              >
                <User className="text-zinc-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  id="Auth1-name"
                  type="text"
                  placeholder={namePlaceholder}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  className="w-full h-10 sm:h-11 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 pl-9 pr-4 rounded-xl outline-none bg-transparent"
                />
              </div>
              {nameError && (
                <p className="text-[10px] sm:text-[11px] font-medium text-rose-500 flex items-center gap-1">
                  <span>•</span> <span>{nameError}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Address Field */}
        <div className="space-y-1">
          <label
            htmlFor="Auth1-email"
            className="block text-xs font-semibold text-zinc-700"
          >
            {emailLabel} <span className="text-rose-500">*</span>
          </label>
          <div
            className={`relative rounded-xl border bg-zinc-50/70 transition-all duration-200 ${
              emailError
                ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 bg-rose-50/20"
                : "border-zinc-200 focus-within:border-[#520618] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#520618]/10"
            }`}
          >
            <Mail className="text-zinc-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="Auth1-email"
              type="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className="w-full h-10 sm:h-11 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 pl-9 pr-4 rounded-xl outline-none bg-transparent"
            />
          </div>
          {emailError && (
            <p className="text-[10px] sm:text-[11px] font-medium text-rose-500 flex items-center gap-1">
              <span>•</span> <span>{emailError}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label
            htmlFor="Auth1-password"
            className="block text-xs font-semibold text-zinc-700"
          >
            {passwordLabel} <span className="text-rose-500">*</span>
          </label>
          <div
            className={`relative rounded-xl border bg-zinc-50/70 transition-all duration-200 ${
              passwordError
                ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 bg-rose-50/20"
                : "border-zinc-200 focus-within:border-[#520618] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#520618]/10"
            }`}
          >
            <Lock className="text-zinc-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              id="Auth1-password"
              type={showPassword ? "text" : "password"}
              placeholder={passwordPlaceholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              className="w-full h-10 sm:h-11 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 pl-9 pr-9 rounded-xl outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-zinc-400 hover:text-zinc-700 absolute top-1/2 right-3 -translate-y-1/2 transition-colors cursor-pointer p-1"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-[10px] sm:text-[11px] font-medium text-rose-500 flex items-center gap-1">
              <span>•</span> <span>{passwordError}</span>
            </p>
          )}
        </div>

        {/* Remember Me Option */}
        {mode === "login" && (
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600 hover:text-zinc-900">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-zinc-300 text-[#520618] focus:ring-[#520618]/20 cursor-pointer accent-[#520618]"
              />
              <span>Remember me on this device</span>
            </label>
          </div>
        )}

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10.5 sm:h-11 bg-zinc-900 hover:bg-[#520618] text-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{mode === "login" ? "Sign In to Account" : "Create Free Account"}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* Social Divider */}
      <div className="flex items-center gap-3 py-0.5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
        <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 shrink-0">
          {dividerText}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={() => onGoogleSignIn?.()}
        className="w-full h-11 sm:h-12 bg-white hover:bg-zinc-50/80 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer active:scale-[0.99]"
      >
        <FcGoogle className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
        <span>Continue with Google</span>
      </button>

      {/* Security & SSL Assurance Footer */}
  
    </div>
  );
}

export default Auth1;
