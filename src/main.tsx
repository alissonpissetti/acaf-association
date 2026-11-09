import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AssociationProvider } from './associationContext';
import { FlashProvider } from './flashContext';
import './styles/fonts.css';
import './styles/global.css';
import './app-overrides.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AssociationProvider>
        <FlashProvider>
          <App />
        </FlashProvider>
      </AssociationProvider>
    </BrowserRouter>
  </StrictMode>,
);
