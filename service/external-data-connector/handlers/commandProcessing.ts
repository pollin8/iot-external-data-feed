import { ExternalDeviceMessage, isGeoJsonPoint, isString, makeGeometryPoint } from "../ExternalDeviceMessage";
import { MessageProcessingPipleing } from "../MessagePipeline";
import { CurrentStateRow } from "../tableStorageHelper";


export function makeCommonMessageProcessor(pipeline: MessageProcessingPipleing<ExternalDeviceMessage, CurrentStateRow>): void {
  pipeline
    .withHandler(commonTypeConversions)
}


function commonTypeConversions(msg: ExternalDeviceMessage, prev: CurrentStateRow) {
  const result = { ...prev };

  const { current } = msg.state;
  if (isGeoJsonPoint(current.location)) {
    const pt = makeGeometryPoint(current.location);
    result.latitude = pt.lat;
    result.longitude = pt.lon;
  }

  if (isString(current.gps_fix_timestamp)) {
    result.gps_fix_timestamp = new Date(current.gps_fix_timestamp);
  }

  return result;
}
