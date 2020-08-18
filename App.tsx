import React, { useRef, useState } from 'react';
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
  event,
  useCode,
  onChange,
  debug,
  interpolate,
  multiply,
  sub,
  defined,
  and,
} from 'react-native-reanimated';

import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
  TapGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const CIRCUMFERENCE = 2 * Math.PI * 2;

const runProgress = (
  clock: Clock,
  intialPosition: number,
  toValue: number,
  endDownload: Animated.Value<number>
) => {
  const state = {
    finished: new Animated.Value(0),
    position: new Animated.Value(intialPosition),
    frameTime: new Animated.Value(0),
    time: new Animated.Value(0),
  };

  const config = {
    toValue: new Animated.Value(toValue),
    duration: 8000,
    easing: Easing.inOut(Easing.ease),
  };

  return block([
    timing(clock, state, config),
    cond(eq(state.finished, 1), [
      stopClock(clock),
      set(state.finished, 0),
      set(state.frameTime, 0),
      cond(eq(endDownload, 0), set(endDownload, 1)),
    ]),
    state.position,
  ]);
};

export default function App() {
  const downloadClock = useRef(new Clock()).current;
  const checkMarkclock = useRef(new Clock()).current;

  const endDownload = useRef(new Animated.Value(0)).current;
  const isDownloading = useRef(new Animated.Value(0)).current;

  const progress = runProgress(checkMarkclock, 6, 12, new Animated.Value(-1));

  const downloadProgress = runProgress(downloadClock, 0, 1, endDownload);
  const download = multiply(sub(1, downloadProgress), CIRCUMFERENCE);

  useCode(
    () => [
      onChange(endDownload, [debug('endDownload', endDownload)]),

      onChange(
        endDownload,
        cond(
          and(not(clockRunning(downloadClock)), eq(endDownload, 1)),
          startClock(checkMarkclock)
        )
      ),
    ],
    []
  );
  const onGestureEvent = event<
    TapGestureHandlerGestureEvent & TapGestureHandlerStateChangeEvent
  >([
    {
      nativeEvent: ({ state }) =>
        block([
          cond(eq(state, State.BEGAN), [
            set(isDownloading, 1),
            startClock(downloadClock),
          ]),
        ]),
    },
  ]);

  return (
    <Animated.View style={styles.container}>
      <TapGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
      >
        <Animated.View style={styles.circleContainer}>
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
          <AnimatedSvg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            style={{ position: 'absolute', opacity: not(isDownloading) }}
          >
            <Path
              d="M19 9.5H15V3.5H9V9.5H5L12 16.5L19 9.5ZM11 11.5V5.5H13V11.5H14.17L12 13.67L9.83002 11.5H11ZM19 20.5V18.5H5V20.5H19Z"
              fill="white"
              fillOpacity="0.54"
            />
          </AnimatedSvg>
        </Animated.View>
      </TapGestureHandler>
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
  circleContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#f001',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
