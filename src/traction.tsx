import React, { useEffect, useState } from "react";
import { G, Path, Text, SvgXml, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import carSvgData from "./../assets/svg/car"
import Animated, { useAnimatedProps, useSharedValue } from "react-native-reanimated";
import { ColorValue } from "react-native";
import LinearScale from "./linearScale";


const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedText = Animated.createAnimatedComponent(Text)
const AnimatedRect = Animated.createAnimatedComponent(Rect)



export type TractionProps = {
    size: number
    turningLevel: number
    leftMotor: number
    rightMotor: number
}
export type TractionBarProps = {
    size: number
    value: number
}
const powerMarker = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
const powerMajorMarker = [-5, 0, 5]

const TractionBar = (props: TractionBarProps) => {

    const { size, value } = props
    useEffect(() => {
        console.log('🟢 TractionBar Mounted');
        return () => console.log('🔴 TractionBar Unmounted');
    }, []);
    
    const sharedValue = useSharedValue(1)
    useEffect(() => {
        sharedValue.set(value)
        console.warn(sharedValue.value)
    }, [value])
    const powerThickness = size * 0.6
    const barProps = useAnimatedProps(() => ({
        transform: [{ scaleY: -sharedValue.get() }], // Better than animating height,
        fill: `url(#${sharedValue.get() > 0 ? 'positivePowerTraction' : 'negativePowerTraction'})`
    }));

    return (<>
        <AnimatedRect x={0} y={0} width={powerThickness} height={size / 2} animatedProps={barProps} />
        <G x={0} y={-size / 2} transform={`rotate(90) scale(1,-1)`} opacity={0.5}>
            <LinearScale size={size} markers={powerMarker} majorMarkers={powerMajorMarker} majorRuleSize={20} superMajorMarkers={[0]}></LinearScale>
        </G>
    </>)
}

const Traction = (props: TractionProps) => {
    const { size, leftMotor, rightMotor, turningLevel } = props
    useEffect(() => {
        console.log('🟢 Traction Mounted');
        return () => console.log('🔴 Traction Unmounted');
    }, []);
    const carSize = size * 0.8

    return (
        <>
            <Defs>
                <LinearGradient id="blackShade" x1="100%" y1="0%" x2="0%" y2="0%">
                    <Stop offset="100%" stopColor="#000" stopOpacity="0" />
                    <Stop offset="65%" stopColor="#000" stopOpacity="1" />
                    <Stop offset="35%" stopColor="#000" stopOpacity="1" />
                    <Stop offset="0%" stopColor="#000" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="positivePowerTraction" x1="0%" y1="100%" x2="0%" y2="0%">
                    <Stop offset="0%" stopColor="#3ef" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#0df" stopOpacity="0.3" />
                </LinearGradient>
                <LinearGradient id="negativePowerTraction" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#c3c" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#909" stopOpacity="0.3" />
                </LinearGradient>
            </Defs>
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


        </>
    );
};

export default Traction;