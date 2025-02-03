import { DeviceSelectorProps } from "../types/StateTypes";

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ selectDevice, devices }) => {

    return (
        <div className="device_selector">
            {
                devices.map((device: MediaDeviceInfo, index: number) => {
                    return (
                        <button key={index} onClick={() => {
                            selectDevice(device.deviceId);
                        }}>
                            {device.label}
                        </button>
                    )
                })
            }
        </div>
    )
}

export default DeviceSelector;