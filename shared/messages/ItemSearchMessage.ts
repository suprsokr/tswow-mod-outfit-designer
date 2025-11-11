import { MessageRegistry } from "../MessageRegistry";

export const ITEM_SEARCH_MESSAGE_ID = MessageRegistry.ITEM_SEARCH_MESSAGE_ID;

export class ItemSearchMessage {
    searchText: string = "";

    constructor(searchText: string) {
        this.searchText = searchText;
    }

    read(read: TSPacketRead): void {
        this.searchText = read.ReadString();
    }

    write(): TSPacketWrite {
        let packet = CreateCustomPacket(ITEM_SEARCH_MESSAGE_ID, 0);
        packet.WriteString(this.searchText);
        return packet;
    }
}

