import { MessageRegistry } from "../MessageRegistry";

export const EQUIP_ITEM_MESSAGE_ID = MessageRegistry.EQUIP_ITEM_MESSAGE_ID;

export class EquipItemMessage {
    itemEntry: uint32 = 0;
    itemName: string = "";

    constructor(itemEntry: uint32, itemName: string) {
        this.itemEntry = itemEntry;
        this.itemName = itemName;
    }

    read(read: TSPacketRead): void {
        this.itemEntry = read.ReadUInt32();
        this.itemName = read.ReadString();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(EQUIP_ITEM_MESSAGE_ID, 0);
        packet.WriteUInt32(this.itemEntry);
        packet.WriteString(this.itemName);
        return packet;
    }
}

