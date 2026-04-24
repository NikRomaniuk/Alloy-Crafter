# Alloy Crafter

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Windows-blue)](#)
[![Framework](https://img.shields.io/badge/framework-Ionic%208-blueviolet)](#)
[![Angular](https://img.shields.io/badge/angular-18-dd0031)](#)
[![PWA](https://img.shields.io/badge/PWA-supported-orange)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)
[![Status](https://img.shields.io/badge/stage-alpha-yellow)](#)

## Description
**Alloy Crafter** is a resource management game built as a Progressive Web Application using the Ionic framework

## Key Features
- **Navigation:** Hub navigation to Forge, Market, Storage, and Main Menu
- **Crafting:** Forge crafting loop with two input slots, recipe matching and materials checks
- **Presistance:** Persistent game state via Ionic Storage: Inventory, discovered Materials
- **External API:** Remote loading of Materials and Recipes via HTTP
- **Plugins:** Haptics on "Forge hit" and NativeAudio playback:
  - Random "Forge hit" sound: `bang_01 | bang_02 | bang_03`
  - Craft completion sound: `craft-complete_01`

## User Guide
1. Press **New Game** (or **Load Game** if a save already exists)
2. In **Hub**, go to **Forge**
3. Select 2 Materials in the input slots to preview the matching recipe result
4. Press **Start Crafting**, then tap **BANG** to speed up progress
5. When crafting completes, the new material is added to inventory and saved automatically
6. Experiment and explore!

## Technical Stack
- **Framework:** Ionic CLI v7.0+ with Angular Standalone Components
- **Language:** TypeScript

## Demo (Firebase Hosting)
Use the hosted demo to try the App instantly with no installation required!
- **Demo URL:** [Demo from Firebase](https://alloy-crafter.web.app)

## Quick Start

### Install Dependencies
Ensure you have [Node.js](https://nodejs.org/en) installed, then run:
   ```bash
   npm install
   ```

### Project Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/NikRomaniuk/Alloy-Crafter.git
   cd alloy-crafter
   ```

2. **Launch the Application**
   ```bash
   ionic serve
   ```

## AI Acknowledgment
- **GitHub Copilot:** Used for code suggestions in scripts and for writing some code comments
- **Gemini:** Used for information gathering and quick reference research

## Author
- **Developer:** Nik Romaniuk

## Contact Me
<p>
	<a href="https://www.linkedin.com/in/nik-romaniuk"><img src="https://img.shields.io/badge/LinkedIn-Nik%20Romaniuk-0A66C2?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn"></a><br>
	<a href="mailto:g00468889@atu.ie"><img src="https://img.shields.io/badge/Student%20Email-g00468889%40atu.ie-0F8F8F?style=flat&logo=gmail&logoColor=white" alt="Student Email"></a><br>
	<a href="mailto:expifel@gmail.com"><img src="https://img.shields.io/badge/Personal%20Email-expifel%40gmail.com-8B6BCF?style=flat&logo=gmail&logoColor=white" alt="Personal Email"></a>
</p>

## License
This project is distributed under the **MIT License**
