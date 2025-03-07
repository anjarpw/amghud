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
export const analogSteerState = atom<number>({
    key: "analogSteerState",
    default: 0,
});
export const analogThrottleState = atom<number>({
    key: "analogThrottleState",
    default: 0,
});
export const analogBrakeState = atom<number>({
    key: "analogBrakeState",
    default: 0,
});