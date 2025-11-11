// Global state management for Outfit Designer addon

// Outfit appearance state
let currentRace = 1;
let currentGender = 0;
let currentSkin = 0;
let currentFace = 0;
let currentHair = 0;
let currentHairColor = 0;
let currentFacialHair = 0;

// Equipped items state
let equippedItems: {[key: string]: {name: string, id: number}} = {};

// Search results state
let searchResults: any[] = [];

// Saved outfits state
let savedOutfits: Array<{id: number, race: number, gender: number, savedToDB: boolean}> = [];
let savedOutfitsVisible: boolean = false;

// State getter functions (for live access)
export function getEquippedItems() {
    return equippedItems;
}
export function getRace() {
    return currentRace;
}

export function getGender() {
    return currentGender;
}

export function getSkin() {
    return currentSkin;
}

export function getFace() {
    return currentFace;
}

export function getHair() {
    return currentHair;
}

export function getHairColor() {
    return currentHairColor;
}

export function getFacialHair() {
    return currentFacialHair;
}

// State update functions
export function setRace(race: number) {
    currentRace = race;
}

export function setGender(gender: number) {
    currentGender = gender;
}

export function setSkin(skin: number) {
    currentSkin = skin;
}

export function setFace(face: number) {
    currentFace = face;
}

export function setHair(hair: number) {
    currentHair = hair;
}

export function setHairColor(hairColor: number) {
    currentHairColor = hairColor;
}

export function setFacialHair(facialHair: number) {
    currentFacialHair = facialHair;
}

export function setEquippedItems(items: {[key: string]: {name: string, id: number}}) {
    equippedItems = items;
}

export function addEquippedItem(slot: string, name: string, id: number) {
    equippedItems[slot] = {name, id};
}

export function removeEquippedItem(slot: string) {
    delete equippedItems[slot];
}

export function clearEquippedItems() {
    equippedItems = {};
}

export function setSearchResults(results: any[]) {
    searchResults = results;
}

export function clearSearchResults() {
    searchResults = [];
}

export function getSavedOutfits() {
    return savedOutfits;
}

export function setSavedOutfits(outfits: Array<{id: number, race: number, gender: number, savedToDB: boolean}>) {
    savedOutfits = outfits;
}

export function getSavedOutfitsVisible() {
    return savedOutfitsVisible;
}

export function setSavedOutfitsVisible(visible: boolean) {
    savedOutfitsVisible = visible;
}

