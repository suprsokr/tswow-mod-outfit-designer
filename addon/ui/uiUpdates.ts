// UI update functions for Outfit Designer addon
import { getEquippedItems } from "../state/addonState";
import { 
    getEquippedScrollChild, 
    getEquippedRows, 
    clearEquippedRows, 
    addEquippedRow,
    getResultsScrollChild,
    getResultRows,
    clearResultRows,
    addResultRow,
    getRaceText,
    getGenderText,
    getSkinText,
    getFaceText,
    getHairText,
    getHairColorText,
    getFacialHairText
} from "./uiReferences";
import { getRaceName } from "../utils/constants";
import { UnequipItemMessage, EquipItemMessage, LoadOutfitMessage, DeleteOutfitMessage, LoadOutfitListMessage, SaveOutfitMessage, SaveOutfitToDBMessage, ExportOutfitByIdMessage } from "../../shared/Messages";
import { getSavedOutfits, getSavedOutfitsVisible, setSavedOutfitsVisible } from "../state/addonState";
import { getSavedOutfitsScrollChild, getSavedOutfitsRows, clearSavedOutfitsRows, addSavedOutfitsRow, getSavedOutfitsContainer, getSavedOutfitsToggleBtn } from "./uiReferences";

export function updateEquippedDisplay() {
    const equippedScrollChild = getEquippedScrollChild();
    if (!equippedScrollChild) return;
    
    // Clear existing rows
    for (const row of getEquippedRows()) {
        if (row) {
            row.Hide();
        }
    }
    clearEquippedRows();
    
    let yPos = -5;
    const equippedRowHeight = 25;
    const equippedCol1Width = 200; // Item Name column
    const equippedCol2Width = 120; // Slot column
    const equippedCol3Width = 80;  // Unequip button column
    
    const equippedItems = getEquippedItems();
    const slots = Object.keys(equippedItems);
    
    if (slots.length === 0) {
        // Show "No items equipped" message
        const noItemsFrame = CreateFrame('Frame', undefined, equippedScrollChild);
        noItemsFrame.SetSize(400, 20);
        noItemsFrame.SetPoint('TOPLEFT', equippedScrollChild, 'TOPLEFT', 0, yPos);

        const noItemsText = noItemsFrame.CreateFontString(undefined, 'OVERLAY', 'GameFontNormal');
        noItemsText.SetPoint('TOPLEFT', noItemsFrame, 'TOPLEFT', 10, 0);
        noItemsText.SetText('No items equipped');

        addEquippedRow(noItemsFrame);
        return;
    }

    // Create rows for each equipped item
    for (const slot of slots) {
        const item = equippedItems[slot];

        // Create a frame for this row
        const rowFrame = CreateFrame('Frame', undefined, equippedScrollChild);
        rowFrame.SetSize(400, equippedRowHeight);
        rowFrame.SetPoint('TOPLEFT', equippedScrollChild, 'TOPLEFT', 0, yPos);
        addEquippedRow(rowFrame);

        // Item Name (Column 1)
        const nameText = rowFrame.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
        nameText.SetPoint('TOPLEFT', rowFrame, 'TOPLEFT', 10, 0);
        nameText.SetText(item.name);
        nameText.SetWidth(equippedCol1Width);
        nameText.SetJustifyH('LEFT');

        // Slot (Column 2)
        const slotText = rowFrame.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
        slotText.SetPoint('TOPLEFT', rowFrame, 'TOPLEFT', 10 + equippedCol1Width, 0);
        slotText.SetText(slot);
        slotText.SetWidth(equippedCol2Width);
        slotText.SetJustifyH('LEFT');

        // Unequip Button (Column 3)
        const unequipBtn = CreateFrame('Button', undefined, rowFrame, 'UIPanelButtonTemplate');
        unequipBtn.SetSize(equippedCol3Width, equippedRowHeight - 3);
        unequipBtn.SetPoint('TOPLEFT', rowFrame, 'TOPLEFT', 10 + equippedCol1Width + equippedCol2Width, 0);
        unequipBtn.SetText('Unequip');

        // Capture the slot name in the closure
        const slotName = slot;
        unequipBtn.SetScript('OnClick', () => {
            const msg = new UnequipItemMessage(slotName);
            msg.write().Send();
        });

        yPos -= equippedRowHeight;
    }

    // Set content height
    equippedScrollChild.SetSize(400, Math.max(100, Math.abs(yPos)));
}

export function updateAppearanceUI(race: number, gender: number, skin: number, face: number, hair: number, hairColor: number, facialHair: number) {
    const raceText = getRaceText();
    const genderText = getGenderText();
    const skinText = getSkinText();
    const faceText = getFaceText();
    const hairText = getHairText();
    const hairColorText = getHairColorText();
    const facialHairText = getFacialHairText();
    
    if (raceText) {
        raceText.SetText('Race: ' + getRaceName(race) + ' (' + race + ')');
    }
    if (genderText) {
        genderText.SetText('Gender: ' + (gender === 0 ? 'Male' : 'Female') + ' (' + gender + ')');
    }
    if (skinText) {
        skinText.SetText('Skin: ' + skin);
    }
    if (faceText) {
        faceText.SetText('Face: ' + face);
    }
    if (hairText) {
        hairText.SetText('Hair: ' + hair);
    }
    if (hairColorText) {
        hairColorText.SetText('Hair Color: ' + hairColor);
    }
    if (facialHairText) {
        facialHairText.SetText('Facial Hair: ' + facialHair);
    }
}

export function displaySearchResults(results: any[]) {
    const resultsScrollChild = getResultsScrollChild();
    if (!resultsScrollChild) {
        return;
    }

    // Clear previous result rows
    for (const row of getResultRows()) {
        if (row) {
            row.Hide();
            row.SetParent(undefined as any);
        }
    }
    clearResultRows();

    let yPos = -5;
    const rowHeight = 22;

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        
        // Create row frame
        const row = CreateFrame('Frame', undefined, resultsScrollChild);
        row.SetSize(440, rowHeight);
        row.SetPoint('TOPLEFT', resultsScrollChild, 'TOPLEFT', 0, yPos);

        // Item name text (column 1)
        const nameText = row.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
        nameText.SetPoint('LEFT', row, 'LEFT', 5, 0);
        nameText.SetText(`${result.name} (${result.entry})`);
        nameText.SetJustifyH('LEFT');
        nameText.SetWidth(280);

        // Slot text (column 2)
        const slotText = row.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
        slotText.SetPoint('LEFT', row, 'LEFT', 290, 0);
        slotText.SetText(result.slot);
        slotText.SetJustifyH('LEFT');
        slotText.SetWidth(80);

        // Equip button (column 3)
        const equipBtn = CreateFrame('Button', undefined, row, 'UIPanelButtonTemplate');
        equipBtn.SetSize(60, 18);
        equipBtn.SetPoint('RIGHT', row, 'RIGHT', 0, 0);
        equipBtn.SetText('Equip');
        equipBtn.SetScript('OnClick', () => {
            const packet = new EquipItemMessage(result.entry, result.name);
            packet.write().Send();
        });

        row.Show();
        addResultRow(row);
        yPos -= rowHeight;
    }
    
    // Update scroll child height to fit all rows
    const contentHeight = Math.max(180, results.length * rowHeight + 10);
    if (resultsScrollChild) {
        resultsScrollChild.SetHeight(contentHeight);
    }
}

export function displaySavedOutfits() {
    const savedOutfitsScrollChild = getSavedOutfitsScrollChild();
    if (!savedOutfitsScrollChild) {
        return;
    }

    const outfits = getSavedOutfits();

    // Clear previous rows
    const rows = getSavedOutfitsRows();
    for (const row of rows) {
        if (row) {
            row.Hide();
            row.SetParent(undefined as any);
        }
    }
    clearSavedOutfitsRows();

    let yPos = -5;
    const rowHeight = 25;

    if (outfits.length === 0) {
        // Show "No saved outfits" message
        const noOutfitsFrame = CreateFrame('Frame', undefined, savedOutfitsScrollChild);
        noOutfitsFrame.SetSize(520, 20);
        noOutfitsFrame.SetPoint('TOPLEFT', savedOutfitsScrollChild, 'TOPLEFT', 0, yPos);
        
        const noOutfitsText = noOutfitsFrame.CreateFontString(undefined, 'OVERLAY', 'GameFontNormal');
        noOutfitsText.SetPoint('TOPLEFT', noOutfitsFrame, 'TOPLEFT', 10, 0);
        noOutfitsText.SetText('No saved outfits');
        
        addSavedOutfitsRow(noOutfitsFrame);
        return;
    }

    for (let i = 0; i < outfits.length; i++) {
        const outfit = outfits[i];
        
        // Create row frame
        const row = CreateFrame('Frame', undefined, savedOutfitsScrollChild);
        row.SetSize(520, rowHeight);
        row.SetPoint('TOPLEFT', savedOutfitsScrollChild, 'TOPLEFT', 0, yPos);

        // ID (column 1)
        const idText = row.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
        idText.SetPoint('LEFT', row, 'LEFT', 5, 0);
        idText.SetText(outfit.id.toString());
        idText.SetJustifyH('LEFT');
        idText.SetWidth(80);

        // Race (column 2)
        const raceText = row.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
        raceText.SetPoint('LEFT', row, 'LEFT', 90, 0);
        raceText.SetText(getRaceName(outfit.race));
        raceText.SetJustifyH('LEFT');
        raceText.SetWidth(70);

        // Gender (column 3)
        const genderText = row.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
        genderText.SetPoint('LEFT', row, 'LEFT', 165, 0);
        genderText.SetText(outfit.gender === 0 ? 'Male' : 'Female');
        genderText.SetJustifyH('LEFT');
        genderText.SetWidth(70);

        // Saved to DB (column 4)
        const savedToDBText = row.CreateFontString(undefined, 'OVERLAY', 'GameFontNormalSmall');
        savedToDBText.SetPoint('LEFT', row, 'LEFT', 240, 0);
        savedToDBText.SetText(outfit.savedToDB ? 'Yes' : 'No');
        savedToDBText.SetJustifyH('LEFT');
        savedToDBText.SetWidth(80);
        // Color code: green for DB, yellow for memory
        if (outfit.savedToDB) {
            savedToDBText.SetTextColor(0.2, 1, 0.2, 1); // Green
        } else {
            savedToDBText.SetTextColor(1, 1, 0, 1); // Yellow
        }

        // Capture outfit ID in closure
        const outfitId = outfit.id;
        
        // Load button
        const loadBtn = CreateFrame('Button', undefined, row, 'UIPanelButtonTemplate');
        loadBtn.SetSize(50, 20);
        loadBtn.SetPoint('LEFT', row, 'LEFT', 320, 0);
        loadBtn.SetText('Load');
        loadBtn.SetScript('OnClick', () => {
            const packet = new LoadOutfitMessage(outfitId);
            packet.write().Send();
        });

        // Export button
        const exportBtn = CreateFrame('Button', undefined, row, 'UIPanelButtonTemplate');
        exportBtn.SetSize(50, 20);
        exportBtn.SetPoint('LEFT', row, 'LEFT', 375, 0);
        exportBtn.SetText('Export');
        exportBtn.SetScript('OnClick', () => {
            const packet = new ExportOutfitByIdMessage(outfitId);
            packet.write().Send();
        });

        // Save button (only show if not saved to DB)
        if (!outfit.savedToDB) {
            const saveBtn = CreateFrame('Button', undefined, row, 'UIPanelButtonTemplate');
            saveBtn.SetSize(50, 20);
            saveBtn.SetPoint('LEFT', row, 'LEFT', 430, 0);
            saveBtn.SetText('Save');
            saveBtn.SetScript('OnClick', () => {
                const packet = new SaveOutfitToDBMessage(outfitId);
                packet.write().Send();
            });
        }

        // Delete button (only show if not saved to DB)
        if (!outfit.savedToDB) {
            const deleteBtn = CreateFrame('Button', undefined, row, 'UIPanelButtonTemplate');
            deleteBtn.SetSize(50, 20);
            deleteBtn.SetPoint('LEFT', row, 'LEFT', 485, 0);
            deleteBtn.SetText('Delete');
            deleteBtn.SetScript('OnClick', () => {
                const packet = new DeleteOutfitMessage(outfitId);
                packet.write().Send();
            });
        }

        row.Show();
        addSavedOutfitsRow(row);
        yPos -= rowHeight;
    }
    
    // Update scroll child height based on content
    const minHeight = 130; // Min height for the smaller frame
    const contentHeight = Math.max(minHeight, outfits.length * rowHeight + 10);
    savedOutfitsScrollChild.SetHeight(contentHeight);
}

export function toggleSavedOutfitsSection() {
    const container = getSavedOutfitsContainer();
    const toggleBtn = getSavedOutfitsToggleBtn();
    
    if (!container || !toggleBtn) return;

    const isVisible = getSavedOutfitsVisible();
    
    if (isVisible) {
        // Hide section
        container.Hide();
        toggleBtn.SetText('Browse');
        setSavedOutfitsVisible(false);
    } else {
        // Show section
        container.Show();
        toggleBtn.SetText('Hide');
        setSavedOutfitsVisible(true);
        
        // Always request fresh outfit list when opening
        const packet = new LoadOutfitListMessage();
        packet.write().Send();
    }
}

export function closeSavedOutfitsSection() {
    const container = getSavedOutfitsContainer();
    const toggleBtn = getSavedOutfitsToggleBtn();
    
    if (!container || !toggleBtn) return;

    // Only close if it's currently visible
    if (getSavedOutfitsVisible()) {
        container.Hide();
        toggleBtn.SetText('Browse');
        setSavedOutfitsVisible(false);
    }
}

