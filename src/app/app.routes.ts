import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'hub',
    loadComponent: () => import('./pages/hub/hub.page').then( m => m.HubPage)
  },
  {
    path: 'forge',
    loadComponent: () => import('./pages/forge/forge.page').then( m => m.ForgePage)
  },
  {
    path: 'market',
    loadComponent: () => import('./pages/market/market.page').then( m => m.MarketPage)
  },
  {
    path: 'storage',
    loadComponent: () => import('./pages/storage/storage.page').then( m => m.StoragePage)
  },
];
