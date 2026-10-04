import { expect, Page } from "@playwright/test";

export async function expandCategoryGroup(page: Page, groupName: string) {
  const expandButton = page.getByRole("button", {
    name: `Expand ${groupName} category group`,
  });
  await expect(expandButton).toBeVisible();

  await expandButton.click({ trial: true });
  await expandButton.click();

  await expect(
    page.getByRole("button", {
      name: `Collapse ${groupName} category group`,
    })
  ).toBeVisible();
}

export async function collapseCategoryGroup(page: Page, groupName: string) {
  const collapseButton = page.getByRole("button", {
    name: `Collapse ${groupName} category group`,
  });

  await expect(collapseButton).toBeVisible();
  await collapseButton.click();

  await expect(
    page.getByRole("button", {
      name: `Expand ${groupName} category group`,
    })
  ).toBeVisible();
}

export async function expectGroupCategories(
  page: Page,
  groupName: string,
  expected: string[]
) {
  const groupElement = page.getByRole("rowgroup", {
    name: `${groupName} category group`,
  });

  await expect
    .poll(async () =>
      groupElement
        .getByRole("row", {
          name: /category$/,
        })
        .evaluateAll((rows) =>
          rows.map((row) => row.getAttribute("aria-label"))
        )
    )
    .toEqual(expected.map((name) => `${name} category`));
}

export async function expectCategoryGroups(page: Page, expected: string[]) {
  await expect
    .poll(async () =>
      page
        .getByRole("rowgroup")
        .evaluateAll((groups) =>
          groups.map((group) => group.getAttribute("aria-label"))
        )
    )
    .toEqual(expected.map((name) => `${name} category group`));
}

export async function dragCategoryGroup(
  page: Page,
  draggedGroup: string,
  targetGroup: string
) {
  const draggedGroupRow = page.getByRole("row", {
    name: `${draggedGroup} category group`,
  });

  const targetGroupRow = page.getByRole("row", {
    name: `${targetGroup} category group`,
  });

  const draggedGroupBox = await draggedGroupRow.boundingBox();
  const targetGroupBox = await targetGroupRow.boundingBox();

  if (!draggedGroupBox || !targetGroupBox) {
    throw new Error("Could not determine category group row positions");
  }

  const draggedGroupX = draggedGroupBox.x + draggedGroupBox.width / 2;
  const draggedGroupY = draggedGroupBox.y + draggedGroupBox.height / 2;

  const targetGroupX = targetGroupBox.x + targetGroupBox.width / 2;

  await page.mouse.move(draggedGroupX, draggedGroupY);
  await page.mouse.down();

  await page.mouse.move(
    targetGroupX,
    targetGroupBox.y + targetGroupBox.height + 20,
    {
      steps: 5,
    }
  );

  await page.mouse.move(
    targetGroupX,
    targetGroupBox.y + targetGroupBox.height * 0.25,
    {
      steps: 5,
    }
  );

  await page.mouse.up();
}

export async function dragCategoryGroupOutside(
  page: Page,
  draggedGroup: string,
  targetGroup: string
) {
  const draggedGroupRow = page.getByRole("row", {
    name: `${draggedGroup} category group`,
  });

  const targetGroupRow = page.getByRole("row", {
    name: `${targetGroup} category group`,
  });

  const draggedGroupBox = await draggedGroupRow.boundingBox();
  const targetGroupBox = await targetGroupRow.boundingBox();

  if (!draggedGroupBox || !targetGroupBox) {
    throw new Error("Could not determine category group row positions");
  }

  const draggedGroupX = draggedGroupBox.x + draggedGroupBox.width / 2;
  const draggedGroupY = draggedGroupBox.y + draggedGroupBox.height / 2;

  const targetGroupX = targetGroupBox.x + targetGroupBox.width / 2;
  const targetGroupY = targetGroupBox.y + targetGroupBox.height * 0.25;

  await page.mouse.move(draggedGroupX, draggedGroupY);
  await page.mouse.down();

  // Move to where the group would be reordered.
  await page.mouse.move(targetGroupX, targetGroupY, {
    steps: 10,
  });

  // Then leave the viewport before releasing.
  await page.mouse.move(targetGroupX, -20, {
    steps: 10,
  });

  await page.mouse.up();
}

export async function dragCategory(
  page: Page,
  draggedCategory: string,
  targetCategory: string
) {
  const draggedCategoryRow = page.getByRole("row", {
    name: `${draggedCategory} category`,
  });

  const targetCategoryRow = page.getByRole("row", {
    name: `${targetCategory} category`,
  });

  const draggedCategoryBox = await draggedCategoryRow.boundingBox();
  const targetCategoryBox = await targetCategoryRow.boundingBox();

  if (!draggedCategoryBox || !targetCategoryBox) {
    throw new Error("Could not determine category row positions");
  }

  const draggedCategoryX = draggedCategoryBox.x + draggedCategoryBox.width / 2;
  const draggedCategoryY = draggedCategoryBox.y + draggedCategoryBox.height / 2;

  const targetCategoryX = targetCategoryBox.x + targetCategoryBox.width / 2;

  await page.mouse.move(draggedCategoryX, draggedCategoryY);
  await page.mouse.down();

  // Move past the target, then approach it from below.
  await page.mouse.move(
    targetCategoryX,
    targetCategoryBox.y + targetCategoryBox.height + 20,
    {
      steps: 5,
    }
  );

  await page.mouse.move(
    targetCategoryX,
    targetCategoryBox.y + targetCategoryBox.height * 0.25,
    {
      steps: 5,
    }
  );

  await page.mouse.up();
}

export async function dragCategoryToEnd(
  page: Page,
  categoryName: string,
  groupName: string
) {
  const categoryRow = page.getByRole("row", {
    name: `${categoryName} category`,
  });

  const groupElement = page.getByRole("rowgroup", {
    name: `${groupName} category group`,
  });

  const rows = groupElement.getByRole("row", { name: /category$/ });
  const lastRow = rows.last();
  const categoryBox = await categoryRow.boundingBox();
  const lastRowBox = await lastRow.boundingBox();

  if (!categoryBox || !lastRowBox) {
    throw new Error("Could not determine category row positions");
  }

  const categoryX = categoryBox.x + categoryBox.width / 2;
  const categoryY = categoryBox.y + categoryBox.height / 2;
  const targetX = lastRowBox.x + lastRowBox.width / 2;
  const targetY = lastRowBox.y + lastRowBox.height + 20;

  await page.mouse.move(categoryX, categoryY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 10 });

  await page.mouse.up();
}

export async function dragCategoryToGroup(
  page: Page,
  categoryName: string,
  groupName: string
) {
  const categoryRow = page.getByRole("row", {
    name: `${categoryName} category`,
  });

  const groupRow = page.getByRole("row", {
    name: `${groupName} category group`,
  });

  const categoryBox = await categoryRow.boundingBox();
  const groupBox = await groupRow.boundingBox();

  if (!categoryBox || !groupBox) {
    throw new Error("Could not determine drag positions");
  }

  await page.mouse.move(
    categoryBox.x + categoryBox.width / 2,
    categoryBox.y + categoryBox.height / 2
  );
  await page.mouse.down();

  await page.mouse.move(
    groupBox.x + groupBox.width / 2,
    groupBox.y + groupBox.height / 2,
    { steps: 10 }
  );

  await page.mouse.up();
}

export async function dragCategoryOutside(
  page: Page,
  draggedCategory: string,
  targetCategory: string
) {
  const draggedCategoryRow = page.getByRole("row", {
    name: `${draggedCategory} category`,
  });

  const targetCategoryRow = page.getByRole("row", {
    name: `${targetCategory} category`,
  });

  const draggedCategoryBox = await draggedCategoryRow.boundingBox();
  const targetCategoryBox = await targetCategoryRow.boundingBox();

  if (!draggedCategoryBox || !targetCategoryBox) {
    throw new Error("Could not determine category row positions");
  }

  const draggedCategoryX = draggedCategoryBox.x + draggedCategoryBox.width / 2;
  const draggedCategoryY = draggedCategoryBox.y + draggedCategoryBox.height / 2;

  const targetCategoryX = targetCategoryBox.x + targetCategoryBox.width / 2;
  const targetCategoryY = targetCategoryBox.y + targetCategoryBox.height * 0.25;

  await page.mouse.move(draggedCategoryX, draggedCategoryY);
  await page.mouse.down();

  // Move to where the category would be reordered.
  await page.mouse.move(targetCategoryX, targetCategoryY, {
    steps: 10,
  });

  // Then leave the viewport before releasing.
  await page.mouse.move(targetCategoryX, -20, {
    steps: 10,
  });

  await page.mouse.up();
}
