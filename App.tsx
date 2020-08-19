import React, { useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  Clock,
  Easing,
  block,
  cond,
  clockRunning,
  startClock,
  timing,
  eq,
  set,
  stopClock,
  event,
  useCode,
  onChange,
  multiply,
  sub,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
  TapGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

const HEIGHT_ORIGIN = 667;

import * as utils from './utils';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const { height } = Dimensions.get('window');

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
    duration: 3000,
    easing: Easing.inOut(Easing.ease),
  };

  return block([
    cond(clockRunning(clock), timing(clock, state, config)),

    cond(eq(state.finished, 1), [
      stopClock(clock),
      set(state.finished, 0),
      set(state.frameTime, 0),
      set(state.time, 0),

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
  const opacity = interpolate(downloadProgress, {
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: Extrapolate.CLAMP,
  });

  useCode(
    () => [
      onChange(
        endDownload,
        cond(eq(endDownload, 1), startClock(checkMarkclock))
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
            set(endDownload, 0),
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
            width={utils.scale({
              origin_size: HEIGHT_ORIGIN,
              destination_size: height,
              size: 200,
            })}
            height={utils.scale({
              origin_size: HEIGHT_ORIGIN,
              destination_size: height,
              size: 200,
            })}
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
              fill="rgba(21, 21, 21, 1)"
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
            width={utils.scale({
              origin_size: HEIGHT_ORIGIN,
              destination_size: height,
              size: 50,
            })}
            height={utils.scale({
              origin_size: HEIGHT_ORIGIN,
              destination_size: height,
              size: 50,
            })}
            viewBox="0 0 24 24"
            style={{ position: 'absolute', opacity }}
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
    backgroundColor: 'rgba(21, 21, 21, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    width: utils.scale({
      origin_size: HEIGHT_ORIGIN,
      destination_size: height,
      size: 200,
    }),
    height: utils.scale({
      origin_size: HEIGHT_ORIGIN,
      destination_size: height,
      size: 200,
    }),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
