import { CurrentStateRow } from "./tableStorageHelper"

  export function partitionRows<T>(rows: Array<CurrentStateRow>): Record<string, Array<CurrentStateRow>> {
    return rows.reduce(
        (prev, curr) => {
            if (!prev[curr.partitionKey]) prev[curr.partitionKey] = []
            prev[curr.partitionKey].push(curr)
            return prev
        },
        {}
    )
  }

  export function dedupeRows<T>(rows: Array<CurrentStateRow>): Array<CurrentStateRow> {
    const dedupledAndKeyed = rows.reduce<Record<string, CurrentStateRow>>((prev, curr) => {
        prev[curr.rowKey] = curr
        return prev
    }, {})

    return Object.keys(dedupledAndKeyed).map(key => dedupledAndKeyed[key])
  }

