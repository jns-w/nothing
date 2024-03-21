import {StyleSheet, View} from "react-native";
import React, {RefObject, useCallback, useEffect, useState} from "react";
import {Task, taskListAtom} from "../atoms/tasks";
import {useAtom} from "jotai";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {theme} from "../styles/theme";
import {appModeAtom, currentEditTaskAtom} from "../atoms/ui";
import TaskInput from "./task-input";
import {produce} from "immer";


const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 500,
    paddingBottom: 200,
  },
  container: {
    justifyContent: 'flex-end',
  },
  taskText: {
    ...theme.typography.taskText,
    color: theme.colors.text,
  },
  taskTextCompleted: {
    ...theme.typography.taskText,
    // color: theme.colors.textCompleted,
    textDecorationLine: 'line-through',
  },
  selectedIcon: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.warning,
    right: 10,
    top: 10,
  },
  selectIndicator: {
    position: 'absolute',
    left: 10,
    top: 0,
    backgroundColor: theme.colors.accent,
    width: 10,
    height: 20,
  }
})

type TaskListProps = {
  scrollRef: RefObject<Animated.ScrollView>
}

export default function TaskList(props: TaskListProps) {
  const [appMode, setAppMode] = useAtom(appModeAtom)
  const [taskList, setTasks] = useAtom(taskListAtom)
  const [currentEditTask, setCurrentEditTask] = useAtom(currentEditTaskAtom)

  // creates a squish effect when dragging past ends of scrollview
  const scaleY = useSharedValue(1)
  const scaleX = useSharedValue(1)
  const isControlled = useSharedValue(true)
  const transformOrigin = useSharedValue("center center")

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (ev) => {
      if (appMode !== 'appDefault' || !isControlled.value) return;
      if (ev.contentOffset.y < 0) {
        transformOrigin.value = "center bottom"
        scaleY.value = 1 + ev.contentOffset.y / 1500
        scaleX.value = 1 - ev.contentOffset.y / 7000
      }
      if (ev.contentOffset.y + ev.layoutMeasurement.height > ev.contentSize.height) {
        transformOrigin.value = "center top"
        scaleY.value = 1 - (ev.contentOffset.y + ev.layoutMeasurement.height - ev.contentSize.height) / 1500
        scaleX.value = 1 + (ev.contentOffset.y + ev.layoutMeasurement.height - ev.contentSize.height) / 7000
      }
    },
    onEndDrag: () => {
      if (appMode !== 'appDefault') return;
      isControlled.value = false
      scaleY.value = withSpring(1, {stiffness: 1000, damping: 10, mass: 1}, () => {
        isControlled.value = true
      })
      scaleX.value = withSpring(1, {stiffness: 1000, damping: 10, mass: 1}, () => {
        isControlled.value = true
      })
    },
  })
  const scrollAnimation = useAnimatedStyle(() => ({
    transform: [
      {
        scaleY: scaleY.value,
      }, {
        scaleX: scaleX.value,
      },
    ],
    transformOrigin: transformOrigin.value,
  }))

  const scale = useSharedValue(1)

  const modeAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {scale: scale.value},
      ],
      transformOrigin: "center center",
    }
  })

  const listOpacity = useSharedValue(1)
  const listOpacityAnimation = useAnimatedStyle(() => {
    return {
      opacity: withTiming(listOpacity.value, {duration: 400}),
    }
  })

  const taskFaderOpacity = useSharedValue(1)

  useEffect(() => {
    switch (appMode) {
      case 'appDefault':
        listOpacity.value = 1
        scale.value = withTiming(1, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
        taskFaderOpacity.value = withTiming(1, {duration: 200})
        break
      case 'taskNew':
        scale.value = withTiming(0.93, {
          duration: 450,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        })
        listOpacity.value = 0.2
        // props.scrollRef.current?.scrollToEnd({
        //   animated: true,
        // })
        break
      case "taskEdit":
        taskFaderOpacity.value = withTiming(0.2, {duration: 200})
          break
      case 'appEdit':
        scale.value = withTiming(0.93, {
          duration: 370,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
        break
      default:
        break
    }
  }, [appMode])

  return (
    <Animated.ScrollView
      ref={props.scrollRef}
      contentContainerStyle={[
        styles.wrapper
      ]}
      // onScroll={scrollHandler}
      // scrollEventThrottle={16}
    >
      <Animated.View
        style={[
          styles.container,
          scrollAnimation,
          listOpacityAnimation,
          modeAnimation,
        ]}
      >
        {taskList.map((t, i) => {
          if (t.isDeleted) return null;
          if (currentEditTask === t.id) {
            return (
              <TaskInput
                key={t.id}
                task={t}
                scrollRef={props.scrollRef}
              />
            )
          }
          return (
            <TaskText
              key={t.id}
              task={t}
              index={i}
              faderOpacity={taskFaderOpacity}
            />
          )
        })}
      </Animated.View>
      {appMode === "taskNew" && <TaskInput scrollRef={props.scrollRef}/>}
    </Animated.ScrollView>
  )
}

type TaskTextProps = {
  task: Task
  index: number
  scrollRef?: RefObject<Animated.ScrollView>
  faderOpacity: Animated.SharedValue<number>
}

function TaskText(props: TaskTextProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [layoutHeight, setLayoutHeight] = useState(25)
  const [layoutWidth, setLayoutWidth] = useState(400)
  const [layoutY, setLayoutY] = useState(0)
  const [appMode, setAppMode] = useAtom(appModeAtom)
  const [, setTasks] = useAtom(taskListAtom)
  const [currentEditTask, setCurrentEditTask] = useAtom(currentEditTaskAtom)

  const textRef = React.useRef<Animated.Text>(null)

  const onLayout = useCallback((ev: any) => {
    const {height, width, y} = ev.nativeEvent.layout
    setLayoutHeight(height)
    setLayoutWidth(width)
    setLayoutY(y)
  }, [])

  const toggleCompleted = useCallback((id: string) => {
    setTasks(
      produce(draft => {
        draft[props.index].isCompleted = !draft[props.index].isCompleted
      })
    )
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setTasks(
      produce(draft => {
        draft[props.index].isSelected = !draft[props.index].isSelected
      })
    )
  }, [])

  const toggleEdit = useCallback((id: string) => {
    setCurrentEditTask(id)
    setAppMode('taskEdit')
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(
      produce(draft => {
        draft[props.index].isDeleted = true
      })
    )
  }, [])

  const panSucceed = useSharedValue(false)

// text
  const offsetX = useSharedValue(0)
  const colorProgress = useSharedValue(0)
  const scale = useSharedValue(1)

  const textAnimation = useAnimatedStyle(() => ({
    transform: [
      {translateX: offsetX.value},
      {scale: scale.value}
    ],
    color: interpolateColor(
      colorProgress.value,
      [0, 1, 2],
      [theme.colors.text, theme.colors.textCompleted, theme.colors.accent]
    ),
  }))

// strike through
  const strikeThroughProgress = useSharedValue(0)
  const strikeThroughOpacity = useSharedValue(1)
  const strikeThroughColorProgress = useSharedValue(0)

  const strikeThroughAnimation = useAnimatedStyle(() => ({
    width: strikeThroughProgress.value,
    opacity: strikeThroughOpacity.value,
    backgroundColor: interpolateColor(
      strikeThroughColorProgress.value,
      [0, 1],
      [theme.colors.textCompleted, theme.colors.accentStrong],
    ),
    height: 7,
    position: 'absolute',
    top: layoutHeight / 2 - 3.5,
    zIndex: 2,
  }))

// ui
  const opacity = useSharedValue(1)

  const selectAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: offsetX.value},
      ],
      opacity: opacity.value
    }
  })

  const faderAnimation = useAnimatedStyle(() => {
    return {
      opacity: props.faderOpacity.value
    }
  })

// layout
  const selectIndicatorEnterAnimation = (targetValues: any) => {
    'worklet';
    const animations = {
      width: withTiming(targetValues.targetWidth, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    }

    const initialValues = {
      width: 0,
    }

    return {
      initialValues,
      animations,
    }
  }

  const selectIndicatorExitAnimation = (values: any) => {
    'worklet';
    const animations = {
      width: withTiming(0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    }

    const initialValues = {
      width: values.currentWidth,
    }

    return {
      initialValues,
      animations,
    }
  }

  const pan = Gesture.Pan().minDistance(40)
    .onBegin((ev) => {
      if (appMode !== 'appDefault') return;
      panSucceed.value = false
      strikeThroughColorProgress.value = 0
    })
    .onStart((ev) => {
      if (appMode !== 'appDefault') return;
      strikeThroughOpacity.value = withTiming(1, {duration: 200})
    })
    .onChange((ev) => {
      if (appMode !== 'appDefault') return;
      offsetX.value = ev.translationX / 5;
      strikeThroughProgress.value = ev.translationX;
      strikeThroughOpacity.value = withTiming(1, {duration: 50})
      if (props.task.isCompleted) colorProgress.value = Math.min(Math.max(1 - ev.translationX / 200, 0), 1); else
        colorProgress.value = Math.max(Math.min(ev.translationX / 200, 1), 0);
      if (ev.translationX > layoutWidth / 4) {
        panSucceed.value = true
        strikeThroughColorProgress.value = withTiming(1, {duration: 200})
      } else {
        panSucceed.value = false
        strikeThroughColorProgress.value = withTiming(0, {duration: 200})
      }
    })
    .onEnd(() => {
      if (appMode !== 'appDefault') return;
      offsetX.value = withSpring(0, {stiffness: 500, damping: 50, mass: 1})
      if (panSucceed.value) {
        runOnJS(toggleCompleted)(props.task.id)
        strikeThroughProgress.value = withTiming(layoutWidth, {duration: 300})
        strikeThroughOpacity.value = withDelay(200, withTiming(0, {duration: 500}))
        strikeThroughColorProgress.value = withTiming(1, {duration: 200})
        colorProgress.value = withTiming(props.task.isCompleted ? 0 : 1, {duration: 200})
      } else {
        strikeThroughProgress.value = withTiming(0, {duration: 300})
        strikeThroughOpacity.value = withTiming(0, {duration: 300})
        strikeThroughColorProgress.value = withTiming(0, {duration: 200})
        colorProgress.value = withTiming(props.task.isCompleted ? 1 : 0, {duration: 200})
      }
      panSucceed.value = false
    })

  const tap = Gesture.Tap()
    .onTouchesDown(() => {
      scale.value = withTiming(0.97, {
        easing: Easing.elastic(1.5),
        duration: 150,
      })
    })
    .onTouchesUp(() => {
      scale.value = withTiming(1, {
        easing: Easing.elastic(3),
        duration: 500,
      })
    })
    .onFinalize(() => {
      scale.value = withTiming(1, {
        easing: Easing.elastic(1),
        duration: 500,
      })
    })
    .onEnd(() => {
      scale.value = withTiming(1, {
        easing: Easing.elastic(1),
        duration: 500,
      })
      if (appMode === 'appEdit') {
        runOnJS(toggleSelect)(props.task.id)
      }
    })

  // long press on task to edit
  const longPress = Gesture.LongPress().minDuration(500).maxDistance(200)
    .onBegin(() => {
      scale.value = withTiming(0.97, {
        easing: Easing.elastic(1.5),
        duration: 200,
      })
    })
    .onFinalize(() => {
      scale.value = withTiming(1, {
        easing: Easing.elastic(3),
        duration: 400,
      })
    })
    .onEnd(() => {
      runOnJS(toggleEdit)(props.task.id)
    })
  const composed = Gesture.Simultaneous(pan, tap, longPress)


  useEffect(() => {
    switch (appMode) {
      case "appEdit":
        if (props.task.isSelected) {
          offsetX.value = withTiming(25, {duration: 300, easing: Easing.out(Easing.exp)})
          opacity.value = withTiming(1, {duration: 200})
          colorProgress.value = withTiming(0, {duration: 200})
        } else {
          offsetX.value = withTiming(0, {duration: 300, easing: Easing.out(Easing.exp)})
          opacity.value = withTiming(1, {duration: 200})
          colorProgress.value = withTiming(1, {duration: 200})
        }
        break
      default:
        offsetX.value = withTiming(0, {duration: 300, easing: Easing.out(Easing.exp)})
        opacity.value = withTiming(1, {duration: 200})
        colorProgress.value = withTiming(props.task.isCompleted ? 1 : 0, {duration: 200})
    }
  }, [props.task.isSelected, appMode])

  return (
    <GestureDetector gesture={composed}>
      <View onLayout={onLayout}>
        {appMode === 'appEdit' && props.task.isSelected &&
            <Animated.View
                style={{
                  position: 'absolute',
                  height: layoutHeight,
                  width: 240,
                  left: 20,
                  top: 3,
                  backgroundColor: theme.colors.accentStrong,
                }}
                entering={selectIndicatorEnterAnimation}
                exiting={selectIndicatorExitAnimation}
            />
        }
        <Animated.View
          style={[strikeThroughAnimation]}
        />
        <Animated.Text
          ref={textRef}
          style={[
            props.task.isCompleted ? styles.taskTextCompleted : styles.taskText,
            textAnimation,
            selectAnimation,
            faderAnimation,
          ]}
        >
          {props.task.content.toLowerCase()}
        </Animated.Text>
      </View>
    </GestureDetector>
  )
}
