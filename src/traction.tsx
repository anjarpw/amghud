import React, { useEffect, useState } from "react";
import { G, Path, Text, SvgXml, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import carSvgData from "./../assets/svg/car"
import Animated, { useAnimatedProps, useDerivedValue, useFrameCallback, useSharedValue } from "react-native-reanimated";
import LinearScale from "./linearScale";
import { computeTransition, interpolateValue } from "./common";
import { analogSteerState } from "./state";

const AnimatedPath = Animated.createAnimatedComponent(Path)

export type TractionProps = {
    size: number
    turningLevel: number
    analogSteer: number
    leftMotor: number
    rightMotor: number
}
export type TractionBarProps = {
    size: number
    value: number
}
const powerMarker = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
const powerMajorMarker = [-5, 0, 5]
const steerMarker = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
const steerMajorMarker = [-5, -1, 1, 5]

export type TurningLevelProps = {
    turningLevel: number
    analogSteer: number
    size: number
}

const TurningLevelBar = (props: TurningLevelProps) => {

    const { size, turningLevel, analogSteer } = props
    useEffect(() => {
        console.log('🟢 TurningLevelBar Mounted');
        return () => console.log('🔴 TurningLevelBar Unmounted');
    }, []);
    const transitionProgress = useSharedValue(0); // Interpolation progress

    const displayedTurningLevel = useSharedValue(0)
    const currentTurningLevel = useSharedValue(0)
    const previousTurningLevel = useSharedValue(0)

    const displayedAnalogSteer = useSharedValue(0)
    const currentAnalogSteer = useSharedValue(0)
    const previousAnalogSteer = useSharedValue(0)

    const n = 5
    useFrameCallback(() => {
        const x = computeTransition(n, transitionProgress)
        console.log(displayedAnalogSteer, displayedTurningLevel)
        displayedTurningLevel.set(interpolateValue(previousTurningLevel.get(), currentTurningLevel.get(), x))
        displayedAnalogSteer.set(interpolateValue(previousAnalogSteer.get(), currentAnalogSteer.get(), x))
    });

    useEffect(() => {
        previousTurningLevel.set(displayedTurningLevel.get())
        currentTurningLevel.set(turningLevel)
        previousAnalogSteer.set(displayedAnalogSteer.get())
        currentAnalogSteer.set(analogSteer)
        transitionProgress.set(0)
    }, [turningLevel,analogSteer])

    const triangleD = `M 0 2 L ${size * 0.03} ${size * 0.05} L ${-size * 0.03} ${size * 0.05} L 0 2`
    const invertedTriangleD = `M 0 -2 L ${size * 0.03} ${size * -0.05} L ${-size * 0.03} ${size * -0.05} L 0 -2`

    const turningLevelBarProps = useAnimatedProps(() => {
        return {
            transform: [{ translateX: displayedTurningLevel.get() * size / 2 }]
        }
    });
    const analogSteerBarProps = useAnimatedProps(() => {
        return {
            transform: [{ translateX: displayedAnalogSteer.get() * size / 2 }]
        }
    });

    return (<>
        <Rect x={-size * 0.5} y={-size*0.1} width={size} height={size * 0.1} fill="url(#steerShade)" />
        <G x={-size/2} transform={`scale(1,-1)`} opacity={0.5}>
            <LinearScale size={size} markers={steerMarker} majorMarkers={steerMajorMarker} majorRuleSize={size * 0.1}></LinearScale>
        </G>
        <AnimatedPath animatedProps={turningLevelBarProps} fill="white" d={triangleD}></AnimatedPath>
        <AnimatedPath animatedProps={analogSteerBarProps} fill="red" d={invertedTriangleD}></AnimatedPath>

    </>)
}


const TractionBar = (props: TractionBarProps) => {

    const { size, value } = props
    useEffect(() => {
        console.log('🟢 TractionBar Mounted');
        return () => console.log('🔴 TractionBar Unmounted');
    }, []);
    const transitionProgress = useSharedValue(0); // Interpolation progress

    const displayedValue = useSharedValue(0)
    const currentValue = useSharedValue(0)
    const previousValue = useSharedValue(0)


    const n = 5
    useFrameCallback(() => {

        const x = computeTransition(n, transitionProgress)
        displayedValue.set(interpolateValue(previousValue.get(), currentValue.get(), x))
        //console.log("DISPLAY", previousValue.get(), currentValue.get(), x, displayValue.get())
    });

    useEffect(() => {
        previousValue.set(displayedValue.get())
        currentValue.set(value)
        transitionProgress.set(0)

    }, [value])


    const powerThickness = size * 0.6
    const positiveBarProps = useAnimatedProps(() => {
        if (displayedValue.get() < 0) {
            return { d: 'M 0 0' }
        }
        const x1 = 0, x2 = powerThickness, y1 = 0, y2 = -displayedValue.get() * size / 2
        return {
            d: `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} L ${x1} ${y1}`
        }
    });
    const negativeBarProps = useAnimatedProps(() => {
        if (displayedValue.get() > 0) {
            return { d: 'M 0 0' }
        }
        const x1 = 0, x2 = powerThickness, y1 = 0, y2 = -displayedValue.get() * size / 2
        return {
            d: `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} L ${x1} ${y1}`
        }
    });

    return (<>
        <AnimatedPath fill={`url(#positivePowerTraction)`} x={0} y={0} animatedProps={positiveBarProps} />
        <AnimatedPath fill={`url(#negativePowerTraction)`} x={0} y={0} animatedProps={negativeBarProps} />
        <G x={0} y={-size / 2} transform={`rotate(90) scale(1,-1)`} opacity={0.5}>
            <LinearScale size={size} markers={powerMarker} majorMarkers={powerMajorMarker} majorRuleSize={size * 0.1} superMajorMarkers={[0]}></LinearScale>
        </G>
    </>)
}

const Traction = (props: TractionProps) => {
    const { size, leftMotor, rightMotor, turningLevel, analogSteer } = props
    useEffect(() => {
        console.log('🟢 Traction Mounted');
        return () => console.log('🔴 Traction Unmounted');
    }, []);
    const carSize = size * 0.8


    return (
        <>
            <Defs>
                <LinearGradient id="powerShade" x1="100%" y1="0%" x2="0%" y2="0%">
                    <Stop offset="100%" stopColor="#036" stopOpacity="1" />
                    <Stop offset="50%" stopColor="#036" stopOpacity="0" />
                    <Stop offset="0%" stopColor="#036" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="steerShade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="100%" stopColor="#036" stopOpacity="1" />
                    <Stop offset="0%" stopColor="#036" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="blackShade" x1="100%" y1="0%" x2="0%" y2="0%">
                    <Stop offset="100%" stopColor="#000" stopOpacity="0" />
                    <Stop offset="55%" stopColor="#000" stopOpacity="1" />
                    <Stop offset="45%" stopColor="#000" stopOpacity="1" />
                    <Stop offset="0%" stopColor="#000" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="positivePowerTraction" x1="0%" y1="100%" x2="0%" y2="0%">
                    <Stop offset="100%" stopColor="#3ef" stopOpacity="1" />
                    <Stop offset="0%" stopColor="#0df" stopOpacity="0.3" />
                </LinearGradient>
                <LinearGradient id="negativePowerTraction" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="100%" stopColor="#c3c" stopOpacity="1" />
                    <Stop offset="0%" stopColor="#909" stopOpacity="0.3" />
                </LinearGradient>
            </Defs>
            <Rect x={-carSize * 0.6} y={-carSize * 0.6} width={carSize * 1.2} height={carSize} fill="url(#powerShade)" />
            <G x={-carSize * 0.6} y={-carSize * 0.1}>
                <TractionBar size={carSize} value={leftMotor}></TractionBar>
            </G>
            <G x={carSize * 0.6} y={-carSize * 0.1} transform={`scale(-1,1)`}>
                <TractionBar size={carSize} value={rightMotor}></TractionBar>
            </G>
            <Rect x={-carSize * 0.5} y={-carSize * 0.6} width={carSize * 1} height={carSize} fill="url(#blackShade)" />
            <G transform={`translate(${-carSize * 0.5} ${carSize * 0.4}) rotate(-90)`}>
                {carSvgData ? <SvgXml xml={carSvgData} width={carSize} height={carSize} /> : null}
            </G>
            <G transform={`translate(0 ${size * 0.5})`}>
                <TurningLevelBar size={size * 0.8} turningLevel={turningLevel} analogSteer={analogSteer}></TurningLevelBar>
            </G>




        </>
    );
};

export default Traction;