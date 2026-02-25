"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import {
  ProductsHeader,
  ProductsTable,
  ProductModal,
} from "@/components/products";
import { useProductsManager } from "@/hooks/useProducts";
import type {
  Product,
  ProductFormData,
} from "@/utils/admin/products/product-api";

export default function ProductsPage() {
  const t = useTranslations("products");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const productsManager = useProductsManager();

  const filteredProducts = productsManager.products
    .filter((product) => {
      const keyword = search.toLowerCase();
      const productCode = (product.productCode ?? "").toLowerCase();
      const productName = (product.productName ?? "").toLowerCase();
      return (
        productCode.includes(keyword) ||
        productName.includes(keyword)
      );
    })
    .sort((a, b) => {
      const compared = (a.productCode ?? "").localeCompare(
        b.productCode ?? "",
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );
      return sortOrder === "asc" ? compared : -compared;
    })
    .map((product, index) => ({
      no: index + 1,
      id: product.id,
      productCode: product.productCode ?? "-",
      productName: product.productName ?? "-",
    }));

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    productsManager.deleteProduct(product);
  };

  const handleSave = async (product: Product) => {
    try {
      const productData: ProductFormData = {
        productCode: product.productCode,
        productName: product.productName,
      };

      if (editProduct && editProduct.id) {
        await productsManager.updateProductAsync({
          id: editProduct.id,
          data: productData,
        });

        Swal.fire({
          title: t("save.updateSuccess"),
          icon: "success",
          confirmButtonText: t("buttons.ok"),
        });
      } else {
        await productsManager.createProductAsync(productData);

        Swal.fire({
          title: t("save.createSuccess"),
          icon: "success",
          confirmButtonText: t("buttons.ok"),
        });
      }

      setModalOpen(false);
      setEditProduct(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("save.error");
      Swal.fire({
        title: t("save.error"),
        text: message,
        icon: "error",
        confirmButtonText: t("buttons.ok"),
      });
    }
  };

  const handleAddProduct = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditProduct(null);
  };

  if (productsManager.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (productsManager.isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">{t("errors.loadError")}</p>
          <p>{productsManager.error?.message || "Unknown error occurred"}</p>
          <button
            onClick={() => productsManager.refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t("buttons.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <ProductsHeader onAddProduct={handleAddProduct} />

      <ProductsTable
        products={filteredProducts}
        search={search}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onSortOrderChange={setSortOrder}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initialData={editProduct}
        onSave={handleSave}
      />
    </div>
  );
}
