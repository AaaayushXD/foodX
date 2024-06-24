import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { useState } from "react";

interface DropDownProp {
  options: string[];
  onSelect?: (selectedOption: string) => void;
}

export const DropDown: React.FC<DropDownProp> = ({ onSelect, options }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (selectOption: string) => {
    setSelectedOption(selectOption);
    if (onSelect) onSelect(selectOption);
  };

  return (
    <div className="w-[200px] ">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button
            className={` py-2 px-9 bg-[var(--color)] text-[var(--light-foreground)] rounded w-[200px]  duration-200`}
          >
            {selectedOption || "Select an options"}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="relative bg-[var(--light-foreground)] w-full  py-3 my-1 px-1 rounded flex flex-col items-start justify-center gap-2">
            {options?.map((item, index) => (
              <DropdownMenu.Item
                key={index}
                onClick={() => handleSelect(item as string)}
                className=" outline-none w-full cursor-pointer duration-150 rounded px-9 py-1.5 text-[15px] hover:text-[var(--light-foreground)] hover:bg-[#666]  "
              >
                {item}
              </DropdownMenu.Item>
            ))}
            <div className="w-[10px] h-[10px] z-[-1] absolute top-[-5px] right-16 rotate-45  bg-[var(--light-background)] "></div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
