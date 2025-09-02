export type OperatorOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export async function fetchOperatorOptions(): Promise<OperatorOption[]> {
  const response = await fetch('/network-operator-details');
  const data = await response.json();
  // If your endpoint returns [{id, text}], map to {value, label}
  return [
    { value: '', label: 'Select one...', disabled: true },
    ...data.map((item: { id: string; text: string }) => ({
      value: item.id,
      label: item.text,
    })),
  ];
}
