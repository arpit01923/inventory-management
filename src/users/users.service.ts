import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.entity';
import { randomBytes } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });

        return createdUser.save();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email });
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    async generateResetToken(email: string): Promise<string> {
        const user = await this.userModel.findOne({ email });
        if (!user) throw new Error('User not found');

        const token = randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        return token;
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.userModel.findOne({ resetToken: token });
        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
            throw new Error('Token is invalid or has expired');
        }

        user.password = await this.hashPassword(newPassword);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return { message: 'Password reset successful' };
    }
}
