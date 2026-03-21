import { useNavigate } from "react-router-dom";

const LoginRequired = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 text-center">
        Login Required
      </h2>
      <p className="text-gray-600 mt-2 text-center">
        You need to log in or register to access this page.
      </p>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-blue-500 text-white rounded-md cursor-pointer"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-6 py-2 bg-green-500 text-white rounded-md cursor-pointer"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LoginRequired;
