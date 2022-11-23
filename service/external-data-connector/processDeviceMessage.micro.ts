import { Logger } from "@azure/functions";
import { assertThat, match } from "mismatched";
import { ExternalDeviceMessage, OYSTER_SCHEMA_URN } from "./ExternalDeviceMessage"
import { makeOutputMessages, SchemaBindings } from "./processDeviceMessage";
import { makeTableStorageRow } from "./tableStorageHelper";

describe('processDeviceMessage', () => {
  const logger = makeConsoleServiceLogger()
  const message: ExternalDeviceMessage = {
    id: "some-id-1",
    device: "device",
    hardwareId: "hwid",
    timestamp: "ts",
    tenantUrn: "tenant",
    deviceUrn: "deviceUrn",
    schemaUrn: OYSTER_SCHEMA_URN,
    state: {
      current: { test: 100 },
    }
  }

  const schemaToOutputBindingMap: SchemaBindings = {
    [OYSTER_SCHEMA_URN]: {current:"testOutput", history: 'outputHistory'},
  };

  const tenantMap = {
    tenant: schemaToOutputBindingMap
  }


  it('can read package version', ()=> {
    const packageData = require('./../package.json')
    assertThat(packageData).is(match.obj.has({version: match.ofType.string()}))

    const versionString: string = packageData.version
    const versionComponents = versionString.split('.')
    assertThat(versionComponents.length).is(match.number.greaterEqual(3))
  })

  describe('makeOutputMessages', () => {

    it('Produces an output', () => {
      const outputs = makeOutputMessages(tenantMap, [message], logger)

      assertThat(outputs).is(match.obj.has({
        testOutput: match.array.length(1)
      }))
    })

    it('Produces correct output message', () => {
      const outputs = makeOutputMessages(tenantMap, [message], logger)
      assertThat(outputs.testOutput[0]).is(match.obj.has({
        partitionKey: message.tenantUrn,
        rowKey: message.deviceUrn,
        test: 100,
      }))
    })

    describe('Output has expected keys', ()=>{
      let tenantBinding: Record<string, SchemaBindings>

      beforeEach(() =>{
        const schemaBinding: SchemaBindings = {
          [OYSTER_SCHEMA_URN]: {current:"testOutput", history: 'outputHistory'},
        };

        tenantBinding = {
          tenant: schemaBinding
        }

      })

      it('Current and history', () => {
        const outputs = makeOutputMessages(tenantBinding, [message], logger)
        const keys = Object.keys(outputs)
        assertThat(keys).is(["testOutput", "outputHistory"])
      })

      it('Current only', () => {
        tenantBinding[message.tenantUrn][OYSTER_SCHEMA_URN].history = undefined
        const outputs = makeOutputMessages(tenantBinding, [message], logger)
        const keys = Object.keys(outputs)
        assertThat(keys).is(["testOutput"])
      })


      it('History only', () => {
        tenantBinding[message.tenantUrn][OYSTER_SCHEMA_URN].current = undefined
        const outputs = makeOutputMessages(tenantBinding, [message], logger)
        const keys = Object.keys(outputs)
        assertThat(keys).is(["outputHistory"])
      })

      it('None', () => {
        tenantBinding[message.tenantUrn][OYSTER_SCHEMA_URN].current = undefined
        tenantBinding[message.tenantUrn][OYSTER_SCHEMA_URN].history = undefined
        const outputs = makeOutputMessages(tenantBinding, [message], logger)
        const keys = Object.keys(outputs)
        assertThat(keys).is([])
      })
    })



    it('makes expected rows', ()=>{
      const outputs = makeOutputMessages(tenantMap, [message], logger)
      const tableRows = Object.keys(outputs)
      .map(binding => outputs[binding])
      .flat()

      assertThat(tableRows).is(match.array.length(2))
      assertThat(tableRows[0]).is(match.obj.has({
        partitionKey: message.tenantUrn,
        rowKey: message.deviceUrn,
        test: 100,
      }))

      assertThat(tableRows[1]).is(match.obj.has({
        partitionKey: message.tenantUrn,
        rowKey: message.id,
        test: 100,
      }))
    })
  })

  describe('end to end test', ()=>{
    it('makes correct table entity', ()=>{
      const outputs = makeOutputMessages(tenantMap, [message], logger)
      const tableRows = Object.keys(outputs)
      .map(binding => outputs[binding])
      .flat()
      .map(x => makeTableStorageRow(x))

      assertThat(tableRows).is(match.array.length(2))
      assertThat(tableRows[0]).is(match.obj.has({
        PartitionKey: match.obj.has({}),
        RowKey: match.obj.has({}),
        test: match.obj.has({}),
      }))

      assertThat(tableRows[1]).is(match.obj.has({
        PartitionKey: match.obj.has({}),
        RowKey: match.obj.has({}),
        test: match.obj.has({}),
      }))

      tableRows.forEach(x => console.log(JSON.stringify(x)))

    })

  })

  function makeConsoleServiceLogger(): Logger {
    const defaultLog = (data: any[]) => console.info(data)
    defaultLog.error = console.error
    defaultLog.warn = console.warn
    defaultLog.info = console.info
    defaultLog.verbose = console.debug

    return defaultLog;
  }
})