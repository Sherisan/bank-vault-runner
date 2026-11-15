import { createVaultScene } from './scenes/vault';

export const GAME = {
  id: 'vault',
  title: 'Bank Vault Runner',
  blurb: 'Crack the vault, grab the gold, then outrun booby traps, guards and the police. Cash out before they catch you.',
  waitLabel: 'Cracking the vault',
  crashVerb: 'Busted',
  runningLabel: 'Loot multiplier',
  scene: createVaultScene,
};
