export interface IUser {
  name: string;
  email: string;
  avatar?: string | null;
  greeting?: string;
  hasCompletedOnboarding: boolean;
}

export interface IUserStateModel {
  user: IUser | null;
}
