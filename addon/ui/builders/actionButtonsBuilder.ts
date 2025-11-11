// Action buttons (Spawn, Despawn, Reset, Copy, Apply Copy) builder
import {
    SpawnMessage,
    DespawnMessage,
    ResetOutfitMessage,
    CopyOutfitMessage,
    ApplyCopyOutfitMessage
} from "../../../shared/Messages";
import {
    getRace,
    getGender,
    getSkin,
    getFace,
    getHair,
    getHairColor,
    getFacialHair,
    clearEquippedItems,
    getEquippedItems
} from "../../state/addonState";
import { updateEquippedDisplay } from "../uiUpdates";

export function createActionButtons(parent: WoWAPI.Frame, startY: number): number {
    let yOffset = startY;
    const buttonWidth = 155;
    const buttonSpacing = 5;

    // First row: Spawn, Despawn, Reset
    const spawnBtn = CreateFrame('Button', 'OutfitDesignerSpawnBtn', parent, 'UIPanelButtonTemplate');
    spawnBtn.SetSize(buttonWidth, 25);
    spawnBtn.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    spawnBtn.SetText('Spawn');
    spawnBtn.SetScript('OnClick', () => {
        // Build items array from equipped items
        const equippedItems = getEquippedItems();
        const itemsArray: Array<{slot: string, name: string, entry: number}> = [];
        for (const slot in equippedItems) {
            const item = equippedItems[slot];
            itemsArray.push({
                slot: slot,
                name: item.name,
                entry: item.id
            });
        }
        
        const packet = new SpawnMessage(getRace(), getGender(), getSkin(), getFace(), getHair(), getHairColor(), getFacialHair(), itemsArray);
        packet.write().Send();
    });

    const despawnBtn = CreateFrame('Button', 'OutfitDesignerDespawnBtn', parent, 'UIPanelButtonTemplate');
    despawnBtn.SetSize(buttonWidth, 25);
    despawnBtn.SetPoint('LEFT', spawnBtn, 'RIGHT', buttonSpacing, 0);
    despawnBtn.SetText('Despawn');
    despawnBtn.SetScript('OnClick', () => {
        const targetGUID = UnitGUID('target');
        if (targetGUID && targetGUID !== '') {
            const packet = new DespawnMessage(targetGUID);
            packet.write().Send();
        } else {
            print('No target selected! Target a creature first.');
        }
    });

    const resetBtn = CreateFrame('Button', 'OutfitDesignerResetBtn', parent, 'UIPanelButtonTemplate');
    resetBtn.SetSize(buttonWidth, 25);
    resetBtn.SetPoint('LEFT', despawnBtn, 'RIGHT', buttonSpacing, 0);
    resetBtn.SetText('Reset');
    resetBtn.SetScript('OnClick', () => {
        const targetGUID = UnitGUID('target');
        if (targetGUID && targetGUID !== '') {
            const packet = new ResetOutfitMessage();
            packet.write().Send();
            clearEquippedItems();
            updateEquippedDisplay();
        } else {
            print('No target selected! Target a creature first.');
        }
    });

    yOffset -= 30;

    // Second row: Copy Outfit, Apply Copy
    const copyBtn = CreateFrame('Button', 'OutfitDesignerCopyBtn', parent, 'UIPanelButtonTemplate');
    copyBtn.SetSize(buttonWidth, 25);
    copyBtn.SetPoint('TOPLEFT', parent, 'TOPLEFT', 10, yOffset);
    copyBtn.SetText('Copy Outfit');
    copyBtn.SetScript('OnClick', () => {
        const targetGUID = UnitGUID('target');
        if (targetGUID && targetGUID !== '') {
            const packet = new CopyOutfitMessage();
            packet.write().Send();
        } else {
            print('No target selected! Target a creature first.');
        }
    });

    const applyCopyBtn = CreateFrame('Button', 'OutfitDesignerApplyCopyBtn', parent, 'UIPanelButtonTemplate');
    applyCopyBtn.SetSize(buttonWidth, 25);
    applyCopyBtn.SetPoint('LEFT', copyBtn, 'RIGHT', buttonSpacing, 0);
    applyCopyBtn.SetText('Apply');
    applyCopyBtn.SetScript('OnClick', () => {
        const targetGUID = UnitGUID('target');
        if (targetGUID && targetGUID !== '') {
            const packet = new ApplyCopyOutfitMessage();
            packet.write().Send();
        } else {
            print('No target selected! Target a creature first.');
        }
    });

    yOffset -= 35;

    return yOffset;
}

