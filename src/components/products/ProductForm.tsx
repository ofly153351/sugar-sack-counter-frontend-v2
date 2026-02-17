"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

export interface Product {
  no?: number;
  id?: string | number;
  productCode: string;
  productName: string;
}

interface ProductFormProps {
  initialData?: Product | null;
  onCancel: () => void;
  onSave: (product: Product) => void;
}

export function ProductForm({ initialData, onCancel, onSave }: ProductFormProps) {
  const t = useTranslations("products");
  const [productCode, setProductCode] = useState(initialData?.productCode || "");
  const [productName, setProductName] = useState(initialData?.productName || "");

  const handleSubmit = () => {
    if (!productCode.trim() || !productName.trim()) {
      Swal.fire(t("form.requiredFields"), "", "warning");
      return;
    }

    onSave({
      no: initialData?.no || 0,
      id: initialData?.id,
      productCode: productCode.trim(),
      productName: productName.trim(),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">
          {t("form.productCode")} <span className="text-red-500">*</span>
        </label>
        <input
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder={t("form.productCode")}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">
          {t("form.productName")} <span className="text-red-500">*</span>
        </label>
        <input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder={t("form.productName")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t("form.cancel")}
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("form.save")}
        </button>
      </div>
    </div>
  );
}
