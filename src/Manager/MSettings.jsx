import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Phone,
  Bell,
  Globe,
  Palette,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Settings,
  Moon,
  Sun,
  Eye,
  Loader2,
} from "lucide-react";

function Msettings() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dynamic state that you can populate from API
  const [userData, setUserData] = useState({
    email: "",
    phone: "",
    name: "",
  });

  const [settings, setSettings] = useState({
    notifications: {
      email: false,
      sms: false,
      tournaments: false,
      bookings: false,
    },
    privacy: {
      publicProfile: false,
      shareContact: false,
    },
    preferences: {
      theme: "light",
      language: "English",
    },
  });

  const [appInfo, setAppInfo] = useState({
    version: "",
    supportPhone: "",
    supportEmail: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Simulate API calls - Replace these with your actual API calls
  useEffect(() => {
    fetchUserData();
    fetchSettings();
    fetchAppInfo();
  }, []);

  const fetchUserData = async () => {
    try {
      // Replace with your API call
      // const response = await fetch('/api/user/profile');
      // const data = await response.json();

      // Simulated data - replace with actual API response
      setTimeout(() => {
        setUserData({
          email: "user@example.com",
          phone: "+91-9876543210",
          name: "John Doe",
        });
      }, 1000);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      // Replace with your API call
      // const response = await fetch('/api/user/settings');
      // const data = await response.json();

      // Simulated data - replace with actual API response
      setTimeout(() => {
        setSettings({
          notifications: {
            email: true,
            sms: false,
            tournaments: true,
            bookings: false,
          },
          privacy: {
            publicProfile: true,
            shareContact: false,
          },
          preferences: {
            theme: "light",
            language: "English",
          },
        });
        setLoading(false);
      }, 1200);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setLoading(false);
    }
  };

  const fetchAppInfo = async () => {
    try {
      // Replace with your API call
      // const response = await fetch('/api/app/info');
      // const data = await response.json();

      // Simulated data - replace with actual API response
      setTimeout(() => {
        setAppInfo({
          version: "v1.2.3",
          supportPhone: "+91-1234567890",
          supportEmail: "support@example.com",
          description:
            "This app helps manage tournaments and turf bookings efficiently with a modern, user-friendly interface.",
        });
      }, 800);
    } catch (error) {
      console.error("Error fetching app info:", error);
    }
  };

  const updateSettings = async (newSettings) => {
    setSaving(true);
    try {
      // Replace with your API call
      // const response = await fetch('/api/user/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings)
      // });

      // Simulate API call
      setTimeout(() => {
        setSettings(newSettings);
        setSaving(false);
      }, 500);
    } catch (error) {
      console.error("Error updating settings:", error);
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setSaving(true);
    try {
      // Replace with your actual password update API endpoint
      const response = await fetch("/api/managers/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationChange = (key) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    };
    updateSettings(newSettings);
  };

  const handlePrivacyChange = (key) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key],
      },
    };
    updateSettings(newSettings);
  };

  const handleThemeChange = (theme) => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        theme,
      },
    };
    updateSettings(newSettings);
  };

  const handleLanguageChange = (language) => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        language,
      },
    };
    updateSettings(newSettings);
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    children,
    onClick,
    showArrow = false,
    loading: itemLoading = false,
  }) => (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      } ${itemLoading ? "opacity-50" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            {itemLoading ? (
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            ) : (
              <Icon className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {children}
          {showArrow && <ChevronRight className="h-5 w-5 text-gray-400" />}
          {saving && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
        </div>
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      disabled={disabled || saving}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled || saving ? "opacity-50 cursor-not-allowed" : ""
      } ${checked ? "bg-blue-600" : "bg-gray-200"}`}
      onClick={onChange}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading settings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-500">Manage your account preferences</p>
              {userData.name && (
                <p className="text-sm text-gray-400">
                  Welcome, {userData.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Account Settings
            </h2>

            <SettingItem
              icon={Lock}
              title="Change Password"
              subtitle="Update your password"
              showArrow
              onClick={() => setShowPasswordModal(true)}
            />

            <SettingItem
              icon={Mail}
              title="Email Address"
              subtitle={userData.email || "Loading..."}
              showArrow
              loading={!userData.email}
              onClick={() => {
                /* Handle email change */
              }}
            />

            <SettingItem
              icon={Phone}
              title="Phone Number"
              subtitle={userData.phone || "Loading..."}
              showArrow
              loading={!userData.phone}
              onClick={() => {
                /* Handle phone change */
              }}
            />
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Notifications
            </h2>

            <SettingItem
              icon={Mail}
              title="Email Notifications"
              subtitle="Receive updates via email"
            >
              <Toggle
                checked={settings.notifications.email}
                onChange={() => handleNotificationChange("email")}
              />
            </SettingItem>

            <SettingItem
              icon={Phone}
              title="SMS Notifications"
              subtitle="Receive text messages"
            >
              <Toggle
                checked={settings.notifications.sms}
                onChange={() => handleNotificationChange("sms")}
              />
            </SettingItem>

            <SettingItem
              icon={Bell}
              title="Tournament Updates"
              subtitle="New tournament notifications"
            >
              <Toggle
                checked={settings.notifications.tournaments}
                onChange={() => handleNotificationChange("tournaments")}
              />
            </SettingItem>

            <SettingItem
              icon={Bell}
              title="Booking Alerts"
              subtitle="Turf booking notifications"
            >
              <Toggle
                checked={settings.notifications.bookings}
                onChange={() => handleNotificationChange("bookings")}
              />
            </SettingItem>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Palette className="h-5 w-5 mr-2 text-blue-600" />
              Preferences
            </h2>

            <SettingItem
              icon={Globe}
              title="Language"
              subtitle="Choose your language"
            >
              <select
                value={settings.preferences.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={saving}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </SettingItem>

            <SettingItem
              icon={settings.preferences.theme === "light" ? Sun : Moon}
              title="App Theme"
              subtitle="Choose your preferred theme"
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => handleThemeChange("light")}
                  disabled={saving}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                    settings.preferences.theme === "light"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => handleThemeChange("dark")}
                  disabled={saving}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                    settings.preferences.theme === "dark"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Dark
                </button>
              </div>
            </SettingItem>
          </div>

          {/* Privacy */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Privacy & Security
            </h2>

            <SettingItem
              icon={Eye}
              title="Public Profile"
              subtitle="Show profile to other users"
            >
              <Toggle
                checked={settings.privacy.publicProfile}
                onChange={() => handlePrivacyChange("publicProfile")}
              />
            </SettingItem>

            <SettingItem
              icon={Phone}
              title="Share Contact Info"
              subtitle="Allow teams to see your contact"
            >
              <Toggle
                checked={settings.privacy.shareContact}
                onChange={() => handlePrivacyChange("shareContact")}
              />
            </SettingItem>
          </div>
        </div>

        {/* Support & About */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Support & Help
            </h2>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex gap-[20px]">
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {appInfo.supportPhone ? (
                    <span className="text-sm text-gray-600">
                      {appInfo.supportPhone}
                    </span>
                  ) : (
                    <LoadingSkeleton />
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {appInfo.supportEmail ? (
                    <span className="text-sm text-gray-600">
                      {appInfo.supportEmail}
                    </span>
                  ) : (
                    <LoadingSkeleton />
                  )}
                </div>
              </div>

              <div className="mt-3 border-gray-200">
                <div className="flex gap-[20px]">
                  <a
                    href="#"
                    className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    FAQs
                  </a>
                  <a
                    href="#"
                    className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Terms & Conditions
                  </a>
                  <a
                    href="#"
                    className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              About
            </h2>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">App Version</span>
                  {appInfo.version ? (
                    <span className="text-sm font-medium text-gray-900">
                      {appInfo.version}
                    </span>
                  ) : (
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  )}
                </div>
                {appInfo.description ? (
                  <p className="text-sm text-gray-600">{appInfo.description}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-3 px-4 rounded-lg border border-red-200 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                  Change Password
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="text-xl text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordError("");
                      setPasswordSuccess("");
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Msettings;
