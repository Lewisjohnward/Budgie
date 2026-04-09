/**
 * Groups an array of items into an object, indexed by a key derived from each item.
 *
 * @template T - The type of items in the input array.
 * @template K - The type of the key, constrained to string or number.
 *
 * @param items - The array of items to group.
 * @param keyFn - A function that takes an item and returns its grouping key.
 *
 * @returns An object where each key is a grouping key and the corresponding value is
 *          an array of items that share that key.
 *
 * @example
 * const users = [{ id: 1, role: 'admin' }, { id: 2, role: 'user' }, { id: 3, role: 'admin' }];
 * const grouped = groupBy(users, user => user.role);
 * // grouped = {
 * //   admin: [{ id: 1, role: 'admin' }, { id: 3, role: 'admin' }],
 * //   user: [{ id: 2, role: 'user' }]
 * // }
 */

export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}
