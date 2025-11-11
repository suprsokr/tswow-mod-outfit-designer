// Main entry point for Outfit Designer addon
// This file orchestrates the UI creation and packet handling

import { registerPacketHandlers } from "./packets/packetHandlers";
import { createUI, toggleUI } from "./ui/createUI";

// Initialize packet handlers
registerPacketHandlers();

// Register slash commands
(globalThis as any).SLASH_OUTFITDESIGNER1 = '/od';
(globalThis as any).SLASH_OUTFITDESIGNER2 = '/outfitdesigner';
(globalThis as any).SlashCmdList['OUTFITDESIGNER'] = () => {
    toggleUI();
};

console.log('Outfit Designer addon loaded! Use /od or /outfitdesigner to open.');
