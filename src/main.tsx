import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './store'
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import theme from './theme.ts'
import { persistStore } from 'reduxjs-toolkit-persist'
import { BrowserRouter } from 'react-router-dom'

const persistor = persistStore(store);


const GlobalStyle = createGlobalStyle`
  html {
    background-color: ${({ theme }) => theme.bgColor};
    color: ${({ theme }) => theme.fgColor};
  }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 1em;

    display: flex;
    min-width: 320px;
    min-height: 100vh;
  }
  a {
    text-decoration: none;
    color: ${({ theme }) => theme.fgColor};
  }
`



//@ts-ignore
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme.light}>
      <GlobalStyle />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ThemeProvider>

  </React.StrictMode>,
)
