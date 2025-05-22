// import { useState } from "react";
// import { Eye, EyeOff } from "lucide-react";

// const Login = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleLogin = () => {
//     // Handle login logic here
//     console.log("Login attempt:", { email, password });
//   };

//   return (
//     <div
//       className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4"
//       style={{ backgroundColor: "#F0F0F0" }}
//     >
//       {/* Grove Heading Above Form */}
//       <h1 className="text-4xl font-bold pb-12" style={{ color: "#2D4427" }}>
//         Grove
//       </h1>

//       <div className="bg-white rounded-lg shadow-lg p-8 w-full md:w-[420px] md:h-[472px] max-w-sm">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h2 className="text-2xl font-semibold text-gray-800">Admin Login</h2>
//         </div>

//         {/* Login Form */}
//         <div className="space-y-6">
//           {/* Email Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="your@email.com"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
//             />
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
//               />
//               <button
//                 type="button"
//                 onClick={togglePasswordVisibility}
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4" />
//                 ) : (
//                   <Eye className="h-4 w-4" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Login Button */}
//           <button
//             onClick={handleLogin}
//             className="w-full text-black font-medium py-2 px-4 rounded-md transition duration-200 hover:opacity-90 cursor-pointer"
//             style={{ backgroundColor: "#E9D3A5" }}
//           >
//             Login
//           </button>

//           {/* Forgot Password Link */}
//           <div className="text-center">
//             <button
//               type="button"
//               className="text-sm text-gray-600 hover:text-gray-800 underline bg-transparent border-none cursor-pointer"
//             >
//               Forgot Password?
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="py-9 text-center w-full">
//         <p className="text-xs text-gray-500">
//           © 2025 Grove. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    // Handle login logic here
    console.log("Login attempt:", { email, password });
  };

  return (
    <div
      className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "#F0F0F0" }}
    >
      {/* Grove Heading Above Form */}
      <h1 className="text-4xl font-bold mb-8" style={{ color: "#2D4427" }}>
        Grove
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Login</h2>
        </div>

        {/* Login Form */}
        <div className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              onClick={handleLogin}
              className="w-full text-black font-medium py-3 px-4 rounded-md transition duration-200 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: "#E9D3A5" }}
            >
              Login
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-gray-800 underline bg-transparent border-none cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center w-full">
        <p className="text-xs text-gray-500">
          © 2025 Grove. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;