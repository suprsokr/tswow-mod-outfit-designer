// import { 
//     SpawnMessage, 
//     SPAWN_MESSAGE_ID, 
//     DespawnMessage, 
//     DESPAWN_MESSAGE_ID, 
//     SetCustomOutfitMessage, 
//     SET_CUSTOM_OUTFIT_MESSAGE_ID, 
//     ItemSearchMessage, 
//     ITEM_SEARCH_MESSAGE_ID, 
//     ItemSearchResultsMessage, 
//     ITEM_SEARCH_RESULTS_MESSAGE_ID, 
//     EquipItemMessage, 
//     EQUIP_ITEM_MESSAGE_ID, 
//     UpdateEquippedMessage, 
//     UPDATE_EQUIPPED_MESSAGE_ID, 
//     ResetOutfitMessage, 
//     RESET_OUTFIT_MESSAGE_ID, 
//     CopyOutfitMessage, 
//     COPY_OUTFIT_MESSAGE_ID, 
//     ApplyCopyOutfitMessage, 
//     APPLY_COPY_OUTFIT_MESSAGE_ID, 
//     OutfitCopiedMessage, 
//     OUTFIT_COPIED_MESSAGE_ID,
//     UnequipItemMessage,
//     UNEQUIP_ITEM_MESSAGE_ID
// } from "../shared/Messages";
// import * as logger from "./logger";

// // Class to store outfit copy in player memory
// class OutfitCopyData extends TSClass {
//     outfit: TSOutfit | null = null;
// }

// // Map to track spawned creatures per player (player guid low -> array of creatures)
// const playerCreatures = new Map<number, TSCreature[]>();

// // Map to track player outfit states (race, gender, skin, face, hair, haircolor, facialhair, items per slot with names)
// const playerOutfits = new Map<number, {
//     race: number, 
//     gender: number, 
//     skin: number, 
//     face: number, 
//     hair: number, 
//     haircolor: number, 
//     facialhair: number, 
//     items: {[key: number]: {entry: number, name: string}}
// }>();

// export function Main(events: TSEvents) {

//     // Handle spawn requests
//     events.CustomPacket.OnReceive(SPAWN_MESSAGE_ID, (opcode, packet, player) => {
//         // Check GM rank
//         if (player.GetGMRank() <= 0) {
//             player.SendBroadcastMessage('You do not have permission to use this command.');
//             return;
//         }

//         const msg = new SpawnMessage(1, 0, 0, 0, 0, 0, 0);
//         msg.read(packet);

//         // Get the preview creature entry from datascripts
//         const creatureIds = TAG('unit-creator', 'outfit-preview-creature');
//         const creatureEntry = creatureIds[0];

//         // Spawn in front of the player
//         const pos = player.GetPosition();
//         const o = player.GetO();
//         const creature = player.GetMap().SpawnCreature(
//             creatureEntry,
//             pos.x + 2 * Math.cos(o),
//             pos.y + 2 * Math.sin(o),
//             pos.z,
//             o
//         );

//         if (creature && !creature.IsNull()) {
//             // Create and apply outfit with the specified race and gender
//             const customOutfit = CreateOutfit(msg.race, msg.gender);
//             customOutfit.SetSkin(msg.skin);
//             customOutfit.SetFace(msg.face);
//             customOutfit.SetHairStyle(msg.hair);
//             customOutfit.SetHairColor(msg.haircolor);
//             customOutfit.SetFacialStyle(msg.facialhair);
            
//             creature.SetOutfit(customOutfit);

//             // Initialize outfit state for this player
//             playerOutfits.set(player.GetGUIDLow(), {
//                 race: msg.race,
//                 gender: msg.gender,
//                 skin: msg.skin,
//                 face: msg.face,
//                 hair: msg.hair,
//                 haircolor: msg.haircolor,
//                 facialhair: msg.facialhair,
//                 items: {}
//             });

//             // Add to tracking
//             const creatures = playerCreatures.get(player.GetGUIDLow()) || [];
//             creatures.push(creature);
//             playerCreatures.set(player.GetGUIDLow(), creatures);

//             player.SendBroadcastMessage('Preview creature spawned!');
//             player.SendBroadcastMessage('Target the creature to change its outfit using the selectors.');
//         } else {
//             player.SendBroadcastMessage('Failed to spawn creature!');
//         }
//     });

//     // Handle despawn requests
//     events.CustomPacket.OnReceive(DESPAWN_MESSAGE_ID, (opcode, packet, player) => {
//         // Check GM rank
//         if (player.GetGMRank() <= 0) {
//             player.SendBroadcastMessage('You do not have permission to use this command.');
//             return;
//         }

//         const msg = new DespawnMessage("");
//         msg.read(packet);


//         // Extract low GUID from hex string (last 4 characters)
//         const guidLowHex = msg.creatureGUID.substring(msg.creatureGUID.length - 4);
//         const targetGuidLow = parseInt(guidLowHex, 16);

//         let found = false;
//         const creatures = playerCreatures.get(player.GetGUIDLow());

//         // Try to find in tracked creatures
//         if (creatures && creatures.length > 0) {
//             for (let i = 0; i < creatures.length; i++) {
//                 const creature = creatures[i];
//                 if (creature && !creature.IsNull() && creature.GetGUIDLow() === targetGuidLow) {
//                     creature.DespawnOrUnsummon(0);
//                     creatures.splice(i, 1);
//                     player.SendBroadcastMessage('Despawned creature!');
//                     found = true;
//                     break;
//                 }
//             }
//         }

//         // If not found in tracked creatures, try to find any Outfit Preview Dummy nearby
//         if (!found) {
//             const creatureIds = TAG('unit-creator', 'outfit-preview-creature');
//             const targetCreatureEntry = creatureIds[0];

//             const nearbyCreatures = player.GetCreaturesInRange(100, targetCreatureEntry, 0, 1);

//             for (let i = 0; i < nearbyCreatures.length; i++) {
//                 const creature = nearbyCreatures[i];
//                 if (creature && !creature.IsNull() && creature.GetGUIDLow() === targetGuidLow) {
//                     creature.DespawnOrUnsummon(0);
//                     player.SendBroadcastMessage('Despawned creature!');
//                     logger.log('Despawned untracked creature');
//                     found = true;
//                     break;
//                 }
//             }
//         }

//         if (!found) {
//             player.SendBroadcastMessage('Creature not found!');
//             logger.warn('Creature not found with GUID Low: ' + targetGuidLow);
//         }
//     });

//     // Handle set custom outfit requests
//     events.CustomPacket.OnReceive(SET_CUSTOM_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
//         // Check GM rank
//         if (player.GetGMRank() <= 0) {
//             player.SendBroadcastMessage('You do not have permission to use this command.');
//             return;
//         }

//         const msg = new SetCustomOutfitMessage("", 1, 0, 0, 0, 0, 0, 0);
//         msg.read(packet);

//         // Get the player's target
//         const target = player.GetSelection();
        
//         if (!target || target.IsNull()) {
//             player.SendBroadcastMessage('No target selected!');
//             return;
//         }

//         const creature = target.ToCreature();
//         if (!creature || creature.IsNull()) {
//             player.SendBroadcastMessage('Target is not a creature!');
//             return;
//         }

//         // Check if it's an outfit preview creature
//         const creatureIds = TAG('unit-creator', 'outfit-preview-creature');
//         const targetCreatureEntry = creatureIds[0];
        
//         if (creature.GetEntry() !== targetCreatureEntry) {
//             player.SendBroadcastMessage('Target is not an Outfit Preview Dummy!');
//             return;
//         }

//         // Get or create outfit state
//         let outfitState = playerOutfits.get(player.GetGUIDLow());
//         if (!outfitState) {
//             outfitState = {race: msg.race, gender: msg.gender, skin: msg.skin, face: msg.face, hair: msg.hair, haircolor: msg.haircolor, facialhair: msg.facialhair, items: {}};
//             playerOutfits.set(player.GetGUIDLow(), outfitState);
//         }
        
//         // Update state with new values
//         outfitState.race = msg.race;
//         outfitState.gender = msg.gender;
//         outfitState.skin = msg.skin;
//         outfitState.face = msg.face;
//         outfitState.hair = msg.hair;
//         outfitState.haircolor = msg.haircolor;
//         outfitState.facialhair = msg.facialhair;

//         // Create outfit with new values
//         const customOutfit = CreateOutfit(msg.race, msg.gender);
//         customOutfit.SetSkin(msg.skin);
//         customOutfit.SetFace(msg.face);
//         customOutfit.SetHairStyle(msg.hair);
//         customOutfit.SetHairColor(msg.haircolor);
//         customOutfit.SetFacialStyle(msg.facialhair);
        
//         // Apply all previously equipped items
//         for (const [slotStr, itemData] of Object.entries(outfitState.items)) {
//             const slotNum = Number(slotStr);
//             const itemEntry = itemData.entry;
//             // Use specific methods for weapon slots
//             if (slotNum === 15) {
//                 customOutfit.SetMainhand(itemEntry);
//             } else if (slotNum === 16) {
//                 customOutfit.SetOffhand(itemEntry);
//             } else if (slotNum === 17) {
//                 customOutfit.SetRanged(itemEntry);
//             } else {
//                 customOutfit.SetItem(slotNum, itemEntry);
//             }
//         }
        
//         // Apply the outfit to the creature
//         creature.SetOutfit(customOutfit);

//         player.SendBroadcastMessage('Outfit updated!');
//         logger.log('Applied race ' + msg.race + ', gender ' + msg.gender + ' outfit to creature with ' + Object.keys(outfitState.items).length + ' items');
//     });

//     // Handle item search requests
//     events.CustomPacket.OnReceive(ITEM_SEARCH_MESSAGE_ID, (opcode, packet, player) => {
//         // Check GM rank
//         if (player.GetGMRank() <= 0) {
//             player.SendBroadcastMessage('You do not have permission to use this command.');
//             return;
//         }

//         const msg = new ItemSearchMessage("");
//         msg.read(packet);

//         // Query item_template for items matching the search
//         const query = `SELECT entry, name, InventoryType FROM item_template WHERE name LIKE '%${msg.searchText}%' AND (InventoryType BETWEEN 1 AND 26) LIMIT 20`;
//         const result = QueryWorld(query);

//         const results: any[] = [];
        
//         while (result.GetRow()) {
//             const entry = result.GetUInt32(0);
//             const name = result.GetString(1);
//             const invType = result.GetUInt32(2);
            
//             // Map inventory type to slot name
//             let slotName = 'Unknown';
//             switch (invType) {
//                 case 1: slotName = 'Head'; break;
//                 case 2: slotName = 'Neck'; break;
//                 case 3: slotName = 'Shoulder'; break;
//                 case 4: slotName = 'Body'; break;
//                 case 5: slotName = 'Chest'; break;
//                 case 6: slotName = 'Waist'; break;
//                 case 7: slotName = 'Legs'; break;
//                 case 8: slotName = 'Feet'; break;
//                 case 9: slotName = 'Wrists'; break;
//                 case 10: slotName = 'Hands'; break;
//                 case 11: slotName = 'Finger'; break;
//                 case 12: slotName = 'Trinket'; break;
//                 case 13: slotName = 'Weapon (1H)'; break;
//                 case 14: slotName = 'Shield'; break;
//                 case 15: slotName = 'Ranged'; break;
//                 case 16: slotName = 'Back'; break;
//                 case 17: slotName = 'Weapon (2H)'; break;
//                 case 19: slotName = 'Tabard'; break;
//                 case 20: slotName = 'Chest'; break;
//                 case 21: slotName = 'Main Hand'; break;
//                 case 22: slotName = 'Off Hand'; break;
//                 case 23: slotName = 'Held In Off-Hand'; break;
//                 case 26: slotName = 'Ranged'; break;
//             }

//             const resultObj = {
//                 entry: entry,
//                 name: name,
//                 invType: invType,
//                 slot: slotName
//             };
//             results.push(resultObj);
//         }

//         // Send results back to client
//         try {
//             const resultsMsg = new ItemSearchResultsMessage(results);
//             const packet = resultsMsg.write();
//             packet.SendToPlayer(player);
            
//             player.SendBroadcastMessage('Found ' + results.length + ' items');
//         } catch (error) {
//             logger.error('Sending results: ' + error);
//             player.SendBroadcastMessage('Error: ' + error);
//         }
//     });

//     // Handle equip item requests
//     events.CustomPacket.OnReceive(EQUIP_ITEM_MESSAGE_ID, (opcode, packet, player) => {
//         // Check GM rank
//         if (player.GetGMRank() <= 0) {
//             player.SendBroadcastMessage('You do not have permission to use this command.');
//             return;
//         }

//         const msg = new EquipItemMessage(0, "");
//         msg.read(packet);

//         // Get or create outfit state
//         let outfitState = playerOutfits.get(player.GetGUIDLow());
//         if (!outfitState) {
//             outfitState = {race: 1, gender: 0, skin: 0, face: 0, hair: 0, haircolor: 0, facialhair: 0, items: {}};
//             playerOutfits.set(player.GetGUIDLow(), outfitState);
//         }

//         // Query item to get inventory type
//         const query = `SELECT InventoryType FROM item_template WHERE entry = ${msg.itemEntry}`;
//         const result = QueryWorld(query);

//         if (result && result.GetRow()) {
//             const invType = result.GetUInt32(0);
            
//             // Map inventory type to outfit slot
//             let slot = -1;
//             let slotName = '';
//             switch (invType) {
//                 case 1: slot = 0; slotName = 'Head'; break;
//                 case 3: slot = 2; slotName = 'Shoulder'; break;
//                 case 4: slot = 3; slotName = 'Body'; break;
//                 case 5: case 20: slot = 4; slotName = 'Chest'; break;
//                 case 6: slot = 5; slotName = 'Waist'; break;
//                 case 7: slot = 6; slotName = 'Legs'; break;
//                 case 8: slot = 7; slotName = 'Feet'; break;
//                 case 9: slot = 8; slotName = 'Wrists'; break;
//                 case 10: slot = 9; slotName = 'Hands'; break;
//                 case 16: slot = 14; slotName = 'Back'; break;
//                 case 19: slot = 18; slotName = 'Tabard'; break;
//                 // Weapon slots
//                 case 13: slot = 15; slotName = 'Weapon (1H)'; break; // One-Hand
//                 case 17: slot = 15; slotName = 'Weapon (2H)'; break; // Two-Hand
//                 case 21: slot = 15; slotName = 'Main Hand'; break; // Main hand
//                 case 22: slot = 16; slotName = 'Off Hand'; break; // Off hand
//                 case 14: slot = 16; slotName = 'Shield'; break; // Shield (off hand)
//                 case 23: slot = 16; slotName = 'Held In Off-Hand'; break; // Held in off-hand
//                 case 15: case 26: slot = 17; slotName = 'Ranged'; break; // Ranged
//             }

//             if (slot >= 0) {
//                 // Store in outfit state with item name
//                 outfitState.items[slot] = {entry: msg.itemEntry, name: msg.itemName};

//                 // Get player's target
//                 const target = player.GetSelection();
                
//                 if (!target || target.IsNull()) {
//                     player.SendBroadcastMessage('No target selected!');
//                     return;
//                 }

//                 const creature = target.ToCreature();
//                 if (!creature || creature.IsNull()) {
//                     player.SendBroadcastMessage('Target is not a creature!');
//                     return;
//                 }

//                 // Check if it's an outfit preview creature
//                 const creatureIds = TAG('unit-creator', 'outfit-preview-creature');
//                 const targetCreatureEntry = creatureIds[0];
                
//                 if (creature.GetEntry() !== targetCreatureEntry) {
//                     player.SendBroadcastMessage('Target is not an Outfit Preview Dummy!');
//                     return;
//                 }

//                 // Create outfit with current state
//                 const customOutfit = CreateOutfit(outfitState.race, outfitState.gender);
//                 customOutfit.SetSkin(outfitState.skin);
//                 customOutfit.SetFace(outfitState.face);
//                 customOutfit.SetHairStyle(outfitState.hair);
//                 customOutfit.SetHairColor(outfitState.haircolor);
//                 customOutfit.SetFacialStyle(outfitState.facialhair);

//                 // Apply all stored items
//                 for (const [slotStr, itemData] of Object.entries(outfitState.items)) {
//                     const slotNum = Number(slotStr);
//                     const itemEntry = itemData.entry;
//                     // Use specific methods for weapon slots
//                     if (slotNum === 15) {
//                         customOutfit.SetMainhand(itemEntry);
//                     } else if (slotNum === 16) {
//                         customOutfit.SetOffhand(itemEntry);
//                     } else if (slotNum === 17) {
//                         customOutfit.SetRanged(itemEntry);
//                     } else {
//                         customOutfit.SetItem(slotNum, itemEntry);
//                     }
//                 }

//                 // Apply outfit to creature
//                 creature.SetOutfit(customOutfit);

//                 // Send update to client to show equipped item
//                 const updateMsg = new UpdateEquippedMessage(slotName, msg.itemName, msg.itemEntry);
//                 updateMsg.write().SendToPlayer(player);

//                 player.SendBroadcastMessage('Equipped: ' + msg.itemName + ' (' + msg.itemEntry + ')');
//                 logger.log('Applied outfit with item to creature');
//             } else {
//                 player.SendBroadcastMessage('Item cannot be equipped (unsupported slot)');
//             }
//         } else {
//             player.SendBroadcastMessage('Item not found in database');
//         }
//     });

//     // Handle reset outfit requests
//     events.CustomPacket.OnReceive(RESET_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
//         // Check GM rank
//         if (player.GetGMRank() <= 0) {
//             player.SendBroadcastMessage('You do not have permission to use this command.');
//             return;
//         }

//         const msg = new ResetOutfitMessage();
//         msg.read(packet);

//         logger.log('Reset outfit request from player: ' + player.GetName());

//         // Get the player's target
//         const target = player.GetSelection();
        
//         if (!target || target.IsNull()) {
//             player.SendBroadcastMessage('No target selected!');
//             return;
//         }

//         const creature = target.ToCreature();
//         if (!creature || creature.IsNull()) {
//             player.SendBroadcastMessage('Target is not a creature!');
//             return;
//         }

//         // Check if it's an outfit preview creature
//         const creatureIds = TAG('unit-creator', 'outfit-preview-creature');
//         const targetCreatureEntry = creatureIds[0];
        
//         if (creature.GetEntry() !== targetCreatureEntry) {
//             player.SendBroadcastMessage('Target is not an Outfit Preview Dummy!');
//             return;
//         }

//         // Get or create outfit state
//         let outfitState = playerOutfits.get(player.GetGUIDLow());
//         if (!outfitState) {
//             outfitState = {race: 1, gender: 0, skin: 0, face: 0, hair: 0, haircolor: 0, facialhair: 0, items: {}};
//             playerOutfits.set(player.GetGUIDLow(), outfitState);
//         }
        
//         // Clear all items
//         outfitState.items = {};

//         // Create outfit with appearance settings, no items
//         const customOutfit = CreateOutfit(outfitState.race, outfitState.gender);
//         customOutfit.SetSkin(outfitState.skin);
//         customOutfit.SetFace(outfitState.face);
//         customOutfit.SetHairStyle(outfitState.hair);
//         customOutfit.SetHairColor(outfitState.haircolor);
//         customOutfit.SetFacialStyle(outfitState.facialhair);
        
//         // Apply the outfit to the creature
//         creature.SetOutfit(customOutfit);

//         player.SendBroadcastMessage('Reset outfit! All items removed.');
//     });

//     // Handle copy outfit requests
//     events.CustomPacket.OnReceive(COPY_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
//         try {
//             // Check GM rank
//             if (player.GetGMRank() <= 0) {
//                 player.SendBroadcastMessage('You do not have permission to use this command.');
//                 return;
//             }

//             const msg = new CopyOutfitMessage();
//             msg.read(packet);

//             // Get the player's target
//             const target = player.GetSelection();
            
//             if (!target || target.IsNull()) {
//                 player.SendBroadcastMessage('No target selected!');
//                 return;
//             }

//             const creature = target.ToCreature();
            
//             if (!creature || creature.IsNull()) {
//                 player.SendBroadcastMessage('Target is not a creature!');
//                 return;
//             }

//             // Check if it's an outfit preview creature (only these have custom outfits)
//             const creatureIds = TAG('unit-creator', 'outfit-preview-creature');
//             const targetCreatureEntry = creatureIds[0];
            
//             if (creature.GetEntry() !== targetCreatureEntry) {
//                 player.SendBroadcastMessage('Target is not an Outfit Preview Dummy! Can only copy from outfit preview creatures.');
//                 return;
//             }

//             // Verify creature has an outfit
//             const currentOutfit = creature.GetOutfit();
            
//             if (!currentOutfit) {
//                 logger.error('Creature has no outfit');
//                 player.SendBroadcastMessage('Creature has no outfit!');
//                 return;
//             }

//             // Get outfit copy from creature
//             const outfitCopy = creature.GetOutfitCopy();
            
//             if (!outfitCopy) {
//                 logger.error('GetOutfitCopy returned null');
//                 player.SendBroadcastMessage('Failed to copy outfit from creature!');
//                 return;
//             }
            
//             // Store in player memory using GetObject
//             const copyData = player.GetObject('outfit-copy', new OutfitCopyData());
//             copyData.outfit = outfitCopy;

//             // Send the copied outfit values back to client to update UI
//             const race = outfitCopy.GetRace();
//             const gender = outfitCopy.GetGender();
//             const skin = outfitCopy.GetSkin();
//             const face = outfitCopy.GetFace();
//             const hair = outfitCopy.GetHairStyle();
//             const haircolor = outfitCopy.GetHairColor();
//             const facialhair = outfitCopy.GetFacialStyle();
            
//             // Get or create outfit state for this player
//             let outfitState = playerOutfits.get(player.GetGUIDLow());
//             if (!outfitState) {
//                 outfitState = {race: race, gender: gender, skin: skin, face: face, hair: hair, haircolor: haircolor, facialhair: facialhair, items: {}};
//                 playerOutfits.set(player.GetGUIDLow(), outfitState);
//             }
            
//             // Update outfit state with copied appearance values
//             outfitState.race = race;
//             outfitState.gender = gender;
//             outfitState.skin = skin;
//             outfitState.face = face;
//             outfitState.hair = hair;
//             outfitState.haircolor = haircolor;
//             outfitState.facialhair = facialhair;
            
//             // Since outfits are created in memory and not saved to DB,
//             // we need to get items from the creature's stored outfit state
//             // First, check if there's an existing outfit state for the targeted creature
            
//             // Find which player owns this creature by checking all player creature lists
//             let sourcePlayerGUID = 0;
//             playerCreatures.forEach((creatures, playerGUID) => {
//                 if (sourcePlayerGUID === 0) {
//                     for (const c of creatures) {
//                         if (c && !c.IsNull() && c.GetGUIDLow() === creature.GetGUIDLow()) {
//                             sourcePlayerGUID = playerGUID;
//                             break;
//                         }
//                     }
//                 }
//             });
            
//             // Copy items from the source player's outfit state if found
//             const sourceOutfitState = sourcePlayerGUID > 0 ? playerOutfits.get(sourcePlayerGUID) : null;
            
//             // Build items array for sending to client
//             const items: Array<{slot: string, name: string, entry: uint32}> = [];
            
//             // If we found the source outfit state, copy its items
//             if (sourceOutfitState && sourceOutfitState.items) {
//                 // Copy all items from source to current player
//                 for (const [slotStr, itemData] of Object.entries(sourceOutfitState.items)) {
//                     const slotNum = Number(slotStr);
//                     // Copy the item data (entry and name)
//                     outfitState.items[slotNum] = {entry: itemData.entry, name: itemData.name};
                    
//                     // Map slot number to slot name
//                     let slotName = 'Unknown';
//                     switch (slotNum) {
//                         case 0: slotName = 'Head'; break;
//                         case 2: slotName = 'Shoulder'; break;
//                         case 3: slotName = 'Body'; break;
//                         case 4: slotName = 'Chest'; break;
//                         case 5: slotName = 'Waist'; break;
//                         case 6: slotName = 'Legs'; break;
//                         case 7: slotName = 'Feet'; break;
//                         case 8: slotName = 'Wrists'; break;
//                         case 9: slotName = 'Hands'; break;
//                         case 14: slotName = 'Back'; break;
//                         case 15: slotName = 'Main Hand'; break;
//                         case 16: slotName = 'Off Hand'; break;
//                         case 17: slotName = 'Ranged'; break;
//                         case 18: slotName = 'Tabard'; break;
//                     }
                    
//                     // Use the stored item name (no database query needed!)
//                     items.push({slot: slotName, name: itemData.name, entry: itemData.entry});
//                 }
//             }
            
//             const copiedMsg = new OutfitCopiedMessage(race, gender, skin, face, hair, haircolor, facialhair, items);
//             copiedMsg.write().SendToPlayer(player);

//             player.SendBroadcastMessage('Outfit copied from creature!');
//         } catch (error) {
//             logger.error('Exception in Copy Outfit handler: ' + error);
//             player.SendBroadcastMessage('Error copying outfit!');
//         }
//     });

//     // Handle apply copy outfit requests
//     events.CustomPacket.OnReceive(APPLY_COPY_OUTFIT_MESSAGE_ID, (opcode, packet, player) => {
//         // Check GM rank
//         if (player.GetGMRank() <= 0) {
//             player.SendBroadcastMessage('You do not have permission to use this command.');
//             return;
//         }

//         const msg = new ApplyCopyOutfitMessage();
//         msg.read(packet);

//         // Get the player's target
//         const target = player.GetSelection();
        
//         if (!target || target.IsNull()) {
//             player.SendBroadcastMessage('No target selected!');
//             return;
//         }

//         const creature = target.ToCreature();
//         if (!creature || creature.IsNull()) {
//             player.SendBroadcastMessage('Target is not a creature!');
//             return;
//         }

//         // Get stored outfit copy from player memory
//         const copyData = player.GetObject('outfit-copy', new OutfitCopyData());
        
//         if (!copyData.outfit) {
//             player.SendBroadcastMessage('No outfit copied yet! Use "Copy Outfit" first.');
//             return;
//         }

//         // Apply the copied outfit to the creature
//         creature.SetOutfit(copyData.outfit);

//         player.SendBroadcastMessage('Applied copied outfit to creature!');
//     });

//     // Handle unequip item requests
//     events.CustomPacket.OnReceive(UNEQUIP_ITEM_MESSAGE_ID, (opcode, packet, player) => {
//         // Check GM rank
//         if (player.GetGMRank() <= 0) {
//             player.SendBroadcastMessage('You do not have permission to use this command.');
//             return;
//         }

//         const msg = new UnequipItemMessage("");
//         msg.read(packet);

//         // Get or create outfit state
//         let outfitState = playerOutfits.get(player.GetGUIDLow());
//         if (!outfitState) {
//             player.SendBroadcastMessage('No outfit state found!');
//             return;
//         }

//         // Map slot name to slot number
//         let slotNum = -1;
//         const slotName = msg.slot;
//         switch (slotName) {
//             case 'Head': slotNum = 0; break;
//             case 'Shoulder': slotNum = 2; break;
//             case 'Body': slotNum = 3; break;
//             case 'Chest': slotNum = 4; break;
//             case 'Waist': slotNum = 5; break;
//             case 'Legs': slotNum = 6; break;
//             case 'Feet': slotNum = 7; break;
//             case 'Wrists': slotNum = 8; break;
//             case 'Hands': slotNum = 9; break;
//             case 'Back': slotNum = 14; break;
//             case 'Main Hand': slotNum = 15; break;
//             case 'Off Hand': slotNum = 16; break;
//             case 'Ranged': slotNum = 17; break;
//             case 'Tabard': slotNum = 18; break;
//         }

//         if (slotNum === -1) {
//             player.SendBroadcastMessage('Unknown slot: ' + slotName);
//             return;
//         }

//         // Remove item from outfit state
//         delete outfitState.items[slotNum];

//         // Get player's target
//         const target = player.GetSelection();
        
//         if (!target || target.IsNull()) {
//             player.SendBroadcastMessage('No target selected!');
//             return;
//         }

//         const creature = target.ToCreature();
//         if (!creature || creature.IsNull()) {
//             player.SendBroadcastMessage('Target is not a creature!');
//             return;
//         }

//         // Check if it's an outfit preview creature
//         const creatureIds = TAG('unit-creator', 'outfit-preview-creature');
//         const targetCreatureEntry = creatureIds[0];
        
//         if (creature.GetEntry() !== targetCreatureEntry) {
//             player.SendBroadcastMessage('Target is not an Outfit Preview Dummy!');
//             return;
//         }

//         // Recreate outfit with all appearance settings and remaining items
//         const customOutfit = CreateOutfit(outfitState.race, outfitState.gender);
//         customOutfit.SetSkin(outfitState.skin);
//         customOutfit.SetFace(outfitState.face);
//         customOutfit.SetHairStyle(outfitState.hair);
//         customOutfit.SetHairColor(outfitState.haircolor);
//         customOutfit.SetFacialStyle(outfitState.facialhair);

//         // Apply all remaining items
//         for (const [slotStr, itemData] of Object.entries(outfitState.items)) {
//             const slot = Number(slotStr);
//             const itemEntry = itemData.entry;
//             // Use specific methods for weapon slots
//             if (slot === 15) {
//                 customOutfit.SetMainhand(itemEntry);
//             } else if (slot === 16) {
//                 customOutfit.SetOffhand(itemEntry);
//             } else if (slot === 17) {
//                 customOutfit.SetRanged(itemEntry);
//             } else {
//                 customOutfit.SetItem(slot, itemEntry);
//             }
//         }

//         // Apply outfit to creature
//         creature.SetOutfit(customOutfit);

//         // Send update to client to remove item from display
//         const updateMsg = new UpdateEquippedMessage(slotName, '', 0);
//         updateMsg.write().SendToPlayer(player);

//         player.SendBroadcastMessage('Unequipped item from ' + slotName);
//     });

//     // Clean up on player logout
//     events.Player.OnLogout((player) => {
//         const creatures = playerCreatures.get(player.GetGUIDLow());
//         if (creatures && creatures.length > 0) {
//             for (const creature of creatures) {
//                 if (creature && !creature.IsNull()) {
//                     creature.DespawnOrUnsummon(0);
//                 }
//             }
//             playerCreatures.delete(player.GetGUIDLow());
//         }
//     });
// }
