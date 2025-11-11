"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Locale } from "@/i18n/settings";
import { getDictionary } from "@/i18n/dictionaries";
import {
  useRegisterForm,
  InputField,
  register,
  getRegistrationSuccessUrl,
  RegisterFormData,
} from "@/utils/register";
import { Dictionary } from "@/i18n/dictionaries";

export default function RegisterPage() {
  const params = useParams();
  const localeParam = params.locale as string;
  const locale: Locale =
    localeParam === "en" || localeParam === "th" ? localeParam : "en";
  const router = useRouter();

  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  // Load dictionary on component mount
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(locale);
        setDictionary(dict);
      } catch (error) {
        console.error("Failed to load dictionary:", error);
        // Fallback to English dictionary
        try {
          const fallbackDict = await getDictionary("en");
          setDictionary(fallbackDict);
        } catch (fallbackError) {
          console.error("Failed to load fallback dictionary:", fallbackError);
        }
      }
    };
    loadDictionary();
  }, [locale]);

  // Form management
  const { formState, handleInputChange, handleSubmit } = useRegisterForm();

  // Use dictionary texts or fallback
  const t = dictionary || {
    signIn: "Sign in",
    username: "Username",
    password: "Password",
    required: "*",
    forgotPassword: "Forgot your password?",
    signingIn: "Signing in...",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign up",
    usernameError:
      "Username must be at least 6 characters and contain only English letters or numbers",
    passwordError:
      "Password must be at least 6 characters and contain only English letters or numbers",
    loginFailed: "Login failed. Please try again.",
  };

  // Registration handler
  const handleRegistration = async (formData: RegisterFormData) => {
    try {
      const result = await register(formData);

      if (result.success) {
        const redirectTo = getRegistrationSuccessUrl("/");
        router.push(redirectTo);
      } else {
        // Handle registration failure
        console.error("Registration failed:", result.message);
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-gray-600">Sign up to get started</p>
      </div>

      <form
        onSubmit={(e) => handleSubmit(handleRegistration, e)}
        className="space-y-4"
      >
        <InputField
          label="Username"
          name="username"
          value={formState.formData.username}
          onChange={handleInputChange}
          error={formState.errors.username}
          placeholder="Enter username"
        />

        <InputField
          label="รหัสพนักงาน"
          name="employeecode"
          value={formState.formData.employeecode}
          onChange={handleInputChange}
          error={formState.errors.employeecode}
          placeholder="ระบุรหัสพนักงาน"
        />

        <div>
          <div className="grid grid-cols-2 gap-4 mb-1">
            <label className="text-sm font-medium text-gray-700">
              คำนำหน้า <span className="text-red-500">*</span>
            </label>
            <label className="text-sm font-medium text-gray-700">
              ชื่อ <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              name="title"
              value={formState.formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">เลือก</option>
              <option value="นาย">นาย</option>
              <option value="นางสาว">นางสาว</option>
              <option value="นาง">นาง</option>
            </select>

            <input
              name="firstName"
              type="text"
              value={formState.formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                formState.errors.firstName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="ชื่อ"
            />
          </div>
          {formState.errors.firstName && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.firstName}
            </p>
          )}
        </div>

        <InputField
          label="นามสกุล"
          name="lastName"
          value={formState.formData.lastName}
          onChange={handleInputChange}
          error={formState.errors.lastName}
          placeholder="นามสกุล"
        />

        <InputField
          label="เบอร์โทรศัพท์"
          name="phone"
          value={formState.formData.phone}
          onChange={handleInputChange}
          error={formState.errors.phone}
          placeholder="เบอร์โทรศัพท์"
        />

        <InputField
          label="Email"
          name="email"
          value={formState.formData.email}
          onChange={handleInputChange}
          error={formState.errors.email}
          placeholder="Enter your email"
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          value={formState.formData.password}
          onChange={handleInputChange}
          error={formState.errors.password}
          placeholder="Enter password"
        />

        <InputField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formState.formData.confirmPassword}
          onChange={handleInputChange}
          error={formState.errors.confirmPassword}
          placeholder="Confirm password"
        />

        <button
          type="submit"
          disabled={formState.isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formState.isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
