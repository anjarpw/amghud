import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button, Settings } from "react-native";
import { StatusBar } from "react-native";
import Gauges from './src/gauges'
import { DrivingMode } from "./src/common";
import { RecoilRoot, useRecoilState } from 'recoil';
import { analogBrakeState, analogSteerState, analogThrottleState, cumulatedPowerState, leftMotorState, modeState, rightMotorState, turningLevelState } from "./src/state";
import { NavigationProvider, useNavigation } from "./src/navigationContext";
import BluetoothScreen from "./src/settings";
import { BluetoothProvider, useBluetoothContext } from "./src/useBluetooth";
import { throttle } from 'lodash'

const MENU_WIDTH = 70

const AppContent = () => {
  const {
    proceedToFindDeviceAndConnect,
    checkConnection,
    device
} = useBluetoothContext();


  const [, setAnalogSteer] = useRecoilState(analogSteerState);
  const [, setAnalogThrottle] = useRecoilState(analogThrottleState);
  const [, setAnalogBrake] = useRecoilState(analogBrakeState);
  const [, setCumulatedPower] = useRecoilState(cumulatedPowerState);
  const [, setTurningLevel] = useRecoilState(turningLevelState);
  const [, setLeftMotor] = useRecoilState(leftMotorState);
  const [, setRightMotor] = useRecoilState(rightMotorState);
  const [, setMode] = useRecoilState(modeState);

  const throttledSetMode = throttle((v) => {
    setMode(v);
  }, 100);

  const throttledSetAnalogThrottle = throttle((v) => {
    setAnalogThrottle(v)
  }, 100)

  const throttledSetAnalogSteer = throttle((v) => {
    setAnalogSteer(v)
  }, 100)


  const throttledSetAnalogBrake = throttle((v) => {
    setAnalogBrake(v)
  }, 100)

  const throttledSetCumulatedPower = throttle((v) => {
    setCumulatedPower(v)
  }, 100)

  const throttledSetTurningLevel = throttle((v) => {
    setTurningLevel(v)
  }, 100)

  const throttledSetLeftMotor = throttle((v) => {
    setLeftMotor(v)
  }, 100)

  const throttledSetRightMotor = throttle((v) => {
    setRightMotor(v)
  }, 100)

  const drivingModes: DrivingMode[] = ['T', 'P', 'R', 'D', 'S', 'S+', 'S', 'D', 'R', 'P'];

  const { registerOnDataReceivedById, unregisterOnDataReceivedById } = useBluetoothContext()

  const handleDataReceived = (message: string) => {
    const splittedString = message.split('=')
    if (splittedString.length == 0) {
      return
    }
    let [key, value] = splittedString
    value = value ? value.trim() : ""
    switch (key) {
      case 'MODE':
        if (drivingModes.indexOf(value as DrivingMode) == -1) {
          throttledSetMode("P")
        } else {
          throttledSetMode(value as DrivingMode)
        }
        break
      case 'ANALOG_THROTTLE':
        throttledSetAnalogThrottle(Math.min(parseFloat(value) / 500, 1))
        break
      case 'ANALOG_BRAKE':
        throttledSetAnalogBrake(Math.min(parseFloat(value) / 500, 1))
        break
      case 'ANALOG_STEER':
        let v = parseFloat(value)
        if (v > 1024) {
          v = 1024
        }
        if (v < 0) {
          v = 0
        }
        throttledSetAnalogSteer((512 - v) / 512)
        break
      case 'CUMULATED_POWER':
        throttledSetCumulatedPower(parseFloat(value))
        break
      case 'TURNING_LEVEL':
        throttledSetTurningLevel(parseFloat(value))
        break
      case 'LEFT_MOTOR':
        throttledSetLeftMotor(parseFloat(value) / 255)
        break
      case 'RIGHT_MOTOR':
        throttledSetRightMotor(parseFloat(value) / 255)
        break
    }
  };

  useEffect(() => {
    const id = "RECOIL"
    registerOnDataReceivedById(id, handleDataReceived)
    console.log("REGISTER SETTING CALLBACK")
    return () => unregisterOnDataReceivedById(id)
  }, [])


  
  useEffect(() => {
    let isConnecting = false
    const interval = setInterval(async () => {
      if(isConnecting){
        return;
      }
      const isConnected = await checkConnection()

      if(!isConnected){
        isConnecting = true        
        await proceedToFindDeviceAndConnect(5000)
        isConnecting = false
      }
    }, 1000);
    return () => clearInterval(interval)
  }, [device])


  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     throttledSetAnalogThrottle(Math.random()*1)
  //     throttledSetAnalogBrake(Math.random()*1)
  //     throttledSetCumulatedPower(Math.random())
  //     throttledSetLeftMotor(Math.random()*2-1)
  //     throttledSetRightMotor(Math.random()*2-1)
  //     throttledSetTurningLevel(Math.random()*2-1)
  //     throttledSetAnalogSteer(Math.random()*2-1)
  //   },100);
  //   return () => clearInterval(interval)
  // }, [])

  // useEffect(() => {
  //   let i = 0
  //   const interval = setInterval(() => {
  //     const mode = drivingModes[i]
  //     throttledSetMode(mode)
  //     i = (i+1) % (drivingModes.length)
  //   },500);
  //   return () => clearInterval(interval)
  // }, [])


  const { screen, navigate } = useNavigation();
  useEffect(() => {
    navigate("Main")
  }, [])
  return (
    <View style={styles.content}>
      {/* Render the active screen */}
      <View style={{ flex: 1 }}>
        {screen === "Main" && <Gauges />}
        {screen === "Settings" && <BluetoothScreen />}
      </View>

      {/* Navigation buttons - Aligned to the right */}
      <View style={styles.drawer}>
        <TouchableOpacity onPress={() => navigate("Main")} style={styles.drawerButton}>
          <Text style={styles.drawerLabel}>Main</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigate("Settings")} style={styles.drawerButton}>
          <Text style={styles.drawerLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: "black",
    flexDirection: 'row'
  },
  drawer: {
    flexDirection: "column",
    alignItems: "flex-end",
    width: 50
  },
  drawerLabel: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    transform: [{ rotate: "90deg" }, { translateY: 15 }], // Rotate text
    margin: 0,
    padding: 0,
    width: 100,
    textAlign: "center",
  },
  drawerButton: {
    width: MENU_WIDTH, // Full width for buttons
    height: 100, // Large enough to tap easily
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#036",
    padding: 0,
    margin: 0,
    marginVertical: 2, // Tiny gap between buttons
    overflow: 'visible',
  },
});

const App = () => (
  <RecoilRoot>
    <BluetoothProvider>
      <NavigationProvider>
        <StatusBar hidden={true}></StatusBar>
        <AppContent />
      </NavigationProvider>
    </BluetoothProvider>
  </RecoilRoot>
)

export default App;