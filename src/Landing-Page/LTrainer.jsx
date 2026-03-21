import React, { useState, useEffect } from "react";
import {
  Star,
  Calendar,
  MapPin,
  Award,
  ChevronRight,
  X,
  MessageSquare,
  UserCheck,
  Medal,
  Shield,
  LogIn,
  UserPlus,
  User,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sign In Modal Component
const SignInModal = ({ onClose, message }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-transparent p-2 hover:bg-transparent bg-transparent w-auto"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#1B89FF] mx-auto mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Sign in to continue
          </h2>
          <p className="text-gray-600">
            {message ||
              "Create an account or sign in to access exclusive features."}
          </p>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-[#1B89FF] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" />
            Sign in
          </button>

          <div className="text-center mt-4 ">
            <button
              className="text-[#1B89FF] text-sm font-medium hover:underline hover:bg-transparent bg-transparent w-auto"
              onClick={onClose}
            >
              Continue as guest
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Trainer Card Component
const TrainerCard = ({ trainer, onClick }) => {
  // Function to get a color based on experience level
  const getExperienceColor = (years) => {
    if (years >= 10) return "bg-green-100 text-green-800";
    if (years >= 5) return "bg-blue-100 text-blue-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <motion.div
      className="rounded-[24px] overflow-hidden border border-[#DDD] bg-white cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => onClick(trainer)}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-48 bg-gradient-to-r from-[#E6F0F9] to-[#F5F9FD] flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-md overflow-hidden">
          <img
            src={`https://ui-avatars.com/api/?name=${trainer.firstName}+${trainer.lastName}&background=random`}
            alt={`${trainer.firstName} ${trainer.lastName}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-[#333] font-roboto text-[16px] font-semibold leading-normal text-center mb-2">
          {trainer.firstName} {trainer.lastName}
        </h3>

        <p className="text-[#666] text-center mb-4">
          {trainer.sport || "Multi-Sport"} Trainer
        </p>

        <div className="flex justify-center mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getExperienceColor(
              trainer.experience
            )}`}
          >
            {trainer.experience} years experience
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <Star className="w-4 h-4 text-gray-300" />
          </div>
          <span className="text-[#1B89FF] flex items-center text-sm">
            View Profile <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Trainer Detail Modal Component
const TrainerDetailModal = ({ trainer, onClose, onSignInPrompt }) => {
  if (!trainer) return null;

  const [activeTab, setActiveTab] = useState("about");

  // Function to get experience level text
  const getExperienceLevel = (years) => {
    if (years >= 10) return "Expert";
    if (years >= 5) return "Advanced";
    if (years >= 2) return "Intermediate";
    return "Beginner";
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/30 p-2 w-9 hover:bg-white/50 rounded-full shadow-md backdrop-blur-[20px] border-0 z-10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="bg-gradient-to-r from-[#004E93] to-[#1B89FF] p-8 text-white">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-4 border-white">
                <img
                  src={`https://ui-avatars.com/api/?name=${trainer.firstName}+${trainer.lastName}&background=random`}
                  alt={`${trainer.firstName} ${trainer.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {trainer.firstName} {trainer.lastName}
                </h2>
                <p className="text-lg mb-2">
                  {trainer.sport || "Multi-Sport"} Trainer
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5" />
                  <span>
                    {trainer.experience} years experience •{" "}
                    {getExperienceLevel(trainer.experience)}
                  </span>
                </div>
                {trainer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{trainer.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-4 px-6">
              <button
                className={`py-3 px-1 border-b-2 ${
                  activeTab === "about"
                    ? "border-[#1B89FF] text-[#1B89FF] bg-transparent hover:bg-transparent"
                    : "border-transparent text-gray-500 bg-transparent hover:bg-transparent"
                } font-medium text-sm transition-colors`}
                onClick={() => setActiveTab("about")}
              >
                About
              </button>
              <button
                className={`py-3 px-1 border-b-2 ${
                  activeTab === "services"
                    ? "border-[#1B89FF] text-[#1B89FF] bg-transparent hover:bg-transparent"
                    : "border-transparent text-gray-500 bg-transparent hover:bg-transparent"
                } font-medium text-sm transition-colors`}
                onClick={() => setActiveTab("services")}
              >
                Services
              </button>
              <button
                className={`py-3 px-1 border-b-2 ${
                  activeTab === "reviews"
                    ? "border-[#1B89FF] text-[#1B89FF] bg-transparent hover:bg-transparent"
                    : "border-transparent text-gray-500 bg-transparent hover:bg-transparent"
                } font-medium text-sm transition-colors`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "about" && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-[#333]">
                  About
                </h3>
                <p className="text-[#666] mb-6">
                  {trainer.about ||
                    `${trainer.firstName} is a dedicated ${
                      trainer.sport || "sports"
                    } trainer with ${
                      trainer.experience
                    } years of experience. They are passionate about helping clients achieve their fitness and sports goals through personalized training programs.`}
                </p>

                {trainer.certificates && trainer.certificates.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-[#333]">
                      Certifications
                    </h3>
                    <div className="space-y-3">
                      {trainer.certificates.map((cert, index) => (
                        <div
                          key={index}
                          className="bg-[#f5f6f6] p-4 rounded-lg"
                        >
                          <h4 className="font-semibold text-[#333]">
                            {cert.name}
                          </h4>
                          <p className="text-[#666]">
                            Issued by {cert.issuedBy}
                          </p>
                          <p className="text-[#666] text-sm">
                            Issued:{" "}
                            {new Date(cert.issueDate).toLocaleDateString()}
                            {cert.expiryDate &&
                              ` • Expires: ${new Date(
                                cert.expiryDate
                              ).toLocaleDateString()}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "services" && (
              <div className="py-2">
                <h3 className="text-xl font-semibold mb-4 text-[#333]">
                  Training
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#f5f6f6] p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1B89FF] flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#333] mb-1">
                          Private Sessions
                        </h4>
                        <p className="text-[#666] text-sm mb-2">
                          One-on-one personalized training
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            ₹1,500/- per session
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f5f6f6] p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1B89FF] flex-shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#333] mb-1">
                          Group Training
                        </h4>
                        <p className="text-[#666] text-sm mb-2">
                          Small groups (2-5 people)
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            ₹900/- per person
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f5f6f6] p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1B89FF] flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#333] mb-1">
                          Monthly Package
                        </h4>
                        <p className="text-[#666] text-sm mb-2">
                          8 sessions per month
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            ₹10,000/- (save 15%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f5f6f6] p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1B89FF] flex-shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#333] mb-1">
                          Trial Session
                        </h4>
                        <p className="text-[#666] text-sm mb-2">
                          30-minute consultation
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">₹500/-</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
                  <h3 className="font-medium text-[#1B89FF] mb-2">
                    Ready to Start Training?
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Book a session with {trainer.firstName} to begin your
                    fitness journey. All training packages include personalized
                    assessment and goal-setting.
                  </p>
                  <button
                    className="bg-[#1B89FF] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 w-auto"
                    onClick={() =>
                      onSignInPrompt("Sign in to book training sessions.")
                    }
                  >
                    View Available Slots <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="py-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-[#333]">Reviews</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8/5</span>
                    <span className="text-sm text-gray-500 ml-1">
                      (24 reviews)
                    </span>
                  </div>
                </div>

                {/* Sign in to see reviews */}
                <div className="bg-gray-50 rounded-lg p-5 text-center mb-4">
                  <h3 className="font-medium mb-2">Sign in to see reviews</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sign in to view detailed reviews from other clients
                  </p>
                  <button
                    className="bg-[#1B89FF] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto w-auto"
                    onClick={() =>
                      onSignInPrompt("Sign in to view and write reviews.")
                    }
                  >
                    Sign In to View <LogIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Sample review previews */}
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          <span className="text-sm font-medium">S</span>
                        </div>
                        <div>
                          <p className="font-medium">Sanjay K.</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`w-3 h-3 ${
                                  n <= 5
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">2 weeks ago</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      Great trainer who really knows how to motivate. I've been
                      training with them for 3 months and have seen significant
                      improvement in my skills...
                    </p>
                    <button
                      className="text-[#1B89FF] text-sm mt-1 font-medium w-auto bg-transparent hover:bg-transparent hover:text-blue-900"
                      onClick={() =>
                        onSignInPrompt("Sign in to read full reviews.")
                      }
                    >
                      Read more
                    </button>
                  </div>

                  <div className="border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          <span className="text-sm font-medium">P</span>
                        </div>
                        <div>
                          <p className="font-medium">Priya T.</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`w-3 h-3 ${
                                  n <= 4
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">1 month ago</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      Excellent coaching style that balances pushing you to
                      improve while keeping sessions enjoyable. Very
                      knowledgeable about proper technique...
                    </p>
                    <button
                      className="text-[#1B89FF] text-sm mt-1 font-medium w-auto bg-transparent hover:bg-transparent hover:text-blue-900"
                      onClick={() =>
                        onSignInPrompt("Sign in to read full reviews.")
                      }
                    >
                      Read more
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#f5f6f6] p-6 rounded-lg mt-6">
              <h3 className="text-xl font-semibold mb-4 text-[#333]">
                Get in Touch
              </h3>
              <p className="text-[#666] mb-4">
                Interested in training with {trainer.firstName}? Sign in to book
                a session or send a message.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-[#FF6A00] text-white py-3 px-6 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-orange-600"
                  onClick={() =>
                    onSignInPrompt("Sign in to book training sessions.")
                  }
                >
                  <Calendar className="w-5 h-5" />
                  Book a Session
                </button>
                <button
                  className="border border-[#004E93] text-[#004E93] py-3 px-6 rounded-full font-medium flex items-center hover:bg-gray-400 justify-center gap-2 bg-white"
                  onClick={() => onSignInPrompt("Sign in to message trainers.")}
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// All Trainers Modal
const AllTrainersModal = ({
  trainers,
  loading,
  error,
  onClose,
  onSelectTrainer,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-auto my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button positioned in top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 w-auto hover:text-gray-700 bg-transparent hover:bg-transparent border-0 p-2 rounded-full z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="sticky top-0 bg-white p-4 border-b flex items-center z-10 shadow-sm">
          <h2 className="text-xl font-bold text-[#333]">All Trainers</h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No trainers available at the moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainers.map((trainer) => (
                <TrainerCard
                  key={trainer._id}
                  trainer={trainer}
                  onClick={(trainer) => {
                    onSelectTrainer(trainer);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function LTrainer() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // New state for modals
  const [showAllTrainers, setShowAllTrainers] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInMessage, setSignInMessage] = useState("");

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/trainer/trainers`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch trainers");
        }
        const data = await response.json();
        setTrainers(data);
      } catch (err) {
        console.error("Error fetching trainers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const openTrainerDetail = (trainer) => {
    setSelectedTrainer(trainer);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeTrainerDetail = () => {
    setSelectedTrainer(null);
    document.body.style.overflow = "auto"; // Re-enable scrolling
  };

  // Handle sign in prompt
  const handleSignInPrompt = (message) => {
    setSignInMessage(message || "Sign in to access all features.");
    setShowSignInModal(true);
  };

  if (loading && trainers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004E93]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f6] outlets font-roboto">
       <div className="bg-gradient-to-r from-[#004E93] to-[#1B89FF] p-8 text-white rounded-lg mb-8">
          <div className="max-w-3xl mt-[5.25rem]">
            <h1 className="text-3xl font-bold mb-4">
              Expert Sports Trainers at Your Service
            </h1>
            <p className="mb-6">
              Connect with certified sports professionals who can help you
              achieve your fitness goals, improve your technique, and take your
              performance to the next level.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                <span>Certified Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5" />
                <span>Experienced Coaches</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Verified Backgrounds</span>
              </div>
            </div>
            <button
              className="w-auto bg-[#FF6A00] text-white py-3 px-6 rounded-full font-medium hover:bg-orange-600 transition-colors"
              onClick={() =>
                handleSignInPrompt(
                  "Sign in to book training sessions with our certified professionals."
                )
              }
            >
              Sign In to Book a Session
            </button>
          </div>
        </div>
      <div className="max-w-6xl mx-auto px-4 py-8 ">
        {/* Intro Section */}
       

        {/* Trainers Grid View */}
        <div className="bg-white rounded-lg p-6 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#333]">
              Available Trainers
            </h2>
            <div
              className="flex items-center gap-2 text-[#1B89FF] cursor-pointer hover:underline"
              onClick={() => setShowAllTrainers(true)}
            >
              <span className="font-medium">All Trainers</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading trainers: {error}
            </div>
          )}

          {trainers.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No trainers available at the moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainers.slice(0, 3).map((trainer) => (
                <TrainerCard
                  key={trainer._id}
                  trainer={trainer}
                  onClick={openTrainerDetail}
                />
              ))}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-[#333] mb-6">How It Works</h2>
<div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="text-center relative">
              <div className="w-16 h-16 bg-[#004E93] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-[#333] mb-2">
                Choose a Trainer
              </h3>
              <p className="text-[#666]">
                Browse our qualified trainers and find the perfect match for
                your sport and skill level.
              </p>
            </div>
       <div className="hidden md:block absolute top-8 left-1/3">
                <div className="border-t-2 border-dotted border-[#004E93] relative h-[2px]">
                  <svg
                    className="absolute -top-[9px] right-0"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#004E93"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13 5L20 12L13 19" stroke="#004E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 12H20" stroke="#004E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            <div className="text-center relative">
              <div className="w-16 h-16 bg-[#004E93] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-[#333] mb-2">
                Book a Session
              </h3>
              <p className="text-[#666]">
                Select a date and time that works for you and book your training
                session in just a few clicks.
              </p>
            </div>
 <div className="hidden md:block absolute top-8 left-2/3">
                <div className="border-t-2 border-dotted border-[#004E93] relative h-[2px]">
                  <svg
                    className="absolute -top-[9px] right-0"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#004E93"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13 5L20 12L13 19" stroke="#004E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 12H20" stroke="#004E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            <div className="text-center relative">
              <div className="w-16 h-16 bg-[#004E93] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-[#333] mb-2">
                Start Training
              </h3>
              <p className="text-[#666]">
                Meet your trainer and begin your journey to improved performance
                and new skills.
              </p>
            </div>
          </div></div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#333] mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-[#333] mb-2">
                How do I book a training session?
              </h3>
              <p className="text-[#666]">
                To book a session with any of our trainers, you'll need to
                create an account or sign in. Once logged in, you can browse
                trainer profiles and book available time slots directly.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-[#333] mb-2">
                What qualifications do your trainers have?
              </h3>
              <p className="text-[#666]">
                All trainers on our platform have verified certifications in
                their respective sports. Many are former professional athletes
                or have extensive coaching experience.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-[#333] mb-2">
                Can I cancel or reschedule a session?
              </h3>
              <p className="text-[#666]">
                Yes, you can reschedule or cancel a session up to 24 hours
                before the scheduled time without any penalty. Changes made with
                less notice may incur a fee.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#333] mb-2">
                Where do training sessions take place?
              </h3>
              <p className="text-[#666]">
                Training locations vary by trainer. Some trainers work at
                specific facilities, while others can travel to your preferred
                location. Each trainer's profile indicates their available
                training locations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All Trainers Modal */}
      <AnimatePresence>
        {showAllTrainers && (
          <AllTrainersModal
            trainers={trainers}
            loading={loading}
            error={error}
            onClose={() => setShowAllTrainers(false)}
            onSelectTrainer={openTrainerDetail}
          />
        )}
      </AnimatePresence>

      {/* Trainer Detail Modal */}
      <AnimatePresence>
        {selectedTrainer && (
          <TrainerDetailModal
            trainer={selectedTrainer}
            onClose={closeTrainerDetail}
            onSignInPrompt={handleSignInPrompt}
          />
        )}
      </AnimatePresence>

      {/* Sign In Modal */}
      <AnimatePresence>
        {showSignInModal && (
          <SignInModal
            onClose={() => setShowSignInModal(false)}
            message={signInMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Define the missing Users component
const Users = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default LTrainer;
