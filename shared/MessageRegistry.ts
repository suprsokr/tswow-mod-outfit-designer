/**
 * Central registry for all custom packet message IDs
 * All IDs use the 9xx format to avoid conflicts
 */
export class MessageRegistry {
    // Base ID for all unit-creator messages
    private static BASE_ID = 900;
    private static currentId = MessageRegistry.BASE_ID;

    // Message ID registry
    static readonly SPAWN_MESSAGE_ID = MessageRegistry.register();                    // 900
    static readonly DESPAWN_MESSAGE_ID = MessageRegistry.register();                  // 901
    static readonly RESERVED_1 = MessageRegistry.register();                          // 902 - Reserved
    static readonly SET_CUSTOM_OUTFIT_MESSAGE_ID = MessageRegistry.register();        // 903
    static readonly ITEM_SEARCH_MESSAGE_ID = MessageRegistry.register();              // 904
    static readonly ITEM_SEARCH_RESULTS_MESSAGE_ID = MessageRegistry.register();      // 905
    static readonly EQUIP_ITEM_MESSAGE_ID = MessageRegistry.register();               // 906
    static readonly UPDATE_EQUIPPED_MESSAGE_ID = MessageRegistry.register();          // 907
    static readonly RESET_OUTFIT_MESSAGE_ID = MessageRegistry.register();             // 908
    static readonly COPY_OUTFIT_MESSAGE_ID = MessageRegistry.register();              // 909
    static readonly APPLY_COPY_OUTFIT_MESSAGE_ID = MessageRegistry.register();        // 910
    static readonly OUTFIT_COPIED_MESSAGE_ID = MessageRegistry.register();            // 911
    static readonly UNEQUIP_ITEM_MESSAGE_ID = MessageRegistry.register();             // 912
    static readonly SAVE_OUTFIT_MESSAGE_ID = MessageRegistry.register();              // 913
    static readonly LOAD_OUTFIT_LIST_MESSAGE_ID = MessageRegistry.register();         // 914
    static readonly OUTFIT_LIST_MESSAGE_ID = MessageRegistry.register();              // 915
    static readonly LOAD_OUTFIT_MESSAGE_ID = MessageRegistry.register();              // 916
    static readonly DELETE_OUTFIT_MESSAGE_ID = MessageRegistry.register();            // 917
    static readonly EXPORT_OUTFIT_MESSAGE_ID = MessageRegistry.register();            // 918
    static readonly EXPORTED_CODE_MESSAGE_ID = MessageRegistry.register();            // 919

    private static register(): number {
        return MessageRegistry.currentId++;
    }

    /**
     * Get all registered message IDs and their current assignments
     */
    static getAllMessageIds(): Record<string, number> {
        return {
            SPAWN_MESSAGE_ID: MessageRegistry.SPAWN_MESSAGE_ID,
            DESPAWN_MESSAGE_ID: MessageRegistry.DESPAWN_MESSAGE_ID,
            SET_CUSTOM_OUTFIT_MESSAGE_ID: MessageRegistry.SET_CUSTOM_OUTFIT_MESSAGE_ID,
            ITEM_SEARCH_MESSAGE_ID: MessageRegistry.ITEM_SEARCH_MESSAGE_ID,
            ITEM_SEARCH_RESULTS_MESSAGE_ID: MessageRegistry.ITEM_SEARCH_RESULTS_MESSAGE_ID,
            EQUIP_ITEM_MESSAGE_ID: MessageRegistry.EQUIP_ITEM_MESSAGE_ID,
            UPDATE_EQUIPPED_MESSAGE_ID: MessageRegistry.UPDATE_EQUIPPED_MESSAGE_ID,
            RESET_OUTFIT_MESSAGE_ID: MessageRegistry.RESET_OUTFIT_MESSAGE_ID,
            COPY_OUTFIT_MESSAGE_ID: MessageRegistry.COPY_OUTFIT_MESSAGE_ID,
            APPLY_COPY_OUTFIT_MESSAGE_ID: MessageRegistry.APPLY_COPY_OUTFIT_MESSAGE_ID,
            OUTFIT_COPIED_MESSAGE_ID: MessageRegistry.OUTFIT_COPIED_MESSAGE_ID,
            UNEQUIP_ITEM_MESSAGE_ID: MessageRegistry.UNEQUIP_ITEM_MESSAGE_ID,
            SAVE_OUTFIT_MESSAGE_ID: MessageRegistry.SAVE_OUTFIT_MESSAGE_ID,
            LOAD_OUTFIT_LIST_MESSAGE_ID: MessageRegistry.LOAD_OUTFIT_LIST_MESSAGE_ID,
            OUTFIT_LIST_MESSAGE_ID: MessageRegistry.OUTFIT_LIST_MESSAGE_ID,
            LOAD_OUTFIT_MESSAGE_ID: MessageRegistry.LOAD_OUTFIT_MESSAGE_ID,
            DELETE_OUTFIT_MESSAGE_ID: MessageRegistry.DELETE_OUTFIT_MESSAGE_ID,
            EXPORT_OUTFIT_MESSAGE_ID: MessageRegistry.EXPORT_OUTFIT_MESSAGE_ID,
            EXPORTED_CODE_MESSAGE_ID: MessageRegistry.EXPORTED_CODE_MESSAGE_ID,
        };
    }

    /**
     * Get the next available ID (for debugging)
     */
    static getNextAvailableId(): number {
        return MessageRegistry.currentId;
    }
}

