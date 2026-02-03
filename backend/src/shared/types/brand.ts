/**
 * Nominal (branded) type helper.
 *
 * Use this to create *distinct* types that share the same runtime representation
 * (e.g. all are `string`), so TypeScript won’t let you accidentally mix them.
 *
 * Brands exist only at compile time — they do not change the runtime value.
 *
 * @template T The underlying (unbranded) type, e.g. `string`.
 * @template B A unique brand label, e.g. `"AccountId"`.
 *
 * @example
 * type AccountId = Brand<string, "AccountId">;
 * type CategoryId = Brand<string, "CategoryId">;
 *
 * declare const a: AccountId;
 * declare const c: CategoryId;
 */

export type Brand<T, B extends string> = T & { readonly __brand: B };
