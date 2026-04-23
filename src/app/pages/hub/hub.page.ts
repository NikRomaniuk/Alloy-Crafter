import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

interface HubButtonItem {
  id: 'forge' | 'market' | 'storage' | 'home';
  label: string;
  route: '/forge' | '/market' | '/storage' | '/home';
  iconPath: string;
  fallbackEmoji: string;
}

@Component({
  selector: 'app-hub',
  templateUrl: './hub.page.html',
  styleUrls: ['./hub.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, CommonModule],
})
export class HubPage {
  readonly buttons: HubButtonItem[] = [
    {
      id: 'forge',
      label: 'Forge',
      route: '/forge',
      iconPath: 'assets/images/icons/forge.png',
      fallbackEmoji: '⚒️',
    },
    {
      id: 'market',
      label: 'Market',
      route: '/market',
      iconPath: 'assets/images/icons/market.png',
      fallbackEmoji: '🛒',
    },
    {
      id: 'storage',
      label: 'Storage',
      route: '/storage',
      iconPath: 'assets/images/icons/storage.png',
      fallbackEmoji: '📦',
    },
    {
      id: 'home',
      label: 'Main Menu',
      route: '/home',
      iconPath: 'assets/images/icons/home.png',
      fallbackEmoji: '🏠',
    },
  ];

  constructor(private router: Router) {}

  private readonly missingIcons = new Set<HubButtonItem['id']>();

  async onGoTo(route: HubButtonItem['route']) {
    await this.router.navigate([route]);
  }

  isIconVisible(buttonId: HubButtonItem['id']) {
    return !this.missingIcons.has(buttonId);
  }

  onIconError(buttonId: HubButtonItem['id']) {
    this.missingIcons.add(buttonId);
  }
}
