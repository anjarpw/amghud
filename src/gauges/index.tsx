import React, { memo, useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { G, Rect, Line, SvgXml, Defs, LinearGradient, Stop, Text } from 'react-native-svg';
import MainSpeedo from './mainSpeedo';
import Traction from './traction'
import { useRecoilState } from 'recoil';
import { analogBrakeState, analogSteerState, analogThrottleState, cumulatedPowerState, leftMotorState, modeState, rightMotorState, turningLevelState } from '../state';
import GearSelector from './gearSelector';
import ThrottleBar from './throttleBar';
import BluetoothModal from './../bluetoothModal'


export type GaugeProps = {
}

const Gauges = memo((props: GaugeProps) => {

  const [cumulatedPower,] = useRecoilState(cumulatedPowerState);
  const [mode,] = useRecoilState(modeState);
  const [analogThrottle,] = useRecoilState(analogThrottleState)
  const [analogBrake,] = useRecoilState(analogBrakeState)

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
  const circularGaugeSize = Math.min(width, height) *0.8;
  const tractionSize = height * 0.3
  const throttleIndicatorHeight = height * 0.4
  const throttleIndicatorWidth = height * 0.05

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* SVG as the main container */}
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="throttleBar" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="100%" stopColor="#3fe" stopOpacity="1" />
            <Stop offset="0%" stopColor="#0fd" stopOpacity="0.3" />
          </LinearGradient>
          <LinearGradient id="brakeBar" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="100%" stopColor="#f10" stopOpacity="1" />
            <Stop offset="0%" stopColor="#910" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        <G x={width / 2} y={height / 2 + circularGaugeSize * 0.08}>
          <MainSpeedo mode={mode} cumulatedPower={cumulatedPower} size={circularGaugeSize}></MainSpeedo>
        </G>

        <G x={throttleIndicatorWidth * 4} y={height / 2 + throttleIndicatorHeight / 2}>
          <ThrottleBar thickness={throttleIndicatorWidth} size={throttleIndicatorHeight} lowColor="gray" highColor="url(#throttleBar)" value={analogThrottle} max={1} thresholdValue={0.6} thresholdPosition={0.3}/>
        </G>
        <G x={throttleIndicatorWidth * 2.5} y={height / 2 + throttleIndicatorHeight / 2}>
          <ThrottleBar thickness={throttleIndicatorWidth} size={throttleIndicatorHeight} lowColor="gray" highColor="url(#brakeBar)" value={analogBrake} max={1} thresholdValue={0.6} thresholdPosition={0.3}/>
        </G>
        <G x={width - tractionSize * 0.1-90} y={height / 2}>
          <Traction size={tractionSize}></Traction>
        </G>
        <G x={width / 2 - circularGaugeSize * 0.65} y={height * 0.35}>
          <GearSelector gap={height * 0.08} fontSize={20}></GearSelector>
        </G>
      </Svg>    
      <BluetoothModal/>  
    </View>
  );
});

export default Gauges;
