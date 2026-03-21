import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);

    // Step 1: Email Submission Form
    const emailFormik = useFormik({
        initialValues: { email: "" },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Required"),
        }),
        onSubmit: async (values) => {
            try {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/send-otp`, values);
                setEmail(values.email);
                toast.success("OTP sent to email");
                setStep(2);
            } catch (error) {
                toast.error(error.response?.data?.message || "Something went wrong");
            }
        },
    });

    const otpFormik = useFormik({
        initialValues: { otp: "" },
        validationSchema: Yup.object({
            otp: Yup.string().length(6, "OTP must be 6 digits").required("Required"),
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/verify-otp`,
                    {
                        email,
                        otp: parseInt(values.otp)
                    }
                );

                if (response.data.message === "OTP verified successfully!") {
                    setOtp(values.otp);
                    setOtpVerified(true);
                    toast.success("OTP verified successfully");
                    setStep(3);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Invalid or expired OTP");
            }
        },
    });

    // Step 3: Password Reset Form
    const passwordFormik = useFormik({
        initialValues: { newPassword: "" },
        validationSchema: Yup.object({
            newPassword: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("Required"),
        }),
        onSubmit: async (values) => {
            try {
                if (!otpVerified) {
                    toast.error("Please verify OTP first");
                    return;
                }

                // ForgotPassword.jsx (passwordFormik's onSubmit)
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/reset`,
                    {
                        email: email.trim().toLowerCase(), // Normalize email
                        newPassword: values.newPassword    // Ensure field name matches
                    }
                );

                if (response.data.message === "Password reset successful!") {
                    toast.success("Password reset successful!");
                    // Reset all states
                    setStep(1);
                    setEmail("");
                    setOtp("");
                    setOtpVerified(false);
                }
            } catch (error) {
                console.error("Reset error:", error.response?.data);
                toast.error(error.response?.data?.message || "Failed to reset password");
            }
        },
    });

    return (
        <div>
            {step === 1 && (
                <form onSubmit={emailFormik.handleSubmit}>
                    <h2>Forgot Password</h2>
                    <input type="email" name="email" placeholder="Enter your email" {...emailFormik.getFieldProps("email")} />
                    {emailFormik.errors.email && <p>{emailFormik.errors.email}</p>}
                    <button type="submit">Send OTP</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={otpFormik.handleSubmit}>
                    <h2>Enter OTP</h2>
                    <input type="text" name="otp" placeholder="Enter OTP" {...otpFormik.getFieldProps("otp")} />
                    {otpFormik.errors.otp && <p>{otpFormik.errors.otp}</p>}
                    <button type="submit">Verify OTP</button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={passwordFormik.handleSubmit}>
                    <h2>Reset Password</h2>
                    <input type="password" name="newPassword" placeholder="Enter new password" {...passwordFormik.getFieldProps("newPassword")} />
                    <button type="submit">Reset Password</button>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;
