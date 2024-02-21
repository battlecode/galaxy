import React from "react";
import Icon from "./Icon";
import { Switch } from "@headlessui/react";
import FormLabel from "./FormLabel";

interface CheckboxProps {
  disabled?: boolean;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  disabled = false,
  checked = false,
  onChange,
  label,
}) => {
  return (
    <Switch.Group as="div" className="flex flex-row items-center gap-2">
      {label !== undefined && (
        <Switch.Label>
          <FormLabel label={label} />
        </Switch.Label>
      )}
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`inline-flex h-5 w-5 items-center justify-center rounded
                  ring-2 ring-inset ring-cyan-600/50 focus:outline-none
                  focus:ring-2 ui-checked:bg-cyan-500 ui-checked:ring-0`}
      >
        <Icon
          size="xs"
          name="check"
          className={checked ? "text-cyan-100 opacity-100" : "opacity-0"}
        />
      </Switch>
    </Switch.Group>
  );
};

export default Checkbox;
