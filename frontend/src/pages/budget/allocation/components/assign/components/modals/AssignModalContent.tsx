import { ReactNode } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";

import { formatCurrency } from "@/utils/formatCurrency";
import { Category, FundingState, FundingStatus } from "../../types/assignTypes";

export const renderUnderfundedNoMoneyContent = (): ReactNode => (
  <div className="space-y-4 text-stone-900">
    <p>
      You assigned all of your money already—there isn't any left for your plan.
    </p>
    <p>
      This is ok! Prioritize by moving money from less important categories to
      more important ones.
    </p>
    <p>
      When you receive more income, fund your plan the rest of the way by using
      Underfunded again.
    </p>
  </div>
);

export const renderUnderfundedAlreadyFundedContent = (): ReactNode => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 bg-lime-300/60 p-4 rounded">
      <FaCheckCircle size={20} className="text-white fill-lime-500" />
      <p className="text-stone-900">You have already fully funded this month</p>
    </div>
    <p>
      This is a good thing! You can now assign money to a future month or
      manually assign more money this month
    </p>
  </div>
);

export const renderUnderfundedFundingContent = (
  fundingState: FundingState
): ReactNode => {
  if (fundingState.status !== FundingStatus.Underfunded) return null;

  return (
    <>
      {fundingState.partiallyFundedCategory && (
        <>
          <div className="flex-grow flex items-center gap-2 bg-yellow-100 p-4 rounded text-stone-900">
            <CircularProgressbar
              className="!w-auto size-8"
              value={
                fundingState.partiallyFundedCategory?.category.percentFunded ||
                0
              }
              strokeWidth={50}
              styles={buildStyles({
                pathColor: "red",
                strokeLinecap: "butt",
              })}
            />
            <div className="flex-grow">
              <p>
                You don't have enough money to fully fund all of your
                categories. <span className="font-[900]">1 category</span> will
                be partially funded
              </p>
            </div>
          </div>
          <div role="grid" className="px-8 py-2">
            <div role="row">
              <p>{fundingState.partiallyFundedCategory.name}</p>
            </div>
            <div role="row" className="text-stone-900">
              <div className="flex justify-between items-end font-[400]">
                <p>{fundingState.partiallyFundedCategory.category.name}</p>
                <p className="whitespace-nowrap">
                  {formatCurrency(
                    fundingState.partiallyFundedCategory.category.amount,
                    { showPlus: true }
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      {fundingState.fullyFundedCategories.length > 0 && (
        <>
          <div className="flex-grow flex items-center gap-2 bg-lime-300/60 p-4 rounded text-stone-900">
            <FaCheckCircle size={20} className="text-white fill-lime-500" />
            <p>
              <span className="font-[900]">
                {fundingState.fullyFundedCategories.reduce(
                  (total, group) => total + group.categories.length,
                  0
                )}{" "}
                categories
              </span>{" "}
              will be fully funded
            </p>
          </div>

          {fundingState.fullyFundedCategories.map(
            (categoryGroup, groupIndex) => (
              <div key={groupIndex} className="px-8 py-2">
                <div role="row">
                  <div role="gridcell" className="font-[700] text-stone-900">
                    {categoryGroup.name}
                  </div>
                </div>
                {categoryGroup.categories.map(
                  (category: Category, categoryIndex: number) => (
                    <div
                      key={categoryIndex}
                      role="row"
                      className="text-stone-900"
                    >
                      <div
                        key={categoryIndex}
                        className="flex justify-between items-end font-[400]"
                      >
                        <p>{category.name}</p>
                        <p className="whitespace-nowrap">
                          {formatCurrency(category.amount, { showPlus: true })}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )
          )}
        </>
      )}
    </>
  );
};

export const renderCategoriesContent = (
  fundingState: FundingState
): ReactNode => {
  if (fundingState.status === FundingStatus.Underfunded) return null;

  const categoriesCount = fundingState.categories.reduce(
    (acc, categoryGroup) => acc + categoryGroup.categories.length,
    0
  );

  if (categoriesCount === 0)
    return (
      <div className="flex items-center gap-2 bg-sky-600/20 text-stone-900 rounded p-4">
        <FaInfoCircle size={20} className="fill-sky-700" />
        <p>This will not update the assigned amount for any categories.</p>
      </div>
    );

  const message =
    categoriesCount >= 2 ? `${categoriesCount} categories` : "1 category";

  return (
    <>
      <div className="flex-grow flex items-center gap-2 bg-sky-200 p-4 rounded text-stone-900">
        <FaInfoCircle size={20} className="text-white fill-sky-700" />
        <p>
          <span className="font-[800]">{message}</span> will be updated
        </p>
      </div>
      {fundingState.categories.map((categoryGroup, groupIndex) => (
        <div role="grid" key={groupIndex} className="px-8 py-2 text-stone-900">
          <div role="row">
            <p className="font-[700]">{categoryGroup.name}</p>
          </div>
          {categoryGroup.categories.map((category, categoryIndex) => (
            <div
              role="row"
              key={categoryIndex}
              className="flex justify-between items-end font-[400]"
            >
              <p>{category.name}</p>
              <p className="whitespace-nowrap">
                {formatCurrency(category.amount, { showPlus: true })}
              </p>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
