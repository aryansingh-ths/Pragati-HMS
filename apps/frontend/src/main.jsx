import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)