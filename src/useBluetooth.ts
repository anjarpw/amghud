import { useState, useEffect } from 'react';
import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

const BLE_DEVICE_NAME = "ESP32_BLE_AMG";

export const useBluetooth = () => {
  const [manager] = useState(new BleManager());
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [bleStatus, setBleStatus] = useState<string>("");

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

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

  const scanForDevices = async () => {
    const permissionGranted = await requestPermissions();
    if (!permissionGranted) {
      Alert.alert('Permission denied', 'Bluetooth permissions are required to scan.');
      return;
    }

    setDevice(null);
    setBleStatus(`searching ${BLE_DEVICE_NAME}...`);
    const foundItems: string[] = [];

    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        setBleStatus(`failed to find ${BLE_DEVICE_NAME}`);
        console.error(error);
        return;
      }
      if (scannedDevice && scannedDevice.name) {
        foundItems.push(scannedDevice.name);
        setBleStatus(`Found so far: ${foundItems.join(', ')}, searching more...`);
      }

      if (scannedDevice && scannedDevice.name === BLE_DEVICE_NAME) {
        setBleStatus(`${BLE_DEVICE_NAME} is found`);
        setDevice(scannedDevice);
        manager.stopDeviceScan();
      }
    });
  };

  const connectToDevice = async (onDataReceived: (char: Characteristic) => void) => {
    if (!device) return;
    try {
      setBleStatus(`connecting ${BLE_DEVICE_NAME}...`);
      const connectedDevice = await manager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setIsConnected(true);
      startListeningForMessages(connectedDevice, onDataReceived);
      setBleStatus(`${BLE_DEVICE_NAME} is connected`);
    } catch (error: any) {
      Alert.alert('Connection failed', error.message);
      setBleStatus(`failed to connect to ${BLE_DEVICE_NAME}`);
    }
  };

  const disconnectFromDevice = async () => {
    if (device) {
      try {
        await manager.cancelDeviceConnection(device.id);
        setIsConnected(false);
        setBleStatus(`${BLE_DEVICE_NAME} is disconnected`);
      } catch (error) {
        console.error('Disconnect error:', error);
        setBleStatus(`failed to disconnect from ${BLE_DEVICE_NAME}`);
      }
    }
  };

  const startListeningForMessages = async (connectedDevice: Device, onDataReceived: (char: Characteristic) => void) => {
    try {
      const services = await connectedDevice.services();
      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const characteristic of characteristics) {
          if (characteristic.isNotifiable) {
            characteristic.monitor((error, char) => {
              if (error) {
                console.error('Monitor error:', error);
                return;
              }
              if (char) {
                onDataReceived(char); // Call the callback function provided by App.tsx
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };

  return {
    device,
    isConnected,
    bleStatus,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
  };
};
