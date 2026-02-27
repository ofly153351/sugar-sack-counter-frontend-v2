"use client";

import Table from "@/components/table/table";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { useTranslations } from "next-intl";

interface Product {
  no: number;
  id?: string | number;
  productCode: string;
  productName: string;
}

interface ProductsTableProps {
  products: Product[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isLoading?: boolean;
}

export function ProductsTable({
  products,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  isLoading = false,
}: ProductsTableProps) {
  const t = useTranslations("products");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !search) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-lg">{t("noProducts")}</p>
        <p className="text-gray-400 mt-2">{t("noProductsInSystem")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminSearchInput
        value={search}
        onValueChange={onSearchChange}
        placeholder={t("search")}
      />

      {products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-lg">{t("noProducts")}</p>
          {search && (
            <p className="text-gray-400 mt-2">
              {t("tryDifferentSearch")}{" "}
              <button
                onClick={() => onSearchChange("")}
                className="text-blue-600 hover:underline"
              >
                {t("clearSearch")}
              </button>
            </p>
          )}
        </div>
      ) : (
        <Table type="products" data={products} onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  );
}
