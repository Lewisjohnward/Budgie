import { render, screen } from "@testing-library/react";
import { SelectedCategories } from "./SelectedCategories";
import { Category } from "@/core/types/NormalizedData";

const mockCategory1: Category = {
  id: "1",
  name: "Groceries",
  months: ["month1", "month2"],
  userId: "1",
  categoryGroupId: "1",
  position: 1,
};

const mockCategory2: Category = {
  id: "2",
  name: "Transportation",
  months: ["month1", "month2"],
  userId: "1",
  categoryGroupId: "1",
  position: 2,
};

const mockCategory3: Category = {
  id: "3",
  name: "Business Equipment, Software Licenses & Technology Infrastructure",
  months: ["month1", "month2"],
  userId: "1",
  categoryGroupId: "1",
  position: 3,
};

describe("SelectedCategories", () => {
  it("renders nothing when no categories are provided", () => {
    const { container } = render(<SelectedCategories categories={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders single category with edit button", () => {
    render(<SelectedCategories categories={[mockCategory1]} />);

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByText("1 Categories Selected")).not.toBeInTheDocument();
  });

  it("renders single category with long name and truncates properly", () => {
    render(<SelectedCategories categories={[mockCategory3]} />);

    expect(
      screen.getByText(
        "Business Equipment, Software Licenses & Technology Infrastructure"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders multiple categories without edit button", () => {
    render(<SelectedCategories categories={[mockCategory1, mockCategory2]} />);

    expect(screen.getByText("2 Categories Selected")).toBeInTheDocument();
    expect(screen.getByText("Groceries, Transportation")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders three categories with correct count and names", () => {
    const categories = [mockCategory1, mockCategory2, mockCategory3];
    render(<SelectedCategories categories={categories} />);

    expect(screen.getByText("3 Categories Selected")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Groceries, Transportation, Business Equipment, Software Licenses & Technology Infrastructure"
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
