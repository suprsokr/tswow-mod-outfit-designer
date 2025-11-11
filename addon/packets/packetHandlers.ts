// Packet handlers for Outfit Designer addon
import {
    ItemSearchResultsMessage,
    ITEM_SEARCH_RESULTS_MESSAGE_ID,
    UpdateEquippedMessage,
    UPDATE_EQUIPPED_MESSAGE_ID,
    OutfitCopiedMessage,
    OUTFIT_COPIED_MESSAGE_ID,
    OutfitListMessage,
    OUTFIT_LIST_MESSAGE_ID,
    ExportedCodeMessage,
    EXPORTED_CODE_MESSAGE_ID
} from "../../shared/Messages";
import {
    setRace,
    setGender,
    setSkin,
    setFace,
    setHair,
    setHairColor,
    setFacialHair,
    addEquippedItem,
    removeEquippedItem,
    setEquippedItems
} from "../state/addonState";
import { displaySearchResults, updateEquippedDisplay, updateAppearanceUI, displaySavedOutfits } from "../ui/uiUpdates";
import { setSavedOutfits } from "../state/addonState";
import { getMainFrame } from "../ui/uiReferences";
import { createUI } from "../ui/createUI";
import { showExportPopup } from "../ui/builders/exportPopupBuilder";

export function registerPacketHandlers() {
    // Handle search results from server
    OnCustomPacket(ITEM_SEARCH_RESULTS_MESSAGE_ID, (packet: TSPacketRead) => {
        const msg = new ItemSearchResultsMessage([]);
        msg.read(packet);
        
        // Ensure UI is created
        if (!getMainFrame()) {
            createUI();
        }
        
        displaySearchResults(msg.results);
    });

    // Handle equipped item updates from server
    OnCustomPacket(UPDATE_EQUIPPED_MESSAGE_ID, (packet: TSPacketRead) => {
        const msg = new UpdateEquippedMessage("", "", 0);
        msg.read(packet);
        
        if (msg.itemName === '' || msg.itemEntry === 0) {
            // Unequip - remove the item from the slot
            removeEquippedItem(msg.slot);
        } else {
            // Equip - add/update the item in the slot
            addEquippedItem(msg.slot, msg.itemName, msg.itemEntry);
        }
        updateEquippedDisplay();
    });

    // Handle copied outfit values from server
    OnCustomPacket(OUTFIT_COPIED_MESSAGE_ID, (packet: TSPacketRead) => {
        const msg = new OutfitCopiedMessage(1, 0, 0, 0, 0, 0, 0);
        msg.read(packet);
        
        // Update local state variables
        setRace(msg.race);
        setGender(msg.gender);
        setSkin(msg.skin);
        setFace(msg.face);
        setHair(msg.hair);
        setHairColor(msg.haircolor);
        setFacialHair(msg.facialhair);
        
        // Update UI text displays to show the copied values
        updateAppearanceUI(msg.race, msg.gender, msg.skin, msg.face, msg.hair, msg.haircolor, msg.facialhair);
        
        // Update equipped items from the loaded outfit
        if (msg.items && msg.items.length > 0) {
            const newItems: {[key: string]: {name: string, id: number}} = {};
            for (let i = 0; i < msg.items.length; i++) {
                const item = msg.items[i];
                newItems[item.slot] = {
                    name: item.name,
                    id: item.entry
                };
            }
            setEquippedItems(newItems);
            updateEquippedDisplay();
        } else {
            // Clear equipped items if outfit has no items
            setEquippedItems({});
            updateEquippedDisplay();
        }
    });

    // Handle outfit list from server
    OnCustomPacket(OUTFIT_LIST_MESSAGE_ID, (packet: TSPacketRead) => {
        const msg = new OutfitListMessage([]);
        msg.read(packet);
        
        // Update state
        setSavedOutfits(msg.outfits);
        
        // Display outfits
        displaySavedOutfits();
    });

    // Handle exported code from server
    OnCustomPacket(EXPORTED_CODE_MESSAGE_ID, (packet: TSPacketRead) => {
        const msg = new ExportedCodeMessage();
        msg.read(packet);
        showExportPopup(msg.code);
    });
}

