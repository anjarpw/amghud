import { atom } from "recoil";
import { DrivingMode } from "./common";

// Transmission Gear State
export const modeState = atom<DrivingMode>({
    key: "drivingModeState",
    default: "P",
});

// Speed State (Directly Affected by Gear Mode)
export const cumulatedPowerState = atom<number>({
    key: "cumulatedPowerState",
    default: 0,
});

// Speed State (Directly Affected by Gear Mode)
export const rightMotorState = atom<number>({
    key: "rightMotorState",
    default: 0,
});
export const leftMotorState = atom<number>({
    key: "leftMotorState",
    default: 0,
});

export const turningLevelState = atom<number>({
    key: "turningLevelState",
    default: 0,
});