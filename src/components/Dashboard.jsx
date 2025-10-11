export default function Dashboard({ user, onLogout }) {
  const handleSignOut = async () => {
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition duration-150"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to Your Dashboard!
                </h2>
                <p className="text-gray-600">
                  You're successfully logged in
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Your Email
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.email}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  User ID
                </h3>
                <p className="text-sm font-mono text-gray-700 break-all">
                  {user?.id}
                </p>
              </div>

              <div className="mt-8 text-sm text-gray-500">
                <p>Your authentication is working perfectly! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
