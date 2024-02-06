import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

enum UserRoles {
  None = 0b00,
  View = 0b01,
  Admin = 0b10,
}
export type UserRoleName = keyof typeof UserRoles;

@Schema()
export class WebUser {
  @Prop({
    required: true,
    default: UserRoles.None,
    get: (roles: number) => {
      return Object.keys(UserRoles).filter(
        (role: UserRoleName) =>
          role !== 'None' && WebUser.hasRole({ roles }, role),
      );
    },
  })
  roles: number;

  @Prop({ required: true, index: { unique: true } })
  googleID: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  photo?: string;

  static toAPIResponse(user: WebUserDocument) {
    return user.toObject({ versionKey: false, getters: true });
  }

  static hasRole(user: { roles: number }, role: UserRoleName) {
    return (user.roles & UserRoles[role]) === UserRoles[role];
  }
}

export const WebUserSchema = SchemaFactory.createForClass(WebUser);
export type WebUserDocument = HydratedDocument<WebUser>;
