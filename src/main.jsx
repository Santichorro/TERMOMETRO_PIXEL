import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Solo el alfabeto latino (español) y los pesos que se usan
import '@fontsource/pixelify-sans/latin-500.css';
import '@fontsource/pixelify-sans/latin-600.css';
import '@fontsource/mulish/latin-400.css';
import '@fontsource/mulish/latin-600.css';
import './styles/tokens.css';
import './styles/base.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
