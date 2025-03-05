import React, { useEffect, memo } from "react";
import { G, Path } from "react-native-svg";
import Animated, {
    ReduceMotion,
    useAnimatedProps,
    useDerivedValue,
    useFrameCallback,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { powerMajorMarker, powerMarker } from "./common";
import LinearScale from "../../linearScale";
import { Easing } from "react-native";
import { computeTransition, fromRect, interpolateValue } from "../../common";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type TractionBarProps = {
    size: number;
    value: number;
};

const TractionBar = memo((props: TractionBarProps) => {
    const { size, value } = props;

    // Shared values for animation
    const transitionProgress = useSharedValue(0);

    const currentValue = useSharedValue(0);
    const previousValue = useSharedValue(0);
    const animatedValue = useDerivedValue(() => interpolateValue(previousValue.value, currentValue.value, transitionProgress.value), 
    [previousValue, currentValue, transitionProgress]);

    // Frame callback for animation
    useFrameCallback(() => {
        computeTransition(1, transitionProgress)
    });

    // Update animation when value changes
    useEffect(() => {
        previousValue.value = animatedValue.value;
        currentValue.value = value;
        transitionProgress.value = withTiming(1, { duration: 500 }); // Animate transition
    }, [value]);

    // Animated props for positive and negative bars
    const powerThickness = size * 0.6;
    const positiveBarProps = useAnimatedProps(() => ({
        d: animatedValue.value < 0 ? "M 0 0" : fromRect(0, 0, powerThickness, -animatedValue.value * size / 2),
    }), [animatedValue]);

    const negativeBarProps = useAnimatedProps(() => ({
        d: animatedValue.value > 0 ? "M 0 0" : fromRect(0, 0, powerThickness, -animatedValue.value * size / 2),
    }), [animatedValue]);

    return (
        <>
            <AnimatedPath fill="url(#positivePowerTraction)" x={0} y={0} animatedProps={positiveBarProps} />
            <AnimatedPath fill="url(#negativePowerTraction)" x={0} y={0} animatedProps={negativeBarProps} />
            <G x={0} y={-size / 2} transform="rotate(90) scale(1,-1)" opacity={0.5}>
                <LinearScale size={size} markers={powerMarker} majorMarkers={powerMajorMarker} majorRuleSize={size * 0.1} superMajorMarkers={[0]} />
            </G>
        </>
    );
});

export default TractionBar;