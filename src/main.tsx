import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'
import App from './App'
import { store } from './store'
import { Grommet, grommet } from 'grommet'
import { BrowserRouter } from 'react-router-dom'
import { persistStore } from 'reduxjs-toolkit-persist'

const persistor = persistStore(store);

const theme = {
  global: {
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
};



//@ts-ignore
ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <Grommet theme={grommet}>
          <App />
        </Grommet>
      </BrowserRouter>
    </PersistGate>
  </Provider>
  ,
)
