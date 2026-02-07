"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Locale } from "@/i18n/settings";
import { getDictionary } from "@/i18n/dictionaries";
import Swal from "sweetalert2";
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
    signUp: "Sign up",
    nav: {
      employeeCode: "Employee Code",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      username: "Username",
      title: "Title",
      employeeCodePlaceholder: "Enter employee code",
      firstNamePlaceholder: "Enter first name",
      lastNamePlaceholder: "Enter last name",
      emailPlaceholder: "Enter email",
      phonePlaceholder: "Enter phone number",
    },
    register: {
      title: "Create Account",
      subtitle: "Sign up to get started",
      createAccount: "Create Account",
      creatingAccount: "Creating account...",
      confirmPassword: "Confirm Password",
      alreadyHaveAccount: "Already have an account?",
    },
  };

  // Registration handler
  const handleRegistration = async (formData: RegisterFormData) => {
    try {
      const result = await register(formData);

      if (result.success) {
        await Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: t.register.successToast,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        router.push(`/${locale}/login`);
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
        <h1 className="text-2xl font-bold text-gray-900">
          {t.register.title}
        </h1>
        <p className="mt-2 text-gray-600">{t.register.subtitle}</p>
      </div>

      <form
        onSubmit={(e) => handleSubmit(handleRegistration, e)}
        className="space-y-4"
      >
        <InputField
          label={t.username}
          name="username"
          value={formState.formData.username}
          onChange={handleInputChange}
          error={formState.errors.username}
          placeholder={t.username}
        />

        <InputField
          label={t.nav.employeeCode}
          name="employeecode"
          value={formState.formData.employeecode}
          onChange={handleInputChange}
          error={formState.errors.employeecode}
          placeholder={t.nav.employeeCodePlaceholder}
        />

        <div>
          <div className="grid grid-cols-2 gap-4 mb-1">
            <label className="text-sm font-medium text-gray-700">
              {t.nav.title} <span className="text-red-500">*</span>
            </label>
            <label className="text-sm font-medium text-gray-700">
              {t.nav.firstName} <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              name="title"
              value={formState.formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {locale === "th" ? "เลือก" : "Select"}
              </option>
              <option value="นาย">{locale === "th" ? "นาย" : "Mr."}</option>
              <option value="นางสาว">
                {locale === "th" ? "นางสาว" : "Ms."}
              </option>
              <option value="นาง">{locale === "th" ? "นาง" : "Mrs."}</option>
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
              placeholder={t.nav.firstNamePlaceholder}
            />
          </div>
          {formState.errors.firstName && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.firstName}
            </p>
          )}
        </div>

        <InputField
          label={t.nav.lastName}
          name="lastName"
          value={formState.formData.lastName}
          onChange={handleInputChange}
          error={formState.errors.lastName}
          placeholder={t.nav.lastNamePlaceholder}
        />

        <InputField
          label={t.nav.phone}
          name="phone"
          value={formState.formData.phone}
          onChange={handleInputChange}
          error={formState.errors.phone}
          placeholder={t.nav.phonePlaceholder}
        />

        <InputField
          label={t.nav.email}
          name="email"
          value={formState.formData.email}
          onChange={handleInputChange}
          error={formState.errors.email}
          placeholder={t.nav.emailPlaceholder}
        />

        <InputField
          label={t.password}
          name="password"
          type="password"
          value={formState.formData.password}
          onChange={handleInputChange}
          error={formState.errors.password}
          placeholder={t.password}
        />

        <InputField
          label={t.register.confirmPassword}
          name="confirmPassword"
          type="password"
          value={formState.formData.confirmPassword}
          onChange={handleInputChange}
          error={formState.errors.confirmPassword}
          placeholder={t.register.confirmPassword}
        />

        <button
          type="submit"
          disabled={formState.isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formState.isLoading
            ? t.register.creatingAccount
            : t.register.createAccount}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          {t.register.alreadyHaveAccount}{" "}
          <Link
            href={`/${locale}/login`}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
