// Handlers for item management (search, equip, unequip)
import {
    ItemSearchMessage,
    ITEM_SEARCH_MESSAGE_ID,
    ItemSearchResultsMessage,
    EquipItemMessage,
    EQUIP_ITEM_MESSAGE_ID,
    UpdateEquippedMessage,
    UnequipItemMessage,
    UNEQUIP_ITEM_MESSAGE_ID
} from "../../shared/Messages";
import { creatureOutfits } from "../state";
import { checkGMPermission, verifyOutfitPreviewCreature, mapInventoryTypeToSlot, mapSlotNameToNumber, applyItemsToOutfit } from "../utils";
import * as logger from "../logger";

export function registerItemHandlers(events: TSEvents): void {
    // Handle item search requests
    events.CustomPacket.OnReceive(ITEM_SEARCH_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new ItemSearchMessage("");
        msg.read(packet);

        // Query item_template for items matching the search
        console.log('Searching for items: ' + msg.searchText);
        const query = `SELECT entry, name, InventoryType FROM item_template WHERE name LIKE '%${msg.searchText}%' AND (InventoryType BETWEEN 1 AND 26) LIMIT 20`;
        const result = QueryWorld(query);

        const results: any[] = [];
        
        while (result.GetRow()) {
            const entry = result.GetUInt32(0);
            const name = result.GetString(1);
            const invType = result.GetUInt32(2);
            
            // Map inventory type to slot name
            let slotName = 'Unknown';
            switch (invType) {
                case 1: slotName = 'Head'; break;
                case 2: slotName = 'Neck'; break;
                case 3: slotName = 'Shoulder'; break;
                case 4: slotName = 'Body'; break;
                case 5: slotName = 'Chest'; break;
                case 6: slotName = 'Waist'; break;
                case 7: slotName = 'Legs'; break;
                case 8: slotName = 'Feet'; break;
                case 9: slotName = 'Wrists'; break;
                case 10: slotName = 'Hands'; break;
                case 11: slotName = 'Finger'; break;
                case 12: slotName = 'Trinket'; break;
                case 13: slotName = 'Weapon (1H)'; break;
                case 14: slotName = 'Shield'; break;
                case 15: slotName = 'Ranged'; break;
                case 16: slotName = 'Back'; break;
                case 17: slotName = 'Weapon (2H)'; break;
                case 19: slotName = 'Tabard'; break;
                case 20: slotName = 'Chest'; break;
                case 21: slotName = 'Main Hand'; break;
                case 22: slotName = 'Off Hand'; break;
                case 23: slotName = 'Held In Off-Hand'; break;
                case 26: slotName = 'Ranged'; break;
            }

            const resultObj = {
                entry: entry,
                name: name,
                invType: invType,
                slot: slotName
            };
            results.push(resultObj);
        }

        // Send results back to client
        try {
            const resultsMsg = new ItemSearchResultsMessage(results);
            const packet = resultsMsg.write();
            packet.SendToPlayer(player);
            
            player.SendBroadcastMessage('Found ' + results.length + ' items');
        } catch (error) {
            logger.error('Sending results: ' + error);
            player.SendBroadcastMessage('Error: ' + error);
        }
    });

    // Handle equip item requests
    events.CustomPacket.OnReceive(EQUIP_ITEM_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new EquipItemMessage(0, "");
        msg.read(packet);

        // Get player's target first
        const creature = verifyOutfitPreviewCreature(player);
        if (!creature) return;

        // Get or create outfit state for this creature
        let outfitState = creatureOutfits.get(creature.GetGUIDLow());
        if (!outfitState) {
            outfitState = {race: 1, gender: 0, skin: 0, face: 0, hair: 0, haircolor: 0, facialhair: 0, items: {}};
            creatureOutfits.set(creature.GetGUIDLow(), outfitState);
        }

        // Query item to get inventory type
        const query = `SELECT InventoryType FROM item_template WHERE entry = ${msg.itemEntry}`;
        const result = QueryWorld(query);

        if (result && result.GetRow()) {
            const invType = result.GetUInt32(0);
            
            // Map inventory type to outfit slot
            const mapping = mapInventoryTypeToSlot(invType);
            const slot = mapping.slot;
            const slotName = mapping.slotName;

            if (slot >= 0) {
                // Store in outfit state with item name
                outfitState.items[slot] = {entry: msg.itemEntry, name: msg.itemName};

                // Create outfit with current state
                const customOutfit = CreateOutfit(outfitState.race, outfitState.gender);
                customOutfit.SetSkin(outfitState.skin);
                customOutfit.SetFace(outfitState.face);
                customOutfit.SetHairStyle(outfitState.hair);
                customOutfit.SetHairColor(outfitState.haircolor);
                customOutfit.SetFacialStyle(outfitState.facialhair);

                // Apply all stored items
                applyItemsToOutfit(customOutfit, outfitState.items);

                // Apply outfit to creature
                creature.SetOutfit(customOutfit);

                // Send update to client to show equipped item
                const updateMsg = new UpdateEquippedMessage(slotName, msg.itemName, msg.itemEntry);
                updateMsg.write().SendToPlayer(player);

                player.SendBroadcastMessage('Equipped: ' + msg.itemName + ' (' + msg.itemEntry + ')');
            } else {
                player.SendBroadcastMessage('Item cannot be equipped (unsupported slot)');
            }
        } else {
            player.SendBroadcastMessage('Item not found in database');
        }
    });

    // Handle unequip item requests
    events.CustomPacket.OnReceive(UNEQUIP_ITEM_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new UnequipItemMessage("");
        msg.read(packet);

        // Get player's target first
        const creature = verifyOutfitPreviewCreature(player);
        if (!creature) return;

        // Get outfit state for this creature
        let outfitState = creatureOutfits.get(creature.GetGUIDLow());
        if (!outfitState) {
            player.SendBroadcastMessage('No outfit state found!');
            return;
        }

        // Map slot name to slot number
        const slotNum = mapSlotNameToNumber(msg.slot);

        if (slotNum === -1) {
            player.SendBroadcastMessage('Unknown slot: ' + msg.slot);
            return;
        }

        // Remove item from outfit state
        delete outfitState.items[slotNum];

        // Recreate outfit with all appearance settings and remaining items
        const customOutfit = CreateOutfit(outfitState.race, outfitState.gender);
        customOutfit.SetSkin(outfitState.skin);
        customOutfit.SetFace(outfitState.face);
        customOutfit.SetHairStyle(outfitState.hair);
        customOutfit.SetHairColor(outfitState.haircolor);
        customOutfit.SetFacialStyle(outfitState.facialhair);

        // Apply all remaining items
        applyItemsToOutfit(customOutfit, outfitState.items);

        // Apply outfit to creature
        creature.SetOutfit(customOutfit);

        // Send update to client to remove item from display
        const updateMsg = new UpdateEquippedMessage(msg.slot, '', 0);
        updateMsg.write().SendToPlayer(player);

        player.SendBroadcastMessage('Unequipped item from ' + msg.slot);
    });
}

