import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { AddCircleIcon, ChevronDownIcon } from "@/core/icons/icons";
import { bgGray, borderBottom, darkBlueText } from "@/core/theme/colors";
import clsx from "clsx";

import { useState } from "react";

const categories: Category[] = [
  {
    name: "Bills",
    open: true,
    subCategories: [
      {
        name: "Rent",
        assigned: 0,
        activity: 0,
        available: 0,
      },
      {
        name: "Utilities",
        assigned: 0,
        activity: 0,
        available: 0,
      },
    ],
  },
  {
    name: "Needs",
    open: true,
    subCategories: [
      {
        name: "Groceries",
        assigned: 0,
        activity: 0,
        available: 0,
      },
      {
        name: "Retirement",
        assigned: 0,
        activity: 0,
        available: 0,
      },
    ],
  },
  {
    name: "Wants",
    open: true,
    subCategories: [
      {
        name: "Hobbies",
        assigned: 0,
        activity: 0,
        available: 0,
      },
      {
        name: "Budgie subscription",
        assigned: 0,
        activity: 0,
        available: 0,
      },
    ],
  },
];

type Category = {
  name: string;
  open: boolean;
  subCategories: SubCategory[];
};

type SubCategory = {
  name: string;
  assigned: number;
  activity: number;
  available: number;
};

export default function Categories() {
  return (
    <>
      <div className="flex items-center gap-2 py-2 px-2">
        <button>
          <ChevronDownIcon className={`h-4 w-4 ${darkBlueText}`} />
        </button>
        <div className={`${darkBlueText} font-thin`}>CATEGORY</div>
      </div>

      {categories.map((category) => (
        <Category category={category} />
      ))}
    </>
  );
}

function Category({ category }: { category: Category }) {
  const { name, open, subCategories } = category;
  const [hover, setHover] = useState(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseExit = () => setHover(false);

  return (
    <div className="min-w-[600px]">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseExit}
        className={`flex items-center gap-2 px-2 ${bgGray}`}
      >
        <button className="w-4">
          <ChevronDownIcon
            className={clsx(
              open ? "" : "-rotate-90",
              `h-4 w-4 ${darkBlueText}`,
            )}
          />
        </button>

        <Checkbox />
        <div className="flex-grow flex-shrink basis-48 flex items-center gap-4 py-2">
          <p className={`${darkBlueText} font-bold`}>{name}</p>
          {hover && (
            <button>
              <AddCircleIcon className={`${darkBlueText}`} />
            </button>
          )}
        </div>

        <div className="flex-1 text-right">
          <p>Assigned</p>
        </div>
        <div className="flex-1 text-right">
          <p>Activity</p>
        </div>
        <div className="flex-1 text-right">
          <p>Available</p>
        </div>
      </div>

      {subCategories.map((subCategory) => (
        <SubCategory subCategory={subCategory} />
      ))}
    </div>
  );
}

type SubCategoryProps = {
  subCategory: SubCategory;
};

function SubCategory({ subCategory }: SubCategoryProps) {
  return (
    <div
      className={`flex items-center gap-2 py-2 pl-8 pr-2 border-b ${borderBottom}`}
    >
      <Checkbox />
      <div className="flex-grow flex-shrink basis-48 text-ellipsis whitespace-nowrap">
        {subCategory.name}
      </div>
      <div className="flex-1 text-right">{subCategory.activity}</div>
      <div className="flex-1 text-right">{subCategory.assigned}</div>
      <div className="flex-1 text-right">{subCategory.available}</div>
    </div>
  );
}
