import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CarouselImg from '../assets/carouselFirst.png';

const slides = [
  {
    id: 1,
    image: CarouselImg,
    title: "Smash Your Limits: Join the Ultimate Table Tennis Challenge!",
    description:
      "Unleash your skills, compete with players worldwide, and rise to the top of the leader board!",
    buttonText: "Book Now",
  },
  { id: 2, image: CarouselImg},
  { id: 3, image: CarouselImg },
  { id: 4, image: CarouselImg },
];

export default function Carousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="relative w-full h-[600px] overflow-hidden">
        {/* Slides Container */}
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full flex-shrink-0 h-full flex items-center justify-center relative"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {index === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="absolute top-1/3 left-[170px] p-6 rounded-lg w-[588px]"
                >
                  <h2 className="text-4xl text-black font-extrabold">
                    {slide.title}
                  </h2>
                  <p className="mt-[20px] w-[384px] text-black text-lg">
                    {slide.description}
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-[20px] flex h-12 px-4 py-2 pl-6 justify-center items-center gap-2 rounded-[25px] bg-[#FF6A00] text-white hover:bg-orange-600 transition"
                  >
                    {slide.buttonText}
                    <ArrowRight />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-[10px]">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-[10px] p-0 h-2 ml-[10px] rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-blue-500 w-[28px]" : "bg-gray-400"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </>
  );
}
