import {Dimensions, View} from "react-native"
import Animated, {
  AnimatedKeyboardInfo,
  Easing,
  runOnJS,
  runOnUI, useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue, withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import {theme} from "../styles/theme";
import {useAtom} from "jotai";
import {appModeAtom, currentEditTaskAtom} from "../atoms/ui";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {taskInputAtom, taskListAtom} from "../atoms/tasks";
import {RefObject, useCallback, useEffect} from "react";
import {Undo2} from "lucide-react-native";
import {produce} from "immer";
import 'react-native-get-random-values';
import {nanoid} from "nanoid";

type HelperButtonProps = {
  keyboard: AnimatedKeyboardInfo
  scrollRef: RefObject<Animated.ScrollView>
}


export default function HelperButton(props: HelperButtonProps) {
  const [appMode, setAppMode] = useAtom(appModeAtom)
  const [taskInput, setTaskInput] = useAtom(taskInputAtom)
  const [, setTaskList] = useAtom(taskListAtom)
  const [currentEditTask, setCurrentEditTask] = useAtom(currentEditTaskAtom)

  const windowWidth = Dimensions.get('window').width

  const buttonStyles = {
    default: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    taskInputMode: {
      width: windowWidth,
      height: 55,
      borderRadius: 0,
      paddingHorizontal: 0,
      right: 0,
      bottom: 0,
    }
  }

  const handleTap = useCallback(() => {
    setAppMode(prev => {
      switch (prev) {
        case 'appDefault':
          return 'taskNew'
        case 'taskNew':
          if (taskInput) {
            setTaskList(
              produce(draft => {
                draft.push({
                  id: nanoid(),
                  content: taskInput,
                  isCompleted: false,
                  isSelected: false,
                  isDeleted: false,
                })
              })
            )
            setTaskInput("")
            props.scrollRef.current?.scrollToEnd({
              animated: true,
            })
          }
          return 'appDefault'
        case "taskEdit":
          setTaskList(
            produce(draft => {
              const i = draft.findIndex(task => task.id === currentEditTask)
              draft[i].content = taskInput
            })
          )
          setCurrentEditTask(null)
          setTaskInput("")
          return 'appDefault'
        case "appEdit":
          setTaskList(
            produce(draft => {
              for (let i = 0; i < draft.length; i++) {
                if (draft[i].isSelected) {
                  draft[i].isSelected = false
                }
              }
            })
          )
          return 'appDefault'
        default:
          return 'appDefault'
      }
    })
  }, [taskInput, props.scrollRef])

  const handleLongPress = useCallback(() => {
    setAppMode("appEdit")
  }, [])

  const scale = useSharedValue(1)
  const buttonColor = useSharedValue(theme.colors.accent)
  const width = useSharedValue(buttonStyles.default.width)
  const height = useSharedValue(buttonStyles.default.height)
  const right = useSharedValue(15)
  const bottom = useSharedValue(15)
  const borderRadius = useSharedValue(buttonStyles.default.borderRadius)
  const transformOrigin = useSharedValue("center center")
  const translateY = useSharedValue(-props.keyboard.height.value)

  useAnimatedReaction(
    () => {
      return props.keyboard.height.value
    },
    (currVal, prevVal) => {
      if (!prevVal || !currVal) return;
      if (currVal > prevVal) { //opening
        translateY.value = -currVal
        return
      }
      if (currVal < prevVal) { //closing
        translateY.value = withSpring(0, {stiffness: 200, damping: 20})
        return
      }
    }
  )

  const buttonAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {scale: scale.value},
        {translateY: translateY.value}
      ],
      transformOrigin: transformOrigin.value,
      right: withTiming(right.value, {duration: 300}),
      bottom: withTiming(bottom.value, {duration: 300}),
      width: width.value,
      height: withTiming(height.value, {duration: 300}),
      borderRadius: withTiming(borderRadius.value, {duration: 300}),
      backgroundColor: buttonColor.value,
    }
  })

  const textOpacity = useSharedValue(1)
  const textAnimation = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    }
  })

  const textEnterAnimation = (values: any) => {
    'worklet';
    const animations = {
      opacity: withDelay(100, withTiming(1, {duration: 500}))
    }
    const initialValues = {
      opacity: 0,
    }
    return {
      initialValues,
      animations,
    }
  }

  const textExitAnimation = (values: any) => {
    'worklet';
    const animations = {
      opacity: withTiming(0, {duration: 100})
    }
    const initialValues = {
      opacity: 1,
    }
    return {
      initialValues,
      animations,
    }
  }

  const tap = Gesture.Tap().maxDuration(200)
    .onTouchesDown(() => {
      // scale.value = withTiming(0.98, {
      //   easing: Easing.elastic(1.5),
      //   duration: 300,
      // })
    })
    .onFinalize(() => {
      // scale.value = withTiming(1, {
      //   easing: Easing.elastic(2),
      //   duration: 400,
      // })
    })
    .onEnd(() => {
      // scale.value = withTiming(1, {
      //   easing: Easing.elastic(2),
      //   duration: 400,
      // })
      runOnJS(handleTap)()
    })

  const longPress = Gesture.LongPress().minDuration(400).maxDistance(200)
    .onBegin(() => {
      if (appMode !== 'appDefault') return;
      scale.value = withTiming(1.3, {
        easing: Easing.elastic(1.5),
        duration: 300,
      })
    })
    .onStart(() => {
      if (appMode !== 'appDefault') return;
      runOnJS(handleLongPress)()
      scale.value = withTiming(1.3, {
        easing: Easing.elastic(1.5),
        duration: 300,
      })
    })
    .onFinalize(() => {
      scale.value = withTiming(1, {
        easing: Easing.elastic(2),
        duration: 400,
      })
    })

  useEffect(() => {
    switch (appMode) {
      case 'appDefault':
        width.value = withTiming(buttonStyles.default.width, {
          duration: 450,
          easing: Easing.elastic(.7)
          })
        height.value = buttonStyles.default.height
        borderRadius.value = buttonStyles.default.borderRadius
        right.value = 15
        bottom.value = 15
        buttonColor.value = withTiming(theme.colors.accent, {duration: 300})
        break
      case 'taskNew':
        width.value = withTiming(buttonStyles.taskInputMode.width, {
          duration: 450,
          easing: Easing.elastic(.7),
        })
        borderRadius.value = buttonStyles.taskInputMode.borderRadius
        height.value = buttonStyles.taskInputMode.height
        right.value = 0
        bottom.value = 0
        if (!taskInput) {
          buttonColor.value = withTiming(theme.colors.textCompleted, {duration: 300})
        } else {
          buttonColor.value = withTiming(theme.colors.accent, {duration: 330})
        }
        break
      case 'taskEdit':
        width.value = withTiming(buttonStyles.taskInputMode.width, {
          duration: 450,
          easing: Easing.elastic(.7),
        })
        borderRadius.value = buttonStyles.taskInputMode.borderRadius
        height.value = buttonStyles.taskInputMode.height
        right.value = 0
        bottom.value = 0
        buttonColor.value = withTiming(theme.colors.accent, {duration: 300})
        break
      case "appEdit":
        buttonColor.value = withTiming(theme.colors.textCompleted, {duration: 300})
        break
      default:
        break
    }
  }, [appMode, taskInput])


  let gestures = Gesture.Simultaneous(tap, longPress)


  return (
    <GestureDetector gesture={gestures}>
      <Animated.View
        style={[{
          position: 'absolute',
          bottom: 15,
          right: 15,
          width: buttonStyles.default.width,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.colors.accent,
        },
          buttonAnimation,
        ]}
      >
        {
          appMode === 'appDefault' &&
            <View style={{
              height: "100%",
              justifyContent: 'center',
              alignItems: 'center',
            }}
            >
              {/*<Pencil size={20} color={theme.colors.bg} strokeWidth={1}/>*/}
            </View>
        }
        {
          appMode === 'taskNew' &&
            <Animated.View
                style={[{
                  height: "100%",
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end'
                },
                textAnimation
                ]}
                entering={textEnterAnimation}
                exiting={textExitAnimation}
            >
                <Animated.Text
                    style={[{
                      color: theme.colors.bg,
                      fontFamily: 'Haas-Medium',
                      fontSize: 50,
                      padding: 0,
                      margin: 0,
                      lineHeight: 0,
                    },
                    ]}
                >
                  {
                    taskInput ?
                      "save." :
                      "type a new task."
                  }
                </Animated.Text>
            </Animated.View>
        }
        {
          appMode === 'appEdit' &&
            <Animated.View
                style={{
                  height: "100%",
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
            >
                <Undo2 size={30} color={theme.colors.bg} strokeWidth={3}/>
            </Animated.View>
        }
      </Animated.View>
    </GestureDetector>
  )
}
