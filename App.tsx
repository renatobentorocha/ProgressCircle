import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  Clock,
  Easing,
  block,
  cond,
  not,
  clockRunning,
  startClock,
  timing,
  eq,
  set,
  stopClock,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const runProgress = (clock: Clock, intialPosition: number, toValue: number) => {
  const state = {
    finished: new Animated.Value(0),
    position: new Animated.Value(intialPosition),
    frameTime: new Animated.Value(0),
    time: new Animated.Value(0),
  };

  const config = {
    toValue: new Animated.Value(toValue),
    duration: 1200,
    easing: Easing.inOut(Easing.linear),
  };

  return block([
    cond(not(clockRunning(clock)), startClock(clock)),
    timing(clock, state, config),
    cond(eq(state.finished, 1), [
      // stopClock(clock),
      set(state.finished, 0),
      set(state.frameTime, 0),
      set(state.position, intialPosition),
    ]),
    state.position,
  ]);
};

const CIRCUMFERENCE = 2 * Math.PI * 2;

export default function App() {
  const clock = useRef(new Clock()).current;

  const progress = runProgress(clock, 6, 12);

  const download = runProgress(clock, CIRCUMFERENCE, 0);

  return (
    <Animated.View style={styles.container}>
      <Svg
        width="200"
        height="200"
        viewBox="0 0 6 5"
        style={{ position: 'absolute' }}
      >
        <AnimatedCircle
          cx={3}
          cy={2.5}
          r={2}
          stroke="rgba(0, 200,0, 1)"
          strokeWidth={0.5}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={download}
        />
        <AnimatedPath
          x={1.5}
          y={2.5 / 2}
          scale={0.5}
          d="M5 1L2 4L1 3"
          stroke="rgba(0, 100,0, 1)"
          strokeDasharray="6"
          strokeDashoffset={progress}
        />
      </Svg>
      <Svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        style={{ position: 'absolute' }}
      >
        <Path
          d="M19 9.5H15V3.5H9V9.5H5L12 16.5L19 9.5ZM11 11.5V5.5H13V11.5H14.17L12 13.67L9.83002 11.5H11ZM19 20.5V18.5H5V20.5H19Z"
          fill="white"
          fillOpacity="0.54"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151515',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
