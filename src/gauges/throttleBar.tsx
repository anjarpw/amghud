import React, { useEffect, memo } from "react";
import { Defs, G, LinearGradient, Path, Rect, Stop, Text } from "react-native-svg";
import Animated, {
    ReduceMotion,
  useAnimatedProps,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { computeTransition, fromRect, interpolateValue, noTransition } from "../common";
import { ColorValue, Easing } from "react-native";
import LinearScale from "../linearScale";

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type ThrottleBarProps = {
  value: number;
  thresholdValue: number;
  thresholdPosition: number;
  max: number;
  size: number;
  thickness: number;
  lowColor: ColorValue;
  highColor: ColorValue;
};

const ThrottleBar = memo((props: ThrottleBarProps) => {
  const { value, thresholdPosition, thresholdValue, size, thickness, highColor, lowColor, max } = props;

  // Shared values for animation
  const transitionProgress = useSharedValue(0);
  const previousPosition = useSharedValue(0);
  const currentPosition = useSharedValue(0);
  const animatedPosition = useDerivedValue(() => {    
    return interpolateValue(previousPosition.value, currentPosition.value, transitionProgress.value)
  },
  [previousPosition, currentPosition, transitionProgress]);

  // Mount/unmount logging (for debugging)
  useEffect(() => {
    console.log("🟢 ThrottleBar Mounted");
    return () => console.log("🔴 ThrottleBar Unmounted");
  }, []);

  // Frame callback for animation
  useFrameCallback(() => {
    computeTransition(1, transitionProgress)
  });

  // Update animation when value changes
  useEffect(() => {
    transitionProgress.value = 0;
    previousPosition.value = animatedPosition.value;
    let position = 0;
    if(value < thresholdValue){
      position = value *thresholdPosition/thresholdValue;
    }else{
      position = thresholdPosition + (value-thresholdValue)*(1-thresholdPosition)/(1-thresholdValue)
    }
    currentPosition.value = position;
    transitionProgress.value = withTiming(1, { duration: 500 }); // Animate transition
  }, [value]);


  // Animated props for the high bar
  const highBarProps = useAnimatedProps(() => {
    return {
      d: fromRect(0, 0, thickness, -size * animatedPosition.value),
      opacity: animatedPosition.value > thresholdPosition ? 1 : 0,
    };
  }, [animatedPosition]);

  // Animated props for the low bar
  const lowBarProps = useAnimatedProps(() => {
    return {
      d: fromRect(0, 0, thickness, -size * animatedPosition.value),
      opacity: animatedPosition.value > thresholdPosition ? 0 : 1,
    };
  }, [animatedPosition]);

  // Generate markers for the scale
  const markers = React.useMemo(() => {
    const baseMarkers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
      (x) => thresholdPosition + ((max - thresholdPosition) * x) / 10
    );
    return [0, ...baseMarkers];
  }, [thresholdPosition, max]);

  return (
    <>
      <Defs>
        <LinearGradient id="shade" x1="100%" y1="0%" x2="0%" y2="0%">
          <Stop offset="100%" stopColor="#036" stopOpacity="1" />
          <Stop offset="90%" stopColor="#036" stopOpacity="0.8" />
          <Stop offset="0%" stopColor="#036" stopOpacity="0.3" />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#shade)" width={thickness} height={-size} x={0} y={0} />
      <AnimatedPath x="0" y="0" animatedProps={highBarProps} fill={highColor} />
      <AnimatedPath x="0" y="0" animatedProps={lowBarProps} fill={lowColor} />
      <G scaleX={1} scaleY={1} opacity={0.5} rotation={-90}>
        <LinearScale
          size={size}
          markers={markers}
          majorMarkers={[0, thresholdPosition, max]}
          majorRuleSize={thickness / 2}
        />
      </G>
    </>
  );
});

export default ThrottleBar;