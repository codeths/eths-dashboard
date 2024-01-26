import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: any, user: any) => void): any {
    console.log(new Date(), 'session serialized');
    done(null, user);
  }
  deserializeUser(
    payload: any,
    done: (err: any, payload: string) => void,
  ): any {
    console.log(new Date(), 'session deserialized');
    done(null, payload);
  }
}
