import { ProfileAction, ProfileActionType } from './profile.reducer.ts';


export function createProfileState(payload: FormStatePayload): ProfileAction {
  return {type: ProfileActionType.CREATE, payload};
}
