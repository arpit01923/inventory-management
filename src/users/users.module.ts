import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './user.entity';
import { AuthService } from './jwt.service';
import { MailService } from './mail.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [UsersController],
    providers: [UsersService, AuthService, MailService],
    exports: [UsersService],
})
export class UsersModule { }
