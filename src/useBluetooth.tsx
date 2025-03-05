import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BleManager, Device, Characteristic, Service } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { Buffer } from 'buffer'
const BLE_DEVICE_NAME = "ESP32_BLE_AMG";

type ServiceCharacteristic = {
  characteristic: Characteristic
  service: Service
}

export const useBluetooth = () => {
  const [manager] = useState(new BleManager());
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [bleStatus, setBleStatus] = useState<string>("");
  const [writableSC, setWritableSC] = useState<ServiceCharacteristic>()
  const deviceRef = useRef<Device | null>(null);
  const isConnectedRef = useRef<boolean | null>(null);
  const writableSCRef = useRef<ServiceCharacteristic | null>(null)


  const updateDevice = (device: Device | null) => {
    deviceRef.current = device
    setDevice(device)
  }
  const updateIsConnected = (isConnected: boolean) => {
    isConnectedRef.current = isConnected
    setIsConnected(isConnected)
  }

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);


  const reset = async() => {
    if (isConnectedRef.current) {
      try {
        await disconnectFromDevice()
      } catch {

      }
    }
    updateDevice(null)
    updateIsConnected(false)
    setBleStatus("")
  }

  const checkConnection = async () => {
    if(!deviceRef.current){
      updateIsConnected(false)
      return false
    }
    try {
      const isConnected = await manager.isDeviceConnected(deviceRef.current.id);
      updateIsConnected(isConnected)
      return isConnected
    } catch (error) {
      updateIsConnected(false)
      return false
    }
  }

  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted' &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 'granted'
      );
    }
    return true;
  };

  const scanForDevices = async (): Promise<Device | null> => {
    const permissionGranted = await requestPermissions();
    updateDevice(null)
    if (!permissionGranted) {
      Alert.alert('Permission denied', 'Bluetooth permissions are required to scan.');
      return null;
    }
    setBleStatus(`searching ${BLE_DEVICE_NAME}...`);
    const foundItems: string[] = [];

    return new Promise((resolve) => {
      manager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          setBleStatus(`failed to find ${BLE_DEVICE_NAME}`);
          resolve(null);
          return;
        }
        if (scannedDevice && scannedDevice.name) {
          foundItems.push(scannedDevice.name);
          setBleStatus(`Found so far: ${foundItems.join(', ')}, searching more...`);
        }
  
        if (scannedDevice && scannedDevice.name === BLE_DEVICE_NAME) {
          setBleStatus(`${BLE_DEVICE_NAME} is found`);
          updateDevice(scannedDevice);
          manager.stopDeviceScan();
          resolve(scannedDevice)
        }
      });
  
    })
  };

  const connectToDevice = async (onDataReceived: (char: Characteristic) => void) => {
    if (!deviceRef.current) return;
    try {
      setBleStatus(`connecting ${BLE_DEVICE_NAME}...`);
      const connectedDevice = await manager.connectToDevice(deviceRef.current.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      updateIsConnected(true);
      try {
        const sc = await findDeviceWithCertainServiceAndCharacteristic(deviceRef.current, c => c.isNotifiable)
        if (!sc) {
          throw "IsNotifiable Character is not found"
        }
        sc.characteristic.monitor((error, char) => {
          if (error) {
            return;
          }
          if (char) {
            onDataReceived(char); // Call the callback function provided by App.tsx
          }
        });
      } catch (error) {
      }
      try {
        const sc = await findDeviceWithCertainServiceAndCharacteristic(deviceRef.current, c => (c.isWritableWithResponse || c.isWritableWithoutResponse) && c.isNotifiable)
        if (!sc) {
          throw "isWritableWithResponse Character is not found"
        }
        setWritableSC(sc)
      } catch (error) {
      }
      setBleStatus(`${BLE_DEVICE_NAME} is connected`);
    } catch (error: any) {
      Alert.alert('Connection failed', error.message);
      setBleStatus(`failed to connect to ${BLE_DEVICE_NAME}`);
    }
  };

  const findDeviceWithCertainServiceAndCharacteristic = async (connectedDevice: Device, criteria: ((char: Characteristic) => boolean)): Promise<ServiceCharacteristic | null> => {
    const services = await connectedDevice.services();
    for (const service of services) {
      const characteristics = await service.characteristics();
      for (const characteristic of characteristics) {
        if (criteria(characteristic)) {
          return { characteristic, service }
        }
      }
    }
    return null
  }

  const disconnectFromDevice = async () => {
    if (deviceRef.current) {
      try {
        await manager.cancelDeviceConnection(deviceRef.current.id);
        updateIsConnected(false);
        setBleStatus(`${BLE_DEVICE_NAME} is disconnected`);
      } catch (error) {
        setBleStatus(`failed to disconnect from ${BLE_DEVICE_NAME}`);
      }
    }
  };


  const sendPingMessage = async (message: string) => {
    if (!deviceRef.current || !writableSCRef.current) {
      return;
    }

    try {
      await deviceRef.current.writeCharacteristicWithResponseForService(
        writableSCRef.current.service.uuid,
        writableSCRef.current.characteristic.uuid,
        Buffer.from(message).toString('base64')
      );
      console.log(`Sent: ${message}`);
    } catch (error) {
    }
  };

  return {
    reset,
    device,
    isConnected,
    bleStatus,
    sendPingMessage,
    checkConnection,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
  };
};

export type BluetoothContextProps = {
  device: Device | null,
  isConnected: boolean,
  bleStatus: string,
  checkConnection: () => Promise<boolean>
  reset: () => Promise<void>,
  sendPingMessage: (message: string) => Promise<void>
  scanForDevices: () => Promise<Device | null>,
  connectToDevice: () => Promise<void>,
  proceedToFindDeviceAndConnect: (timeout?: number) => Promise<void>,
  disconnectFromDevice: () => Promise<void>,
  registerOnDataReceivedById: (id: string, onDataReceived: MessageCallback) => void,
  unregisterOnDataReceivedById: (id: string) => void,
}

export type MessageCallback = (message: string) => void

const BluetoothContext = createContext<BluetoothContextProps>({} as BluetoothContextProps);
export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    device,
    isConnected,
    bleStatus,
    reset,
    scanForDevices,
    sendPingMessage,
    checkConnection,
    connectToDevice: legacyConnectToDevice,
    disconnectFromDevice,
  } = useBluetooth();

  const callbackMaps = useRef<Record<string, MessageCallback>>({});

  const connectToDevice = async () => {
    await legacyConnectToDevice((char: Characteristic) => {
      let message = ""
      if (char.value) {
        message = Buffer.from(char.value, 'base64').toString('utf-8')
      }
      Object.keys(callbackMaps.current).forEach((key) => {
        const callback: MessageCallback = callbackMaps.current[key]
        callback(message);
      });
    });
  };


  const registerOnDataReceivedById = (id: string, callback: MessageCallback) => {
    console.log("Registering CallbackMap", id)
    callbackMaps.current[id] = callback
  }
  const unregisterOnDataReceivedById = (id: string) => {
    console.log("Registering CallbackMap", id)
    delete callbackMaps.current[id]
  }

  const proceedToFindDeviceAndConnect = async (timeout?: number): Promise<void> => {
    try {
      timeout = timeout || 10000
      await reset()
      const foundDevice  = await scanForDevices()
      if(foundDevice){
        return new Promise(async (resolve, reject) => {
          setTimeout(() => reject(), timeout)
          const device = await connectToDevice()
          resolve(device)
        })
      }
    } catch (error) {
    }
  }

  return (
    <BluetoothContext.Provider
      value={{
        device,
        isConnected,
        bleStatus,
        scanForDevices,
        proceedToFindDeviceAndConnect,
        connectToDevice,
        checkConnection,
        disconnectFromDevice,
        registerOnDataReceivedById,
        unregisterOnDataReceivedById,
        sendPingMessage,
        reset,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetoothContext = () => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error("useBluetoothContext must be used within a BluetoothProvider");
  }
  return context;
};