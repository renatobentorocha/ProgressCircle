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
      <Svg width="200" height="200" viewBox="0 0 6 5">
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
