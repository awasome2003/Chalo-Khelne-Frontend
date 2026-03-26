import { useState } from "react";
import { SocialFeed } from "../features/social";

// Public Social — read-only, gates all actions behind login prompt
export default function LSocialV2() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <SocialFeed
        canCreate={false}
        readOnly={true}
        onGatedAction={() => setShowLogin(true)}
      />

      {/* Login Gate Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Sign in to interact</h3>
            <p className="text-sm text-gray-500 mb-6">Create an account or log in to like, save, and share posts.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLogin(false)}
                className="px-5 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition w-auto"
              >
                Maybe later
              </button>
              <a
                href="/login"
                className="px-5 py-2 bg-[#004E93] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
