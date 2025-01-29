import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import { AddCircleIcon, ChevronDownIcon } from "@/core/icons/icons";
import { bgGray, borderBottom, darkBlueText } from "@/core/theme/colors";
import clsx from "clsx";

import { ReactNode, useState } from "react";

const data = {
  entities: {
    categories: {
      1: { id: 1, name: "Bills", open: true, subCategories: [1, 2] },
      2: { id: 2, name: "Needs", open: true, subCategories: [3, 4] },
      3: { id: 3, name: "Wants", open: true, subCategories: [5, 6] },
    },
    subCategories: {
      1: { id: 1, name: "Rent", assigned: 200, activity: 50, available: 20 },
      2: {
        id: 2,
        name: "Utilities",
        assigned: 100,
        activity: 30,
        available: 10,
      },
      3: {
        id: 3,
        name: "Groceries",
        assigned: 300,
        activity: 80,
        available: 50,
      },
      4: {
        id: 4,
        name: "Retirement",
        assigned: 150,
        activity: 60,
        available: 40,
      },
      5: { id: 5, name: "Hobbies", assigned: 50, activity: 20, available: 10 },
      6: {
        id: 6,
        name: "Budgie subscription",
        assigned: 75,
        activity: 25,
        available: 15,
      },
    },
  },
  result: [1, 2, 3],
};

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
  const [displayAllSubCategories, setDisplayAllSubCategories] = useState(false);

  const categories = Object.values(data.entities.categories);
  const subCategories = Object.values(data.entities.subCategories);

  console.log("categories", categories);
  console.log("subcategories", subCategories);

  const handleExpand = () => {
    console.log("Hello, World!");
  };

  return (
    <div>
      <div className="flex items-center gap-2 py-2 px-2">
        <button>
          <ChevronDownIcon
            className={clsx(
              displayAllSubCategories ? "" : "-rotate-90",
              `h-4 w-4 ${darkBlueText}`,
            )}
            onClick={() => setDisplayAllSubCategories(!displayAllSubCategories)}
          />
        </button>
        <div className={`${darkBlueText} font-thin`}>CATEGORY</div>
      </div>

      {categories.map((category) => (
        <Category name={category.name}>
          {/* category header ? */}
          {category.subCategories.map((subCategory) => (
            <SubCategory subCategory={subCategories[subCategory - 1]} />
          ))}
        </Category>
      ))}
    </div>
  );
}

function Category({ children, name }: { children: ReactNode; name: string }) {
  const [displaySubCategories, setDisplayCategories] = useState(false);
  const [hover, setHover] = useState(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseExit = () => setHover(false);

  const handleToggleDisplaySubCategory = () => {
    setDisplayCategories(!displaySubCategories);
  };

  return (
    <div className="min-w-[600px]">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseExit}
        className={`flex items-center gap-2 px-2 ${bgGray}`}
      >
        <button className="w-4" onClick={handleToggleDisplaySubCategory}>
          <ChevronDownIcon
            className={clsx(
              displaySubCategories ? "rotate-0" : "-rotate-90",
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
      {displaySubCategories && children}
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
