import { assertThat, match } from "mismatched";
import { CurrentStateRow, makeTableStorageRow } from "./tableStorageHelper"

describe("tableStorageHelper", () => {
  it('create a row with required fields', () => {
    const row: CurrentStateRow = {
      partitionKey: "some-part-1",
      rowKey: "some-key-2"
    }

    const singleRow = makeTableStorageRow(row)
    assertThat(singleRow).is({
      PartitionKey: { _: "some-part-1", $: "Edm.String" },
      RowKey: { _: "some-key-2", $: "Edm.String" }
    })
  })

  it('creates row with other values', () => {
    const row: CurrentStateRow = {
      partitionKey: "some-part-1",
      rowKey: "some-key-2",

      str: "string-val",
      num: 100,
      date: new Date(),
      flag: false,
      location: {
        type: "Point",
        coordinates: [
          175.3328387,
          -38.0055714
        ]
      },

    }

    const singleRow = makeTableStorageRow(row)
    assertThat(singleRow).is({
      PartitionKey: { _: "some-part-1", $: "Edm.String" },
      RowKey: { _: "some-key-2", $: "Edm.String" },
      str: { _: "string-val", $: "Edm.String" },
      num: { _: 100, $: "Edm.Int32" },
      date: { _: new Date(), $: "Edm.DateTime" },
      flag: { _: false, $: "Edm.Boolean" },
      location: {_: JSON.stringify(row.location), $: "Edm.String" }
    })
  })
})

