import { MessageRegistry } from "../MessageRegistry";

export const UNEQUIP_ITEM_MESSAGE_ID = MessageRegistry.UNEQUIP_ITEM_MESSAGE_ID;

export class UnequipItemMessage {
    slot: string = "";

    constructor(slot: string) {
        this.slot = slot;
    }

    read(read: TSPacketRead): void {
        this.slot = read.ReadString();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(UNEQUIP_ITEM_MESSAGE_ID, 0);
        packet.WriteString(this.slot);
        return packet;
    }
}

