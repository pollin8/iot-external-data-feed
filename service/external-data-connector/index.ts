import { Context } from "@azure/functions";
import { TableService } from "azure-storage";

import { BINLEVEL_SCHEMA_URN, ExternalDeviceMessage, OYSTER_SCHEMA_URN, PEOPLECOUNTER_SCHEMA_URN } from "./ExternalDeviceMessage";
import { dedupeRows, partitionRows } from "./partionAndDedupTableData";
import { makeOutputMessages, SchemaBindings } from "./processDeviceMessage";
import { executeBatchInsertOrMergeEntity, makeTableStorageRow, makeTableStorageService } from "./tableStorageHelper";




// Replace with table names that are appropriate for you
// If you whish to store data for each device type in a seperate table (recommended) then use a unique table name per schema
// To disable storing data for a particulat configuration set the table name to undefined
// NOTE : These tables will not be created and must be pre-created with your azure subscription
const schemaToOutputBindingMapDemo: SchemaBindings = {
  [OYSTER_SCHEMA_URN]: { current: 'oyster', history: 'oysterHistory' },
  [BINLEVEL_SCHEMA_URN]: { current: 'binLevel', history: 'binLevelHistory' },
  [PEOPLECOUNTER_SCHEMA_URN]: { current: 'peopleCounter', history: 'peopleCounterHistory' },
};

const tenantBindings: Record<string, SchemaBindings> = {
  // Replace with your tenant urn, supplied by pollin8, data is pre filtered but provides
  // the ability to handle data from more than one tenant should the need arise
  'urn:p8:tenant:demo': schemaToOutputBindingMapDemo,
}

const STORAGE_ACCOUNT_CONNECTION = process.env.StorageAccount
let tableStorageService: TableService

export async function clientDataFeedConsumer(context: Context, eventHubMessages: Array<string>) {
  const version_tag = "1.0.0"
  const serviceTag = 'external-data-feed';
  const log = (context.log!.info || console.log);

  log(`[${serviceTag}}] ***********************START*********${version_tag}*********`);
  log('Function triggered to process messages: ', eventHubMessages.length);

  try {
    context.log(`STORAGE_ACCOUNT_CONNECTION -  ${STORAGE_ACCOUNT_CONNECTION ? 'Found' : 'Missing Exiting'}`);
    if (!STORAGE_ACCOUNT_CONNECTION) throw new Error('STORAGE_ACCOUNT_CONNECTION Missing, Named:StorageAccount')

    if (!eventHubMessages || eventHubMessages.length === 0) return


    // eventHubMessages.forEach((message, index) => {
    //   context.log(`EnqueuedTimeUtc = ${context.bindingData.enqueuedTimeUtcArray[index]}`);
    //   context.log(`SequenceNumber = ${context.bindingData.sequenceNumberArray[index]}`);
    //   context.log(`Offset = ${context.bindingData.offsetArray[index]}`);
    // });

    context.log(`Batch Size: ${eventHubMessages.length}`)

    const inputMessages = eventHubMessages
      .map(parseMessage)
      .filter(isExternalDeviceMessage);

    const outputs = makeOutputMessages(tenantBindings, inputMessages, context.log);
    const outputTablesNames = Object.keys(outputs)
    context.log(`[${serviceTag}}] - Number of Outputs:${outputTablesNames.length}, Total Rows:${eventHubMessages.length}`)
    if (outputTablesNames.length === 0) return

    tableStorageService = tableStorageService || makeTableStorageService(STORAGE_ACCOUNT_CONNECTION!)

    const results: Array<TableService.BatchResult> = []
    for (const outputTable in outputs) {
      const partitionedRows = partitionRows(outputs[outputTable])
      for (const partition in partitionedRows) {
        const storageTableRow = dedupeRows(partitionedRows[partition])
          .map(row => makeTableStorageRow(row))

        const batchResult = await executeBatchInsertOrMergeEntity(tableStorageService, outputTable, storageTableRow)
        batchResult.forEach(x => results.push(x))
      }
    }

    const success = results.filter(x => !x.error)
    const failed = results.filter(x => x.error).map(x => x.error)

    if (failed.length) {
      failed.forEach(failure => context.log.error(`[${serviceTag}}] - ${JSON.stringify(failure)}`))
      throw new Error(`Failed to write all batch data to table Storage, see error logs, Success: ${success.length} Failed:${failed.length} of ${results.length}`)
    }

    context.log.info(`[${serviceTag}] - Batch Result Successfull: ${success.length} of ${results.length}`);
  } catch (e) {
    context.log.error(e)
    context.log.error(`[${serviceTag}}] ************************  END:ERROR  *****************`)
    throw e
  }
}


function parseMessage(x: string) {
  const msg = JSON.parse(x);
  assertExternalDeviceMessage(msg, "FinctionInput validation Error: Not of expected type, ExternalDeviceMessage");
  return msg;
}

function isExternalDeviceMessage(data: unknown): data is ExternalDeviceMessage {
  const maybeData: Partial<ExternalDeviceMessage> = data as any
  return (maybeData.id && maybeData.device && maybeData.hardwareId && maybeData.state) ? true : false
}

function assertExternalDeviceMessage(message: string, data: unknown): asserts data is ExternalDeviceMessage {
  if (!isExternalDeviceMessage(data)) throw new Error(message)
}