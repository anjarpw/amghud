import React, { memo, useEffect, useMemo, useState } from 'react';
import Animated, { runOnJS, SharedValue, useAnimatedProps, useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { Defs, G, Line, LinearGradient, Path, Stop, Text } from 'react-native-svg';
import { computeTransition, DrivingMode, interpolateValue, noTransition } from '../common';
import { useRecoilValue } from 'recoil';
import { cumulatedPowerState } from '../state';

export type MainSpeedoProps = {
    size: number,
    mode: DrivingMode
    cumulatedPower: number
}
export type MainSpeedoType = {
    startAngle: number
    endAngle: number,
    min: number,
    max: number,
    step: number,
    redLine: number
}


const drivingModeDisplays: Array<MainSpeedoType & { type: DrivingMode }> = [
    {
        type: 'P',
        startAngle: -135,
        endAngle: 135,
        min: 0,
        max: 8,
        step: 1,
        redLine: 0

    },
    {
        type: 'T',
        startAngle: -45,
        endAngle: 45,
        min: 0,
        max: 8,
        step: 1,
        redLine: 4
    },
    {
        type: 'R',
        startAngle: -135,
        endAngle: 135,
        min: 0,
        max: 8,
        step: 1,
        redLine: 4
    },
    {
        type: 'D',
        startAngle: -135,
        endAngle: 135,
        min: 0,
        max: 8,
        step: 1,
        redLine: 4
    },
    {
        type: 'S',
        startAngle: -135,
        endAngle: 135,
        min: 0,
        max: 8,
        step: 1,
        redLine: 6
    },
    {
        type: 'S+',
        startAngle: -90,
        endAngle: 90,
        min: 0,
        max: 8,
        step: 1,
        redLine: 8
    },

]

function getDrivingModeDisplay(mode: DrivingMode) {
    return drivingModeDisplays.filter(d => d.type == mode)[0]
}

const fromAngularCoordinate = (angle: number, radius: number) => {
    'worklet'
    const rad = (angle * Math.PI) / 180;

    // Calculate the start and end points of the arc
    const x = radius * Math.sin(rad);
    const y = -radius * Math.cos(rad);
    return {
        x, y, rad
    }
}

const generateArcPath = (start: number, end: number, radius: number) => {
    'worklet'
    // Calculate the start and end points of the arc
    const { x: startX, y: startY, rad: startRad } = fromAngularCoordinate(start, radius)
    const { x: endX, y: endY, rad: endRad } = fromAngularCoordinate(end, radius)

    // Determine the large arc flag (1 for angles > 180 degrees, 0 otherwise)
    const largeArcFlag = endRad - startRad <= Math.PI ? 0 : 1;

    // Create the path data string
    const pathData = [
        `M ${startX} ${startY}`, // Move to the start point
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Draw the arc
    ].join(' ');
    return pathData
}

type ScaleLabel = {
    value: number,
    angle: number,
    x: number,
    y: number,
    isVisible: boolean

}
const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedText = Animated.createAnimatedComponent(Text)
const AnimatedG = Animated.createAnimatedComponent(G)

const getValueAngle = (speed: number, x: MainSpeedoType) => {
    'worklet'
    if (!x) {
        return 0
    }
    const { startAngle, endAngle, min, max } = x
    return startAngle + speed * (endAngle - startAngle) / (max - min)
}

const interpolateObject = function <T extends Record<string, number>>(from: T, to: T, progress: number): T {
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

const CircularGauge = memo((props: MainSpeedoProps) => {
    useEffect(() => {
        console.log('🟢 MainSpeedo Mounted');
        return () => console.log('🔴 MainSpeedo Unmounted');
    }, []);

    const { size, mode } = props
    const speedTransitionProgress = useSharedValue(0); // Interpolation progress
    const cumulatedPower = useRecoilValue(cumulatedPowerState)
    const currentSpeed = useSharedValue<number>(cumulatedPower * 8)
    const previousSpeed = useSharedValue<number>(0)
    const animatedSpeed = useDerivedValue(() => interpolateValue(previousSpeed.get(), currentSpeed.get(), speedTransitionProgress.get()))
    const backgroundTransitionProgress = useSharedValue(0); // Interpolation progress


    // Calculate the diameter as the minimum of width and height
    const radius = size / 2;
    const currentCircularGauge = useSharedValue<MainSpeedoType>(getDrivingModeDisplay(mode))
    const previousCircularGauge = useSharedValue<MainSpeedoType>(getDrivingModeDisplay('P'))
    const displayedCircularGauge = useDerivedValue<MainSpeedoType>(() => {
        return interpolateObject(previousCircularGauge.get(), currentCircularGauge.get(), backgroundTransitionProgress.get())
    }, [backgroundTransitionProgress, previousCircularGauge, currentCircularGauge])

    useEffect(() => {
        console.log("Mode changes", mode)
        backgroundTransitionProgress.set(0)
        previousCircularGauge.set(displayedCircularGauge.get())
        currentCircularGauge.set(getDrivingModeDisplay(mode))
    }, [mode, radius]);

    useEffect(() => {
        speedTransitionProgress.set(0)
        currentSpeed.set(cumulatedPower * 8)
    }, [cumulatedPower, radius]);

    const computeScales = (displayedCircularGauge: MainSpeedoType, radius: number) => {
        'worklet'
        const { startAngle, endAngle, min: valueFrom, max: valueTo, step, redLine } = displayedCircularGauge
        const subScaleSize = 8;
        const angleStepSize = (endAngle - startAngle) / ((valueTo - valueFrom) * 8)
        const subScalePathData: string[] = []
        const scalePathData: string[] = []
        const subScaleRedLinePathData: string[] = []
        const scaleRedLinePathData: string[] = []
        const outerRadius = radius - 20
        const innerRadius = radius - 26
        const labelData: ScaleLabel[] = []
        const biggerInnerRadius = radius - 28
        for (let i = valueFrom * subScaleSize; i <= valueTo * subScaleSize; i += step) {
            const angle = startAngle + angleStepSize * i
            const { x: outerX, y: outerY } = fromAngularCoordinate(angle, outerRadius)
            const { x: innerX, y: innerY } = fromAngularCoordinate(angle, innerRadius)
            const hasReachedRedLine = i >= redLine * 8
            if (hasReachedRedLine) {
                subScaleRedLinePathData.push(`M ${outerX} ${outerY}`);
                subScaleRedLinePathData.push(`L ${innerX} ${innerY}`);

            } else {
                subScalePathData.push(`M ${outerX} ${outerY}`);
                subScalePathData.push(`L ${innerX} ${innerY}`);
            }
            if (i % subScaleSize == 0) {
                const { x: biggerInnerX, y: biggerInnerY } = fromAngularCoordinate(angle, biggerInnerRadius)
                if (hasReachedRedLine) {
                    scaleRedLinePathData.push(`M ${outerX} ${outerY}`);
                    scaleRedLinePathData.push(`L ${innerX} ${innerY}`);

                } else {
                    scalePathData.push(`M ${outerX} ${outerY}`);
                    scalePathData.push(`L ${biggerInnerX} ${biggerInnerY}`);
                }
                const { x, y } = fromAngularCoordinate(angle, radius - 40)
                labelData.push({
                    value: (i / subScaleSize),
                    angle,
                    x,
                    y,
                    isVisible: true
                })
            }
        }
        return {
            subScaleD: subScalePathData.join(' '),
            scaleD: scalePathData.join(' '),
            subScaleRedLineD: subScaleRedLinePathData.join(' '),
            scaleRedLineD: scaleRedLinePathData.join(' '),
            labelData
        }
    }


    const n = 5
    const scales = useDerivedValue<{
        subScaleD: string,
        scaleD: string,
        subScaleRedLineD: string,
        scaleRedLineD: string,
        labelData: ScaleLabel[]
    }>(() => {
        return computeScales(displayedCircularGauge.get(), radius)
    }, [displayedCircularGauge])

    const derivedLabelData = useDerivedValue<ScaleLabel[]>(() => scales.get().labelData, [scales])

    useFrameCallback(() => {
        computeTransition(3, backgroundTransitionProgress)
        computeTransition(1, speedTransitionProgress)
    });

    const getArcAnimatedProps = (radiusModifier: number) =>
        useAnimatedProps(() => {
            const { startAngle, endAngle } = displayedCircularGauge.get()
            return {
                d: generateArcPath(startAngle, endAngle, radius - radiusModifier),
            }
        }, [displayedCircularGauge]);

    const redLineArcAnimatedProps = useAnimatedProps(() => {
        const { endAngle, redLine } = displayedCircularGauge.get()
        const redLineAngle = getValueAngle(displayedCircularGauge.get().redLine, displayedCircularGauge.get())
        return {
            d: generateArcPath(redLineAngle, endAngle, radius - 35),
        }

    }, [displayedCircularGauge])

    const speedAngle = useDerivedValue(() => getValueAngle(animatedSpeed.get(), displayedCircularGauge.get()), [animatedSpeed, displayedCircularGauge])

    const powerLineArcAnimatedProps = useAnimatedProps(() => {
        const { startAngle } = displayedCircularGauge.get()
        
        const valueAngle = !!speedAngle ? speedAngle.get() : startAngle
        return {
            d: generateArcPath(startAngle, valueAngle, radius - 35),
        }

    }, [animatedSpeed, displayedCircularGauge])

 
    const redMarkAnimatedProps = useAnimatedProps(() => {
        const { startAngle } = displayedCircularGauge.get()        
        const valueAngle = !!speedAngle ? speedAngle.get() : startAngle
        return {
            transform: [{ rotate: valueAngle+"deg" }],
        }
    }, [animatedSpeed, displayedCircularGauge])

    const subScalesAnimationProps = useAnimatedProps(() => ({ d: scales.get().subScaleD }), [scales])
    const scalesAnimationProps = useAnimatedProps(() => ({ d: scales.get().scaleD }), [scales])
    const subScalesRedLineAnimationProps = useAnimatedProps(() => ({ d: scales.get().subScaleRedLineD }), [scales])
    const scalesRedLineAnimationProps = useAnimatedProps(() => ({ d: scales.get().scaleRedLineD }), [scales])


    const labelAnimationProps: any[] = []
    for (let i = 0; i < 10; i++) {
        labelAnimationProps[i] = useAnimatedProps(() => {
            const data = derivedLabelData.get()[i]
            let x = 0, y = 0, opacity = 0, fill = "white"

            if (data && data.isVisible) {
                x = data.x
                y = data.y
                opacity = 1
                if (data.value >= displayedCircularGauge.get().redLine) {
                    fill = "red"
                }
            }
            return {
                x, y, opacity, fill
            }
        }, [displayedCircularGauge]);
    }
    const [redMarkSvg, setRedMarkSvg] = useState<string>(`M 0 0 L 0 ${-radius + 30}`)
    useEffect(() => {
        setRedMarkSvg(`M 0 0 L 0 ${-radius + 30}`)
    }, [radius])
    const lines = (<>
        <AnimatedPath animatedProps={subScalesAnimationProps} fill="none" stroke="white" opacity={0.5} strokeWidth="2" />
        <AnimatedPath animatedProps={scalesAnimationProps} fill="none" stroke="white" strokeWidth="2" />
        <AnimatedPath animatedProps={subScalesRedLineAnimationProps} fill="none" stroke="red" opacity={0.5} strokeWidth="2" />
        <AnimatedPath animatedProps={scalesRedLineAnimationProps} fill="none" stroke="red" strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((label, index) => {
            const animationProps = labelAnimationProps[index]
            console.log(label)
            return (
                <AnimatedText
                    key={`scaleLabel${index}`}
                    animatedProps={animationProps}
                    fontFamily="Exo"
                    textAnchor="middle"
                    dy="6"
                    fontStyle="italic"
                    fontSize="20"
                    fill="white"
                >{label}</AnimatedText>
            );
        })}
    </>)
    return (
        <>
            <Defs>
                <LinearGradient id="goldenLining" x1="0%" y1="100%" x2="0%" y2="0%">
                    <Stop offset="100%" stopColor="#f6b26b" stopOpacity="1" />
                    <Stop offset="0%" stopColor="#b45f06" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="chrome" x1="0%" y1="100%" x2="0%" y2="0%">
                    <Stop offset="100%" stopColor="#fff" stopOpacity="1" />
                    <Stop offset="70%" stopColor="#eee" stopOpacity="1" />
                    <Stop offset="50%" stopColor="#555" stopOpacity="1" />
                    <Stop offset="0%" stopColor="#111" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="redMark" x1="0%" y1="100%" x2="0%" y2="0%">
                    <Stop offset="100%" stopColor="#f01" stopOpacity="0.9" />
                    <Stop offset="70%" stopColor="#f33" stopOpacity="1" />
                    <Stop offset="30%" stopColor="#f00" stopOpacity="0.5" />
                    <Stop offset="0%" stopColor="#f00" stopOpacity="0" />
                </LinearGradient>
            </Defs>
            <AnimatedPath key="goldenLining" animatedProps={getArcAnimatedProps(0)} fill="none" stroke="url(#goldenLining)" strokeWidth="3" />
            <AnimatedPath key="chromeLining" animatedProps={getArcAnimatedProps(8)} fill="none" stroke="#888" strokeWidth="12" />
            <AnimatedPath key="chrome" animatedProps={getArcAnimatedProps(8)} fill="none" stroke="url(#chrome)" strokeWidth="8" />
            <AnimatedG animatedProps={redMarkAnimatedProps}>
                <AnimatedPath key="redMark" d={redMarkSvg}  fill="none" stroke="url(#redMark)" strokeWidth="6" />
            </AnimatedG>
            <AnimatedPath key="scale" animatedProps={scalesAnimationProps} fill="none" stroke="white" strokeWidth="2" opacity={0.3} />
            <AnimatedPath key="redLine" animatedProps={redLineArcAnimatedProps} fill="none" stroke="#F00" strokeWidth="45" opacity={0.4} />
            <AnimatedPath key="powerLine" animatedProps={powerLineArcAnimatedProps} fill="none" stroke="#3ef" strokeWidth="45" opacity={0.6} />
            {lines}

            <Text fontFamily="Exo" textAnchor="middle" dy="30" dx="0" fontSize="80" fontWeight="bold" fill="white" opacity={1} x={0} y={0} fontStyle='italic'>
                {mode}
            </Text>
            <Text children={`${(cumulatedPower * 100).toFixed(0)}`} fontFamily="Exo" textAnchor='end' dx="20" dy="120" fontSize="40" fill="#0df" x={0} y={0} fontStyle='italic' />
        </>
    );
});


export default CircularGauge;