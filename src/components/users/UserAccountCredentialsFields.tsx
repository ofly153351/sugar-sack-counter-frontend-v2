"use client";

interface UserAccountCredentialsFieldsProps {
  username: string;
  password: string;
  confirmPassword: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  usernameLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  usernamePlaceholder?: string;
  passwordPlaceholder?: string;
  confirmPasswordPlaceholder?: string;
  usernameRequired?: boolean;
  passwordRequired?: boolean;
  confirmPasswordRequired?: boolean;
  showConfirmPassword?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  layoutClassName?: string;
  idPrefix?: string;
}

export function UserAccountCredentialsFields({
  username,
  password,
  confirmPassword,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  usernameLabel,
  passwordLabel,
  confirmPasswordLabel,
  usernamePlaceholder,
  passwordPlaceholder,
  confirmPasswordPlaceholder,
  usernameRequired = false,
  passwordRequired = false,
  confirmPasswordRequired = false,
  showConfirmPassword = true,
  inputClassName = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200",
  labelClassName = "mb-1 block text-sm font-medium text-slate-700",
  layoutClassName = "grid grid-cols-1 gap-3 sm:grid-cols-2",
  idPrefix = "user-account",
}: UserAccountCredentialsFieldsProps) {
  const usernameId = `${idPrefix}-username`;
  const passwordId = `${idPrefix}-password`;
  const confirmPasswordId = `${idPrefix}-confirm-password`;

  return (
    <div className={layoutClassName}>
      <div>
        <label htmlFor={usernameId} className={labelClassName}>
          {usernameLabel} {usernameRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          id={usernameId}
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder={usernamePlaceholder ?? usernameLabel}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor={passwordId} className={labelClassName}>
          {passwordLabel} {passwordRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          id={passwordId}
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder={passwordPlaceholder ?? passwordLabel}
          className={inputClassName}
        />
      </div>

      {showConfirmPassword && (
        <div>
          <label htmlFor={confirmPasswordId} className={labelClassName}>
            {confirmPasswordLabel}{" "}
            {confirmPasswordRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            id={confirmPasswordId}
            type="password"
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            placeholder={confirmPasswordPlaceholder ?? confirmPasswordLabel}
            className={inputClassName}
          />
        </div>
      )}
    </div>
  );
}
