import { TableService } from "azure-storage";
import { CurrentStateRow, executeBatchInsertOrMergeEntity, insertOrMergeEntity, makeTableStorageRows, makeTableStorageService } from "./tableStorageHelper"

describe("tableStorageHelper", () =>{
  const localConenction = "UseDevelopmentStorage=true";  
  const tableName = "currentStateTest"

  let tableService: TableService
  
  beforeAll((done) =>{
    const connectionString = localConenction
    tableService = makeTableStorageService(connectionString)
    tableService.createTableIfNotExists(tableName, (error, result, response) => {
      if(!error){
        // Table exists or created
        return done(error)
      }

      return done()
    });

  })
  it('writes a row', ()=>{
    const row: CurrentStateRow = {
      partitionKey: "some-part-1",
      rowKey: "some-key-2",     
    }

    const singleRow = makeTableStorageRows(row)
    return insertOrMergeEntity(tableService, tableName, singleRow)
  })

  it('writes a row with complex data type', ()=>{
    const row: CurrentStateRow = {
      partitionKey: "some-part-1",
      rowKey: "some-key-2",
      location: {
        type: "Point",
        coordinates: [
          175.3328387,
          -38.0055714
        ]
      },
    }

    const singleRow = makeTableStorageRows(row)
    return insertOrMergeEntity(tableService, tableName, singleRow)
  })


  it('Writes a batch', ()=>{
    const rows = [{
      partitionKey: "some-part-1",
      rowKey: "some-key-2"
    },
    {
      partitionKey: "some-part-1",
      rowKey: "some-key-3"
    }].map(makeTableStorageRows)

    return executeBatchInsertOrMergeEntity(tableService, tableName, rows)
  })
})