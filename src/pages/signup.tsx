import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { auth, googleProvider } from "../util/firebase"; // Adjust the path to your Firebase config
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { signUpUser } from "../util/firebaseServices"; // Adjust the path to your Firebase services
import { useNavigate } from "react-router-dom"; // For navigation

// Define the form input types
type Inputs = {
  name?: string;
  email: string;
  password: string;
};

// Function to generate validation schema based on login mode
const getValidationSchema = (isLogin: boolean) =>
  Yup.object().shape({
    name: isLogin
      ? Yup.string().notRequired()
      : Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

export default function SignUpPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [error, setError] = useState(""); // Error message
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // For navigation

  // Formik setup
  const formik = useFormik<Inputs>({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: getValidationSchema(isLogin), // Dynamically apply validation
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setError("");
      setLoading(true);
      try {
        if (isLogin) {
          // Login with email and password
          const userResponse: UserCredential = await signInWithEmailAndPassword(
            auth,
            values.email,
            values.password
          );
          if (userResponse.user.email) {
            await signUpUser({
              email: userResponse.user.email,
              name: values.name ?? "",
            });
          }
        } else {
          // Sign up with email and password
          const userResponse: UserCredential =
            await createUserWithEmailAndPassword(
              auth,
              values.email,
              values.password
            );
          if (userResponse.user.email) {
            await signUpUser({
              email: userResponse.user.email,
              name: values.name ?? "",
            });
          }
        }

        // Redirect to home page
        navigate("/");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message); // Handle Firebase errors
        } else {
          setError("An unknown error occurred."); // Handle unknown errors
        }
      } finally {
        setLoading(false); // Reset loading state
      }
    },
  });

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    try {
      const userResponse: UserCredential = await signInWithPopup(
        auth,
        googleProvider
      );
      const { email, displayName } = userResponse.user;
      if (email && displayName) {
        await signUpUser({ email: email, name: displayName });
      }

      // Redirect to home page
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Handle Firebase errors
      } else {
        setError("An unknown error occurred."); // Handle unknown errors
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isLogin ? "Login" : "Sign Up"}
        </h1>

        {/* Email/Password Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 font-bold mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
              />
              {formik.touched.name && formik.errors.name ? (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.name}
                </p>
              ) : null}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </p>
            ) : null}
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle between Login and Sign Up */}
        <p className="text-center text-gray-600 mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

        {/* Social Login Buttons */}
        <div className="mt-6 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Sign in with Google
          </button>
        </div>

        {/* Link to Home */}
        <p className="text-center text-gray-600 mt-4">
          <a href="/" className="text-blue-500 hover:underline">
            Go back to Home
          </a>
        </p>
      </div>
    </div>
  );
}
