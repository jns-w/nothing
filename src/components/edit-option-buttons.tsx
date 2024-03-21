import {StyleSheet, Text, View} from "react-native";
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import {theme} from "../styles/theme";
import {useCallback, useEffect, useState} from "react";
import {taskListAtom} from "../atoms/tasks";
import {useAtom} from "jotai";
import {produce} from "immer";
import {appModeAtom} from "../atoms/ui";

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 0,
    alignItems: 'flex-end'
  },
  buttonWrapper: {
    right: 0,
    height: 45,
  },
  text: {
    fontFamily: 'Haas-Medium',
    fontSize: 45,
    color: theme.colors.bg
  }
})

export function EditOptionButtons() {
  const [tasks, setTasks] = useAtom(taskListAtom)
  const [hasSelected, setHasSelected] = useState(false)

  const [, setAppMode] = useAtom(appModeAtom)

  const completeSelected = useCallback(() => {
    setTasks(
      produce(draft => {
        draft.forEach(task => {
          if (task.isSelected) {
            task.isCompleted = true
            task.isSelected = false
          }
        })
      })
    )
    setAppMode('appDefault')
  }, [])

  const deleteSelected = useCallback(() => {
    setTasks(
      produce(draft => {
        draft.forEach(task => {
          if (task.isSelected) {
            task.isDeleted = true
            task.isSelected = false
          }
        })
      })
    )
    setAppMode('appDefault')
  }, [])


  useEffect(() => {
    let hasSelectionCheck = false
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].isSelected && !tasks[i].isDeleted) {
        hasSelectionCheck = true
        break
      }
    }
    if (hasSelectionCheck) {
      setHasSelected(true)
    } else {
      setHasSelected(false)
    }
  }, [tasks])

  return (
    <Animated.View
      style={[
        styles.container
      ]}
    >
      <OptionButton
        text="delete"
        isActive={hasSelected}
        color={theme.colors.warning}
        fn={deleteSelected}/>
      <OptionButton
        text="mark completed"
        isActive={hasSelected}
        color={theme.colors.accent}
        fn={completeSelected}/>
    </Animated.View>
  )
}

type OptionButtonProps = {
  text: string
  isActive: boolean
  color: string
  fn: () => void
}

function OptionButton(props: OptionButtonProps) {

  const buttonColor = useSharedValue(theme.colors.textCompleted)

  const buttonAnimation = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(buttonColor.value, {duration: 150})
    }
  })

  const buttonEnterAnimation = (values: any) => {
    'worklet';
    const animations = {
      originX: withTiming(values.targetOriginX, {
        duration: 400,
        easing: Easing.out(Easing.exp),
      }),
    }
    const initialValues = {
      originX: values.targetWidth
    }

    return {
      initialValues,
      animations,
    }
  }

  const buttonExitAnimation = (values: any) => {
    'worklet';
    const animations = {
      originX: withTiming(values.currentWidth, {
        duration: 400,
        easing: Easing.out(Easing.exp),
      }),
    }
    const initialValues = {
      originX: values.currentOriginX,
    }
    return {
      initialValues,
      animations,
    }
  }

  useEffect(() => {
    if (props.isActive) {
      buttonColor.value = props.color
    } else {
      buttonColor.value = theme.colors.textCompleted
    }
  }, [props.isActive])

  return (
    <View
      style={styles.buttonWrapper}
    >
      <Animated.View
        style={buttonAnimation}
        entering={buttonEnterAnimation}
        exiting={buttonExitAnimation}
        onTouchEnd={
          props.isActive ? props.fn : () => {
          }
        }
      >
        <Text
          style={styles.text}>{props.text}.
        </Text>
      </Animated.View>
    </View>
  )

}