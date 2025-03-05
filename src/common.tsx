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
        if(x > 1){
            x = 1
        }
        transitionProgress.set(x)
    } else if(x < 1){
        transitionProgress.set(1)
    }
    return x
}

export function noTransition(transitionProgress: SharedValue<number>){
    'worklet'
    if(transitionProgress.get() < 1){
        transitionProgress.set(1)
    }
}

export function fromRect(x: number, y: number, width: number, height: number){
    'worklet'
    const x2 = x + width
    const y2 = y + height
    return `M ${x} ${y} L ${x2} ${y} L ${x2} ${y2} L ${x} ${y2} L ${x} ${y}`
}
