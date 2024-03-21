import * as React from 'react'
import {useCallback, useRef} from 'react'
import {StyleSheet, View} from 'react-native'
import {useFonts} from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import TaskList from "../components/tasklist";
import HelperButton from "../components/helper-button";
import {theme} from "../styles/theme";
import Animated, {useAnimatedKeyboard, useAnimatedStyle, useSharedValue} from "react-native-reanimated";
import {useAtom} from "jotai";
import {appModeAtom} from "../atoms/ui";
import {EditOptionButtons} from "../components/edit-option-buttons";

SplashScreen.preventAutoHideAsync()

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    position: 'relative',
  },
})


export default function MainScreen() {

  const [appMode,] = useAtom(appModeAtom)

  const [loaded, error] = useFonts({
    'Haas-Medium': require("../assets/fonts/NeueHaasGrotesk-Medium.ttf"),
    'Haas-Bold': require("../assets/fonts/NeueHaasGrotesk-Bold.ttf"),
    'Haas-Black': require("../assets/fonts/NeueHaasGrotesk-Black.ttf"),
  })


  const tasksScrollRef = useRef<Animated.ScrollView>(null)

  const keyboard = useAnimatedKeyboard()
  const containerAnimation = useAnimatedStyle(() => ({
    transform: [
      {translateY: -keyboard.height.value}
    ],
  }))

  const onLayoutRootView = useCallback(async () => {
    if (loaded || error) {
      await SplashScreen.hideAsync()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <View
      style={styles.wrapper}
    >
      <Animated.View
        onLayout={onLayoutRootView}
        style={[
          styles.container,
          containerAnimation
        ]}
      >
        <TaskList scrollRef={tasksScrollRef}/>
      </Animated.View>
      <HelperButton
        keyboard={keyboard}
        scrollRef={tasksScrollRef}
      />
      {appMode === 'appEdit' && <EditOptionButtons/>}
    </View>
  )
}
