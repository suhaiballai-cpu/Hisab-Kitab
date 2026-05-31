/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import * as Icons from "lucide-react";

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ name, className = "", size = 20 }: CategoryIconProps) {
  // Gracefully fallback to PiggyBank if the icon doesn't exist
  const IconComponent = (Icons as any)[name] || Icons.PiggyBank;

  return <IconComponent className={className} size={size} />;
}
