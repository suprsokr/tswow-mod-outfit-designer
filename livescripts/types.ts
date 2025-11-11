// Type definitions for outfit designer

// Class to store outfit copy in player memory
export class OutfitCopyData extends TSClass {
    outfit: TSOutfit | null = null;
    race: number = 1;
    gender: number = 0;
    skin: number = 0;
    face: number = 0;
    hair: number = 0;
    haircolor: number = 0;
    facialhair: number = 0;
    items: {[key: number]: {entry: number, name: string}} = {};
}

// Outfit state structure
export interface OutfitState {
    race: number;
    gender: number;
    skin: number;
    face: number;
    hair: number;
    haircolor: number;
    facialhair: number;
    items: {[key: number]: {entry: number, name: string}};
}

// Item data structure
export interface ItemData {
    entry: number;
    name: string;
}

