// Common form types for input components
import React from 'react';

export interface CommonInputProps {
  id: string;
  name: string;
  label: string;
    hint?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
  widthClass?: string;
  inlineLabel?: boolean;
  labelClassName?: string;
  maxLength?: number;
  showCount?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}