import { Context } from "@azure/functions";
import { TableService } from "azure-storage";
import { clientDataFeedHandler, makeBindings } from "./clientDataFeedHandler";

import { SchemaBindings } from "./processDeviceMessage";
import { makeTableStorageService } from "./tableStorageHelper";



const version_tag = "1.0.0"
const serviceTag = 'external-data-feed';

const TENANT_ID = process.env.TenantId as string
const STORAGE_ACCOUNT_CONNECTION = process.env.StorageAccount as string

let tableStorageService: TableService
let tenantBindings: Record<string, SchemaBindings>

export async function clientDataFeedConsumer(context: Context, eventHubMessages: Array<string>) {

  const logger = context.log

  try {
    logger.info(`[${serviceTag}}] ***********************START*********${version_tag}*********`);
    logger.info('Function triggered to process messages: ', eventHubMessages.length);

    if (!TENANT_ID) {
      logger.error(`TENANT_ID -  Missing Exiting`);
      throw new Error('TENANT_ID Missing, Named:TenantId')
    }

    if (!STORAGE_ACCOUNT_CONNECTION) {
      logger.error(`STORAGE_ACCOUNT_CONNECTION -  Missing Exiting`);
      throw new Error('STORAGE_ACCOUNT_CONNECTION Missing, Named:StorageAccount')
    }

    eventHubMessages.forEach((message, index) => {
      logger.verbose(`EnqueuedTimeUtc = ${context.bindingData.enqueuedTimeUtcArray[index]}`);
      logger.verbose(`SequenceNumber = ${context.bindingData.sequenceNumberArray[index]}`);
      logger.verbose(`Offset = ${context.bindingData.offsetArray[index]}`);
    });

    tenantBindings = tenantBindings || makeBindings(TENANT_ID)
    tableStorageService = tableStorageService || makeTableStorageService(STORAGE_ACCOUNT_CONNECTION!)

    logger.info(`Batch Size: ${eventHubMessages.length}`)

    await clientDataFeedHandler(serviceTag, tenantBindings, tableStorageService, logger, eventHubMessages)
  } catch (e) {
    logger.error(e)
    logger.error(`[${serviceTag}}] ************************  END:ERROR  *****************`)
    throw e
  }
}