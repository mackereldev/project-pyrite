export default class Client {
    clientId: string;
    connectionId: string;

    constructor(clientId: string, connectionId: string) {
        this.clientId = clientId;
        this.connectionId = connectionId;
    }

    similar = (other: Client) => {
        return this.clientId == other.clientId || this.connectionId == other.connectionId;
    }

    equals = (other: Client) => {
        return this.clientId == other.clientId && this.connectionId == other.connectionId;
    }
}
