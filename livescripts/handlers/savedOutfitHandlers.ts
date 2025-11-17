// Handlers for saved outfit management (save, load, delete, list)
import {
    SaveOutfitMessage,
    SAVE_OUTFIT_MESSAGE_ID,
    LoadOutfitListMessage,
    LOAD_OUTFIT_LIST_MESSAGE_ID,
    OutfitListMessage,
    OUTFIT_LIST_MESSAGE_ID,
    LoadOutfitMessage,
    LOAD_OUTFIT_MESSAGE_ID,
    DeleteOutfitMessage,
    DELETE_OUTFIT_MESSAGE_ID,
    UpdateEquippedMessage,
    OutfitCopiedMessage,
    ExportOutfitMessage,
    EXPORT_OUTFIT_MESSAGE_ID,
    ExportedCodeMessage,
    SaveOutfitToDBMessage,
    SAVE_OUTFIT_TO_DB_MESSAGE_ID,
    ExportOutfitByIdMessage,
    EXPORT_OUTFIT_BY_ID_MESSAGE_ID
} from "../../shared/Messages";
import { creatureOutfits } from "../state";
import { checkGMPermission, verifyOutfitPreviewCreature, mapSlotNumberToName, applyItemsToOutfit } from "../utils";
import * as logger from "../logger";
import { OutfitState, OutfitCopyData } from "../types";

// Class to store saved outfits in player memory
class SavedOutfitsData extends TSClass {
    outfits: Array<{id: number, outfit: OutfitState}> = [];
    nextId: number = 1;
}

// Helper to get player's saved outfits
function getSavedOutfits(player: TSPlayer): SavedOutfitsData {
    return player.GetObject('saved-outfits', new SavedOutfitsData());
}

export function registerSavedOutfitHandlers(events: TSEvents): void {
    // Handle save outfit requests
    events.CustomPacket.OnReceive(SAVE_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new SaveOutfitMessage();
        msg.read(packet);

        const creature = verifyOutfitPreviewCreature(player);
        if (!creature) return;

        // Get outfit state from creature
        const outfitState = creatureOutfits.get(creature.GetGUIDLow());
        if (!outfitState) {
            player.SendBroadcastMessage('No outfit to save!');
            return;
        }

        // Get player's saved outfits
        const savedData = getSavedOutfits(player);
        
        // Generate new ID and save outfit (deep copy)
        const newId = savedData.nextId++;
        const savedOutfit: OutfitState = {
            race: outfitState.race,
            gender: outfitState.gender,
            skin: outfitState.skin,
            face: outfitState.face,
            hair: outfitState.hair,
            haircolor: outfitState.haircolor,
            facialhair: outfitState.facialhair,
            items: {}
        };

        // Deep copy items
        for (const [slotStr, itemData] of Object.entries(outfitState.items)) {
            const slot = Number(slotStr);
            savedOutfit.items[slot] = {
                entry: itemData.entry,
                name: itemData.name
            };
        }

        savedData.outfits.push({id: newId, outfit: savedOutfit});
        
        player.SendBroadcastMessage(`Outfit saved! ID: ${newId}`);
        
        // Send updated outfit list
        sendOutfitList(player);
    });

    // Handle load outfit list requests
    events.CustomPacket.OnReceive(LOAD_OUTFIT_LIST_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new LoadOutfitListMessage();
        msg.read(packet);

        sendOutfitList(player);
    });

    // Handle load outfit requests
    events.CustomPacket.OnReceive(LOAD_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new LoadOutfitMessage(0);
        msg.read(packet);

        // Determine if this is a database outfit (ID > 2147483647) or in-memory outfit
        let savedOutfit: OutfitState | null = null;
        
        if (msg.outfitId > 2147483647) {
            // Database outfit - query from creature_template_outfits
            const query = `SELECT race, gender, skin, face, hair, haircolor, facialhair, 
                                  head, shoulders, body, chest, waist, legs, feet, wrists, hands, 
                                  back, mainhand, offhand, ranged, tabard 
                           FROM creature_template_outfits WHERE entry = ${msg.outfitId}`;
            const result = QueryWorld(query);
            
            if (result.GetRow()) {
                // Extract appearance values
                const race = result.GetUInt8(0);
                const gender = result.GetUInt8(1);
                const skin = result.GetUInt8(2);
                const face = result.GetUInt8(3);
                const hair = result.GetUInt8(4);
                const haircolor = result.GetUInt8(5);
                const facialhair = result.GetUInt8(6);
                
                // Extract item values (slots 7-20)
                const items: {[key: number]: {entry: number, name: string}} = {};
                const slotMap = [0, 2, 3, 4, 5, 6, 7, 8, 9, 14, 15, 16, 17, 18]; // head, shoulders, body, chest, waist, legs, feet, wrists, hands, back, mainhand, offhand, ranged, tabard
                const slotDbIndices = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
                
                for (let i = 0; i < slotMap.length; i++) {
                    const itemValue = result.GetInt32(slotDbIndices[i]);
                    if (itemValue !== 0) {
                        items[slotMap[i]] = {
                            entry: itemValue,
                            name: '' // Database outfits don't store item names
                        };
                    }
                }
                
                savedOutfit = {
                    race,
                    gender,
                    skin,
                    face,
                    hair,
                    haircolor,
                    facialhair,
                    items
                };
            }
        } else {
            // In-memory outfit - get from player's saved outfits
            const savedData = getSavedOutfits(player);
            for (const saved of savedData.outfits) {
                if (saved.id === msg.outfitId) {
                    savedOutfit = saved.outfit;
                    break;
                }
            }
        }

        if (!savedOutfit) {
            player.SendBroadcastMessage('Outfit not found!');
            return;
        }

        // Store outfit in player's clipboard for later use with "Apply"
        const copyData = player.GetObject('outfit-copy', new OutfitCopyData());
        copyData.race = savedOutfit.race;
        copyData.gender = savedOutfit.gender;
        copyData.skin = savedOutfit.skin;
        copyData.face = savedOutfit.face;
        copyData.hair = savedOutfit.hair;
        copyData.haircolor = savedOutfit.haircolor;
        copyData.facialhair = savedOutfit.facialhair;
        
        // Deep copy items to clipboard
        copyData.items = {};
        for (const [slotStr, itemData] of Object.entries(savedOutfit.items)) {
            const slot = Number(slotStr);
            copyData.items[slot] = {
                entry: itemData.entry,
                name: itemData.name
            };
        }

        // If player has a creature targeted, apply the outfit to it immediately
        const creature = player.GetSelection()?.ToCreature();
        if (creature && !creature.IsNull()) {
            // Check if it's an outfit preview creature
            const creatureIds = TAG('outfit-designer', 'outfit-preview-creature');
            const targetCreatureEntry = creatureIds[0];
            
            if (creature.GetEntry() === targetCreatureEntry) {
                // Create outfit
                const customOutfit = CreateOutfit(savedOutfit.race, savedOutfit.gender);
                customOutfit.SetSkin(savedOutfit.skin);
                customOutfit.SetFace(savedOutfit.face);
                customOutfit.SetHairStyle(savedOutfit.hair);
                customOutfit.SetHairColor(savedOutfit.haircolor);
                customOutfit.SetFacialStyle(savedOutfit.facialhair);

                // Apply items using utility function (handles both item entries and display IDs)
                applyItemsToOutfit(customOutfit, savedOutfit.items);

                // Apply outfit to creature
                creature.SetOutfit(customOutfit);

                // Update creature's outfit state
                let outfitState = creatureOutfits.get(creature.GetGUIDLow());
                if (!outfitState) {
                    outfitState = {
                        race: savedOutfit.race,
                        gender: savedOutfit.gender,
                        skin: savedOutfit.skin,
                        face: savedOutfit.face,
                        hair: savedOutfit.hair,
                        haircolor: savedOutfit.haircolor,
                        facialhair: savedOutfit.facialhair,
                        items: {}
                    };
                    creatureOutfits.set(creature.GetGUIDLow(), outfitState);
                }
                
                // Copy outfit data to creature state
                outfitState.race = savedOutfit.race;
                outfitState.gender = savedOutfit.gender;
                outfitState.skin = savedOutfit.skin;
                outfitState.face = savedOutfit.face;
                outfitState.hair = savedOutfit.hair;
                outfitState.haircolor = savedOutfit.haircolor;
                outfitState.facialhair = savedOutfit.facialhair;
                outfitState.items = {};
                
                // Deep copy items
                for (const [slotStr, itemData] of Object.entries(savedOutfit.items)) {
                    const slot = Number(slotStr);
                    outfitState.items[slot] = {
                        entry: itemData.entry,
                        name: itemData.name
                    };
                }
            }
        }

        // Build items array for the copied message
        const itemsArray: Array<{slot: string, name: string, entry: uint32}> = [];
        for (const [slotStr, itemData] of Object.entries(savedOutfit.items)) {
            const slotNum = Number(slotStr);
            const slotName = mapSlotNumberToName(slotNum);
            
            // If item name is empty and entry is negative, it's a display ID
            let displayName = itemData.name;
            if (!displayName && itemData.entry < 0) {
                displayName = `Display ID: ${itemData.entry}`;
            } else if (!displayName) {
                displayName = `Item: ${itemData.entry}`;
            }
            
            itemsArray.push({slot: slotName, name: displayName, entry: itemData.entry});
        }

        // Send outfit values to update UI controls
        const copiedMsg = new OutfitCopiedMessage(
            savedOutfit.race,
            savedOutfit.gender,
            savedOutfit.skin,
            savedOutfit.face,
            savedOutfit.hair,
            savedOutfit.haircolor,
            savedOutfit.facialhair,
            itemsArray
        );
        copiedMsg.write().SendToPlayer(player);

        player.SendBroadcastMessage(`Outfit ${msg.outfitId} loaded! Use "Apply" to apply it to a targeted creature.`);
    });

    // Handle delete outfit requests
    events.CustomPacket.OnReceive(DELETE_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new DeleteOutfitMessage(0);
        msg.read(packet);

        // Get player's saved outfits and remove the requested one
        const savedData = getSavedOutfits(player);
        
        let foundIndex = -1;
        for (let i = 0; i < savedData.outfits.length; i++) {
            if (savedData.outfits[i].id === msg.outfitId) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex >= 0) {
            savedData.outfits.splice(foundIndex, 1);
            player.SendBroadcastMessage(`Outfit ${msg.outfitId} deleted!`);
        } else {
            player.SendBroadcastMessage(`Outfit ${msg.outfitId} not found!`);
        }

        // Send updated outfit list
        sendOutfitList(player);
    });

    // Handle export outfit requests
    events.CustomPacket.OnReceive(EXPORT_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) {
            return;
        }

        const msg = new ExportOutfitMessage();
        msg.read(packet);

        const creature = verifyOutfitPreviewCreature(player);
        if (!creature) {
            return;
        }

        // Get outfit state from creature
        const outfitState = creatureOutfits.get(creature.GetGUIDLow());
        if (!outfitState) {
            player.SendBroadcastMessage('No outfit to export!');
            return;
        }

        // Generate datascripts code
        let code = 'import { std } from "wow/wotlk";\n\n';
        code += 'const outfit = std.CreatureOutfits.create();\n\n';
        code += '// Appearance\n';
        code += `outfit.Race.set(${Math.floor(outfitState.race)});\n`;
        code += `outfit.Gender.set(${Math.floor(outfitState.gender)});\n`;
        code += `outfit.Skin.set(${Math.floor(outfitState.skin)});\n`;
        code += `outfit.Face.set(${Math.floor(outfitState.face)});\n`;
        code += `outfit.Hair.set(${Math.floor(outfitState.hair)});\n`;
        code += `outfit.HairColor.set(${Math.floor(outfitState.haircolor)});\n`;
        code += `outfit.FacialHair.set(${Math.floor(outfitState.facialhair)});\n\n`;

        // Map slot numbers to datascript property names
        const slotMap: {[key: number]: string} = {
            0: 'Head',
            2: 'Shoulders',
            3: 'Shirt',
            4: 'Chest',
            5: 'Waist',
            6: 'Legs',
            7: 'Feet',
            8: 'Wrists',
            9: 'Hands',
            14: 'Back',
            15: 'Mainhand',
            16: 'Offhand',
            17: 'Ranged',
            18: 'Tabard'
        };

        code += '// Equipped items\n';
        // Set all slots to 0 first
        for (const [slot, propName] of Object.entries(slotMap)) {
            code += `outfit.${propName}.set(0);\n`;
        }

        // Then set items that exist
        for (const [slotStr, itemData] of Object.entries(outfitState.items)) {
            const slotNum = Number(slotStr);
            const propName = slotMap[slotNum];
            if (propName) {
                const entry = Math.floor(itemData.entry);
                // Only add comment for positive entries (actual items with names), not display IDs
                let comment = '';
                if (entry > 0 && itemData.name && !itemData.name.startsWith('Display ID:') && !itemData.name.startsWith('Item:')) {
                    comment = ` // ${itemData.name}`;
                }
                code += `outfit.${propName}.set(${entry});${comment}\n`;
            }
        }

        // Send code to client
        const exportMsg = new ExportedCodeMessage(code);
        exportMsg.write().SendToPlayer(player);
        player.SendBroadcastMessage('Outfit exported as datascripts code!');
    });

    // Handle save outfit to DB requests
    events.CustomPacket.OnReceive(SAVE_OUTFIT_TO_DB_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new SaveOutfitToDBMessage();
        msg.read(packet);

        const savedData = getSavedOutfits(player);
        
        // Find outfit in memory
        let outfitToSave: OutfitState | null = null;
        let oldId = msg.outfitId;
        
        for (let i = 0; i < savedData.outfits.length; i++) {
            if (savedData.outfits[i].id === msg.outfitId) {
                outfitToSave = savedData.outfits[i].outfit;
                // Remove from memory
                savedData.outfits.splice(i, 1);
                break;
            }
        }

        if (!outfitToSave) {
            player.SendBroadcastMessage('Outfit not found!');
            return;
        }

        // Get next available DB ID (starting from 2147483648)
        const queryMax = 'SELECT MAX(entry) FROM creature_template_outfits WHERE entry > 2147483647';
        const resultMax = QueryWorld(queryMax);
        let newId = 2147483648;
        
        if (resultMax.GetRow()) {
            const maxId = resultMax.GetUInt32(0);
            if (maxId >= 2147483648) {
                newId = maxId + 1;
            }
        }

        // Insert into database - must use Math.floor to ensure integers
        // Note: column order must match: entry, npcsoundsid, race, class, gender, skin, face, hair, haircolor, facialhair,
        // head, shoulders, body, chest, waist, legs, feet, wrists, hands, back, tabard, guildid, description, mainhand, offhand, ranged
        
        // Map item slots to their order in the INSERT values
        const slotToDBIndex: {[key: number]: number} = {
            0: 10,   // head
            2: 11,   // shoulders
            3: 12,   // body (shirt)
            4: 13,   // chest
            5: 14,   // waist
            6: 15,   // legs
            7: 16,   // feet
            8: 17,   // wrists
            9: 18,   // hands
            14: 19,  // back
            18: 20,  // tabard
            15: 23,  // mainhand
            16: 24,  // offhand
            17: 25   // ranged
        };

        // Initialize all item values to 0
        const values: number[] = [];
        for (let i = 0; i < 26; i++) {
            values[i] = 0;
        }
        values[0] = Math.floor(newId);
        values[1] = 0; // npcsoundsid
        values[2] = Math.floor(outfitToSave.race);
        values[3] = 1; // class (default to 1)
        values[4] = Math.floor(outfitToSave.gender);
        values[5] = Math.floor(outfitToSave.skin);
        values[6] = Math.floor(outfitToSave.face);
        values[7] = Math.floor(outfitToSave.hair);
        values[8] = Math.floor(outfitToSave.haircolor);
        values[9] = Math.floor(outfitToSave.facialhair);
        // values[10-20] are item slots (initialized to 0)
        values[21] = 0; // guildid
        values[22] = 0; // description (will be NULL)
        // values[23-25] are weapons (mainhand, offhand, ranged, initialized to 0)

        // Set item values
        for (const [slotStr, itemData] of Object.entries(outfitToSave.items)) {
            const slotNum = Number(slotStr);
            const dbIdx = slotToDBIndex[slotNum];
            if (dbIdx !== undefined) {
                values[dbIdx] = Math.floor(itemData.entry);
            }
        }

        const insert = `INSERT INTO creature_template_outfits (entry, npcsoundsid, race, class, gender, skin, face, hair, haircolor, facialhair, head, shoulders, body, chest, waist, legs, feet, wrists, hands, back, tabard, guildid, description, mainhand, offhand, ranged) VALUES (${values[0]}, ${values[1]}, ${values[2]}, ${values[3]}, ${values[4]}, ${values[5]}, ${values[6]}, ${values[7]}, ${values[8]}, ${values[9]}, ${values[10]}, ${values[11]}, ${values[12]}, ${values[13]}, ${values[14]}, ${values[15]}, ${values[16]}, ${values[17]}, ${values[18]}, ${values[19]}, ${values[20]}, ${values[21]}, NULL, ${values[23]}, ${values[24]}, ${values[25]})`;
        
        QueryWorld(insert);
        
        player.SendBroadcastMessage(`Outfit saved to database with ID: ${newId}`);
        player.SendBroadcastMessage(`Note: Export your outfits and save them in datascripts to prevent loss during migrations!`);
        
        // Send updated outfit list
        sendOutfitList(player);
    });

    // Handle export outfit by ID requests
    events.CustomPacket.OnReceive(EXPORT_OUTFIT_BY_ID_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new ExportOutfitByIdMessage();
        msg.read(packet);

        const savedData = getSavedOutfits(player);
        let outfitState: OutfitState | null = null;

        // Check in-memory outfits first
        for (const saved of savedData.outfits) {
            if (saved.id === msg.outfitId) {
                outfitState = saved.outfit;
                break;
            }
        }

        // If not found in memory, check database
        if (!outfitState && msg.outfitId > 2147483647) {
            const query = `SELECT race, gender, skin, face, hair, haircolor, facialhair, head, shoulders, body, chest, waist, legs, feet, wrists, hands, back, tabard, mainhand, offhand, ranged FROM creature_template_outfits WHERE entry = ${msg.outfitId}`;
            const result = QueryWorld(query);
            
            if (result.GetRow()) {
                outfitState = {
                    race: result.GetUInt8(0),
                    gender: result.GetUInt8(1),
                    skin: result.GetUInt8(2),
                    face: result.GetUInt8(3),
                    hair: result.GetUInt8(4),
                    haircolor: result.GetUInt8(5),
                    facialhair: result.GetUInt8(6),
                    items: {}
                };

                // Map database columns to slots (column index in SELECT to slot number)
                const dbColumnToSlot: {[key: number]: number} = {
                    7: 0,   // head
                    8: 2,   // shoulders
                    9: 3,   // body (shirt)
                    10: 4,  // chest
                    11: 5,  // waist
                    12: 6,  // legs
                    13: 7,  // feet
                    14: 8,  // wrists
                    15: 9,  // hands
                    16: 14, // back
                    17: 18, // tabard
                    18: 15, // mainhand
                    19: 16, // offhand
                    20: 17  // ranged
                };

                for (const [dbColIdx, slotNum] of Object.entries(dbColumnToSlot)) {
                    const entry = result.GetInt32(Number(dbColIdx));
                    if (entry !== 0) {
                        // Query item name if positive ID
                        let itemName = '';
                        if (entry > 0) {
                            const itemQuery = `SELECT name FROM item_template WHERE entry = ${entry}`;
                            const itemResult = QueryWorld(itemQuery);
                            if (itemResult.GetRow()) {
                                itemName = itemResult.GetString(0);
                            }
                            if (!itemName) {
                                itemName = `Item: ${entry}`;
                            }
                        } else {
                            itemName = `Display ID: ${entry}`;
                        }
                        
                        outfitState.items[slotNum] = {
                            entry: entry,
                            name: itemName
                        };
                    }
                }
            }
        }

        if (!outfitState) {
            player.SendBroadcastMessage('Outfit not found!');
            return;
        }

        // Generate datascripts code
        let code = 'import { std } from "wow/wotlk";\n\n';
        code += 'const outfit = std.CreatureOutfits.create();\n\n';
        code += '// Appearance\n';
        code += `outfit.Race.set(${Math.floor(outfitState.race)});\n`;
        code += `outfit.Gender.set(${Math.floor(outfitState.gender)});\n`;
        code += `outfit.Skin.set(${Math.floor(outfitState.skin)});\n`;
        code += `outfit.Face.set(${Math.floor(outfitState.face)});\n`;
        code += `outfit.Hair.set(${Math.floor(outfitState.hair)});\n`;
        code += `outfit.HairColor.set(${Math.floor(outfitState.haircolor)});\n`;
        code += `outfit.FacialHair.set(${Math.floor(outfitState.facialhair)});\n\n`;

        // Map slot numbers to datascript property names
        const slotMap: {[key: number]: string} = {
            0: 'Head',
            2: 'Shoulders',
            3: 'Shirt',
            4: 'Chest',
            5: 'Waist',
            6: 'Legs',
            7: 'Feet',
            8: 'Wrists',
            9: 'Hands',
            14: 'Back',
            15: 'Mainhand',
            16: 'Offhand',
            17: 'Ranged',
            18: 'Tabard'
        };

        code += '// Equipped items\n';
        // Set all slots to 0 first
        for (const [slot, propName] of Object.entries(slotMap)) {
            code += `outfit.${propName}.set(0);\n`;
        }

        // Then set items that exist
        for (const [slotStr, itemData] of Object.entries(outfitState.items)) {
            const slotNum = Number(slotStr);
            const propName = slotMap[slotNum];
            if (propName) {
                const entry = Math.floor(itemData.entry);
                // Only add comment for positive entries (actual items with names), not display IDs
                let comment = '';
                if (entry > 0 && itemData.name && !itemData.name.startsWith('Display ID:') && !itemData.name.startsWith('Item:')) {
                    comment = ` // ${itemData.name}`;
                }
                code += `outfit.${propName}.set(${entry});${comment}\n`;
            }
        }

        // Send code to client
        const exportMsg = new ExportedCodeMessage(code);
        exportMsg.write().SendToPlayer(player);
        player.SendBroadcastMessage('Outfit exported as datascripts code!');
    });
}

// Helper function to send outfit list
function sendOutfitList(player: TSPlayer): void {
    const savedData = getSavedOutfits(player);
    
    const outfits: Array<{id: number, race: number, gender: number, savedToDB: boolean}> = [];
    
    // Add in-memory outfits (not saved to DB)
    for (const saved of savedData.outfits) {
        outfits.push({
            id: saved.id,
            race: saved.outfit.race,
            gender: saved.outfit.gender,
            savedToDB: false
        });
    }

    // Add database outfits (saved to DB)
    const query = 'SELECT entry, race, gender FROM creature_template_outfits WHERE entry > 2147483647 ORDER BY entry DESC LIMIT 100';
    const result = QueryWorld(query);
    
    while (result.GetRow()) {
        const id = result.GetUInt32(0);
        const race = result.GetUInt8(1);
        const gender = result.GetUInt8(2);
        outfits.push({
            id,
            race,
            gender,
            savedToDB: true
        });
    }

    // Sort by ID descending (most recent first)
    outfits.sort((a, b) => b.id - a.id);

    const listMsg = new OutfitListMessage(outfits);
    listMsg.write().SendToPlayer(player);
}

