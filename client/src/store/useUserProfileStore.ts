import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types/biometrics';

interface UserProfileState {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

const DEFAULT_USER_PROFILE: UserProfile = {
  heightCm: null,
  weightKg: null,
  birthDate: '',
  biologicalSex: 'male',
  activityLevel: 'moderate',
};

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_USER_PROFILE,
      setProfile: (updated) =>
        set((state) => ({
          profile: { ...state.profile, ...updated },
        })),
      resetProfile: () => set({ profile: DEFAULT_USER_PROFILE }),
    }),
    {
      name: 'fitai-user-profile-storage',
    }
  )
);
