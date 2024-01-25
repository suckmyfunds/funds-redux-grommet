import { Grommet, grommet } from 'grommet'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { persistStore } from 'reduxjs-toolkit-persist'
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'

import App from './App'
import { store } from './store'
import { colors } from './theme'

const persistor = persistStore(store)

const theme = {
  ...grommet,
  global: {
    ...grommet.global,
    colors: {
      ...grommet.global?.colors,
      brand: colors.orange,
      //dark: colors.barkBlue,
      border: colors.blue,
      control: colors.orange,
    },
    font: {
      ...grommet.global?.font,
    },
  },
}
//@ts-ignore
ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <Grommet theme={theme}>
          <App />
        </Grommet>
      </BrowserRouter>
    </PersistGate>
  </Provider>
)
