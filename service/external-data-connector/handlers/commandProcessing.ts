import { ExternalDeviceMessage, isGeoJsonPoint, makeGeometryPoint,  } from "../ExternalDeviceMessage";
import { MessageProcessingPipleing } from "../MessagePipeline";
import { PipelineData } from "../tableStorageHelper";
import { isString } from "../validation";


export function makeCommonMessageProcessor(pipeline: MessageProcessingPipleing<ExternalDeviceMessage, PipelineData>): void {
  pipeline
    .withHandler(commonTypeConversions)
}


function commonTypeConversions(msg: ExternalDeviceMessage, prev: PipelineData) {
  const result = { ...prev };

  const { current } = msg.state;
  if (isGeoJsonPoint(current.location)) {
    const pt = makeGeometryPoint(current.location);
    result.latitude = pt.lat;
    result.longitude = pt.lon;
  }
  if (isGeoJsonPoint(result.location)) {
    delete result.location;
  }

  if (isString(current.gps_fix_timestamp)) {
    result.gps_fix_timestamp = new Date(current.gps_fix_timestamp);
  }

  return result;
}
