// LiveKit Controller for Move By Practice
// Handles server-side LiveKit operations for live classes

import jwt from 'jsonwebtoken';
import {
  AccessToken,
  RoomServiceClient,
  ParticipantInfo,
  ParticipantPermission,
} from 'livekit-server-sdk';

export type ClassMetadata = {
  instructor_id: string;
  class_id: string;
  chat_enabled: boolean;
  qa_enabled: boolean;
  donations_enabled: boolean;
};

export type ParticipantMetadata = {
  user_id: string;
  username: string;
  avatar_url?: string;
  is_instructor: boolean;
  hand_raised: boolean;
};

export type Session = {
  user_id: string;
  class_id: string;
  room_name: string;
};

export type ConnectionDetails = {
  token: string;
  ws_url: string;
};

export type CreateClassParams = {
  class_id: string;
  instructor_id: string;
  room_name?: string;
  metadata: ClassMetadata;
};

export type CreateClassResponse = {
  room_name: string;
  auth_token: string;
  connection_details: ConnectionDetails;
};

export type JoinClassParams = {
  room_name: string;
  user_id: string;
  username: string;
  avatar_url?: string;
};

export type JoinClassResponse = {
  auth_token: string;
  connection_details: ConnectionDetails;
};

export function getSessionFromReq(req: Request): Session {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    throw new Error('No authorization header found');
  }
  const verified = jwt.verify(token, process.env.LIVEKIT_API_SECRET!);
  if (!verified) {
    throw new Error('Invalid token');
  }
  const decoded = jwt.decode(token) as Session;
  return decoded;
}

export class LiveKitController {
  private _roomService: RoomServiceClient | null = null;

  private get roomService(): RoomServiceClient {
    if (!this._roomService) {
      const url = process.env.LIVEKIT_URL;
      if (!url) throw new Error('LIVEKIT_URL is not configured');
      const httpUrl = url.replace('wss://', 'https://').replace('ws://', 'http://');
      this._roomService = new RoomServiceClient(
        httpUrl,
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!
      );
    }
    return this._roomService;
  }

  /**
   * Create a new LiveKit room for a class
   */
  async createClass({
    metadata,
    room_name,
    class_id,
    instructor_id,
  }: CreateClassParams): Promise<CreateClassResponse> {
    if (!room_name) {
      room_name = this.generateRoomName(class_id);
    }

    // Create LiveKit room
    await this.roomService.createRoom({
      name: room_name,
      metadata: JSON.stringify(metadata),
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 100,
    });

    // Create instructor access token with full permissions
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: instructor_id,
        metadata: JSON.stringify({
          user_id: instructor_id,
          is_instructor: true,
        } as Partial<ParticipantMetadata>),
      }
    );

    at.addGrant({
      room: room_name,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    });

    const authToken = this.createAuthToken(room_name, instructor_id, class_id);

    return {
      room_name,
      auth_token: authToken,
      connection_details: {
        ws_url: process.env.LIVEKIT_URL!,
        token: await at.toJwt(),
      },
    };
  }

  /**
   * Generate access token for a student joining a class
   */
  async joinClass({
    user_id,
    username,
    room_name,
    avatar_url,
  }: JoinClassParams): Promise<JoinClassResponse> {
    // Check if room exists
    try {
      await this.roomService.listRooms([room_name]);
    } catch (error) {
      throw new Error('Class room does not exist');
    }

    // Check for existing participant with same identity
    let exists = false;
    try {
      await this.roomService.getParticipant(room_name, user_id);
      exists = true;
    } catch {
      // Participant doesn't exist, which is fine
    }

    if (exists) {
      throw new Error('You are already in this class');
    }

    // Create student access token with limited permissions
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: user_id,
        metadata: JSON.stringify({
          user_id,
          username,
          avatar_url,
          is_instructor: false,
          hand_raised: false,
        } as ParticipantMetadata),
      }
    );

    at.addGrant({
      room: room_name,
      roomJoin: true,
      canPublish: false, // Students can't publish by default
      canSubscribe: true,
      canPublishData: true, // Allow chat messages
      canUpdateOwnMetadata: true,
    });

    const rooms = await this.roomService.listRooms([room_name]);
    const room = rooms[0];
    const classMetadata = JSON.parse(room.metadata) as ClassMetadata;

    const authToken = this.createAuthToken(
      room_name,
      user_id,
      classMetadata.class_id
    );

    return {
      auth_token: authToken,
      connection_details: {
        ws_url: process.env.LIVEKIT_URL!,
        token: await at.toJwt(),
      },
    };
  }

  /**
   * Generate access token for an instructor joining their own class
   */
  async joinClassAsInstructor({
    user_id,
    username,
    room_name,
    avatar_url,
  }: JoinClassParams): Promise<JoinClassResponse> {
    // Check if room exists
    try {
      await this.roomService.listRooms([room_name]);
    } catch (error) {
      throw new Error('Class room does not exist');
    }

    // Create instructor access token with full permissions
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: user_id,
        metadata: JSON.stringify({
          user_id,
          username,
          avatar_url,
          is_instructor: true,
          hand_raised: false,
        } as ParticipantMetadata),
      }
    );

    at.addGrant({
      room: room_name,
      roomJoin: true,
      canPublish: true, // Instructors can publish
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    });

    const rooms = await this.roomService.listRooms([room_name]);
    const room = rooms[0];
    const classMetadata = JSON.parse(room.metadata) as ClassMetadata;

    const authToken = this.createAuthToken(
      room_name,
      user_id,
      classMetadata.class_id
    );

    return {
      auth_token: authToken,
      connection_details: {
        ws_url: process.env.LIVEKIT_URL!,
        token: await at.toJwt(),
      },
    };
  }

  /**
   * End a class and delete the LiveKit room
   */
  async endClass(session: Session) {
    const rooms = await this.roomService.listRooms([session.room_name]);

    if (rooms.length === 0) {
      throw new Error('Class room does not exist');
    }

    const room = rooms[0];
    const metadata = JSON.parse(room.metadata) as ClassMetadata;

    // Only instructor can end the class
    if (metadata.instructor_id !== session.user_id) {
      throw new Error('Only the instructor can end the class');
    }

    await this.roomService.deleteRoom(session.room_name);
  }

  /**
   * Invite a student to speak (give them publish permissions)
   */
  async inviteToSpeak(session: Session, { student_id }: { student_id: string }) {
    const rooms = await this.roomService.listRooms([session.room_name]);

    if (rooms.length === 0) {
      throw new Error('Class room does not exist');
    }

    const room = rooms[0];
    const metadata = JSON.parse(room.metadata) as ClassMetadata;

    // Only instructor can invite to speak
    if (metadata.instructor_id !== session.user_id) {
      throw new Error('Only the instructor can invite students to speak');
    }

    const participant = await this.roomService.getParticipant(
      session.room_name,
      student_id
    );

    const permission = participant.permission || ({} as ParticipantPermission);
    permission.canPublish = true;

    await this.roomService.updateParticipant(
      session.room_name,
      student_id,
      participant.metadata,
      permission
    );
  }

  /**
   * Remove speaking permission from a student
   */
  async removeFromSpeaking(
    session: Session,
    { student_id }: { student_id: string }
  ) {
    const rooms = await this.roomService.listRooms([session.room_name]);

    if (rooms.length === 0) {
      throw new Error('Class room does not exist');
    }

    const room = rooms[0];
    const metadata = JSON.parse(room.metadata) as ClassMetadata;

    // Only instructor can remove speaking permission
    if (metadata.instructor_id !== session.user_id) {
      throw new Error('Only the instructor can manage speaking permissions');
    }

    const participant = await this.roomService.getParticipant(
      session.room_name,
      student_id
    );

    const permission = participant.permission || ({} as ParticipantPermission);
    permission.canPublish = false;

    await this.roomService.updateParticipant(
      session.room_name,
      student_id,
      participant.metadata,
      permission
    );
  }

  /**
   * Raise hand (update participant metadata)
   */
  async raiseHand(session: Session) {
    const participant = await this.roomService.getParticipant(
      session.room_name,
      session.user_id
    );

    const participantMetadata = this.getOrCreateParticipantMetadata(participant);
    participantMetadata.hand_raised = true;

    await this.roomService.updateParticipant(
      session.room_name,
      session.user_id,
      JSON.stringify(participantMetadata),
      participant.permission
    );
  }

  /**
   * Lower hand (update participant metadata)
   */
  async lowerHand(session: Session) {
    const participant = await this.roomService.getParticipant(
      session.room_name,
      session.user_id
    );

    const participantMetadata = this.getOrCreateParticipantMetadata(participant);
    participantMetadata.hand_raised = false;

    await this.roomService.updateParticipant(
      session.room_name,
      session.user_id,
      JSON.stringify(participantMetadata),
      participant.permission
    );
  }

  /**
   * Update participant permissions (mute/unmute)
   */
  async updateParticipantPermissions(
    session: Session,
    { student_id, canPublish }: { student_id: string; canPublish: boolean }
  ) {
    const rooms = await this.roomService.listRooms([session.room_name]);
    if (rooms.length === 0) {
      throw new Error('Class room does not exist');
    }

    const room = rooms[0];
    const metadata = JSON.parse(room.metadata) as ClassMetadata;

    if (metadata.instructor_id !== session.user_id) {
      throw new Error('Only the instructor can manage participant permissions');
    }

    const participant = await this.roomService.getParticipant(
      session.room_name,
      student_id
    );

    const permission = participant.permission || ({} as ParticipantPermission);
    permission.canPublish = canPublish;

    await this.roomService.updateParticipant(
      session.room_name,
      student_id,
      participant.metadata,
      permission
    );
  }

  /**
   * Get or create participant metadata with defaults
   */
  getOrCreateParticipantMetadata(
    participant: ParticipantInfo
  ): ParticipantMetadata {
    if (participant.metadata) {
      return JSON.parse(participant.metadata) as ParticipantMetadata;
    }
    return {
      user_id: participant.identity,
      username: participant.name || participant.identity,
      is_instructor: false,
      hand_raised: false,
    };
  }

  /**
   * Create auth token for API authentication
   */
  createAuthToken(room_name: string, user_id: string, class_id: string) {
    return jwt.sign(
      JSON.stringify({ room_name, user_id, class_id }),
      process.env.LIVEKIT_API_SECRET!
    );
  }

  /**
   * Generate unique room name from class ID
   */
  private generateRoomName(class_id: string): string {
    return `class-${class_id}`;
  }
}
