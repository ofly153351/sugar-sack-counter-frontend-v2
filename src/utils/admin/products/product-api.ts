import { api } from "../../api-client";
import { API_CONFIG } from "../../config";
import { Product, ProductFormData, ApiProduct } from "../../types";

export type { Product, ProductFormData, ApiProduct };

const extractErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (typeof error === "object" && error !== null) {
    const e = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };

    if (e.response?.data?.message) {
      return e.response.data.message;
    }

    if (e.message) {
      return e.message;
    }
  }

  return fallbackMessage;
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get("/products");
    const apiProducts = response.data as Array<
      ApiProduct & { name?: string | null }
    >;

    return apiProducts.map((product) => ({
      id: product.id,
      productCode: product.productCode ?? "",
      productName: product.name ?? product.productName ?? "",
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to load products"));
  }
};

export const createProduct = async (
  productData: ProductFormData
): Promise<ApiProduct> => {
  try {
    const payload: { name: string; productCode?: string } = {
      name: productData.productName,
    };

    if (productData.productCode?.trim()) {
      payload.productCode = productData.productCode.trim();
    }

    const response = await api.post("/products", payload);
    return response.data;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to create product"));
  }
};

export const updateProduct = async (
  productId: string | number,
  productData: Partial<ProductFormData>
): Promise<ApiProduct> => {
  try {
    const payload: { name?: string; productCode?: string } = {};

    if (productData.productName !== undefined) {
      payload.name = productData.productName.trim();
    }

    if (productData.productCode !== undefined) {
      const trimmedCode = productData.productCode.trim();
      if (trimmedCode) {
        payload.productCode = trimmedCode;
      }
    }

    const response = await api.patch(`/products/${productId}`, payload);
    return response.data;
  } catch (error: unknown) {
    console.error("Error updating product:", {
      error,
      url: `${API_CONFIG.BASE_URL}/products/${productId}`,
    });
    throw new Error(extractErrorMessage(error, "Failed to update product"));
  }
};

export const deleteProduct = async (
  productId: string | number
): Promise<void> => {
  try {
    await api.delete(`/products/${productId}`);
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to delete product"));
  }
};

export const getProductById = async (
  productId: string | number
): Promise<Product> => {
  try {
    const response = await api.get(`/products/${productId}`);
    const product = response.data as ApiProduct & { name?: string | null };

    return {
      id: product.id,
      productCode: product.productCode ?? "",
      productName: product.name ?? product.productName ?? "",
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to fetch product"));
  }
};
