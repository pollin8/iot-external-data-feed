import { createTableService, ExponentialRetryPolicyFilter, TableBatch, TableService, TableUtilities } from "azure-storage";
import { isNumber, isBoolean, isDate, isString, isInteger } from "./validation"

type RowTypes = string | boolean | Date | number | object
export type PipelineData = Record<string, RowTypes>

export type CurrentStateRow = {
  partitionKey: string,
  rowKey: string
} & PipelineData;


export function makeTableStorageService(connection: string): TableService {
  var retryOperations = new ExponentialRetryPolicyFilter();
  var tableSvc = createTableService(connection).withFilter(retryOperations);
  return tableSvc;
}


export function makeTableStorageRow(val: CurrentStateRow, typeHint: Record<string, {isDouble:boolean}> = {} ): Record<'PartitionKey' | 'RowKey' | string, TableUtilities.entityGenerator.EntityProperty<RowTypes>> {
  const entGen = TableUtilities.entityGenerator;

  const makeStorageFieldFromValue = (value: RowTypes, forceDouble: boolean = false): TableUtilities.entityGenerator.EntityProperty<RowTypes> => {

    if (isInteger(value) && !forceDouble) return entGen.Int32(value)
    if (isNumber(value)) return entGen.Double(value)
    if (isBoolean(value)) return entGen.Boolean(value)
    if (isDate(value)) return entGen.DateTime(value)
    if (isString(value)) return entGen.String(value)
    return entGen.String(JSON.stringify(value))
  }

  const rowDefaults: Record<string, TableUtilities.entityGenerator.EntityProperty<RowTypes>> = {
    PartitionKey: entGen.String(val.partitionKey),
    RowKey: entGen.String(val.rowKey),
  }

  const keys = Object.keys(val)
    .filter(key => key !== 'partitionKey' && key !== 'rowKey')


  return keys.reduce((acc, curr) => {
    acc[curr] = makeStorageFieldFromValue(val[curr], typeHint[curr]?.isDouble)
    return acc
  }, rowDefaults)
}



export function insertOrMergeEntity<T>(svc: TableService, table: string, entityDescriptor: T): Promise<TableService.EntityMetadata> {
  return new Promise<TableService.EntityMetadata>((resolve, reject) => {
    svc.insertOrMergeEntity(table, entityDescriptor, (error, result, response) => {
      if (error) reject({ error, response })
      resolve(result)
    })
  })
}

export function executeBatchInsertOrMergeEntity(svc: TableService, table: string, entityDescriptor: Array<object>): Promise<Array<TableService.BatchResult>> {

  var batch = new TableBatch();
  for (const row of entityDescriptor) {
    batch.insertOrMergeEntity(row)
  }
  
  return new Promise<Array<TableService.BatchResult>>((resolve, reject) => {
    svc.executeBatch(table, batch, (error, result, response) => {
      if (error) return reject({ error, response })
      resolve(result)
    })
  })
}