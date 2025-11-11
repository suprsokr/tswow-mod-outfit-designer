// Global state management for outfit designer
import { OutfitState } from "./types";

// Map to track spawned creatures per player (player guid low -> array of creatures)
export const playerCreatures = new Map<number, TSCreature[]>();

// Map to track outfit states per creature (creature guid low -> outfit state)
// This allows each creature to have independent outfit state
export const creatureOutfits = new Map<number, OutfitState>();

