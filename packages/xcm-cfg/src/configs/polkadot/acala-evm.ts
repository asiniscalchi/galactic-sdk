import { AssetConfig, ChainConfig } from '@galacticcouncil/xcm-core';

import { aca, dai_awh, glmr } from '../../assets';
import { hydration, moonbeam, acala_evm } from '../../chains';
import { BalanceBuilder, ContractBuilder } from '../../builders';

const toHydraDXViaWormhole: AssetConfig[] = [
  new AssetConfig({
    asset: dai_awh,
    balance: BalanceBuilder().evm().erc20(),
    contract: ContractBuilder().TokenBridge().transferTokensWithPayload().mrl(),
    destination: hydration,
    destinationFee: {
      amount: 0.08,
      asset: glmr,
      balance: BalanceBuilder().evm().erc20(),
    },
    fee: {
      asset: aca,
      balance: BalanceBuilder().evm().native(),
    },
    via: {
      chain: moonbeam,
    },
  }),
];

export const acalaEvmConfig = new ChainConfig({
  assets: [...toHydraDXViaWormhole],
  chain: acala_evm,
});
