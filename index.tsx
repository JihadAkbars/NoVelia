import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

console.log("Starting NoVelia Application...");
console.log("React runtime version:", React.version);

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color:red; padding:20px;">CRITICAL ERROR: Root element not found.</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
  console.log("React mounted successfully.");
} catch (error: any) {
  console.error("Error during React mount:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif; color: #dc2626;">
      <h3>Application Failed to Start</h3>
      <p style="color: #666; font-size: 14px;">${error.message || error}</p>
    </div>
  `;
}
