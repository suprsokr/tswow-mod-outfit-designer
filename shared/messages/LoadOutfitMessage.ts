// Message to request loading a saved outfit
import { MessageRegistry } from "../MessageRegistry";

export const LOAD_OUTFIT_MESSAGE_ID = MessageRegistry.LOAD_OUTFIT_MESSAGE_ID;

export class LoadOutfitMessage {
    outfitId: number;

    constructor(outfitId: number) {
        this.outfitId = outfitId;
    }

    write(): TSPacketWrite {
        const packet = CreateCustomPacket(LOAD_OUTFIT_MESSAGE_ID, 4);
        packet.WriteUInt32(this.outfitId);
        return packet;
    }

    read(packet: TSPacketRead): void {
        this.outfitId = packet.ReadUInt32();
    }
}

