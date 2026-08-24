import { CategoryActionTarget } from "@/pages/budget/allocation/hooks/useAllocation/useAllocation";
import { CategoryBreakdownView } from "@/pages/budget/allocation/hooks/useAllocation/useCategoryBreakdown";
import { SelectableCategory } from "@/pages/budget/allocation/slices/selectedCategorySlice";
import clsx from "clsx";
import { Pencil } from "lucide-react";

export type SelectedCategoriesProps = {
  selectedCategories: SelectableCategory[];
  view: CategoryBreakdownView;
  onEditCategory: (e: React.MouseEvent, target: CategoryActionTarget) => void;
};

export function SelectedCategories({
  selectedCategories,
  view,
  onEditCategory,
}: SelectedCategoriesProps) {
  const numberOfCategoriesSelected = selectedCategories.length;
  const isSingle = view.kind === "single";

  const displayEditButton = isSingle && !view.isUncategorisedSelected;

  return (
    <section
      aria-label="Selected categories"
      className={clsx(
        numberOfCategoriesSelected > 0 && "py-4",
        "flex items-center rounded overflow-hidden"
      )}
    >
      <div className={`w-96 2xl:w-[500px] ${isSingle ? "truncate" : ""}`}>
        <p className={`text-xl font-bold ${isSingle ? "truncate" : ""}`}>
          {isSingle
            ? selectedCategories[0].name
            : `${numberOfCategoriesSelected} Categories Selected`}
        </p>
        {!isSingle && (
          <p className="text-sm">
            {selectedCategories.map((c) => c.name).join(", ")}
          </p>
        )}
      </div>
      {displayEditButton && (
        <button
          type="button"
          aria-label={`Edit ${selectedCategories[0].name}`}
          onClick={(e) => {
            onEditCategory(e, {
              type: "category",
              id: selectedCategories[0].id,
              name: selectedCategories[0].name,
              categoryGroupId: selectedCategories[0].categoryGroupId,
            });
          }}
        >
          <Pencil aria-hidden="true" className="w-4 h-4 stroke-gray-500" />
        </button>
      )}
    </section>
  );
}

// const CategoryContextSchema = z.object({
//   name: z.string().min(1, { message: "Category requires a name" }),
//   categoryId: z.string().uuid(),
// });

// export function EditCategory({ children }: { children: ReactNode }) {
//   const [contextOpen, setContextOpen] = useState(false);
//   const [editCategory] = useEditCategoryMutation();
//   const [deleteCategory] = useDeleteCategoryMutation();
//
//   const category = {
//     name: "test",
//     id: "temp-id",
//   };
//
//   const form = useForm<CategoryContextType>({
//     defaultValues: {
//       name: category.name,
//       categoryId: category.id,
//     },
//     resolver: zodResolver(CategoryContextSchema),
//   });
//
//   const { reset, control, handleSubmit } = form;
//
//   const handleOpen = (open: boolean) => {
//     if (!open) reset();
//   };
//
//   useEffect(() => {
//     reset({
//       name: category.name,
//       categoryId: category.id,
//     });
//   }, [category.name, category.id]);
//
//   const onSubmit = (updatedCategory: CategoryContextType) => {
//     editCategory(updatedCategory);
//     closeContextMenu();
//     reset();
//   };
//
//   const handleDelete = (categoryId: string) => {
//     deleteCategory({ categoryId });
//   };
//
//   const openContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
//     e.preventDefault();
//     setContextOpen(true);
//   };
//
//   const closeContextMenu = () => {
//     setContextOpen(false);
//   };
//
//   return <button>{children}</button>;
// }
