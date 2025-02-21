import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import { StatusBar } from "react-native";
import Gauges from './src/gauges'
import { CarStats, DrivingMode } from "./src/common";
import { RecoilRoot, atom, useRecoilState } from 'recoil';
import { cumulatedPowerState, leftMotorState, modeState, rightMotorState, turningLevelState } from "./src/state";
import { NavigationProvider, useNavigation } from "./src/navigationContext";

const MENU_WIDTH = 50

const AppContent = () => {
  const [modeShiftIndex, setModeShiftIndex] = useState(0);

  const [cumulatedPower, setCumulatedPower] = useRecoilState(cumulatedPowerState);
  const [turningLevel, setTurningLevel] = useRecoilState(turningLevelState);
  const [leftMotor, setLeftMotor] = useRecoilState(leftMotorState);
  const [rightMotor, setRightMotor] = useRecoilState(rightMotorState);
  const [mode, setMode] = useRecoilState(modeState);

  const drivingModes: DrivingMode[] = ['T', 'P', 'R', 'D', 'S', 'S+', 'S', 'D', 'R', 'P'];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % drivingModes.length; // Cycle through the modes
      setMode(drivingModes[index]);
    }, 3000); // Update every 1 second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      const cumulatedPower = Math.random()
      setCumulatedPower(cumulatedPower)
    }, 1000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      const turningLevel = Math.random()*2 - 1
      setTurningLevel(turningLevel)
      setLeftMotor(turningLevel >= 0 ? cumulatedPower: Math.abs(cumulatedPower * turningLevel))
      setRightMotor(turningLevel <= 0 ? cumulatedPower: Math.abs(cumulatedPower * turningLevel))
    }, 3000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);



  const SettingsScreen = () => (
    <View>
      <Text>Setting</Text>
    </View>
  );
  const { screen, navigate } = useNavigation();
  useEffect(() => {
    navigate("Main")
  }, [])
  return (
    <View style={styles.content}>
      {/* Render the active screen */}
      <View style={{ flex: 1 }}>
        {screen === "Main" && <Gauges />}
        {screen === "Settings" && <SettingsScreen />}
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
    transform: [{ rotate: "90deg" }], // Rotate text
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
    backgroundColor: "gray",
    padding: 0,
    margin: 0,
    marginVertical: 2, // Tiny gap between buttons
    overflow: 'visible',
  },
});

const App = () => (
  <RecoilRoot>
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  </RecoilRoot>
)

export default App;