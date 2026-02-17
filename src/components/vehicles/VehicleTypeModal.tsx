"use client";

import { VehicleTypeForm } from "./VehicleTypeForm";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

interface VehicleTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleTypeData: { name: string }) => void;
  isLoading?: boolean;
}

export function VehicleTypeModal({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: VehicleTypeModalProps) {
  const t = useTranslations("vehicle.form");

  const handleSave = (vehicleTypeData: { name: string }) => {
    onSave(vehicleTypeData);
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
              disabled={isLoading}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {t("createVehicleType", { defaultValue: "สร้างประเภทรถใหม่" })}
            </h2>

            <p className="text-gray-600 mb-6">
              เพิ่มประเภทรถใหม่สำหรับใช้ในการบันทึกข้อมูลรถขนส่ง
            </p>

            <VehicleTypeForm
              onCancel={onClose}
              onSave={handleSave}
              isLoading={isLoading}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
