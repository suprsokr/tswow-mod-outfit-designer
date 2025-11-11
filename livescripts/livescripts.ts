// Main entry point for outfit designer livescripts
import { playerCreatures, creatureOutfits } from "./state";
import { registerSpawnHandlers } from "./handlers/spawnHandlers";
import { registerOutfitHandlers } from "./handlers/outfitHandlers";
import { registerItemHandlers } from "./handlers/itemHandlers";
import { registerSavedOutfitHandlers } from "./handlers/savedOutfitHandlers";

export function Main(events: TSEvents) {
    // Register all handlers
    registerSpawnHandlers(events);
    registerOutfitHandlers(events);
    registerItemHandlers(events);
    registerSavedOutfitHandlers(events);

    // Clean up on player logout
    events.Player.OnLogout((player) => {
        const creatures = playerCreatures.get(player.GetGUIDLow());
        if (creatures && creatures.length > 0) {
            for (const creature of creatures) {
                if (creature && !creature.IsNull()) {
                    // Clean up creature's outfit state
                    creatureOutfits.delete(creature.GetGUIDLow());
                    // Despawn the creature
                    creature.DespawnOrUnsummon(0);
                }
            }
            playerCreatures.delete(player.GetGUIDLow());
        }
    });
}

