"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "@/components/logo/logo";
import { useParams } from "next/navigation";
import { Locale } from "@/i18n/settings";
import { getDictionary } from "@/i18n/dictionaries";
import {
  useLoginForm,
  usePasswordVisibility,
  login,
  storeAuthToken,
  getRedirectUrl,
  validateLoginCredentials,
  Dictionary,
  LoginCredentials,
} from "@/utils/login";

export default function LoginPage() {
  const params = useParams();
  const localeParam = params.locale as string;
  const locale: Locale =
    localeParam === "en" || localeParam === "th" ? localeParam : "en";
  const router = useRouter();

  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [submitError, setSubmitError] = useState("");

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
  const { formState, handleInputChange, setLoading, handleSubmit } =
    useLoginForm();

  // Password visibility
  const {
    isVisible: showPassword,
    toggleVisibility,
    getInputType,
    getVisibilityIcon,
  } = usePasswordVisibility();

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

  // Login handler
  const handleLogin = async (credentials: LoginCredentials) => {
    setSubmitError("");

    // Validate credentials
    const validation = validateLoginCredentials(credentials);
    if (!validation.isValid) {
      setSubmitError(validation.errors[0] || t.loginFailed);
      return;
    }

    try {
      const result = await login(credentials);

      if (result.success) {
        // Backend sets access_token as HttpOnly cookie automatically
        // No need to store token manually in frontend
        const redirectTo = getRedirectUrl("/admin/dashboard");
        router.push(redirectTo);
      } else {
        setSubmitError(result.message || t.loginFailed);
      }
    } catch (err) {
      setSubmitError(t.loginFailed);
    }
  };

  return (
    <div className="w-62">
      <div className="flex justify-center mb-4">
        <Logo />
      </div>

      <h1 className="text-2xl font-bold mb-2 text-center">{t.signIn}</h1>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 w-62">
          {submitError}
        </div>
      )}

      <form
        onSubmit={(e) => handleSubmit(handleLogin, e)}
        className="space-y-4 text-left mt-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.username} <span className="text-red-500">{t.required}</span>
          </label>
          <input
            type="text"
            name="username"
            value={formState.fields.username?.value || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder={t.username}
          />
          {formState.errors.username && (
            <p className="text-red-500 text-xs mt-1">
              {formState.errors.username}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.password} <span className="text-red-500">{t.required}</span>
          </label>

          <div className="relative">
            <input
              type={getInputType()}
              name="password"
              value={formState.fields.password?.value || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder={t.password}
            />
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 text-sm"
            >
              {getVisibilityIcon()}
            </button>
          </div>
          {formState.errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {formState.errors.password}
            </p>
          )}
        </div>

        <Link
          href="#"
          className="text-sm text-blue-600 hover:underline block text-right"
        >
          {t.forgotPassword}
        </Link>

        <button
          type="submit"
          disabled={formState.isLoading || !formState.isValid}
          className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formState.isLoading ? t.signingIn : t.signIn}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4 text-center">
        {t.dontHaveAccount}{" "}
        <Link
          href="/register"
          className="text-blue-600 font-medium hover:underline"
        >
          {t.signUp}
        </Link>
      </p>
    </div>
  );
}
