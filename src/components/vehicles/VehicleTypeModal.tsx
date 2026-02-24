"use client";

import { useState } from "react";
import { VehicleTypeForm } from "./VehicleTypeForm";
import { Check, List, Pencil, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

interface VehicleTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleTypeData: { name: string }) => void;
  onUpdate?: (vehicleTypeId: string | number, vehicleTypeData: { name: string }) => Promise<void>;
  onDelete?: (vehicleTypeId: string | number, vehicleTypeName: string) => Promise<void>;
  isLoading?: boolean;
  vehicleTypes?: Array<{ id: string | number; name: string }>;
  isVehicleTypesLoading?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function VehicleTypeModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  isLoading = false,
  vehicleTypes = [],
  isVehicleTypesLoading = false,
  isUpdating = false,
  isDeleting = false,
}: VehicleTypeModalProps) {
  const t = useTranslations("vehicle.form");
  const [isTypeListOpen, setIsTypeListOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | number | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleClose = () => {
    setIsTypeListOpen(false);
    setEditingTypeId(null);
    setEditingName("");
    onClose();
  };

  const handleSave = (vehicleTypeData: { name: string }) => {
    onSave(vehicleTypeData);
  };

  const handleStartEdit = (id: string | number, name: string) => {
    setEditingTypeId(id);
    setEditingName(name);
  };

  const handleCancelEdit = () => {
    setEditingTypeId(null);
    setEditingName("");
  };

  const handleConfirmEdit = async () => {
    if (!onUpdate || editingTypeId === null) return;
    const trimmedName = editingName.trim();
    if (!trimmedName) return;

    await onUpdate(editingTypeId, { name: trimmedName });
    handleCancelEdit();
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
          onClick={handleClose}
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
              onClick={handleClose}
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

            <motion.button
              type="button"
              onClick={() => setIsTypeListOpen(true)}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="mb-5 group inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 px-3.5 py-2 text-sm font-semibold text-sky-900 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <List className="w-4 h-4 transition-transform duration-200 group-hover:rotate-6" />
              {t("existingVehicleTypes", {
                defaultValue: "ดูประเภทรถที่มีในระบบ",
              })}
              <span className="rounded-full border border-sky-300 bg-white px-2 py-0.5 text-xs shadow-sm">
                {vehicleTypes.length}
              </span>
            </motion.button>

            <VehicleTypeForm
              onCancel={handleClose}
              onSave={handleSave}
              isLoading={isLoading}
            />

            <AnimatePresence>
              {isTypeListOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4"
                  onClick={() => setIsTypeListOpen(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="w-full max-w-lg overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-gradient-to-r from-sky-50 via-cyan-50 to-teal-50 px-5 py-4 border-b border-sky-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-sky-950">
                          {t("existingVehicleTypes", {
                            defaultValue: "ประเภทรถที่มีในระบบตอนนี้",
                          })}
                        </h3>
                        <button
                          onClick={() => setIsTypeListOpen(false)}
                          className="rounded-lg p-1 text-gray-500 hover:bg-white/70 hover:text-gray-700 transition-colors"
                          aria-label="Close"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-sky-800">
                        {vehicleTypes.length}{" "}
                        {t("typesCountUnit", { defaultValue: "ประเภท" })}
                      </p>
                    </div>

                    <div className="p-4">
                      {isVehicleTypesLoading ? (
                        <p className="text-sm text-gray-600">
                          {t("loadingVehicleTypes", {
                            defaultValue: "กำลังโหลดข้อมูลประเภทรถ...",
                          })}
                        </p>
                      ) : vehicleTypes.length === 0 ? (
                        <p className="text-sm text-gray-600">
                          {t("noVehicleTypesYet", {
                            defaultValue: "ยังไม่มีประเภทรถในระบบ",
                          })}
                        </p>
                      ) : (
                        <motion.ul
                          initial="hidden"
                          animate="show"
                          variants={{
                            hidden: {},
                            show: { transition: { staggerChildren: 0.04 } },
                          }}
                          className="max-h-72 overflow-auto space-y-2 pr-1"
                        >
                          {vehicleTypes.map((type) => (
                            <motion.li
                              key={type.id}
                              variants={{
                                hidden: { opacity: 0, y: 6 },
                                show: { opacity: 1, y: 0 },
                              }}
                              className="rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2 text-sm text-sky-900"
                            >
                              {editingTypeId === type.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="flex-1 rounded-lg border border-sky-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                                    disabled={isUpdating || isDeleting}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleConfirmEdit}
                                    className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                    disabled={isUpdating || isDeleting || !editingName.trim()}
                                    aria-label="Save"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    disabled={isUpdating || isDeleting}
                                    aria-label="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium">{type.name}</span>
                                  <div className="flex items-center gap-1">
                                    {onUpdate && (
                                      <button
                                        type="button"
                                        onClick={() => handleStartEdit(type.id, type.name)}
                                        className="inline-flex items-center justify-center rounded-lg border border-sky-200 bg-white p-1.5 text-sky-700 hover:bg-sky-100 disabled:opacity-50"
                                        disabled={isUpdating || isDeleting}
                                        aria-label="Edit"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                    )}
                                    {onDelete && (
                                      <button
                                        type="button"
                                        onClick={() => onDelete(type.id, type.name)}
                                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        disabled={isUpdating || isDeleting}
                                        aria-label="Delete"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
