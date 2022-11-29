import { Thespian, TMocked } from "thespian"
import { assertThat } from "mismatched"
import { clientDataFeedHandler, makeBindings } from "./clientDataFeedHandler"
import { TableService } from "azure-storage"
import { Logger } from "@azure/functions"
import { makeTableStorageService } from "./tableStorageHelper"

describe("clientDataFeedHandler", () => {
    let thespian: Thespian
    let mockTableService: TMocked<TableService>
    const developmentConnectionString = 'UseDevelopmentStorage=true'
    const msg = {
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
    }

    beforeAll(() => {
        const tenant = "urn:p8:tenant:xx"
        const bindings = makeBindings(tenant)
        const localTableService = makeTableStorageService(developmentConnectionString)
        const promises = Object.values(bindings[tenant]).map(async (x) => {
            if(x.current) await createTable(localTableService, x.current)
            if(x.history) await createTable(localTableService, x.history)
        })

        return Promise.all(promises)
    })
    beforeEach(() => {
        thespian = new Thespian()
        mockTableService = thespian.mock("tableService")
    })

    afterEach(() => thespian.verify())


    it("Processes messages", async () => {

        const bindings = makeBindings("urn:p8:tenant:waipa-dc")
        const logger = makeConsoleServiceLogger()
        const eventHubMessages = [JSON.stringify(msg)]

        const localTableService = makeTableStorageService(developmentConnectionString)
        await clientDataFeedHandler("test", bindings, localTableService, logger, eventHubMessages)
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
})