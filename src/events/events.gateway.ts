import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect, OnGatewayConnection } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: true
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private messages = [];

    handleConnection(@ConnectedSocket() client: Socket) {
        client.data.user = client.handshake.query.user;
        this.broadcastUsers();
    }


    @SubscribeMessage('messages')
    handleUsers(@MessageBody() message: string,
        @ConnectedSocket() client: Socket,) {
        const user = client.handshake.query.user;
        this.messages.push({ user, message })
        this.broadcastMessages();

    }

    handleDisconnect(@ConnectedSocket() client: any,) {
        this.broadcastUsers();
    }


    private async broadcastUsers() {
        const userNames = (await this.server.fetchSockets()).map((client: any) => client.data.user)
        this.server.emit('users', userNames);
    }

    private broadcastMessages() {
        this.server.emit('messages', this.messages);
    }


}

