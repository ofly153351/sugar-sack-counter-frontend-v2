// src/utils/admin/vehicles/vehicle-api.ts

import { api } from "../../api-client";
import { API_CONFIG } from "../../config";
import {
  VehicleType,
  VehicleTypeFormData,
  Vehicle,
  VehicleFormData,
  ApiVehicle,
} from "../../types";

// ========== Vehicle Types ==========
// Types are now imported from src/utils/types.ts

// ========== Vehicle Interfaces ==========
// Types are now imported from src/utils/types.ts

// ApiVehicle interface is now imported from src/utils/types.ts

// ========== Vehicle Type API Functions ==========

/**
 * Fetch all vehicle types from API
 */
export const fetchVehicleTypes = async (): Promise<VehicleType[]> => {
  try {
    console.log("📡 Fetching vehicle types from API...");
    const response = await api.get("/vehicle-types");
    console.log("✅ Vehicle types API response received");
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching vehicle types:", error);
    throw new Error(error.message || "Failed to load vehicle types");
  }
};

/**
 * Create a new vehicle type
 */
export const createVehicleType = async (
  vehicleTypeData: VehicleTypeFormData
): Promise<VehicleType> => {
  try {
    console.log("➕ Creating new vehicle type:", vehicleTypeData);
    const response = await api.post("/vehicle-types", vehicleTypeData);
    console.log("✅ Vehicle type created successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error creating vehicle type:", error);

    let errorMessage = "Failed to create vehicle type";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get vehicle type by name
 */
export const getVehicleTypeByName = async (
  name: string
): Promise<VehicleType> => {
  try {
    console.log(`🔍 Fetching vehicle type by name: ${name}`);
    const response = await api.get(
      `/vehicle-types/name/${encodeURIComponent(name)}`
    );
    console.log("✅ Vehicle type fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching vehicle type by name:", error);
    throw new Error(error.message || "Failed to fetch vehicle type");
  }
};

// ========== Vehicle API Functions ==========

/**
 * Fetch all vehicles from API
 */
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  try {
    console.log("📡 Fetching vehicles from API...");
    const response = await api.get("/vehicles");
    console.log("✅ Vehicles API response received");

    const apiVehicles = response.data as ApiVehicle[];

    return apiVehicles.map((vehicle) => ({
      id: vehicle.id,
      vehicleCode: vehicle.vehicleCode,
      licensePlate: vehicle.licensePlate,
      vehicleTypeId: vehicle.vehicleTypeId,
      vehicleType: vehicle.vehicleType,
      driverName: vehicle.driverName,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }));
  } catch (error: any) {
    console.error("❌ Error fetching vehicles:", error);
    throw new Error(error.message || "Failed to load vehicles");
  }
};

/**
 * Fetch active vehicles only
 */
export const fetchActiveVehicles = async (): Promise<Vehicle[]> => {
  try {
    console.log("📡 Fetching active vehicles from API...");
    const response = await api.get("/vehicles/active");
    console.log("✅ Active vehicles API response received");

    const apiVehicles = response.data as ApiVehicle[];

    return apiVehicles.map((vehicle) => ({
      id: vehicle.id,
      vehicleCode: vehicle.vehicleCode,
      licensePlate: vehicle.licensePlate,
      vehicleTypeId: vehicle.vehicleTypeId,
      vehicleType: vehicle.vehicleType,
      driverName: vehicle.driverName,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }));
  } catch (error: any) {
    console.error("❌ Error fetching active vehicles:", error);
    throw new Error(error.message || "Failed to load active vehicles");
  }
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (
  vehicleData: VehicleFormData
): Promise<ApiVehicle> => {
  try {
    console.log("➕ Creating new vehicle:", vehicleData);
    const response = await api.post("/vehicles", vehicleData);
    console.log("✅ Vehicle created successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error creating vehicle:", error);

    let errorMessage = "Failed to create vehicle";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Update an existing vehicle
 */
export const updateVehicle = async (
  vehicleId: string | number,
  vehicleData: Partial<VehicleFormData>
): Promise<ApiVehicle> => {
  try {
    // Filter out empty string fields before sending
    const filteredData: Partial<VehicleFormData> = {};

    for (const [key, value] of Object.entries(vehicleData)) {
      // Only include non-empty values
      if (value !== undefined && value !== null && value !== "") {
        filteredData[key as keyof VehicleFormData] = value;
      }
    }

    console.log(`✏️ Updating vehicle with ID: ${vehicleId}`);
    console.log(`🔍 Original data:`, vehicleData);
    console.log(`🔍 Filtered data (to send):`, filteredData);
    console.log(
      `🔍 Full API URL: ${API_CONFIG.BASE_URL}/vehicles/${vehicleId}`
    );
    console.log(`🔍 Request method: PATCH`);

    const response = await api.patch(`/vehicles/${vehicleId}`, filteredData);

    console.log("✅ Vehicle updated successfully");
    console.log(`🔍 Response status: ${response.status}`);
    console.log(`🔍 Response data:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error updating vehicle:", error);
    console.error(`🔍 Error details:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });

    let errorMessage = "Failed to update vehicle";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (
  vehicleId: string | number
): Promise<void> => {
  try {
    console.log(`🗑️ Deleting vehicle with ID: ${vehicleId}`);
    console.log(
      `🔍 Full API URL: ${API_CONFIG.BASE_URL}/vehicles/${vehicleId}`
    );
    console.log(`🔍 Request method: DELETE`);

    const response = await api.delete(`/vehicles/${vehicleId}`);
    console.log("✅ Vehicle deleted successfully");
    console.log(`🔍 Response status: ${response.status}`);
    console.log(`🔍 Response data:`, response.data);
  } catch (error: any) {
    console.error("❌ Error deleting vehicle:", error);
    console.error(`🔍 Error details:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });

    let errorMessage = "Failed to delete vehicle";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get vehicle by ID
 */
export const getVehicleById = async (
  vehicleId: string | number
): Promise<Vehicle> => {
  try {
    console.log(`🔍 Fetching vehicle with ID: ${vehicleId}`);
    const response = await api.get(`/vehicles/${vehicleId}`);
    console.log("✅ Vehicle fetched successfully:", response.data);

    const vehicle = response.data as ApiVehicle;

    return {
      id: vehicle.id,
      vehicleCode: vehicle.vehicleCode,
      licensePlate: vehicle.licensePlate,
      vehicleTypeId: vehicle.vehicleTypeId,
      vehicleType: vehicle.vehicleType,
      driverName: vehicle.driverName,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  } catch (error: any) {
    console.error("❌ Error fetching vehicle:", error);

    let errorMessage = "Failed to fetch vehicle";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get vehicle by vehicle code
 */
export const getVehicleByCode = async (
  vehicleCode: string
): Promise<Vehicle> => {
  try {
    console.log(`🔍 Fetching vehicle by code: ${vehicleCode}`);
    const response = await api.get(
      `/vehicles/code/${encodeURIComponent(vehicleCode)}`
    );
    console.log("✅ Vehicle fetched successfully:", response.data);

    const vehicle = response.data as ApiVehicle;

    return {
      id: vehicle.id,
      vehicleCode: vehicle.vehicleCode,
      licensePlate: vehicle.licensePlate,
      vehicleTypeId: vehicle.vehicleTypeId,
      vehicleType: vehicle.vehicleType,
      driverName: vehicle.driverName,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  } catch (error: any) {
    console.error("❌ Error fetching vehicle by code:", error);

    let errorMessage = "Failed to fetch vehicle by code";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get vehicle by license plate
 */
export const getVehicleByLicensePlate = async (
  licensePlate: string
): Promise<Vehicle> => {
  try {
    console.log(`🔍 Fetching vehicle by license plate: ${licensePlate}`);
    const response = await api.get(
      `/vehicles/license/${encodeURIComponent(licensePlate)}`
    );
    console.log("✅ Vehicle fetched successfully:", response.data);

    const vehicle = response.data as ApiVehicle;

    return {
      id: vehicle.id,
      vehicleCode: vehicle.vehicleCode,
      licensePlate: vehicle.licensePlate,
      vehicleTypeId: vehicle.vehicleTypeId,
      vehicleType: vehicle.vehicleType,
      driverName: vehicle.driverName,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  } catch (error: any) {
    console.error("❌ Error fetching vehicle by license plate:", error);

    let errorMessage = "Failed to fetch vehicle by license plate";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Convert Vehicle to VehicleFormData for API submission
 */
export const convertToVehicleFormData = (vehicle: Vehicle): VehicleFormData => {
  const formData: VehicleFormData = {
    vehicleCode: vehicle.vehicleCode,
    licensePlate: vehicle.licensePlate,
    vehicleTypeId: vehicle.vehicleTypeId,
    driverName: vehicle.driverName,
    status: vehicle.status,
  };

  return formData;
};

/**
 * Validate vehicle data before submission
 */
export const validateVehicleData = (
  vehicleData: VehicleFormData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!vehicleData.vehicleCode?.trim()) {
    errors.push("Vehicle code is required");
  }

  if (!vehicleData.licensePlate?.trim()) {
    errors.push("License plate is required");
  }

  if (!vehicleData.vehicleTypeId) {
    errors.push("Vehicle type is required");
  }

  if (!vehicleData.driverName?.trim()) {
    errors.push("Driver name is required");
  }

  if (!vehicleData.status?.trim()) {
    errors.push("Status is required");
  } else if (!["active", "inactive"].includes(vehicleData.status)) {
    errors.push("Status must be either 'active' or 'inactive'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if vehicle code is available
 */
export const checkVehicleCodeAvailability = async (
  vehicleCode: string
): Promise<boolean> => {
  try {
    // Try to get vehicle by code
    await getVehicleByCode(vehicleCode);
    return false; // Vehicle exists, so code is not available
  } catch (error: any) {
    // If error is 404, vehicle doesn't exist, so code is available
    if (error.response?.status === 404) {
      return true;
    }
    // For other errors, assume not available
    return false;
  }
};

/**
 * Check if license plate is available
 */
export const checkLicensePlateAvailability = async (
  licensePlate: string
): Promise<boolean> => {
  try {
    // Try to get vehicle by license plate
    await getVehicleByLicensePlate(licensePlate);
    return false; // Vehicle exists, so license plate is not available
  } catch (error: any) {
    // If error is 404, vehicle doesn't exist, so license plate is available
    if (error.response?.status === 404) {
      return true;
    }
    // For other errors, assume not available
    return false;
  }
};

export default {
  // Vehicle Type functions
  fetchVehicleTypes,
  createVehicleType,
  getVehicleTypeByName,

  // Vehicle functions
  fetchVehicles,
  fetchActiveVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicleByCode,
  getVehicleByLicensePlate,
  convertToVehicleFormData,
  validateVehicleData,
  checkVehicleCodeAvailability,
  checkLicensePlateAvailability,
};
