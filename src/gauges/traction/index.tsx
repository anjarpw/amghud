import React, { useEffect, memo } from "react";
import { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { SvgXml } from "react-native-svg";
import { useRecoilValue } from "recoil";
import { leftMotorState, rightMotorState } from "./../../state";
import carSvgData from "./../../../assets/svg/car";
import TractionBar from "./tractionBar";
import TurningLevelBar from "./turningLevelBar";

export type TractionProps = {
  size: number;
};

const Traction = (props: TractionProps) => {
  const { size } = props;

  // Recoil state
  const rightMotor = useRecoilValue(rightMotorState);
  const leftMotor = useRecoilValue(leftMotorState);

  // Car size
  const carSize = size * 0.8;

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
        <TractionBar size={carSize} value={leftMotor} />
      </G>
      <G x={carSize * 0.6} y={-carSize * 0.1} scaleX={-1} scaleY={1}>
        <TractionBar size={carSize} value={rightMotor} />
      </G>
      <Rect x={-carSize * 0.5} y={-carSize * 0.6} width={carSize * 1} height={carSize} fill="url(#blackShade)" />
      <G transform={`translate(${-carSize * 0.5} ${carSize * 0.4}) rotate(-90)`}>
        {carSvgData ? <SvgXml xml={carSvgData} width={carSize} height={carSize} /> : null}
      </G>
      <G x={0} y={size * 0.5}>
        <TurningLevelBar size={size * 0.8}/>
      </G>
    </>
  );
};

export default Traction;