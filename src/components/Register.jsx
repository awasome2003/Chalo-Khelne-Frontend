import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number")
      .required("Mobile number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    role: Yup.string().required("Please select a role"),
  });

  // 🔹 **Formik Setup**
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values, { setTouched, validateForm }) => {
      // ✅ Ensure all fields are marked as touched
      setTouched({
        name: true,
        email: true,
        mobile: true,
        password: true,
        confirmPassword: true,
        role: true,
      });

      // ✅ Validate form before submitting
      const errors = await validateForm();
      if (Object.keys(errors).length > 0) {
        toast.error("Please fill all required fields correctly.");
        return;
      }

      // ❌ Block submission if email is not verified
      if (!isEmailVerified) {
        toast.error("Please verify your email before registering.");
        return;
      }

      try {
        const { confirmPassword, ...formData } = values;
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, formData);
        toast.success(response.data.message);
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
      }
    },
  });

  // 🔹 **Send OTP**
  const handleSendOtp = async () => {
    const email = formik.values.email;
    if (!email) {
      toast.error("Please enter an email before verifying.");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`, { email });
      toast.success(response.data.message);
      setOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  // 🔹 **Verify OTP**
  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }
    try {
      const email = formik.values.email;
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, { email, otp });
      toast.success(response.data.message);
      setIsEmailVerified(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    }
  };

  // 🔹 **Handle Email Change**
  const handleEmailChange = (e) => {
    formik.handleChange(e);
    setIsEmailVerified(false); // Reset email verification if changed
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={formik.handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" {...formik.getFieldProps("name")} />
        {formik.touched.name && formik.errors.name && <p className="error">{formik.errors.name}</p>}

        {/* Email & OTP Verification */}
        <div className="email-verification">
          <input type="email" name="email" placeholder="Email Address" value={formik.values.email} onChange={handleEmailChange} />
          {!otpSent ? (
            <button type="button" className="verify-btn" onClick={handleSendOtp}>
              Send OTP
            </button>
          ) : (
            <>
              <input type="text" name="otp" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <button type="button" className="verify-btn" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
            </>
          )}
        </div>
        {formik.touched.email && formik.errors.email && <p className="error">{formik.errors.email}</p>}
        {isEmailVerified && <p className="success-text">Email Verified ✅</p>}

        <input type="text" name="mobile" placeholder="Mobile Number" {...formik.getFieldProps("mobile")} />
        {formik.touched.mobile && formik.errors.mobile && <p className="error">{formik.errors.mobile}</p>}

        <input type="password" name="password" placeholder="Password" {...formik.getFieldProps("password")} />
        {formik.touched.password && formik.errors.password && <p className="error">{formik.errors.password}</p>}

        <input type="password" name="confirmPassword" placeholder="Confirm Password" {...formik.getFieldProps("confirmPassword")} />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="error">{formik.errors.confirmPassword}</p>}

        {/* Role Selection */}
        <div className="role-container">
          {["Club", "Player", "Trainer"].map((role) => (
            <label key={role} className={`role-button ${formik.values.role === role ? "selected" : ""}`}>
              <input type="radio" name="role" value={role} onChange={formik.handleChange} />
              {role}
            </label>
          ))}
        </div>
        {formik.touched.role && formik.errors.role && <p className="error">{formik.errors.role}</p>}

        {/* Register Button */}
        <button type="submit" disabled={!isEmailVerified}>Register</button>
        <p className="login-text">
          Already registered? <a href="/login">Please Login</a>
        </p>
      </form>
    </div>
  );
};

export default RegistrationForm;
