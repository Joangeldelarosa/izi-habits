import { IUser } from '../shared/interfaces/user.interface';

export class SetUser {
  static readonly type = '[User] Set User';
  constructor(public user: IUser) {}
}

export class UpdateUser {
  static readonly type = '[User] Update User';
  constructor(public user: Partial<IUser>) {}
}

export class CompleteOnboarding {
  static readonly type = '[User] Complete Onboarding';
  constructor() {}
}

export class ClearUser {
  static readonly type = '[User] Clear User';
  constructor() {}
}
