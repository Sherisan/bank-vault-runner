import { createVaultScene } from './scenes/vault';

export const GAME = {
  id: 'vault',
  title: 'Bank Vault Runner',
  blurb: 'Hack the vault, grab the gold, then outrun booby traps, guards and the police. Cash out before they catch you.',
  waitLabel: 'Hacking the vault',
  crashVerb: 'Busted',
  runningLabel: 'Loot multiplier',
  // where the chase moves as the multiplier climbs (matches the scene's zones)
  milestones: [
    { at: 1.6, name: 'Grand Hall' },
    { at: 3.2, name: 'City Streets' },
    { at: 8, name: 'Rooftops' },
  ],
  scene: createVaultScene,
};
