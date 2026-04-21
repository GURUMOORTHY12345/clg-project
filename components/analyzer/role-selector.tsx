"use client";

import { TARGET_ROLES, type TargetRole } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface RoleSelectorProps {
  value: TargetRole | "";
  onChange: (value: TargetRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">Target Role</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as TargetRole)}
        disabled={disabled}
      >
        <SelectTrigger id="role" className="w-full">
          <SelectValue placeholder="Select your target role" />
        </SelectTrigger>
        <SelectContent>
          {TARGET_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
