import { Reflector } from '@nestjs/core';
import { UserRoleName } from 'src/schemas/WebUser.schema';

/**
 * Requires the authenticated user to have every listed role
 */
export const Roles = Reflector.createDecorator<UserRoleName[]>();
