import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom, forkJoin } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { GameSaveService } from '../../services/game-save.service';
import { AudioService } from '../../services/audio.service';
import { Haptics } from '@capacitor/haptics';

interface AlloyRecipeIngredient {
  materialId: string;
}

interface AlloyRecipe {
  id: string;
  craftTime: number;
  quantity: number;
  ingredients: AlloyRecipeIngredient[];
}

interface MaterialDefinition {
  id: string;
  name: string;
  purchaseCost: number;
  sellCost: number;
  initDiscovered: boolean;
}

interface MaterialState extends MaterialDefinition {
  quantity: number;
  discovered: boolean;
}

type SlotKey = 'first' | 'second';

@Component({
  selector: 'app-forge',
  templateUrl: './forge.page.html',
  styleUrls: ['./forge.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonProgressBar,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonRadioGroup,
    IonRadio,
    CommonModule,
    FormsModule,
  ],
})
export class ForgePage implements OnInit {
  readonly fallbackEmoji = '🪨';
  readonly recipesUrl = 'https://gist.githubusercontent.com/NikRomaniuk/ef33825844c357c3e49771ea3a319b1f/raw/alloyRecipes.json';
  readonly materialsUrl = 'https://gist.githubusercontent.com/NikRomaniuk/ef33825844c357c3e49771ea3a319b1f/raw/materials.json';
  readonly bangSoundIds = ['bang_01', 'bang_02', 'bang_03'];

  materialDefinitions: MaterialDefinition[] = [];
  materials: MaterialState[] = [];
  recipes: AlloyRecipe[] = [];

  isLoading = true;
  loadErrorMessage = '';

  openSelectorSlot: SlotKey | null = null;
  firstSlotMaterialId: string | null = null;
  secondSlotMaterialId: string | null = null;

  activeRecipe: AlloyRecipe | null = null;
  craftingRecipe: AlloyRecipe | null = null;
  isCrafting = false;
  elapsedCraftTime = 0;
  private craftingAnimationFrameId: number | null = null;
  private lastCraftFrameTimestamp: number | null = null;
  private isCompletingCraft = false;

  private inventoryById: Record<string, number> = {};
  private discoveredById: Record<string, boolean> = {};
  private missingIcons = new Set<string>();

  constructor(
    private http: HttpClient,
    private gameSaveService: GameSaveService,
    private audioService: AudioService,
  ) {}

  async ngOnInit() {
    await this.loadForgeData();
  }

  ionViewWillLeave() {
    this.stopCraftingProcess();
    this.closeSelector();
  }

  get selectorMaterials() {
    return this.materials.filter((material) => material.discovered);
  }

  get craftedMaterialId() {
    return this.activeRecipe ? this.activeRecipe.id : null;
  }

  get craftedMaterialName() {
    if (!this.activeRecipe) {
      return 'No recipe';
    }

    const craftedMaterial = this.getMaterialById(this.activeRecipe.id);
    return craftedMaterial?.name ?? this.activeRecipe.id;
  }

  get craftedQuantityLabel() {
    return this.activeRecipe ? `x${this.activeRecipe.quantity}` : 'x0';
  }

  get isInteractionLocked() {
    return this.isLoading || this.loadErrorMessage.length > 0;
  }

  get canStartCrafting() {
    return !this.isInteractionLocked && !this.isCrafting && this.hasEnoughResources(this.activeRecipe);
  }

  get canBang() {
    return this.isCrafting && this.craftingRecipe !== null;
  }

  get progressValue() {
    if (!this.isCrafting || !this.craftingRecipe || this.craftingRecipe.craftTime <= 0) {
      return 0;
    }

    return Math.min(this.elapsedCraftTime / this.craftingRecipe.craftTime, 1);
  }

  onToggleSelector(slot: SlotKey) {
    if (this.isCrafting || this.isInteractionLocked) {
      return;
    }

    if (this.openSelectorSlot === slot) {
      this.openSelectorSlot = null;
      return;
    }

    this.openSelectorSlot = slot;
  }

  closeSelector() {
    this.openSelectorSlot = null;
  }

  getOpenSlotSelectionId() {
    if (this.openSelectorSlot === 'first') {
      return this.firstSlotMaterialId;
    }

    if (this.openSelectorSlot === 'second') {
      return this.secondSlotMaterialId;
    }

    return null;
  }

  onSelectMaterial(materialId: string) {
    if (!this.openSelectorSlot || this.isCrafting) {
      return;
    }

    if (this.openSelectorSlot === 'first') {
      this.firstSlotMaterialId = materialId;
    } else {
      this.secondSlotMaterialId = materialId;
    }

    this.updateRecipePreview();
  }

  getSlotMaterial(slot: SlotKey) {
    if (slot === 'first') {
      return this.getMaterialById(this.firstSlotMaterialId);
    }

    return this.getMaterialById(this.secondSlotMaterialId);
  }

  getMaterialById(materialId: string | null) {
    if (!materialId) {
      return null;
    }

    return this.materials.find((material) => material.id === materialId) ?? null;
  }

  isIconVisible(materialId: string | null) {
    if (!materialId) {
      return false;
    }

    return !this.missingIcons.has(materialId);
  }

  onIconError(materialId: string) {
    this.missingIcons.add(materialId);
  }

  async onStartCrafting() {
    if (!this.canStartCrafting || !this.activeRecipe) {
      return;
    }

    this.craftingRecipe = this.activeRecipe;
    this.isCrafting = true;
    this.elapsedCraftTime = 0;
    this.closeSelector();
    this.startCraftingTimer();
  }

  async onBang() {
    if (!this.canBang || !this.craftingRecipe) {
      return;
    }

    const randomSoundIndex = Math.floor(Math.random() * this.bangSoundIds.length);
    void this.audioService.play(this.bangSoundIds[randomSoundIndex]);
    await Haptics.vibrate({ duration: 50 });
    await this.advanceCraftTime(0.25);
  }

  private startCraftingTimer() {
    this.clearCraftingTimer();
    this.lastCraftFrameTimestamp = null;

    const tick = (timestamp: number) => {
      if (!this.isCrafting || !this.craftingRecipe) {
        return;
      }

      if (this.lastCraftFrameTimestamp === null) {
        this.lastCraftFrameTimestamp = timestamp;
      }

      const deltaSeconds = (timestamp - this.lastCraftFrameTimestamp) / 1000;
      this.lastCraftFrameTimestamp = timestamp;

      void this.advanceCraftTime(deltaSeconds);

      if (this.isCrafting) {
        this.craftingAnimationFrameId = requestAnimationFrame(tick);
      }
    };

    this.craftingAnimationFrameId = requestAnimationFrame(tick);
  }

  private clearCraftingTimer() {
    if (this.craftingAnimationFrameId !== null) {
      cancelAnimationFrame(this.craftingAnimationFrameId);
      this.craftingAnimationFrameId = null;
    }

    this.lastCraftFrameTimestamp = null;
  }

  private async advanceCraftTime(seconds: number) {
    if (!this.isCrafting || !this.craftingRecipe || this.isCompletingCraft) {
      return;
    }

    this.elapsedCraftTime = Math.min(this.elapsedCraftTime + seconds, this.craftingRecipe.craftTime);

    if (this.elapsedCraftTime >= this.craftingRecipe.craftTime) {
      this.isCompletingCraft = true;
      await this.completeCrafting();
      this.isCompletingCraft = false;
    }
  }

  private async loadForgeData() {
    this.isLoading = true;
    this.loadErrorMessage = '';

    try {
      const payload = await firstValueFrom(
        forkJoin({
          recipes: this.http.get<AlloyRecipe[]>(this.recipesUrl),
          materials: this.http.get<MaterialDefinition[]>(this.materialsUrl),
        }),
      );

      this.recipes = payload.recipes;
      this.materialDefinitions = payload.materials;

      await this.initializeInventoryState(payload.materials);
      this.rebuildMaterials();
      this.updateRecipePreview();
    } catch {
      this.recipes = [];
      this.materialDefinitions = [];
      this.materials = [];
      this.loadErrorMessage = 'Failed to load forge data.';
      this.closeSelector();
    } finally {
      this.isLoading = false;
    }
  }

  private async initializeInventoryState(materialDefinitions: MaterialDefinition[]) {
    const savedInventory = await this.gameSaveService.getInventory();
    const savedDiscovered = await this.gameSaveService.getDiscovered();

    const hasSavedState =
      Object.keys(savedInventory).length > 0 || Object.keys(savedDiscovered).length > 0;

    const inventoryById: Record<string, number> = {};
    const discoveredById: Record<string, boolean> = {};

    materialDefinitions.forEach((material) => {
      if (hasSavedState) {
        const savedQuantity = savedInventory[material.id];
        const safeQuantity = typeof savedQuantity === 'number' ? Math.max(0, Math.floor(savedQuantity)) : 0;
        inventoryById[material.id] = safeQuantity;

        const savedDiscoverState = savedDiscovered[material.id];
        if (savedDiscoverState === true) {
          discoveredById[material.id] = true;
        } else if (savedDiscoverState === false) {
          discoveredById[material.id] = false;
        } else {
          discoveredById[material.id] = material.initDiscovered;
        }

        return;
      }

      discoveredById[material.id] = material.initDiscovered;
      inventoryById[material.id] = material.initDiscovered ? 10 : 0;
    });

    this.inventoryById = inventoryById;
    this.discoveredById = discoveredById;

    await this.gameSaveService.setInventory(this.inventoryById);
    await this.gameSaveService.setDiscovered(this.discoveredById);
  }

  private rebuildMaterials() {
    this.materials = this.materialDefinitions.map((material) => {
      const quantity = this.inventoryById[material.id] ?? 0;
      const discovered = this.discoveredById[material.id] === true;

      return {
        ...material,
        quantity,
        discovered,
      };
    });
  }

  private updateRecipePreview() {
    this.activeRecipe = this.findMatchingRecipe(this.firstSlotMaterialId, this.secondSlotMaterialId);
  }

  private findMatchingRecipe(firstMaterialId: string | null, secondMaterialId: string | null) {
    if (!firstMaterialId || !secondMaterialId) {
      return null;
    }

    const selectedCounts = this.toCountMap([firstMaterialId, secondMaterialId]);

    return (
      this.recipes.find((recipe) => {
        const recipeIngredients = recipe.ingredients.map((ingredient) => ingredient.materialId);
        const recipeCounts = this.toCountMap(recipeIngredients);

        return this.isCountMapEqual(selectedCounts, recipeCounts);
      }) ?? null
    );
  }

  private toCountMap(values: string[]) {
    const counts: Record<string, number> = {};

    values.forEach((value) => {
      counts[value] = (counts[value] ?? 0) + 1;
    });

    return counts;
  }

  private isCountMapEqual(first: Record<string, number>, second: Record<string, number>) {
    const firstKeys = Object.keys(first);
    const secondKeys = Object.keys(second);

    if (firstKeys.length !== secondKeys.length) {
      return false;
    }

    return firstKeys.every((key) => first[key] === second[key]);
  }

  private hasEnoughResources(recipe: AlloyRecipe | null) {
    if (!recipe) {
      return false;
    }

    const requirements = this.toCountMap(recipe.ingredients.map((ingredient) => ingredient.materialId));

    return Object.entries(requirements).every(([materialId, requiredQuantity]) => {
      const availableQuantity = this.inventoryById[materialId] ?? 0;
      return availableQuantity >= requiredQuantity;
    });
  }

  private async completeCrafting() {
    const recipe = this.craftingRecipe;

    this.clearCraftingTimer();

    this.isCrafting = false;
    this.craftingRecipe = null;
    this.elapsedCraftTime = 0;

    if (!recipe || !this.hasEnoughResources(recipe)) {
      return;
    }

    const requirements = this.toCountMap(recipe.ingredients.map((ingredient) => ingredient.materialId));

    Object.entries(requirements).forEach(([materialId, requiredQuantity]) => {
      const currentQuantity = this.inventoryById[materialId] ?? 0;
      this.inventoryById[materialId] = Math.max(0, currentQuantity - requiredQuantity);
    });

    this.inventoryById[recipe.id] = (this.inventoryById[recipe.id] ?? 0) + recipe.quantity;
    this.discoveredById[recipe.id] = true;

    await this.gameSaveService.setInventory(this.inventoryById);
    await this.gameSaveService.setDiscovered(this.discoveredById);

    this.rebuildMaterials();
    this.updateRecipePreview();
    void this.audioService.play('craft-complete_01');
  }

  private stopCraftingProcess() {
    this.clearCraftingTimer();
    this.isCompletingCraft = false;
    this.isCrafting = false;
    this.craftingRecipe = null;
    this.elapsedCraftTime = 0;
  }
}
