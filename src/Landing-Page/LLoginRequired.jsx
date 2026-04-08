import { useNavigate } from "react-router-dom";
import { LogIn, ShieldAlert } from "lucide-react";

const LoginRequired = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F7FA] px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Login Required</h2>
        <p className="text-sm text-gray-500 mt-2">
          You need to sign in to access this page.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequired;
