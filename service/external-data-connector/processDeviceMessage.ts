import { ExternalDeviceMessage, OYSTER_SCHEMA_URN, PEOPLECOUNTER_SCHEMA_URN } from "./ExternalDeviceMessage";
import { MessageProcessingPipleing } from "./MessagePipeline";
import { CurrentStateRow } from "./tableStorageHelper";
import { makeDemoMessageProcessor } from "./handlers/demo/demoHandler";
import { makeCommonMessageProcessor } from "./handlers/commandProcessing";


export type SchemaMapping = {current: string | undefined, history: string | undefined}
export type SchemaBindings = Record<string, SchemaMapping>


const pipline = new MessageProcessingPipleing<ExternalDeviceMessage, CurrentStateRow>(initialisePipeline)
  .initialiseHandler(makeCommonMessageProcessor)
  .initialiseHandler(makeDemoMessageProcessor)



// Forward each message to the correct output binging keyed of the schema name
export function makeOutputMessages(
  tenantBindingMap:  Record<string, SchemaBindings>,
  forwardedMessages: Array<ExternalDeviceMessage>,
  logger: (...args: any[]) => void
): Record<string, Array<CurrentStateRow>> {
  const serviceTag = makeOutputMessages.name
  const outputBindings: Record<string, Array<CurrentStateRow>> = {}

  forwardedMessages.forEach(msg => {
    const schemaToOutputBindingMap = tenantBindingMap[msg.tenantUrn]
    const outputBinding = schemaToOutputBindingMap ? schemaToOutputBindingMap[msg.schemaUrn] : undefined

    if (outputBinding) {
      const {current, history} = outputBinding
      if(current || history){
        // logger(`[${serviceTag}] Found Matching binding: Tenant:${msg.tenantUrn}, Schema:${msg.schemaUrn}, Binding: ${JSON.stringify(outputBinding)}`);

        const convertedMessage = pipline.handle(msg)
        if (convertedMessage) {

          if(current){
            if (!outputBindings[current]) outputBindings[current] = [];
            outputBindings[current].push(convertedMessage)
          }

          if(history){
            if (!outputBindings[history]) outputBindings[history] = [];

            // To make history set partition as deviceUrn / rowKey
            // Set row key to a unique id, preferrable from the message so idenpotent
            const historyMessage : CurrentStateRow = {
              ...convertedMessage,
              partitionKey: convertedMessage.rowKey,
              rowKey: msg.id
            }
            outputBindings[history].push(historyMessage)
          }

        }
      }
    } else {
      logger(`[${serviceTag}] No Match found Schema:${msg.schemaUrn} - Ignoring`);
    }
  })

  return outputBindings
}



function initialisePipeline(msg: ExternalDeviceMessage): CurrentStateRow {
  switch (msg.schemaUrn) {
    case OYSTER_SCHEMA_URN:
    case PEOPLECOUNTER_SCHEMA_URN:
      return flatternData(msg.schemaUrn, msg.deviceUrn, msg);

    default:
      return flatternData(msg.schemaUrn, msg.deviceUrn, msg);
  }
}


function flatternData(partitionKey: string, rowKey: string, msg: ExternalDeviceMessage): CurrentStateRow {

  const result: CurrentStateRow = ({
    // This means we can query for all messages by device
    partitionKey: partitionKey,
    rowKey: rowKey,

    tenantUrn: msg.tenantUrn,
    schemaUrn: msg.schemaUrn,
    receivedAt: new Date(msg.timestamp),
    deviceUrn: msg.deviceUrn,
    hardwareId: msg.hardwareId,
    ...msg.state.current,
  })


  return result;
}

