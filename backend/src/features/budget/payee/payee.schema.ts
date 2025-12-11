import { z } from "zod";

export const deletePayeeSchema = z.object({
  userId: z.string().uuid(),
  payeeId: z.string().uuid(),
  replacementPayeeId: z.string().uuid().nullish().optional(),
});

export const editPayeeSchema = z
  .object({
    userId: z.string().uuid(),
    payeeId: z.string().uuid(),
    newName: z.string().trim().min(1).max(50).optional(),
    newDefaultCategoryId: z.string().uuid().nullable().optional(),
    automaticallyCategorisePayee: z.boolean().optional(),
    includeInPayeeList: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const { userId, payeeId, ...updates } = data;
      return Object.keys(updates).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    }
  );

export const editPayeesInBulkSchema = z.object({
  userId: z.string().uuid(),
  payeeIds: z.array(z.string().uuid()).min(1),
  updates: z
    .object({
      includeInPayeeList: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const combinePayeesSchema = z.object({
  userId: z.string().uuid(),
  payeeIds: z.array(z.string().uuid()).min(2),
  targetPayeeId: z.string().uuid(),
});

export const deletePayeesInBulkSchema = z.object({
  userId: z.string().uuid(),
  payeeIds: z.array(z.string().uuid()).min(1),
  replacementPayeeId: z.string().uuid().nullish().optional(),
});

export type DeletePayeePayload = z.infer<typeof deletePayeeSchema>;
export type EditPayeePayload = z.infer<typeof editPayeeSchema>;
export type EditPayeesInBulkPayload = z.infer<typeof editPayeesInBulkSchema>;
export type CombinePayeesPayload = z.infer<typeof combinePayeesSchema>;
export type DeletePayeesInBulkPayload = z.infer<
  typeof deletePayeesInBulkSchema
>;
