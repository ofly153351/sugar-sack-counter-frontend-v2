"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface SugarType {
  id?: string | number;
  name: string;
  description?: string;
}

interface SugarTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SugarType | null;
  onSave: (sugarType: SugarType) => void;
}

export function SugarTypeModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: SugarTypeModalProps) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Initialize form with initialData
  useEffect(() => {
    // Use setTimeout to avoid synchronous state update in effect
    const timer = setTimeout(() => {
      if (initialData) {
        setName(initialData.name || "");
        setDescription(initialData.description || "");
      } else {
        setName("");
        setDescription("");
      }
      setErrors({});
    }, 0);

    return () => clearTimeout(timer);
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = t("sugarTypeManagement.requiredFields", {
        defaultValue: "กรุณากรอกข้อมูลให้ครบ",
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const sugarTypeData: SugarType = {
      ...initialData,
      name: name.trim(),
      description: description.trim() || undefined,
    };

    // Call onSave callback - the parent component will handle the API call and SweetAlert
    onSave(sugarTypeData);
    onClose();
  };

  const handleClose = () => {
    // Check if there are unsaved changes
    const hasChanges =
      name.trim() !== (initialData?.name || "") ||
      description.trim() !== (initialData?.description || "");

    if (hasChanges) {
      const confirmClose = window.confirm(
        t("sugarTypeManagement.unsavedChangesMessage", {
          defaultValue:
            "คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการปิดหน้าต่างนี้ใช่หรือไม่?",
        })
      );
      if (confirmClose) {
        setName("");
        setDescription("");
        setErrors({});
        onClose();
      }
    } else {
      setName("");
      setDescription("");
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData
              ? t("sugarTypeManagement.editSugarType", {
                  defaultValue: "แก้ไขชนิดน้ำตาล",
                })
              : t("sugarTypeManagement.addSugarType", {
                  defaultValue: "เพิ่มชนิดน้ำตาล",
                })}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("sugarTypeManagement.sugarTypeName", {
                  defaultValue: "ชื่อชนิดน้ำตาล",
                })}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-400"
                }`}
                placeholder={t("sugarTypeManagement.sugarTypeName", {
                  defaultValue: "ชื่อชนิดน้ำตาล",
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("sugarTypeManagement.sugarTypeDescription", {
                  defaultValue: "คำอธิบาย",
                })}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                placeholder={t("sugarTypeManagement.sugarTypeDescription", {
                  defaultValue: "คำอธิบาย",
                })}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t("sugarTypeManagement.cancel", { defaultValue: "ยกเลิก" })}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              {t("sugarTypeManagement.save", { defaultValue: "บันทึก" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
