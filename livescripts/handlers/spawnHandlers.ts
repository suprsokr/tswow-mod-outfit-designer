// Handlers for spawning and despawning creatures
import { SpawnMessage, SPAWN_MESSAGE_ID, DespawnMessage, DESPAWN_MESSAGE_ID } from "../../shared/Messages";
import { playerCreatures, creatureOutfits } from "../state";
import { checkGMPermission, mapSlotNameToNumber } from "../utils";
import { OutfitCopyData } from "../types";

export function registerSpawnHandlers(events: TSEvents): void {
    // Handle spawn requests
    events.CustomPacket.OnReceive(SPAWN_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new SpawnMessage(1, 0, 0, 0, 0, 0, 0);
        msg.read(packet);

        // Get the preview creature entry from datascripts
        const creatureIds = TAG('outfit-designer', 'outfit-preview-creature');
        const creatureEntry = creatureIds[0];

        // Spawn in front of the player, facing back towards the player
        const pos = player.GetPosition();
        const o = player.GetO();
        const creature = player.GetMap().SpawnCreature(
            creatureEntry,
            pos.x + 2 * Math.cos(o),
            pos.y + 2 * Math.sin(o),
            pos.z,
            o + Math.PI  // Add PI (180 degrees) to make creature face the player
        );

        if (creature && !creature.IsNull()) {
            // Convert items array from message to items object
            const items: {[key: number]: {entry: number, name: string}} = {};
            for (const item of msg.items) {
                const slotNum = mapSlotNameToNumber(item.slot);
                items[slotNum] = {
                    entry: item.entry,
                    name: item.name
                };
            }
            
            // Create outfit state for this creature
            const outfitState = {
                race: msg.race,
                gender: msg.gender,
                skin: msg.skin,
                face: msg.face,
                hair: msg.hair,
                haircolor: msg.haircolor,
                facialhair: msg.facialhair,
                items: items
            };
            creatureOutfits.set(creature.GetGUIDLow(), outfitState);

            // Create and apply outfit with the specified race, gender, and items
            const customOutfit = CreateOutfit(msg.race, msg.gender);
            customOutfit.SetSkin(msg.skin);
            customOutfit.SetFace(msg.face);
            customOutfit.SetHairStyle(msg.hair);
            customOutfit.SetHairColor(msg.haircolor);
            customOutfit.SetFacialStyle(msg.facialhair);
            
            // Apply any equipped items from the message
            for (const [slotStr, itemData] of Object.entries(items)) {
                const slot = Number(slotStr);
                const item = itemData as {entry: number, name: string};
                if (slot === 15) {
                    customOutfit.SetMainhand(item.entry);
                } else if (slot === 16) {
                    customOutfit.SetOffhand(item.entry);
                } else if (slot === 17) {
                    customOutfit.SetRanged(item.entry);
                } else {
                    customOutfit.SetItem(slot, item.entry);
                }
            }
            
            creature.SetOutfit(customOutfit);

            // Track the spawned creature
            let creatures = playerCreatures.get(player.GetGUIDLow());
            if (!creatures) {
                creatures = [];
                playerCreatures.set(player.GetGUIDLow(), creatures);
            }
            creatures.push(creature);

            player.SendBroadcastMessage('Spawned outfit preview creature! Target it to modify its outfit.');
        } else {
            player.SendBroadcastMessage('Failed to spawn creature');
        }
    });

    // Handle despawn requests
    events.CustomPacket.OnReceive(DESPAWN_MESSAGE_ID, (opcode, packet, player) => {
        if (!checkGMPermission(player)) return;

        const msg = new DespawnMessage("");
        msg.read(packet);

        // Get the player's target
        const target = player.GetSelection();

        if (!target || target.IsNull()) {
            player.SendBroadcastMessage('No target selected!');
            return;
        }

        const creature = target.ToCreature();

        if (!creature || creature.IsNull()) {
            player.SendBroadcastMessage('Target is not a creature!');
            return;
        }

        // Check if it's an outfit preview creature
        const creatureIds = TAG('outfit-designer', 'outfit-preview-creature');
        const targetCreatureEntry = creatureIds[0];

        if (creature.GetEntry() !== targetCreatureEntry) {
            player.SendBroadcastMessage('Target is not an Outfit Preview Dummy!');
            return;
        }

        // Despawn the creature
        const creatureGUID = creature.GetGUIDLow();
        creature.DespawnOrUnsummon(0);

        // Clean up creature's outfit state
        creatureOutfits.delete(creatureGUID);

        // Try to remove from playerCreatures if it exists
        const creatures = playerCreatures.get(player.GetGUIDLow());
        if (creatures) {
            const index = creatures.findIndex(c => c && !c.IsNull() && c.GetGUIDLow() === creatureGUID);
            if (index !== -1) {
                creatures.splice(index, 1);
            }
        }

        player.SendBroadcastMessage('Outfit Preview Dummy despawned!');
    });
}

