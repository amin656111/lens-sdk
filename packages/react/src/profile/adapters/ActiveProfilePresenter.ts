import { makeVar, useReactiveVar } from '@apollo/client';
import {
  IActiveProfilePresenter,
  ProfileIdentifier,
} from '@lens-protocol/domain/use-cases/profile';

export const activeProfileIdentifierVar = makeVar<ProfileIdentifier | null>(null);

export class ActiveProfilePresenter implements IActiveProfilePresenter {
  async presentActiveProfile(profileIdentifier: ProfileIdentifier | null): Promise<void> {
    activeProfileIdentifierVar(profileIdentifier);
  }
}

export function useActiveProfileIdentifierVar() {
  return useReactiveVar(activeProfileIdentifierVar);
}
