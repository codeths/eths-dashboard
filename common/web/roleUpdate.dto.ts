import { IsArray, IsIn } from 'class-validator';
import { UserRoleName, UserRoles } from 'src/schemas/WebUser.schema';

export class RoleUpdateDto {
  @IsIn(Object.keys(UserRoles).filter((e) => !(parseInt(e) >= 0)), {
    each: true,
  })
  @IsArray()
  roles: UserRoleName[];
}
