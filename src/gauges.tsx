import React, { useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { G, Rect, Line, SvgXml } from 'react-native-svg';
import MainSpeedo from './mainSpeedo';
import Traction from './traction'
import { useRecoilState } from 'recoil';
import { analogSteerState, cumulatedPowerState, leftMotorState, modeState, rightMotorState, turningLevelState } from './state';



export type GaugeProps = {
}

const Gauges = (props: GaugeProps) => {

  const [cumulatedPower, ] = useRecoilState(cumulatedPowerState);
  const [mode, ] = useRecoilState(modeState);
  const [rightMotor, ] = useRecoilState(rightMotorState)
  const [leftMotor, ] = useRecoilState(leftMotorState)
  const [turningLevel, ] = useRecoilState(turningLevelState)
  const [analogSteer, ] = useRecoilState(analogSteerState)

  useEffect(() => {
    console.log('🟢 Gauges Mounted');
    return () => console.log('🔴 Gauges Unmounted');
}, []);
      
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions(Dimensions.get('window'));
    };
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove(); // Cleanup on unmount
  }, []);

  const { width, height } = dimensions;
  const circularGaugeSize = Math.min(width, height) ;
  const tractionSize = height*0.6

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* SVG as the main container */}
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>

        {/* Center Circular Gauge */}
        <G transform={`translate(${width / 2}, ${height / 2 + circularGaugeSize*0.1})`}>
          <MainSpeedo mode={mode} cumulatedPower={cumulatedPower} size={circularGaugeSize}></MainSpeedo>
        </G>

        {/* Left Bar Gauge */}
        <G transform="translate(100, 100)">
          <Rect x="0" y="0" width="30" height="200" fill="blue" />
        </G>

        {/* Right Bar Gauge */}
        <G transform={`translate(${width - tractionSize*0.6}, ${height/2})`}>
          {/* <Rect x={-tractionSize/2} y={-tractionSize/2} width={tractionSize} height={tractionSize} opacity={0.3} fill="blue" /> */}
          <Traction turningLevel={turningLevel} analogSteer={analogSteer} rightMotor={rightMotor} leftMotor={leftMotor} size={tractionSize}></Traction>
        </G>

        {/* Indicator Line */}
        <G transform="translate(200, 50)">
        </G>

      </Svg>
    </View>
  );
};

export default Gauges;
