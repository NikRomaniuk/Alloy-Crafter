import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { GameSaveService } from '../services/game-save.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, NgIf],
})
export class HomePage implements OnInit {
  hasSaveGame = false;

  constructor(
    private router: Router,
    private gameSaveService: GameSaveService,
  ) {}

  async ngOnInit() {
    await this.refreshSaveAvailability();
  }

  async ionViewWillEnter() {
    await this.refreshSaveAvailability();
  }

  async onLoadGame() {
    const saveExists = await this.gameSaveService.hasSave();

    if (!saveExists) {
      this.hasSaveGame = false;
      return;
    }

    await this.router.navigate(['/hub']);
  }

  async onNewGame() {
    await this.gameSaveService.startNewGame();
    this.hasSaveGame = true;
    await this.router.navigate(['/hub']);
  }

  async onExitGame() {
    if (Capacitor.isNativePlatform()) {
      await App.exitApp();
    }
  }

  private async refreshSaveAvailability() {
    this.hasSaveGame = await this.gameSaveService.hasSave();
  }
}
