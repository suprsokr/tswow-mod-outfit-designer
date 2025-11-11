# Outfit Designer

A TSWoW module for creating and managing DressNPC outfits with a visual in-game editor. Design custom NPC appearances by configuring race, gender, facial features, and equipment, then export to DressNPCs database table or to datascript.

## Overview

Outfit Designer provides an in-game UI for creating creature outfits that integrate with the DressNPCs system. Spawn preview creatures, customize their appearance in real-time, and export the results to database format or datascript code.

## Requirements
In modules/<yourmodule>/datasets/dataset/dataset.conf, be sure that !client-extensions is removed from Client.Patches.

## File Structure

```
outfit-designer/
├── datascripts/          # Creates preview dummy creature
│   └── datascripts.ts    # Defines outfit-preview-dummy NPC
├── livescripts/          # Server-side logic (main business logic)
│   ├── livescripts.ts    # Entry point, registers all handlers
│   ├── state.ts          # Global state (playerCreatures, creatureOutfits)
│   ├── types.ts          # TypeScript interfaces (OutfitState, ItemData)
│   ├── utils.ts          # Helper functions (slot mapping, permissions)
│   ├── logger.ts         # Logging utilities
│   └── handlers/
│       ├── spawnHandlers.ts        # Spawn/despawn preview creatures
│       ├── outfitHandlers.ts       # Set/reset/copy/apply outfits
│       ├── itemHandlers.ts         # Equip/unequip items
│       └── savedOutfitHandlers.ts  # Save/load/delete/export outfits
├── addon/                # Client-side UI (WoW addon)
│   ├── addon.ts          # Entry point, slash commands (/od)
│   ├── packets/
│   │   └── packetHandlers.ts      # Receives server responses
│   ├── state/
│   │   └── addonState.ts           # Client state management
│   └── ui/
│       ├── createUI.ts             # Main UI orchestrator
│       ├── uiReferences.ts         # UI element references
│       ├── uiUpdates.ts            # UI update logic
│       └── builders/               # Individual UI components
│           ├── mainFrameBuilder.ts
│           ├── actionButtonsBuilder.ts
│           ├── appearanceControlsBuilder.ts
│           ├── itemSearchBuilder.ts
│           ├── equippedItemsBuilder.ts
│           ├── savedOutfitsBuilder.ts
│           └── exportPopupBuilder.ts
└── shared/               # Shared between addon and livescripts
    ├── MessageRegistry.ts          # Packet ID registry (900-921)
    └── messages/                   # 22 message types for client-server communication
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      OUTFIT DESIGNER                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐      Custom Packets       ┌──────────────────┐
│   CLIENT (Addon) │ ◄────────────────────────► │ SERVER (Livescr) │
│                  │      (900-921 IDs)         │                  │
│  ┌────────────┐  │                            │  ┌────────────┐  │
│  │     UI     │  │                            │  │  Handlers  │  │
│  │ Builders   │  │                            │  │  - Spawn   │  │
│  │  (7 types) │  │                            │  │  - Outfit  │  │
│  └────────────┘  │                            │  │  - Item    │  │
│        │         │                            │  │  - Saved   │  │
│  ┌────────────┐  │                            │  └────────────┘  │
│  │   Packet   │  │                            │        │         │
│  │  Handlers  │  │                            │  ┌────────────┐  │
│  └────────────┘  │                            │  │   State    │  │
│        │         │                            │  │ Management │  │
│  ┌────────────┐  │                            │  └────────────┘  │
│  │   State    │  │                            │        │         │
│  └────────────┘  │                            │  ┌────────────┐  │
└──────────────────┘                            │  │ DressNPCs  │  │
                                                │  │ Database   │  │
┌──────────────────┐                            │  └────────────┘  │
│   DATASCRIPTS    │                            └──────────────────┘
│                  │
│  Creates preview │
│  dummy creature  │
│  (entry stored   │
│   via TAG)       │
└──────────────────┘
```

## Workflow: Creating an Outfit

```
1. User opens UI (/od or /outfitdesigner)
   │
   ├─► 2. Click "Spawn" button
   │   └─► SpawnMessage → Server spawns preview creature with current state
   │
   ├─► 3. Adjust appearance (Race, Gender, Skin, Face, Hair, etc.)
   │   └─► SetCustomOutfitMessage → Server updates creature outfit
   │
   ├─► 4. Search & equip items
   │   ├─► ItemSearchMessage → Server queries item_template
   │   ├─► ItemSearchResultsMessage ← Server returns results
   │   └─► EquipItemMessage → Server updates creature's equipped items
   │
   ├─► 5. Save outfit (in-memory or to database)
   │   ├─► SaveOutfitMessage → Saves to player memory
   │   └─► SaveOutfitToDBMessage → Writes to creature_template_outfits
   │
   └─► 6. Export outfit code
       └─► ExportOutfitMessage → Server generates C++ or SQL code
```

## Usage

### In-Game Commands

- `/od` or `/outfitdesigner` - Toggle the Outfit Designer UI

### Workflow

1. **Open the UI** using `/od`
2. **Spawn a preview creature** with the "Spawn" button
3. **Customize appearance** using the dropdowns (race, gender, skin, face, hair, hair color, facial hair)
4. **Search and equip items** by entering item names in the search box
5. **Save your outfit** to memory or export to database
6. **Export code** to get SQL or C++ definitions

### Permissions

Requires GM rank to use all features.

## Key Features

- **Real-time Preview**: Spawn a dummy creature to visualize outfits
- **Race & Gender**: Support for all WoW races and both genders
- **Appearance Customization**: Skin, face, hair style, hair color, facial hair
- **Item Search**: Search items by name with fuzzy matching
- **Equipment Slots**: Head, Shoulders, Chest, Waist, Legs, Feet, Wrists, Hands, Back, Mainhand, Offhand, Ranged, Tabard
- **Outfit Management**: Save, load, delete outfits (in-memory)
- **Database Export**: Export to `creature_template_outfits` table (DressNPCs format)
- **Code Generation**: Export to datascript that can be copy-pasted into your project.
- **Copy/Paste**: Copy outfits between creatures

## DressNPCs Integration

Creates outfits compatible with the DressNPCs system:

- Uses `creature_template_outfits` table (entry > 2147483647)
- Supports positive values (item entries) and negative values (display IDs)
- Race/gender/appearance values map directly to DressNPCs columns
- Generated outfit entries can be used as `modelid` in creature templates
