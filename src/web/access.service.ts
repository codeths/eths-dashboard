import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRoleName, WebUser } from 'src/schemas/WebUser.schema';

@Injectable()
export class AccessService {
  constructor(
    @InjectModel(WebUser.name) private readonly webUserModel: Model<WebUser>,
  ) {}

  async getAllUsers() {
    const users = await this.webUserModel.find({});
    return users.map((user) => WebUser.toAPIResponse(user));
  }

  async setUserRoles(userID: string, roles: UserRoleName[]) {
    const user = await this.webUserModel.findByIdAndUpdate(
      userID,
      {
        roles: WebUser.rolesToBitfield(roles),
      },
      { new: true },
    );
    if (!user) throw new Error();

    return WebUser.toAPIResponse(user);
  }

  async deleteUser(userID: string) {
    await this.webUserModel.findByIdAndDelete(userID);
  }
}
