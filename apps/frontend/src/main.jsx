import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  const hotelId = sessionStorage.getItem('hms_selected_hotel_id');
  if (hotelId && typeof resource === 'string' && resource.includes('/api/')) {
    const url = new URL(resource.startsWith('http') ? resource : window.location.origin + resource);
    url.searchParams.set('hotel_id', hotelId);
    resource = url.toString();
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
