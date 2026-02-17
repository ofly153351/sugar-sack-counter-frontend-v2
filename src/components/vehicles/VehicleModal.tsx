"use client";

import { VehicleForm } from "./VehicleForm";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

interface VehicleType {
  id: string | number;
  name: string;
}

interface Vehicle {
  no?: number;
  id?: string | number;
  vehicleCode: string;
  licensePlate: string;
  vehicleType: string;
  vehicleTypeId: string | number;
  driverName: string;
  status: "active" | "inactive" | "maintenance";
}

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Vehicle | null;
  onSave: (vehicle: Vehicle) => void;
  vehicleTypes?: VehicleType[];
}

export function VehicleModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  vehicleTypes = [],
}: VehicleModalProps) {
  const t = useTranslations();

  const handleSave = (vehicle: Vehicle) => {
    onSave(vehicle);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {initialData
                ? t("vehicle.edit", { defaultValue: "แก้ไขรถขนส่ง" })
                : t("vehicle.add", { defaultValue: "เพิ่มรถขนส่ง" })}
            </h2>

            <VehicleForm
              initialData={initialData}
              onCancel={onClose}
              onSave={handleSave}
              vehicleTypes={vehicleTypes}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
