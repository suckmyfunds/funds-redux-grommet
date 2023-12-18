import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store'
import { PersistGate } from 'redux-persist/integration/react'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import theme from './theme.ts'
import { persistStore } from 'redux-persist'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";


const persistor = persistStore(store);


const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.black};
    color: ${({ theme }) => theme.colors.white};
    padding: 1em;

    display: flex;
    min-width: 320px;
    min-height: 100vh;
  }

`
//import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
        </PersistGate>
      </Provider>
    </ThemeProvider>

  </React.StrictMode>,
)
