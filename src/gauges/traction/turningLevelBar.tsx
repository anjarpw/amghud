

import React, { useEffect, memo } from "react";
import { G, Path, Rect } from "react-native-svg";
import Animated, {
  ReduceMotion,
  useAnimatedProps,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import LinearScale from "../../linearScale";
import { computeTransition, interpolateValue } from "../../common";
import { steerMajorMarker, steerMarker } from "./common";
import { Easing } from "react-native";
import { useRecoilValue } from "recoil";
import { analogSteerState, turningLevelState } from "../../state";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G)

export type TurningLevelProps = {
  size: number;
};

const TurningLevelBar = memo((props: TurningLevelProps) => {
  const { size } = props;
  const turningLevel = useRecoilValue(turningLevelState);
  const analogSteer = useRecoilValue(analogSteerState);

  // Shared values for animation
  const transitionProgress = useSharedValue(0);
  const currentTurningLevel = useSharedValue(0);
  const previousTurningLevel = useSharedValue(0);
  const animatedTurningLevel = useDerivedValue(() => interpolateValue(previousTurningLevel.value, currentTurningLevel.value, transitionProgress.value),
    [previousTurningLevel, currentTurningLevel, transitionProgress]);

  const currentAnalogSteer = useSharedValue(0);
  const previousAnalogSteer = useSharedValue(0);
  const animatedAnalogSteer = useDerivedValue(() => interpolateValue(previousAnalogSteer.value, currentAnalogSteer.value, transitionProgress.value),
    [previousTurningLevel, currentTurningLevel, transitionProgress]);

  // Frame callback for animation
  useFrameCallback(() => {
    computeTransition(1, transitionProgress)
  });

  // Update animation when turningLevel or analogSteer changes
  useEffect(() => {
    previousTurningLevel.value = animatedTurningLevel.value;
    currentTurningLevel.value = turningLevel;
    previousAnalogSteer.value = animatedAnalogSteer.value;
    currentAnalogSteer.value = analogSteer;
    transitionProgress.value = withTiming(1, { duration: 500 }); // Animate transition
  }, [turningLevel, analogSteer]);

  // Triangle paths
  const tA = 0.1;
  const tH = 0.08;
  const triangleD = `M 0 2 L ${size * tA / 2} ${size * tH} L ${-size * tA / 2} ${size * tH} L 0 2`;
  const invertedTriangleD = `M 0 -2 L ${size * tA / 2} ${size * -tH} L ${-size * tA / 2} ${size * -tH} L 0 -2`;

  // Animated props for the turning level and analog steer
  const turningLevelBarProps = useAnimatedProps(() => ({
    transform: [{ translateX: animatedTurningLevel.value * size / 2 }],
  }), [animatedTurningLevel]);

  const analogSteerBarProps = useAnimatedProps(() => ({
    transform: [{ translateX: animatedAnalogSteer.value * size / 2 }],
  }), [animatedTurningLevel]);

  return (
    <>
      <Rect x={-size * 0.5} y={-size * 0.1} width={size} height={size * 0.1} fill="url(#steerShade)" />
      <G x={-size / 2} scaleX={1} scaleY={-1} opacity={0.5}>
        <LinearScale size={size} markers={steerMarker} majorMarkers={steerMajorMarker} majorRuleSize={size * 0.1} />
      </G>
      <AnimatedG animatedProps={turningLevelBarProps}>
      <Path fill="white" d={triangleD} />
      </AnimatedG>
      <AnimatedG animatedProps={analogSteerBarProps}>
      <Path fill="red" d={invertedTriangleD} />
      </AnimatedG>
    </>
  );
});

export default TurningLevelBar;