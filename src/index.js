import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './newUi/tokens.css';
import './newUi/override.css';
import './newUi/loading.css';
import logoMask from './Assets/Images/PlanieLogoMark.svg';
import App from './App';
import reportWebVitals from './reportWebVitals';

// The sidebar logo is drawn via CSS mask (override.css); the asset URL is
// only known to the bundler, so expose it as a CSS variable here.
document.documentElement.style.setProperty('--nu-logo-mask', `url(${logoMask})`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
