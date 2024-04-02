import { createTheme, MantineProvider } from '@mantine/core'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { persistStore } from 'reduxjs-toolkit-persist'
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'

import App from './App'
import { store } from './store'

const persistor = persistStore(store)

const theme = createTheme({})

//@ts-ignore
ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <MantineProvider theme={theme}>
          <App />
        </MantineProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
)
