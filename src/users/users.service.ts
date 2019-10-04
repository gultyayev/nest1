import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User')
        private readonly userModel: Model<User>,
    ) {}

    async create(createUserDto: UserDto): Promise<{ id: string }> {
        const createdUser = new this.userModel(createUserDto);
        const instance = await createdUser.save();

        return { id: instance.id };
    }

    async findAll(): Promise<User[]> {
        return await this.userModel
            .find()
            .select('-roles')
            .exec();
    }

    async findOne(id: string, withRoles = false): Promise<User> {
        try {
            const query = this.userModel.findById(id);

            if (withRoles) {
                query.populate('roles');
            } else {
                query.select('-roles');
            }

            return await query.exec();
        } catch (err) {
            if (err instanceof mongoose.Error.CastError) {
                throw new NotFoundException();
            }

            throw err;
        }
    }

    async delete(id: string) {
        return await this.userModel.findByIdAndDelete(id).exec();
    }
}
