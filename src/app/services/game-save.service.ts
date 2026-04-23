import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

const SAVE_KEY = 'alloy-crafter.game-save';

type SaveState = {
  startedAt: string;
  updatedAt: string;
  inventory?: Record<string, number>;
  discovered?: Record<string, boolean>;
};

@Injectable({
  providedIn: 'root',
})
export class GameSaveService {
  private storageInstance: Storage | null = null;

  constructor(private storage: Storage) {}

  async hasSave() {
    const saveState = await this.getSave();
    return !!saveState;
  }

  async getSave() {
    const storage = await this.getStorage();
    return storage.get(SAVE_KEY);
  }

  async startNewGame() {
    const now = new Date().toISOString();
    const save: SaveState = {
      startedAt: now,
      updatedAt: now,
      inventory: {},
      discovered: {}
    };

    const storage = await this.getStorage();
    await storage.set(SAVE_KEY, save);

    return save;
  }

  async clearSave() {
    const storage = await this.getStorage();
    await storage.remove(SAVE_KEY);
  }

  async getInventory() {
    const save = await this.getOrCreateSave();
    const rawInventory = save.inventory;

    if (!rawInventory || typeof rawInventory !== 'object') {
      return {};
    }

    const inventory: Record<string, number> = {};

    Object.entries(rawInventory).forEach(([materialId, quantity]) => {
      if (typeof quantity !== 'number' || !Number.isFinite(quantity)) {
        inventory[materialId] = 0;
        return;
      }

      inventory[materialId] = Math.max(0, Math.floor(quantity));
    });

    return inventory;
  }

  async setInventory(inventory: Record<string, number>) {
    const cleanInventory: Record<string, number> = {};

    Object.entries(inventory).forEach(([materialId, quantity]) => {
      if (typeof quantity !== 'number' || !Number.isFinite(quantity)) {
        cleanInventory[materialId] = 0;
        return;
      }

      cleanInventory[materialId] = Math.max(0, Math.floor(quantity));
    });

    await this.updateSave({ inventory: cleanInventory });
  }

  async getDiscovered() {
    const save = await this.getOrCreateSave();
    const rawDiscovered = save.discovered;

    if (!rawDiscovered || typeof rawDiscovered !== 'object') {
      return {};
    }

    const discovered: Record<string, boolean> = {};

    Object.entries(rawDiscovered).forEach(([materialId, isDiscovered]) => {
      discovered[materialId] = isDiscovered === true;
    });

    return discovered;
  }

  async setDiscovered(discovered: Record<string, boolean>) {
    const cleanDiscovered: Record<string, boolean> = {};

    Object.entries(discovered).forEach(([materialId, isDiscovered]) => {
      cleanDiscovered[materialId] = isDiscovered === true;
    });

    await this.updateSave({ discovered: cleanDiscovered });
  }

  private async getStorage() {
    if (this.storageInstance !== null) {
      return this.storageInstance;
    }

    this.storageInstance = await this.storage.create();
    return this.storageInstance;
  }

  private async getOrCreateSave() {
    const existing = await this.getSave();

    if (existing && typeof existing === 'object') {
      return existing as SaveState;
    }

    return this.startNewGame();
  }

  private async updateSave(patch: Partial<SaveState>) {
    const baseSave = await this.getOrCreateSave();
    const updatedSave: SaveState = {
      ...baseSave,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const storage = await this.getStorage();
    await storage.set(SAVE_KEY, updatedSave);
  }
}
