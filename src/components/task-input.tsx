import {LayoutChangeEvent, ScrollView, StyleSheet, Text, View} from "react-native";
import {TextInput} from "react-native-gesture-handler";
import {theme} from "../styles/theme";
import {createRef, RefObject, useEffect} from "react";
import {Task, taskInputAtom} from "../atoms/tasks";
import {useAtom} from "jotai";
import {appModeAtom, currentEditTaskAtom} from "../atoms/ui";
import Animated, {Easing, withTiming} from "react-native-reanimated";


type TaskInputProps = {
  scrollRef: RefObject<Animated.ScrollView>
  task?: Task
}

export default function TaskInput(props: TaskInputProps) {
  const [appMode, setAppMode] = useAtom(appModeAtom)
  const [input, setInput] = useAtom(taskInputAtom)
  const [, setCurrentEditTask] = useAtom(currentEditTaskAtom)

  function inputHandler(text: string) {
    setInput(text.toLowerCase())
  }

  const inputRef = createRef<TextInput>()

  // scroll down when input goes to next line
  function handleLayoutChange(ev: LayoutChangeEvent) {
    props.scrollRef.current?.scrollToEnd({animated: true})
  }

  function handleOnBlur(ev) {
    switch (appMode) {
      case "taskNew":
        setAppMode("appDefault")
        break
      case "taskEdit":
        setAppMode("appDefault")
        setCurrentEditTask(null)
        setInput("")
        break
    }
  }

  const styles = StyleSheet.create({
    textInput: {
      ...theme.typography.taskText,
      lineHeight: 40,
      paddingTop: 8,
      margin: 0,
      color: theme.colors.bg,
      width: '100%',
    }
  })

  const InputEnterAnimation = () => {
    'worklet';
    const initialValues = {
      opacity: 0
    }
    const animations = {
      opacity: withTiming(1, {duration: 300})
    }
    return {
      initialValues,
      animations,
    }
  }

  const InputExitAnimation = () => {
    'worklet';
    const initialValues = {
      opacity: 1
    }
    const animations = {
      opacity: withTiming(0, {duration: 300})
    }
    return {
      initialValues,
      animations,
    }
  }

  const BgEnterAnimation = (values: any) => {
    'worklet';
    const animations = {
      width: withTiming(values.targetWidth, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    }
    const initialValues = {
      width: 0,
    }
    return {
      initialValues,
      animations,
    }
  }

  const BgExitAnimation = (values: any) => {
    'worklet';
    const animations = {
      width: withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    }
    const initialValues = {
      width: values.currentWidth,
    }
    return {
      initialValues,
      animations,
    }
  }

// focus on input on mount
  useEffect(() => {
    if ((appMode === "taskNew" || appMode === "taskEdit") && inputRef.current) {
      inputRef.current.focus()
    }
  }, [appMode])

  useEffect(() => {
    if (props.task) {
      setInput(props.task.content)
    }
  }, [])

  return (
    <ScrollView keyboardShouldPersistTaps='always'>
      {appMode === "taskNew" || "taskEdit" ?
        <Animated.View
          entering={InputEnterAnimation}
          exiting={InputExitAnimation}
        >
          {
            // background color for text input using pseudo text
            input &&
              <Animated.View
                  style={[{
                    position: 'absolute',
                    backgroundColor: theme.colors.text,
                    top: 2,
                  }]}
                  entering={BgEnterAnimation}
                  exiting={BgExitAnimation}
              >
                  <Text
                      style={{
                        ...theme.typography.taskText,
                        color: 'transparent'
                      }}
                  >{input.toLowerCase()}</Text>
              </Animated.View>
          }
          <TextInput
            onLayout={ev => handleLayoutChange(ev)}
            ref={inputRef}
            onChangeText={inputHandler}
            keyboardType='default'
            onBlur={handleOnBlur}
            style={styles.textInput}
            multiline={true}
          >
            <Text>
              {input.toLowerCase()}
            </Text>
          </TextInput>
        </Animated.View>
        :
        <View/>
      }
    </ScrollView>
  )
}