import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { IUser, IUserStateModel } from '../shared/interfaces/user.interface';
import {
  SetUser,
  UpdateUser,
  CompleteOnboarding,
  ClearUser,
} from './user.actions';

const defaults: IUserStateModel = {
  user: null,
};

@State<IUserStateModel>({
  name: 'user',
  defaults,
})
@Injectable()
export class UserState {
  @Selector()
  static user(state: IUserStateModel): IUser | null {
    return state.user;
  }

  @Selector()
  static hasCompletedOnboarding(state: IUserStateModel): boolean {
    return state.user?.hasCompletedOnboarding || false;
  }

  @Action(SetUser)
  setUser(ctx: StateContext<IUserStateModel>, action: SetUser) {
    ctx.patchState({
      user: action.user,
    });
  }

  @Action(UpdateUser)
  updateUser(ctx: StateContext<IUserStateModel>, action: UpdateUser) {
    const state = ctx.getState();
    if (state.user) {
      ctx.patchState({
        user: { ...state.user, ...action.user },
      });
    }
  }

  @Action(CompleteOnboarding)
  completeOnboarding(ctx: StateContext<IUserStateModel>) {
    const state = ctx.getState();
    if (state.user) {
      ctx.patchState({
        user: { ...state.user, hasCompletedOnboarding: true },
      });
    }
  }

  @Action(ClearUser)
  clearUser(ctx: StateContext<IUserStateModel>) {
    ctx.setState(defaults);
  }
}
