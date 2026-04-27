import { MonthBranded } from "@/core/types/NormalizedData";
import { z } from "zod";

export const AddCategorySchema = z.object({
  categoryGroupId: z.string(),
  name: z.string().min(1),
});

export type AddCategoryFormData = z.infer<typeof AddCategorySchema>;

/*
 * tst
 */
export type MonthKey = string & { readonly __brand: "MonthKey" };
export const asMonthKey = (value: string): MonthKey => value as MonthKey;

export type CategoryId = string & { readonly __brand: "CategoryId" };
export const asCategoryId = (value: string): CategoryId => value as CategoryId;

export type MonthId = string & { readonly __brand: "MonthId" };
export const asMonthId = (value: string): MonthId => value as MonthId;

export const asCategoryGroupId = (id: string) => id as CategoryGroupId;
export type CategoryGroupId = string & { readonly __brand: "CategoryGroupId" };

export type AccountId = string & { readonly __brand: "AccountId" };
export const asAccountId = (value: string): AccountId => value as AccountId;

export type TransactionId = string & { readonly __brand: "TransactionId" };
export const asTransactionId = (value: string): TransactionId =>
  value as TransactionId;

export type PayeeId = string & { readonly __brand: "TransactionId" };
export const asPayeeId = (value: string): TransactionId =>
  value as TransactionId;

export type NoteId = string & { readonly __brand: "NoteId" };
export const asNoteId = (value: string): NoteId => value as NoteId;

/**
 * Lookup of CategoryId to its corresponding MonthBranded.
 */
export type CategoryMonthMap = Record<CategoryId, MonthBranded>;
