export default class Client {
    clientId: string;
    connectionId: string;

    constructor(clientId: string, connectionId: string) {
        this.clientId = clientId;
        this.connectionId = connectionId;
    }
}
