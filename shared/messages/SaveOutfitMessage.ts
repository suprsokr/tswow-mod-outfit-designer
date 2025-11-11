// Message to request saving current outfit to database
import { MessageRegistry } from "../MessageRegistry";

export const SAVE_OUTFIT_MESSAGE_ID = MessageRegistry.SAVE_OUTFIT_MESSAGE_ID;

export class SaveOutfitMessage {
    dummy: uint32 = 1;

    constructor() {
        this.dummy = 1;
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(SAVE_OUTFIT_MESSAGE_ID, 4);
        packet.WriteUInt32(this.dummy);
        return packet;
    }

    read(packet: TSPacketRead): void {
        this.dummy = packet.ReadUInt32();
    }
}

