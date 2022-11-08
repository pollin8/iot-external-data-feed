import { CurrentStateRow } from "./tableStorageHelper"

  export function partitionRows<T>(rows: Array<CurrentStateRow>): Record<string, Array<CurrentStateRow>> {
    // Seperate out into sets by partition key, cannot set multiple partions at once
    return rows.reduce<Record<string, Array<CurrentStateRow>>>(
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

