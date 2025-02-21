import { SharedValue } from "react-native-reanimated";

export type DrivingMode = 'T' | 'P' | 'R' | 'D' | 'S' | 'S+'

export type CarStats = {
    cumulatedPower: number,
    mode: DrivingMode
}

export const interpolateObject = function <T extends Record<string, number>>(from: T, to: T, progress: number): T {
    'worklet'
    const result: any = {};
    for (const key in from) {
        if (isNaN(to[key]) || isNaN(from[key])) {
            result[key] = from[key]
        } else {
            result[key] = (from[key] + (to[key] - from[key]) * progress)
        }
    }
    return result as T;
};
export const interpolateValue = function (from: number, to: number, progress: number): number {
    'worklet'
    return (from + (to - from) * progress);
};

export function computeTransition(n: number, transitionProgress: SharedValue<number>){
    'worklet'
    let x = transitionProgress.get()
    if (x < 1 - 0.01) {
        x += (1 - x) / n;
    } else {
        x = 1
    }
    transitionProgress.set(x)
    return x
}
