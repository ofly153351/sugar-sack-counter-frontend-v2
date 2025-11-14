"use client";

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";
import { LogOut, Settings, User } from "lucide-react";
import Logo from "../logo/logo";

export default function Nav() {
  return (
    <Navbar className="px-3 py-4 bg-white shadow-sm border-b border-gray-200 h-18 z-30  justify-between">
      <NavbarBrand className="flex items-center gap-2">
        <Logo width={40} height={40} />
        <p className="font-bold text-2xl text-mp-green-800">Mitr Phol</p>
      </NavbarBrand>

      {/* เมนูด้านขวา */}
      <NavbarContent as="div" justify="end" className="gap-6">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center transition-transform hover:scale-105">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </DropdownTrigger>

          <DropdownMenu
            aria-label="Profile Actions"
            variant="flat"
            className="bg-white border border-gray-200 shadow-lg rounded-xl w-52"
          >
            <DropdownItem
              key="profile"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
            >
              <span className="flex items-center gap-3 leading-none align-middle">
                <User className="text-inherit text-lg" />
                <span className="font-medium">Profile</span>
              </span>
            </DropdownItem>

            <DropdownItem
              key="settings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
            >
              <span className="flex items-center gap-3 leading-none align-middle">
                <Settings className="text-inherit text-lg" />
                <span className="font-medium">Settings</span>
              </span>
            </DropdownItem>

            <DropdownItem
              key="logout"
              color="danger"
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors border-t border-gray-200 mt-1"
            >
              <span className="flex items-center gap-3 leading-none align-middle">
                <LogOut className="text-inherit text-lg" />
                <span className="font-medium">Log Out</span>
              </span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
