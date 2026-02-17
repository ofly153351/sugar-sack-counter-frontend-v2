"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  type Product,
  type ProductFormData,
} from "@/utils/admin/products/product-api";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: { search?: string } = {}) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string | number) => [...productKeys.details(), id] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: fetchProducts,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string | number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<ProductFormData> }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useConfirmDeleteProduct() {
  const deleteMutation = useDeleteProduct();
  const t = useTranslations("products");

  const confirmDelete = (product: Product) => {
    Swal.fire({
      title: t("delete.confirm"),
      text: `${product.productCode} - ${product.productName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("delete.confirmButton"),
      cancelButtonText: t("buttons.cancel"),
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed && product.id) {
        deleteMutation.mutate(product.id, {
          onSuccess: () => {
            Swal.fire({
              title: t("delete.success"),
              icon: "success",
              confirmButtonText: t("buttons.ok"),
            });
          },
          onError: (error: Error) => {
            Swal.fire({
              title: t("delete.error"),
              text: error.message || t("delete.error"),
              icon: "error",
              confirmButtonText: t("buttons.ok"),
            });
          },
        });
      }
    });
  };

  return {
    confirmDelete,
    isLoading: deleteMutation.isPending,
  };
}

export function useProductsManager() {
  const productsQuery = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { confirmDelete } = useConfirmDeleteProduct();

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    refetch: productsQuery.refetch,

    createProduct: createMutation.mutate,
    createProductAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateProduct: updateMutation.mutate,
    updateProductAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteProduct: confirmDelete,

    isProcessing:
      createMutation.isPending || updateMutation.isPending || productsQuery.isLoading,
  };
}
