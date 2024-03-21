import {atom} from "jotai";

// group modes in prefixes to benefit from switch optimizations
export type AppMode = 'appDefault' | 'appEdit' | 'taskNew' | 'taskEdit'

export const appModeAtom = atom<AppMode>('appDefault')
export const currentEditTaskAtom = atom<string | null>(null)