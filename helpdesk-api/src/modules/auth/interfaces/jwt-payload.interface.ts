import { Role } from '../../../common/enums/role.enum';

/** Decoded shape of a signed access-token payload. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

/** The object attached to `request.user` after JWT validation. */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}
