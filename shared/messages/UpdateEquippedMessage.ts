import { MessageRegistry } from "../MessageRegistry";

export const UPDATE_EQUIPPED_MESSAGE_ID = MessageRegistry.UPDATE_EQUIPPED_MESSAGE_ID;

export class UpdateEquippedMessage {
    slot: string = "";
    itemName: string = "";
    itemEntry: uint32 = 0;

    constructor(slot: string, itemName: string, itemEntry: uint32) {
        this.slot = slot;
        this.itemName = itemName;
        this.itemEntry = itemEntry;
    }

    read(read: TSPacketRead): void {
        this.slot = read.ReadString();
        this.itemName = read.ReadString();
        this.itemEntry = read.ReadUInt32();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(UPDATE_EQUIPPED_MESSAGE_ID, 0);
        packet.WriteString(this.slot);
        packet.WriteString(this.itemName);
        packet.WriteUInt32(this.itemEntry);
        return packet;
    }
}

