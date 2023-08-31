import React, { Fragment } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import Icon from "./Icon";

interface CollapseProps {
  children?: React.ReactNode;
  title: string;
}

const Collapse: React.FC<CollapseProps> = ({ children, title }) => {
  return (
    <Disclosure as="div" className="flex flex-col rounded bg-gray-100">
      <Disclosure.Button
        className="relative rounded bg-cyan-200 bg-opacity-40 py-2 pl-4 pr-8 text-left text-cyan-900 ring-0
      ring-inset ring-cyan-800 ring-opacity-50 hover:bg-cyan-300 hover:bg-opacity-40"
      >
        {title}
        <div
          className="absolute inset-y-0 right-0 mr-2 flex transform items-center
              transition duration-300 ui-open:rotate-180"
        >
          <Icon name="chevron_down" size="sm" />
        </div>
      </Disclosure.Button>
      <Transition
        as={Fragment}
        enter="transition ease-in duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Disclosure.Panel className="rounded-b p-3 ">
          {children}
        </Disclosure.Panel>
      </Transition>
    </Disclosure>
  );
};

export default Collapse;
