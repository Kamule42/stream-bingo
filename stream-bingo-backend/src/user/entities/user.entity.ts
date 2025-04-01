import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('bingo.users')
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column('discord_id')
  @Index()
  discordId: string;

  @Column('discord_username')
  discordUsername: string;

  @Column('discord_avatar')
  discordAvatar: string;
}
