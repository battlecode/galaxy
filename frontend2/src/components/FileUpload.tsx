import React, {
  forwardRef,
  useMemo,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import FormLabel from "./elements/FormLabel";
import FormError from "./elements/FormError";
import type { Maybe } from "../utils/utilTypes";

interface FileUploadProps extends React.ComponentPropsWithoutRef<"input"> {
  label?: string;
  required?: boolean;
  className?: string;
  errorMessage?: string;
  fileInputHelp?: string;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  function FileUpload(
    {
      label,
      required = false,
      className = "",
      errorMessage,
      fileInputHelp,
      ...rest
    },
    forwardedRef,
  ) {
    const invalid = errorMessage !== undefined;
    const disabledClassName = `${invalid ? "ring-red-500" : ""}
    ${rest.disabled === true ? "bg-gray-400/20 text-gray-600" : ""}`;

    const ref = useRef<HTMLInputElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(forwardedRef, () => ref.current!, []);

    const [fileName, setFileName] = useState<Maybe<string>>();

    return (
      <div className={`relative ${invalid ? "mb-1" : ""} ${className}`}>
        {label !== undefined && <FormLabel label={label} />}
        <label className="flex max-w-md flex-row items-center">
          <input
            aria-invalid={errorMessage !== undefined ? "true" : "false"}
            type="file"
            onInput={() => {
              let name = ref.current?.files?.item(0)?.name;
              if (name === null) name = undefined;
              setFileName(name);
            }}
            className="hidden"
            ref={ref}
            {...rest}
          />
          <div
            className={`flex w-[150px] cursor-pointer items-center justify-center rounded-l-lg border-y border-l border-gray-200 bg-cyan-400 p-2 text-sm text-cyan-900 hover:bg-cyan-300 focus:outline-none ${disabledClassName}`}
          >
            Choose File
          </div>
          <div
            className={`block w-full cursor-pointer rounded-r-lg border-y border-r border-gray-200 bg-gray-100 p-2 text-sm text-gray-500 focus:outline-none ${disabledClassName}`}
          >
            {fileName ?? "No file uploaded."}
          </div>
        </label>
        {invalid && <FormError className="mb-4" message={errorMessage} />}
        {fileInputHelp !== undefined && (
          <p className="mb-0 mt-1 text-sm text-gray-500">{fileInputHelp}</p>
        )}
      </div>
    );
  },
);

export default FileUpload;
