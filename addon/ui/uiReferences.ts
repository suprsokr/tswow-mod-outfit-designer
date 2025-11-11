// UI element references for Outfit Designer addon

// Main frame reference
let mainFrame: WoWAPI.Frame | null = null;

// Getter for mainFrame
export function getMainFrame(): WoWAPI.Frame | null {
    return mainFrame;
}

// Appearance control text elements
let raceText: WoWAPI.FontString | null = null;
let genderText: WoWAPI.FontString | null = null;
let skinText: WoWAPI.FontString | null = null;
let faceText: WoWAPI.FontString | null = null;
let hairText: WoWAPI.FontString | null = null;
let hairColorText: WoWAPI.FontString | null = null;
let facialHairText: WoWAPI.FontString | null = null;

// Getters for appearance control text elements
export function getRaceText(): WoWAPI.FontString | null { return raceText; }
export function getGenderText(): WoWAPI.FontString | null { return genderText; }
export function getSkinText(): WoWAPI.FontString | null { return skinText; }
export function getFaceText(): WoWAPI.FontString | null { return faceText; }
export function getHairText(): WoWAPI.FontString | null { return hairText; }
export function getHairColorText(): WoWAPI.FontString | null { return hairColorText; }
export function getFacialHairText(): WoWAPI.FontString | null { return facialHairText; }

// Search results UI elements
let resultsScrollFrame: WoWAPI.ScrollFrame | null = null;
let resultsScrollChild: WoWAPI.Frame | null = null;
let resultRows: WoWAPI.Frame[] = [];

// Getters for search results UI elements
export function getResultsScrollChild(): WoWAPI.Frame | null { return resultsScrollChild; }
export function getResultRows(): WoWAPI.Frame[] { return resultRows; }

// Equipped items UI elements
let equippedScrollFrame: WoWAPI.ScrollFrame | null = null;
let equippedScrollChild: WoWAPI.Frame | null = null;
let equippedRows: WoWAPI.Frame[] = [];

// Getters for equipped items UI elements
export function getEquippedScrollChild(): WoWAPI.Frame | null { return equippedScrollChild; }
export function getEquippedRows(): WoWAPI.Frame[] { return equippedRows; }

// Saved outfits UI elements
let savedOutfitsToggleBtn: WoWAPI.Button | null = null;
let savedOutfitsContainer: WoWAPI.Frame | null = null;
let savedOutfitsScrollFrame: WoWAPI.ScrollFrame | null = null;
let savedOutfitsScrollChild: WoWAPI.Frame | null = null;
let savedOutfitsRows: WoWAPI.Frame[] = [];

// Getters for saved outfits UI elements
export function getSavedOutfitsToggleBtn(): WoWAPI.Button | null { return savedOutfitsToggleBtn; }
export function getSavedOutfitsContainer(): WoWAPI.Frame | null { return savedOutfitsContainer; }
export function getSavedOutfitsScrollChild(): WoWAPI.Frame | null { return savedOutfitsScrollChild; }
export function getSavedOutfitsRows(): WoWAPI.Frame[] { return savedOutfitsRows; }

// Setter functions
export function setMainFrame(frame: WoWAPI.Frame) {
    mainFrame = frame;
}

export function setRaceText(text: WoWAPI.FontString) {
    raceText = text;
}

export function setGenderText(text: WoWAPI.FontString) {
    genderText = text;
}

export function setSkinText(text: WoWAPI.FontString) {
    skinText = text;
}

export function setFaceText(text: WoWAPI.FontString) {
    faceText = text;
}

export function setHairText(text: WoWAPI.FontString) {
    hairText = text;
}

export function setHairColorText(text: WoWAPI.FontString) {
    hairColorText = text;
}

export function setFacialHairText(text: WoWAPI.FontString) {
    facialHairText = text;
}

export function setResultsScrollFrame(frame: WoWAPI.ScrollFrame, child: WoWAPI.Frame) {
    resultsScrollFrame = frame;
    resultsScrollChild = child;
}

export function setEquippedScrollFrame(frame: WoWAPI.ScrollFrame, child: WoWAPI.Frame) {
    equippedScrollFrame = frame;
    equippedScrollChild = child;
}

export function clearEquippedRows() {
    equippedRows = [];
}

export function addEquippedRow(row: WoWAPI.Frame) {
    equippedRows.push(row);
}

export function clearResultRows() {
    resultRows = [];
}

export function addResultRow(row: WoWAPI.Frame) {
    resultRows.push(row);
}

export function setSavedOutfitsToggleBtn(btn: WoWAPI.Button) {
    savedOutfitsToggleBtn = btn;
}

export function setSavedOutfitsContainer(container: WoWAPI.Frame) {
    savedOutfitsContainer = container;
}

export function setSavedOutfitsScrollFrame(frame: WoWAPI.ScrollFrame, child: WoWAPI.Frame) {
    savedOutfitsScrollFrame = frame;
    savedOutfitsScrollChild = child;
}

export function clearSavedOutfitsRows() {
    savedOutfitsRows = [];
}

export function addSavedOutfitsRow(row: WoWAPI.Frame) {
    savedOutfitsRows.push(row);
}

