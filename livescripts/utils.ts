// Utility functions for outfit designer

// Map slot number to database column name
export function mapSlotNumberToDBColumn(slotNum: number): string {
    switch (slotNum) {
        case 0: return 'head';
        case 2: return 'shoulders';
        case 3: return 'body';
        case 4: return 'chest';
        case 5: return 'waist';
        case 6: return 'legs';
        case 7: return 'feet';
        case 8: return 'wrists';
        case 9: return 'hands';
        case 14: return 'back';
        case 15: return 'mainhand';
        case 16: return 'offhand';
        case 17: return 'ranged';
        case 18: return 'tabard';
        default: return '';
    }
}

// Map inventory type to outfit slot and slot name
export function mapInventoryTypeToSlot(invType: number): {slot: number, slotName: string} {
    let slot = -1;
    let slotName = '';
    
    switch (invType) {
        case 1: slot = 0; slotName = 'Head'; break;
        case 3: slot = 2; slotName = 'Shoulder'; break;
        case 4: slot = 3; slotName = 'Body'; break;
        case 5: case 20: slot = 4; slotName = 'Chest'; break;
        case 6: slot = 5; slotName = 'Waist'; break;
        case 7: slot = 6; slotName = 'Legs'; break;
        case 8: slot = 7; slotName = 'Feet'; break;
        case 9: slot = 8; slotName = 'Wrists'; break;
        case 10: slot = 9; slotName = 'Hands'; break;
        case 16: slot = 14; slotName = 'Back'; break;
        case 19: slot = 18; slotName = 'Tabard'; break;
        // Weapon slots
        case 13: slot = 15; slotName = 'Weapon (1H)'; break; // One-Hand
        case 17: slot = 15; slotName = 'Weapon (2H)'; break; // Two-Hand
        case 21: slot = 15; slotName = 'Main Hand'; break; // Main hand
        case 22: slot = 16; slotName = 'Off Hand'; break; // Off hand
        case 14: slot = 16; slotName = 'Shield'; break; // Shield (off hand)
        case 23: slot = 16; slotName = 'Held In Off-Hand'; break; // Held in off-hand
        case 15: case 26: slot = 17; slotName = 'Ranged'; break; // Ranged
    }
    
    return {slot, slotName};
}

// Map slot name to slot number
export function mapSlotNameToNumber(slotName: string): number {
    switch (slotName) {
        case 'Head': return 0;
        case 'Shoulder': return 2;
        case 'Body': return 3;
        case 'Chest': return 4;
        case 'Waist': return 5;
        case 'Legs': return 6;
        case 'Feet': return 7;
        case 'Wrists': return 8;
        case 'Hands': return 9;
        case 'Back': return 14;
        case 'Main Hand': return 15;
        case 'Weapon (1H)': return 15;  // One-handed weapon goes to main hand
        case 'Weapon (2H)': return 15;  // Two-handed weapon goes to main hand
        case 'Off Hand': return 16;
        case 'Shield': return 16;  // Shield goes to off hand
        case 'Held In Off-Hand': return 16;  // Held items go to off hand
        case 'Ranged': return 17;
        case 'Tabard': return 18;
        default: return -1;
    }
}

// Map slot number to slot name
export function mapSlotNumberToName(slotNum: number): string {
    switch (slotNum) {
        case 0: return 'Head';
        case 2: return 'Shoulder';
        case 3: return 'Body';
        case 4: return 'Chest';
        case 5: return 'Waist';
        case 6: return 'Legs';
        case 7: return 'Feet';
        case 8: return 'Wrists';
        case 9: return 'Hands';
        case 14: return 'Back';
        case 15: return 'Main Hand';
        case 16: return 'Off Hand';
        case 17: return 'Ranged';
        case 18: return 'Tabard';
        default: return 'Unknown';
    }
}

// Apply items to an outfit
export function applyItemsToOutfit(outfit: TSOutfit, items: {[key: number]: {entry: number, name: string}}): void {
    for (const [slotStr, itemData] of Object.entries(items)) {
        const slotNum = Number(slotStr);
        const itemEntry = itemData.entry;
        
        // Use specific methods for weapon slots (always positive item entries)
        if (slotNum === 15) {
            outfit.SetMainhand(itemEntry);
        } else if (slotNum === 16) {
            outfit.SetOffhand(itemEntry);
        } else if (slotNum === 17) {
            outfit.SetRanged(itemEntry);
        } else {
            // Armor slots: check if it's a display ID (negative) or item entry (positive)
            if (itemEntry < 0) {
                // Negative = display ID
                const displayId = Math.abs(itemEntry);
                outfit.SetItemByDisplayID(slotNum, displayId);
            } else {
                // Positive = item entry
                outfit.SetItem(slotNum, itemEntry);
            }
        }
    }
}

// Check if player has GM permissions
export function checkGMPermission(player: TSPlayer): boolean {
    if (player.GetGMRank() <= 0) {
        player.SendBroadcastMessage('You do not have permission to use this command.');
        return false;
    }
    return true;
}

// Verify target is an outfit preview creature
export function verifyOutfitPreviewCreature(player: TSPlayer): TSCreature | null {
    const target = player.GetSelection();
    
    if (!target || target.IsNull()) {
        player.SendBroadcastMessage('No target selected!');
        return null;
    }

    const creature = target.ToCreature();
    if (!creature || creature.IsNull()) {
        player.SendBroadcastMessage('Target is not a creature!');
        return null;
    }

    // Check if it's an outfit preview creature
    const creatureIds = TAG('unit-creator', 'outfit-preview-creature');
    const targetCreatureEntry = creatureIds[0];
    
    if (creature.GetEntry() !== targetCreatureEntry) {
        player.SendBroadcastMessage('Target is not an Outfit Preview Dummy!');
        return null;
    }

    return creature;
}

