import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {refreshDurableStorage} from './services/durableStorage';
import {installDatabaseProducts} from './data/mockGenerator';
import './index.css';

async function boot(){
const state=await refreshDurableStorage();if(state.database)installDatabaseProducts(state.products);
const {default:App}=await import('./App.tsx');
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

}
void boot().catch(()=>{document.getElementById('root')!.textContent='دریافت اطلاعات سایت از پایگاه داده ممکن نشد. لطفاً دوباره بارگذاری کنید.';});
