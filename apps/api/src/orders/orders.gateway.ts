import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

/**
 * OrdersGateway — real-time WebSocket gateway for order events.
 *
 * Shares the HTTP port (no port argument) for Railway single-port deployment.
 *
 * Two-tier auth:
 *  - Token provided: verified with JwtService; set socket.data.isAuthenticated = true
 *  - No token: allowed through with socket.data.isAuthenticated = false (anonymous customer)
 *
 * Rooms:
 *  - venue:{venueId}  — authenticated owners only (ownership verified)
 *  - order:{orderId}  — anyone (anonymous customers track their own order)
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:7000',
    credentials: true,
  },
})
export class OrdersGateway implements OnGatewayInit {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * afterInit — wire up two-tier auth middleware BEFORE any connections are accepted.
   * Socket.IO Guards don't block initial connections; middleware is the correct pattern.
   */
  afterInit(server: Server) {
    server.use((socket: Socket, next: (err?: Error) => void) => {
      const token = socket.handshake?.auth?.token as string | undefined;

      if (!token) {
        // Anonymous connection allowed — customer tracking their order
        socket.data.isAuthenticated = false;
        return next();
      }

      try {
        const payload = this.jwtService.verify<{ sub: string }>(token);
        socket.data.userId = payload.sub;
        socket.data.isAuthenticated = true;
        return next();
      } catch {
        return next(new Error('Unauthorized'));
      }
    });

    this.logger.log('OrdersGateway initialized with two-tier auth middleware');
  }

  /**
   * join:venue — authenticated venue owners join their venue room.
   * Verifies:
   *  1. Socket is authenticated
   *  2. The authenticated user owns the requested venue
   */
  @SubscribeMessage('join:venue')
  async handleJoinVenue(
    @MessageBody() data: { venueId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.isAuthenticated) {
      return { error: 'Forbidden' };
    }

    const venue = await this.prisma.venue.findUnique({
      where: { id: data.venueId },
      select: { ownerId: true },
    });

    if (!venue || venue.ownerId !== client.data.userId) {
      return { error: 'Forbidden' };
    }

    await client.join(`venue:${data.venueId}`);
    this.logger.log(
      `Client ${client.id} joined venue room venue:${data.venueId}`,
    );
    return { joined: `venue:${data.venueId}` };
  }

  /**
   * join:order — anyone can join an order room to track status.
   * No auth check — anonymous customers receive their own order updates.
   */
  @SubscribeMessage('join:order')
  async handleJoinOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`order:${data.orderId}`);
    this.logger.log(
      `Client ${client.id} joined order room order:${data.orderId}`,
    );
    return { joined: `order:${data.orderId}` };
  }

  /**
   * Emit a new order event to the venue room.
   * Called by OrdersService when a PAY_AT_COUNTER order is created
   * or when a Stripe payment_intent.succeeded webhook is processed.
   */
  emitNewOrder(venueId: string, order: object) {
    this.server.to(`venue:${venueId}`).emit('order:new', order);
  }

  /**
   * Emit an order updated event to BOTH the venue room AND the order-specific room.
   * Called by OrdersService.updateStatus() after persisting status change.
   */
  emitOrderUpdated(venueId: string, orderId: string, update: object) {
    this.server.to(`venue:${venueId}`).emit('order:updated', update);
    this.server.to(`order:${orderId}`).emit('order:updated', update);
  }
}
