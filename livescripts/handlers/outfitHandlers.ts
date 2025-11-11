// Handlers for outfit management (set, reset, copy, apply)
import {
    SetCustomOutfitMessage,
    SET_CUSTOM_OUTFIT_MESSAGE_ID,
    ResetOutfitMessage,
    RESET_OUTFIT_MESSAGE_ID,
    CopyOutfitMessage,
    COPY_OUTFIT_MESSAGE_ID,
    ApplyCopyOutfitMessage,
    APPLY_COPY_OUTFIT_MESSAGE_ID,
    OutfitCopiedMessage
} from "../../shared/Messages";
import { OutfitCopyData } from "../types";
import { playerCreatures, creatureOutfits } from "../state";
import { checkGMPermission, verifyOutfitPreviewCreature, applyItemsToOutfit, mapSlotNumberToName } from "../utils";
import * as logger from "../logger";

export function registerOutfitHandlers(events: TSEvents): void {
    // Handle set custom outfit requests
    events.CustomPacket.OnReceive(SET_CUSTOM_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new SetCustomOutfitMessage("", 1, 0, 0, 0, 0, 0, 0);
        msg.read(packet);

        // Parse the GUID to get the low part
        const guidHex = msg.creatureGUID;
        const lowGuidHex = guidHex.substring(guidHex.length - 4);
        const lowGuid = parseInt(lowGuidHex, 16);

        // Find the creature
        const creatures = playerCreatures.get(player.GetGUIDLow());
        let creature: TSCreature | null = null;
        
        if (creatures) {
            for (const c of creatures) {
                if (c && !c.IsNull() && c.GetGUIDLow() === lowGuid) {
                    creature = c;
                    break;
                }
            }
        }

        if (!creature) {
            player.SendBroadcastMessage('Creature not found with GUID: ' + guidHex);
            return;
        }

        // Get or create outfit state for this creature
        let outfitState = creatureOutfits.get(lowGuid);
        if (!outfitState) {
            outfitState = {race: msg.race, gender: msg.gender, skin: msg.skin, face: msg.face, hair: msg.hair, haircolor: msg.haircolor, facialhair: msg.facialhair, items: {}};
            creatureOutfits.set(lowGuid, outfitState);
        }

        // Update outfit state
        outfitState.race = msg.race;
        outfitState.gender = msg.gender;
        outfitState.skin = msg.skin;
        outfitState.face = msg.face;
        outfitState.hair = msg.hair;
        outfitState.haircolor = msg.haircolor;
        outfitState.facialhair = msg.facialhair;

        // Create outfit with new values
        const customOutfit = CreateOutfit(msg.race, msg.gender);
        customOutfit.SetSkin(msg.skin);
        customOutfit.SetFace(msg.face);
        customOutfit.SetHairStyle(msg.hair);
        customOutfit.SetHairColor(msg.haircolor);
        customOutfit.SetFacialStyle(msg.facialhair);
        
        // Apply all previously equipped items
        applyItemsToOutfit(customOutfit, outfitState.items);
        
        // Apply the outfit to the creature
        creature.SetOutfit(customOutfit);

        player.SendBroadcastMessage('Outfit updated!');
    });

    // Handle reset outfit requests
    events.CustomPacket.OnReceive(RESET_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new ResetOutfitMessage();
        msg.read(packet);

        const creature = verifyOutfitPreviewCreature(player);
        if (!creature) return;

        // Get or create outfit state for this creature
        let outfitState = creatureOutfits.get(creature.GetGUIDLow());
        if (!outfitState) {
            outfitState = {race: 1, gender: 0, skin: 0, face: 0, hair: 0, haircolor: 0, facialhair: 0, items: {}};
            creatureOutfits.set(creature.GetGUIDLow(), outfitState);
        }
        
        // Clear all items
        outfitState.items = {};

        // Create outfit with appearance settings, no items
        const customOutfit = CreateOutfit(outfitState.race, outfitState.gender);
        customOutfit.SetSkin(outfitState.skin);
        customOutfit.SetFace(outfitState.face);
        customOutfit.SetHairStyle(outfitState.hair);
        customOutfit.SetHairColor(outfitState.haircolor);
        customOutfit.SetFacialStyle(outfitState.facialhair);
        
        // Explicitly clear weapon slots
        customOutfit.SetMainhand(0);
        customOutfit.SetOffhand(0);
        customOutfit.SetRanged(0);
        
        // Apply the outfit to the creature
        creature.SetOutfit(customOutfit);

        player.SendBroadcastMessage('Reset outfit! All items removed.');
    });

    // Handle copy outfit requests
    events.CustomPacket.OnReceive(COPY_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
        try {
            if (!checkGMPermission(player)) return;

            const msg = new CopyOutfitMessage();
            msg.read(packet);

            const creature = verifyOutfitPreviewCreature(player);
            if (!creature) return;

            // Verify creature has an outfit
            const currentOutfit = creature.GetOutfit();
            
            if (!currentOutfit) {
                logger.error('Creature has no outfit');
                player.SendBroadcastMessage('Creature has no outfit!');
                return;
            }

            // Get outfit copy from creature
            const outfitCopy = creature.GetOutfitCopy();
            
            if (!outfitCopy) {
                logger.error('GetOutfitCopy returned null');
                player.SendBroadcastMessage('Failed to copy outfit from creature!');
                return;
            }
            
            // Store in player memory using GetObject
            const copyData = player.GetObject('outfit-copy', new OutfitCopyData());
            copyData.outfit = outfitCopy;

            // Send the copied outfit values back to client to update UI
            const race = outfitCopy.GetRace();
            const gender = outfitCopy.GetGender();
            const skin = outfitCopy.GetSkin();
            const face = outfitCopy.GetFace();
            const hair = outfitCopy.GetHairStyle();
            const haircolor = outfitCopy.GetHairColor();
            const facialhair = outfitCopy.GetFacialStyle();
            
            // Get the creature's outfit state (the source)
            const sourceOutfitState = creatureOutfits.get(creature.GetGUIDLow());
            
            // Build items array for sending to client
            const items: Array<{slot: string, name: string, entry: uint32}> = [];
            
            // Clear previous items
            copyData.items = {};
            
            // First, check outfit state for item entries (positive values)
            if (sourceOutfitState && sourceOutfitState.items) {
                for (const [slotStr, itemData] of Object.entries(sourceOutfitState.items)) {
                    const slotNum = Number(slotStr);
                    const slotName = mapSlotNumberToName(slotNum);
                    
                    // Determine display name
                    let displayName = itemData.name;
                    if (!displayName && itemData.entry < 0) {
                        displayName = `Display ID: ${itemData.entry}`;
                    } else if (!displayName) {
                        displayName = `Item: ${itemData.entry}`;
                    }
                    
                    // Store in copyData for later use when spawning
                    copyData.items[slotNum] = {entry: itemData.entry, name: displayName};
                    // Add to items array for sending to client
                    items.push({slot: slotName, name: displayName, entry: itemData.entry});
                }
            }
            
            // Also check for display IDs (negative values) in armor slots
            const armorSlots = [0, 2, 3, 4, 5, 6, 7, 8, 9, 14, 18]; // head, shoulders, body, chest, waist, legs, feet, wrists, hands, back, tabard
            for (const slotNum of armorSlots) {
                // Skip if already have an item entry for this slot
                if (copyData.items[slotNum]) continue;
                
                const displayId = outfitCopy.GetDisplayID(slotNum);
                if (displayId > 0) {
                    const slotName = mapSlotNumberToName(slotNum);
                    // Store as negative to indicate it's a display ID
                    const negativeEntry = -displayId;
                    copyData.items[slotNum] = {entry: negativeEntry, name: `Display ID: ${displayId}`};
                    items.push({slot: slotName, name: `Display ID: ${displayId}`, entry: negativeEntry});
                }
            }
            
            const copiedMsg = new OutfitCopiedMessage(race, gender, skin, face, hair, haircolor, facialhair, items);
            copiedMsg.write().SendToPlayer(player);

            player.SendBroadcastMessage('Outfit copied from creature!');
        } catch (error) {
            logger.error('Exception in Copy Outfit handler: ' + error);
            player.SendBroadcastMessage('Error copying outfit!');
        }
    });

    // Handle apply copy outfit requests
    events.CustomPacket.OnReceive(APPLY_COPY_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new ApplyCopyOutfitMessage();
        msg.read(packet);

        const creature = verifyOutfitPreviewCreature(player);
        if (!creature) return;

        // Get the stored outfit copy from player memory
        const copyData = player.GetObject('outfit-copy', new OutfitCopyData());
        
        // Check if we have outfit data (either TSOutfit or appearance properties)
        const hasOutfitData = copyData.outfit || (copyData.race !== undefined && copyData.race > 0);
        if (!hasOutfitData) {
            player.SendBroadcastMessage('No outfit has been loaded! Use "Load" or "Copy Outfit" first.');
            return;
        }

        // Create outfit from stored data
        const customOutfit = CreateOutfit(copyData.race, copyData.gender);
        customOutfit.SetSkin(copyData.skin);
        customOutfit.SetFace(copyData.face);
        customOutfit.SetHairStyle(copyData.hair);
        customOutfit.SetHairColor(copyData.haircolor);
        customOutfit.SetFacialStyle(copyData.facialhair);

        // Apply items using utility function (handles both item entries and display IDs)
        applyItemsToOutfit(customOutfit, copyData.items);

        // Apply the outfit to the creature
        creature.SetOutfit(customOutfit);

        // Update creature's outfit state
        let outfitState = creatureOutfits.get(creature.GetGUIDLow());
        if (!outfitState) {
            outfitState = {
                race: copyData.race,
                gender: copyData.gender,
                skin: copyData.skin,
                face: copyData.face,
                hair: copyData.hair,
                haircolor: copyData.haircolor,
                facialhair: copyData.facialhair,
                items: {}
            };
            creatureOutfits.set(creature.GetGUIDLow(), outfitState);
        } else {
            // Update existing state
            outfitState.race = copyData.race;
            outfitState.gender = copyData.gender;
            outfitState.skin = copyData.skin;
            outfitState.face = copyData.face;
            outfitState.hair = copyData.hair;
            outfitState.haircolor = copyData.haircolor;
            outfitState.facialhair = copyData.facialhair;
            outfitState.items = {};
        }

        // Deep copy items to creature state
        for (const [slotStr, itemData] of Object.entries(copyData.items)) {
            const slot = Number(slotStr);
            outfitState.items[slot] = {
                entry: itemData.entry,
                name: itemData.name
            };
        }

        player.SendBroadcastMessage('Applied outfit to creature!');
    });
}

