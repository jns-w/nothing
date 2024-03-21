import AppContainer from './src/components/app-container';
import MainScreen from './src/screens/main';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AppContainer>
        <MainScreen/>
      </AppContainer>
    </GestureHandlerRootView>
  );
}

