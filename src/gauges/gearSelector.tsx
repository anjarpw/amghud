import React, { memo, useEffect } from "react";
import { G, Text } from "react-native-svg";
import Animated, {
    ReduceMotion,
    useAnimatedProps,
    useDerivedValue,
    useFrameCallback,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useRecoilValue } from 'recoil';
import { computeTransition, interpolateValue } from "../common";
import { modeState } from "../state";
import { Easing } from "react-native";

const AnimatedText = Animated.createAnimatedComponent(Text);

export type GearSelectorProps = {
    fontSize: number;
    gap: number;
};

const modes = ['T', 'P', 'R', 'D', 'S', 'S+'];

const GearSelector = memo((props: GearSelectorProps) => {
    const { fontSize, gap } = props;

    // Get mode from Recoil
    const mode = useRecoilValue(modeState);

    // Animation values
    const transitionProgress = useSharedValue(0);
    const currentMode = useSharedValue("P");
    const previousMode = useSharedValue("P");
    const animatedIndex = useDerivedValue(() => {
        const currentIndex = modes.indexOf(currentMode.value);
        const previousIndex = modes.indexOf(previousMode.value);
        return interpolateValue(previousIndex, currentIndex, transitionProgress.value);
    }, [currentMode, previousMode, transitionProgress]);

    // Mount/unmount logging (for debugging)
    useEffect(() => {
        console.log('🟢 GearSelector Mounted');
        return () => console.log('🔴 GearSelector Unmounted');
    }, []);

    // Frame callback for animation
    useFrameCallback(() => {
        computeTransition(3, transitionProgress)
    });

    // Update animation when mode changes
    useEffect(() => {
        transitionProgress.set(0);
        previousMode.set(currentMode.get());
        currentMode.set(mode);
    }, [mode]);

    // Animated props for each mode
    const singleModeProps = (m: string) => {
        const currentPosition = modes.indexOf(m);
        const distanceFromAnimatedIndex = useDerivedValue(() => Math.abs(animatedIndex.value - currentPosition));

        const opacity = useDerivedValue(() => {
            return distanceFromAnimatedIndex.value < 1
                ? interpolateValue(1, 0.4, distanceFromAnimatedIndex.value)
                : 0.4;
        }, [animatedIndex]);

        const scale = useDerivedValue(() => {
            return distanceFromAnimatedIndex.value < 1
                ? interpolateValue(1.5, 1, distanceFromAnimatedIndex.value)
                : 1;
        }, [animatedIndex]);

        return useAnimatedProps(() => {
            const transform: any = [];
            if (scale.value > 1) {
                transform.push({ scaleX: scale.value });
                transform.push({ scaleY: scale.value });
            }
            return {
                transform,
                opacity: opacity.value,
            };
        }, [scale]);
    };

    return (
        <>
            {modes.map((m, index) => (
                <G y={gap * index} key={`mode-${m}-${index}`}>
                    <AnimatedText
                        fontFamily="Exo"
                        alignmentBaseline="middle"
                        textAnchor="middle"
                        dx="0"
                        fontSize={fontSize}
                        fontWeight="bold"
                        fill="white"
                        opacity={1}
                        x={0}
                        y={0}
                        fontStyle="italic"
                        animatedProps={singleModeProps(m)}
                    >
                        {m}
                    </AnimatedText>
                </G>
            ))}
        </>
    );
});

export default GearSelector;