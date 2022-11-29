import { Thespian, TMocked } from "thespian"
import { clientDataFeedHandler, makeBindings } from "./clientDataFeedHandler"
import { TableService } from "azure-storage"
import { Logger } from "@azure/functions"
import { makeTableStorageService } from "./tableStorageHelper"
import { assertThat, match } from "mismatched"

describe("clientDataFeedHandler", () => {
    let thespian: Thespian
    let mockTableService: TMocked<TableService>
    const developmentConnectionString = 'UseDevelopmentStorage=true'
    const msg = [{
        "id": "1de45f84-9388-417c-8d3d-145461984f2b",
        "hardwareId": "12000886",
        "timestamp": "2022-11-29T04:48:40.000Z",
        "tenantUrn": "urn:p8:tenant:waipa-dc",
        "deviceUrn": "urn:p8:tenant:waipa-dc:device:victoria-st-roundabout-footpath",
        "schemaUrn": "urn:p8:schema:peoplesense",
        "state": {
            "current": {
                "BatteryVoltage": 7,
                "Delta": 14,
                "location": {
                    "type": "Point",
                    "coordinates": [
                        175.46642107737463,
                        -37.88868771997175
                    ]
                },
                "TotalCount": 345921,
                "address": "117 Victoria Street, Cambridge, Cambridge 3434",
                "locality": "Cambridge"
            }
        }
    },
    {
        "id": "7a8d9192-84a7-4bfe-9222-5f57e9bd12a4",
        "hardwareId": "02001384",
        "timestamp": "2022-11-29T04:57:25.000Z",
        "tenantUrn": "urn:p8:tenant:waipa-dc",
        "deviceUrn": "urn:p8:tenant:waipa-dc:device:1-maungatautari-road",
        "schemaUrn": "urn:p8:schema:peoplesense",
        "state": {
          "current": {
            "BatteryVoltage": 6.9,
            "Delta": 10,
            "location": {
              "type": "Point",
              "coordinates": [
                175.48134202041396,
                -37.912336764494846
              ]
            },
            "TotalCount": 257946,
            "address": "1 Maungatautari Road, Leamington, Cambridge 3432",
            "locality": "Leamington"
          }
        }
      }]

    beforeAll(() => {})

    beforeEach(async () => {
        thespian = new Thespian()
        mockTableService = thespian.mock("tableService")

        const tenant = "urn:p8:tenant:xx"
        const bindings = makeBindings(tenant)
        const localTableService = makeTableStorageService(developmentConnectionString)
        const promises = Object.values(bindings[tenant]).map(async (x) => {
            if(x.current) {
                const table = x.current
                await deleteTable(localTableService, table)
                await createTable(localTableService, table)
            }
            if(x.history) {
                const table = x.history
                await deleteTable(localTableService, table)
                await createTable(localTableService, table)
            }
        })

        return Promise.all(promises)
    })

    afterEach(() => thespian.verify())


    it("Processes messages", async () => {

        const bindings = makeBindings("urn:p8:tenant:waipa-dc")
        const logger = makeConsoleServiceLogger()
        const localTableService = makeTableStorageService(developmentConnectionString)

        const eventHubMessages = msg.map(x => JSON.stringify(x))
        const results = await clientDataFeedHandler("test", bindings, localTableService, logger, eventHubMessages)
        assertThat(results).is(match.array.length(2* eventHubMessages.length))
    })

    function makeConsoleServiceLogger(): Logger {
        const defaultLog = (data: any[]) => console.info(data)
        defaultLog.error = console.error
        defaultLog.warn = console.warn
        defaultLog.info = console.info
        defaultLog.verbose = console.debug

        return defaultLog;
    }

    function createTable(srv: TableService, name:string) : Promise<void>{
        return new Promise<void>(
            (resolve, reject) => srv.createTableIfNotExists(
                name,
                {},
                (error) => error ? reject(error) : resolve()
            )
        )
    }

    function deleteTable(srv: TableService, name:string) : Promise<void>{
        return new Promise<void>(
            (resolve, reject) => srv.deleteTableIfExists(
                name,
                {},
                (error) => error ? reject(error) : resolve()
            )
        )
    }


})