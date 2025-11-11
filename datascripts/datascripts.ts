import { std } from "wow/wotlk";

const outfit = std.CreatureOutfits.create();

// These values don't matter since the addon will set the outfit values.
// As a nod to history, these values come from https://github.com/Rochet2/TrinityCore/blob/dressnpcs_3.3.5/src/server/scripts/Custom/DressNPCs/Example.sql
outfit.Race.set(11); 
outfit.Gender.set(1);
outfit.Skin.set(14);
outfit.Face.set(4);
outfit.Hair.set(10);
outfit.HairColor.set(3);
outfit.FacialHair.set(5);

// Set equipped items (negative values in SQL = display IDs)
outfit.Head.set(-31286);
outfit.Shoulders.set(-43617);
outfit.Shirt.set(0);
outfit.Chest.set(-26267);
outfit.Waist.set(-26270);
outfit.Legs.set(-26272);
outfit.Feet.set(0);
outfit.Wrists.set(0);
outfit.Hands.set(-43698);
outfit.Back.set(0);
outfit.Tabard.set(0);

const previewCreature = std.CreatureTemplates
    .create('outfit-designer', 'outfit-preview-dummy', 6)
    .Name.enGB.set('Outfit Preview Dummy')
    .FactionTemplate.set(35)
    .UnitFlags.NON_ATTACKABLE.set(1)
    .Tags.add('outfit-designer', 'outfit-preview-creature');

previewCreature.Models.clearAll();
previewCreature.Models.addIds(outfit.ID);
