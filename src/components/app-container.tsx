import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native'

type Props = {
  children: React.ReactNode;
};

export default function AppContainer({children}: Props) {
  return (
      <NavigationContainer>
        {children}
      </NavigationContainer>
  );
}
