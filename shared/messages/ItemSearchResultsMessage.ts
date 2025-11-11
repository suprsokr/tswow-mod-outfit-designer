import { MessageRegistry } from "../MessageRegistry";

export const ITEM_SEARCH_RESULTS_MESSAGE_ID = MessageRegistry.ITEM_SEARCH_RESULTS_MESSAGE_ID;

export class ItemSearchResultsMessage {
    count: uint32 = 0;
    results: Array<{entry: uint32, name: string, invType: uint32, slot: string}> = [];

    constructor(results: Array<{entry: uint32, name: string, invType: uint32, slot: string}>) {
        this.results = results;
        this.count = results.length;
    }

    read(read: TSPacketRead): void {
        this.results = [];
        this.count = read.ReadUInt32();
        for (let i = 0; i < this.count; i++) {
            this.results.push({
                entry: read.ReadUInt32(),
                name: read.ReadString(),
                invType: read.ReadUInt32(),
                slot: read.ReadString()
            });
        }
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(ITEM_SEARCH_RESULTS_MESSAGE_ID, 0);
        packet.WriteUInt32(this.count);
        for (let i = 0; i < this.count; i++) {
            packet.WriteUInt32(this.results[i].entry);
            packet.WriteString(this.results[i].name);
            packet.WriteUInt32(this.results[i].invType);
            packet.WriteString(this.results[i].slot);
        }
        return packet;
    }
}

