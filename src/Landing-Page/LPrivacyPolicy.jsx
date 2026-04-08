import React from "react";
import { useNavigate } from "react-router-dom";
import PrivacyImage from '../assets/PrivacyPolicy.jpg';

const LPrivacyPolicy = () => {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate("/");
    };

    return (
        <>
            {/* Header Image Section */}
            <div className="w-full bg-white shadow-md rounded-md overflow-hidden">
                <div className="relative w-full h-[300px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-80"
                        style={{ backgroundImage: `url(${PrivacyImage})` }}
                    ></div>

                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center px-4">
                        <h1 className="text-3xl font-semibold">Privacy Policy for Chalo Khelne</h1>
                        <button
                            onClick={handleBackToHome}
                            className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-500 transition text-white rounded-md w-auto"
                        >
                            Back to Home Page
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Privacy Policy Content */}
            <div className="max-w-5xl mx-auto my-8 p-6 bg-gray-100 rounded-md shadow-md text-base leading-relaxed font-['Roboto']">
                <p className="mb-4">Effective Date: 06-12-2024</p>
                <p className="mb-4">
                    At Chalo Khelne, your privacy is our top priority. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our sports application. Please read this policy carefully to understand our views and practices regarding your personal data.
                </p>

                {/* Sections */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
                    <ul className="space-y-2">
                        <li><strong>a) Personal Information</strong></li>
                        <ul className="ml-5 list-disc text-sm text-gray-700">
                            <li>Name</li>
                            <li>Email Address</li>
                            <li>Phone Number</li>
                            <li>Date of Birth (optional)</li>
                            <li>Profile Picture (optional)</li>
                        </ul>
                        <li className="mt-2"><strong>b) Non-Personal Information</strong></li>
                        <ul className="ml-5 list-disc text-sm text-gray-700">
                            <li>Device Information (e.g., device type, OS, app version)</li>
                            <li>Usage Data (e.g., pages viewed, session duration)</li>
                            <li>Location Data (if enabled)</li>
                        </ul>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
                    <ul className="list-disc ml-5 text-gray-700 space-y-2">
                        <li>To provide, maintain, and improve the app’s features and user experience.</li>
                        <li>To manage user accounts and personalize your experience.</li>
                        <li>To send notifications, updates, and relevant communication.</li>
                        <li>To analyze usage trends and improve app performance.</li>
                        <li>To organize sports events, tournaments, and leaderboards.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Sharing Your Information</h2>
                    <p className="mb-2">We do not sell, trade, or rent your personal information to third parties. However, we may share your information:</p>
                    <ul className="list-disc ml-5 text-gray-700 space-y-2">
                        <li>With Service Providers (e.g., hosting, analytics, support).</li>
                        <li>For Legal Compliance or to protect rights.</li>
                        <li>With Consent for specific sharing.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Security Measures</h2>
                    <p>
                        We take appropriate security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Third-Party Links</h2>
                    <p>
                        Chalo Khelne may contain links to third-party websites or services. We are not responsible for their privacy practices and encourage you to read their privacy policies.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Children’s Privacy</h2>
                    <p>
                        Our app is not intended for users under the age of 13. If we discover data from a child under 13, we will delete it immediately.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">7. User Rights</h2>
                    <ul className="list-disc ml-5 text-gray-700 space-y-2">
                        <li>Access and update your personal information.</li>
                        <li>Request data deletion.</li>
                        <li>Withdraw consent for processing.</li>
                        <li>Opt-out of marketing messages.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Data Retention</h2>
                    <p className="mb-2">
                        We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, including providing our services, complying with legal obligations, resolving disputes, and enforcing our agreements.
                    </p>
                    <ul className="list-disc ml-5 text-gray-700 space-y-2">
                        <li>Account Information: Retained as long as your account is active.</li>
                        <li>Usage & Analytics Data: Retained for up to 90 days.</li>
                        <li>Support & Communication Data: Retained for up to 6 months.</li>
                    </ul>
                    <p className="mt-2">
                        If you request account deletion, your personal data will be deleted or anonymized within a reasonable time, unless retention is required by law.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Changes to This Privacy Policy</h2>
                    <p>
                        We may update this policy. You will be notified via the "Effective Date" change at the top of this page.
                    </p>
                </section>

                <section className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
                    <p className="mb-2">If you have any questions or concerns:</p>
                    <ul className="list-disc ml-5 text-gray-700 space-y-2">
                        <li>Email: <a href="mailto:sales@chalokhelne.com" className="text-orange-500 hover:underline">sales@chalokhelne.com</a></li>
                        <li>Phone: 9272090926</li>
                    </ul>
                </section>
            </div>
        </>
    );
};

export default LPrivacyPolicy;
