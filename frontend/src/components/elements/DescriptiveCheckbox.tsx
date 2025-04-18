import type React from "react";
import Icon from "./Icon";
import { Switch } from "@headlessui/react";
import Spinner from "../Spinner";
import { isPresent } from "utils/utilTypes";

export const enum CheckboxState {
  CHECKED,
  UNCHECKED,
  LOADING,
}

export const getCheckboxState = (
  loading: boolean,
  editMode: boolean,
  manualCheck: boolean | undefined,
  dataCheck: boolean | undefined,
): CheckboxState => {
  if (loading) {
    return CheckboxState.LOADING;
  } else if (editMode && isPresent(manualCheck)) {
    return manualCheck ? CheckboxState.CHECKED : CheckboxState.UNCHECKED;
  } else {
    return isPresent(dataCheck) && dataCheck
      ? CheckboxState.CHECKED
      : CheckboxState.UNCHECKED;
  }
};

interface DescriptiveCheckboxProps {
  disabled?: boolean;
  status: CheckboxState;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}

const DescriptiveCheckbox: React.FC<DescriptiveCheckboxProps> = ({
  disabled = false,
  status,
  onChange,
  title,
  description,
}) => (
  <Switch
    checked={status === CheckboxState.CHECKED}
    onChange={onChange}
    disabled={disabled || status === CheckboxState.LOADING}
    className={`flex w-full
      flex-row items-center justify-between gap-3 rounded-lg px-6 py-4 shadow ring-2 ring-inset
       ring-cyan-600/20 transition-all disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:ring-gray-400 ui-checked:bg-cyan-900/80 ui-checked:ring-0`}
  >
    <div className="flex flex-col gap-2 text-left">
      <div className="font-semibold ui-checked:text-white">{title}</div>
      <div className="text-sm text-cyan-700 ui-checked:text-cyan-100">
        {description}
      </div>
    </div>

    {status === CheckboxState.LOADING ? (
      <div>
        <Spinner size="md" />
      </div>
    ) : (
      <div
        className="rounded-full p-1.5 ring-2 ring-inset ring-cyan-600/20 transition-all
      ui-checked:bg-cyan-500/50 ui-checked:ring-0"
      >
        <Icon
          name="check"
          size="sm"
          className={`text-cyan-100 opacity-0 ui-checked:opacity-100`}
        />
      </div>
    )}
  </Switch>
);

export default DescriptiveCheckbox;
