import { Module } from '@nestjs/common';
import { GridGateway } from './gateways/grid/grid.gateway';
import { GridService } from './services/grid/grid.service';
import { UserModule } from 'src/user/user.module';
import { GridEntity } from './entities/grid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [GridGateway, GridService],
  imports: [
    TypeOrmModule.forFeature([GridEntity]),
    UserModule,
  ]
})
export class GridModule {}
