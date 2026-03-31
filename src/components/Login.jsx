import React, { useState, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { X, Eye, EyeOff, Loader2, LogIn, Shield, Zap, Send, Mail, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AuthPopup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] w-full max-w-md max-h-[90vh] overflow-hidden border border-white/20"
      >
        {/* Tactical Header Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 z-50" />

        {/* Decorative Background Intel */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full" />

        {/* Close button - Tactical Style */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-2xl bg-gray-50/80 backdrop-blur-sm hover:bg-gray-900 hover:text-white transition-all duration-300 z-[60] shadow-sm border border-black/5"
          aria-label="Secure Extraction"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto max-h-[calc(90vh)] custom-scrollbar relative z-10">
          {activeTab === "login" ? (
            <LoginForm
              onClose={onClose}
              switchToForgot={() => setActiveTab("forgotPassword")}
            />
          ) : (
            <ForgotPasswordForm
              switchToLogin={() => setActiveTab("login")}
            />
          )}
        </div>
        <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      </motion.div>
    </AnimatePresence>
  );
};

const LoginForm = ({ onClose, switchToForgot }) => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid tactical channel")
      .required("Email channel required"),
    password: Yup.string()
      .min(6, "Encryption length error")
      .required("Access key required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/login`,
          { email: values.email?.trim().toLowerCase(), password: values.password?.trim() }
        );
        toast.success("Authentication Successful");
        login(response.data);
        onClose();

        const userRole = response.data.user.role.toLowerCase();
        if (userRole === "superadmin") {
          navigate("/home");
        } else if (userRole === "manager") {
          navigate("/mdashboard");
        } else if (userRole === "clubadmin") {
          navigate("/club-dashboard");
        } else if (userRole === "corporate_admin") {
          navigate("/corporate-dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Login failure:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Transmission Error: Invalid Credentials");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-[2px] bg-blue-600 rounded-full" />
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Access Protocol</span>
        </div>
        <h2 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter leading-none mb-3">
          Chalo Khelne <span className="text-transparent stroke-gray-900 stroke-[1px]">Terminal</span>
        </h2>
        <p className="text-gray-400 font-medium italic text-sm">Synchronize with operational central.</p>
      </div>

      <form className="space-y-6" onSubmit={formik.handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4 italic"
          >
            Operator Channel (Email)
          </label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={`w-full pl-14 pr-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold italic outline-none focus:border-blue-600/30 focus:bg-white transition-all shadow-inner ${formik.touched.email && formik.errors.email ? "border-red-200" : ""
                }`}
              placeholder="you@arena.com"
              {...formik.getFieldProps("email")}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-[10px] font-black text-red-500 uppercase tracking-widest pl-4 italic">{formik.errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4 italic"
          >
            Access Encryption (Password)
          </label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`w-full pl-14 pr-14 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold italic outline-none focus:border-blue-600/30 focus:bg-white transition-all shadow-inner ${formik.touched.password && formik.errors.password ? "border-red-200" : ""
                }`}
              placeholder="••••••••"
              {...formik.getFieldProps("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-[10px] font-black text-red-500 uppercase tracking-widest pl-4 italic leading-none">
              {formik.errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-5 w-5 bg-gray-50 border-black/5 rounded-lg text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="text-xs font-black text-gray-500 uppercase tracking-widest italic cursor-pointer"
            >
              Steady State
            </label>
          </div>
          <button
            type="button"
            onClick={switchToForgot}
            className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest italic transition-all"
          >
            Lost Comms?
          </button>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-black italic uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] ${isLoading ? "cursor-not-allowed" : ""
              }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>Initiate Link <LogIn className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-8 border-t border-black/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">
          Regional Chalo Khelne Access Restricted to Authorized Operators
        </p>
      </div>
    </>
  );
};

const ForgotPasswordForm = ({ switchToLogin }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid tactical channel").required("Channel required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/email/forgot-password/send-otp`, { email: values.email });
        setEmail(values.email);
        toast.success("Signal Transmission Successfully: OTP Sent");
        setStep(2);
      } catch (error) {
        toast.error(error.response?.data?.message || "Signal Jammed: Transmission Failure");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string().length(6, "Encryption length error").required("Key required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/email/forgot-password/verify-otp`,
          {
            email,
            otp: values.otp
          }
        );
        toast.success("Verification Handshake Confirmed");
        setStep(3);
      } catch (error) {
        toast.error(error.response?.data?.message || "Signal Corruption: Invalid Token");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(6, "Encryption standard too low")
        .required("Encryption required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Signal Out of Phase (Mismatch)")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/email/forgot-password/reset`,
          {
            email: email.trim().toLowerCase(),
            newPassword: values.newPassword
          }
        );
        toast.success("Frequency Reset Confirmed");
        switchToLogin();
      } catch (error) {
        toast.error(error.response?.data?.message || "Protocol Failure: Reset Denied");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-[2px] bg-indigo-600 rounded-full" />
          <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Recovery Protocol</span>
        </div>
        <h2 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter leading-none mb-3">
          Signal <span className="text-transparent stroke-gray-900 stroke-[1px]">Resync</span>
        </h2>
        <p className="text-gray-400 font-medium italic text-sm">
          {step === 1 ? "Broadcast channel for verification." : step === 2 ? `Decoding token for ${email}` : "Define new access parameters."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={emailFormik.handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4 italic">Channel (Email)</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold italic outline-none focus:border-indigo-600/30 focus:bg-white transition-all shadow-inner"
                  placeholder="operator@channel.com"
                  {...emailFormik.getFieldProps("email")}
                />
              </div>
              {emailFormik.touched.email && emailFormik.errors.email && (
                <p className="mt-1 text-[10px] font-black text-red-500 uppercase tracking-widest pl-4 italic">{emailFormik.errors.email}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black italic uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Transmit OTP <Send className="w-4 h-4" /></>}
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={otpFormik.handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4 italic">Decryption Key (OTP)</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Zap className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold italic outline-none focus:border-blue-600/30 focus:bg-white transition-all shadow-inner"
                  placeholder="6-digit tactical key"
                  {...otpFormik.getFieldProps("otp")}
                />
              </div>
              {otpFormik.touched.otp && otpFormik.errors.otp && (
                <p className="mt-1 text-[10px] font-black text-red-500 uppercase tracking-widest pl-4 italic">{otpFormik.errors.otp}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black italic uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Verify Handshake <Shield className="w-4 h-4" /></>}
            </button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={passwordFormik.handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4 italic">Next Gen Encryption (New Password)</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold italic outline-none focus:border-purple-600/30 focus:bg-white transition-all shadow-inner"
                    placeholder="••••••••"
                    {...passwordFormik.getFieldProps("newPassword")}
                  />
                </div>
                {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                  <p className="mt-1 text-[10px] font-black text-red-500 uppercase tracking-widest pl-4 italic">{passwordFormik.errors.newPassword}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4 italic">Confirm Encryption</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold italic outline-none focus:border-purple-600/30 focus:bg-white transition-all shadow-inner"
                    placeholder="••••••••"
                    {...passwordFormik.getFieldProps("confirmPassword")}
                  />
                </div>
                {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                  <p className="mt-1 text-[10px] font-black text-red-500 uppercase tracking-widest pl-4 italic">{passwordFormik.errors.confirmPassword}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black italic uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Finalize Encryption <Lock className="w-5 h-5" /></>}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-10 text-center">
        <button
          onClick={switchToLogin}
          className="text-xs font-black text-gray-500 hover:text-gray-900 uppercase tracking-widest italic transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <User className="w-4 h-4" /> Abort Recovery & Login
        </button>
      </div>
    </>
  );
};

export default AuthPopup;
