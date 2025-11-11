import { MessageRegistry } from "../MessageRegistry";

export const RESET_OUTFIT_MESSAGE_ID = MessageRegistry.RESET_OUTFIT_MESSAGE_ID;

export class ResetOutfitMessage {
    dummy: uint32 = 0;

    constructor() {
        this.dummy = 1;
    }

    read(read: TSPacketRead): void {
        this.dummy = read.ReadUInt32();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(RESET_OUTFIT_MESSAGE_ID, 0);
        packet.WriteUInt32(this.dummy);
        return packet;
    }
}

