import { Logger } from "@azure/functions";
import { TableService } from "azure-storage";
import { partitionRows, dedupeRows } from "./partionAndDedupTableData";
import { SchemaBindings, makeOutputMessages } from "./processDeviceMessage";
import { makeTableStorageRow, executeBatchInsertOrMergeEntity } from "./tableStorageHelper";
import { BINLEVEL_SCHEMA_URN, ExternalDeviceMessage, OYSTER_SCHEMA_URN, PEOPLECOUNTER_SCHEMA_URN } from "./ExternalDeviceMessage";

const typeHints = {
    vbat: { isDouble: true },
    vext: { isDouble: true },
    BatteryVoltage: { isDouble: true },
  };

  export function makeBindings(tenantUrn: string, overrides?: Record<string, SchemaBindings>): Record<string, SchemaBindings> {
    if (!tenantUrn || tenantUrn === "urn:p8:tenant:<tenant-id>") throw new Error(`Environment variable 'tenantId' not configured: tenantId:${tenantUrn}`)

    // Replace with table names that are appropriate for you
    // If you whish to store data for each device type in a seperate table (recommended) then use a unique table name per schema
    // To disable storing data for a particulat configuration set the table name to undefined
    // NOTE : These tables will not be created and must be pre-created with your azure subscription
    const schemaToOutputBindingMap: SchemaBindings = {
      [OYSTER_SCHEMA_URN]: { current: 'currentOyster', history: 'historyOyster' },
      [BINLEVEL_SCHEMA_URN]: { current: 'currentBinLevel', history: 'historyBinLevel' },
      [PEOPLECOUNTER_SCHEMA_URN]: { current: 'currentPeopleSense', history: 'historyPeopleSense' },
    };

    // const tenantBindingOverrides: Record<string, SchemaBindings> = {
    //   // Replace custom tenantbindings here
    // }

    return {
      [tenantUrn]: schemaToOutputBindingMap,
      ...overrides
    }
  }



export async function clientDataFeedHandler(
    serviceTag: string,
    tenantBindings: Record<string, SchemaBindings>,
    tableStorageService: TableService,
    logger: Logger,
    eventHubMessages: Array<string>): Promise<Array<TableService.BatchResult>> {

    if (!eventHubMessages || eventHubMessages.length === 0) return []

    const inputMessages = eventHubMessages
      .map(parseMessage)
      .filter(isExternalDeviceMessage);


    const outputs = makeOutputMessages(tenantBindings, inputMessages, logger);
    const outputTablesNames = Object.keys(outputs)
    logger.info(`[${serviceTag}}] - Number of Outputs:${outputTablesNames.length}, Total Rows:${eventHubMessages.length}`)
    if (outputTablesNames.length === 0) return []

    const results: Array<TableService.BatchResult> = []
    for (const outputTable in outputs) {
      const partitionedRows = partitionRows(outputs[outputTable])
      for (const partition in partitionedRows) {
        const storageTableRow = dedupeRows(partitionedRows[partition])
          .map(row => makeTableStorageRow(row, typeHints))

        const batchResult = await executeBatchInsertOrMergeEntity(tableStorageService, outputTable, storageTableRow)
        batchResult.forEach(x => results.push(x))
      }
    }

    const success = results.filter(x => !x.error)
    const failed = results.filter(x => x.error).map(x => x.error)

    if (failed.length) {
      failed.forEach(failure => logger.error(`[${serviceTag}}] - ${JSON.stringify(failure)}`))
      throw new Error(`Failed to write all batch data to table Storage, see error logs, Success: ${success.length} Failed:${failed.length} of ${results.length}`)
    }

    logger.info(`[${serviceTag}] - Batch Result Successfull: ${success.length} of ${results.length}`);

    return  results
  }

  function parseMessage(x: string) : ExternalDeviceMessage{
    const msg = JSON.parse(x);
    assertExternalDeviceMessage("FunctionInput validation Error: Not of expected type, ExternalDeviceMessage", msg);
    return msg;
  }

  function isExternalDeviceMessage(data: unknown): data is ExternalDeviceMessage {
    const maybeData: Partial<ExternalDeviceMessage> = data as any
    return (maybeData.id && maybeData.deviceUrn && maybeData.hardwareId && maybeData.state) ? true : false
  }

  function assertExternalDeviceMessage(message: string, data: object): asserts data is ExternalDeviceMessage {
    if (!isExternalDeviceMessage(data)) throw new Error(message)
  }