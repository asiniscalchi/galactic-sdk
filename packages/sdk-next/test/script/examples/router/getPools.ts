import { PolkadotClient } from 'polkadot-api';

import { PapiExecutor } from '../../PapiExecutor';
import { ApiUrl } from '../../types';

import { api as a, pool as p } from '../../../../src';

class GetPoolsExample extends PapiExecutor {
  async script(client: PolkadotClient): Promise<any> {
    const poolType = p.PoolType;
    const poolService = new p.PoolService(client);
    const router = new a.TradeRouter(poolService, {
      includeOnly: [poolType.Omni],
    });
    return router.getPools();
  }
}

new GetPoolsExample(ApiUrl.HydraDx, 'Get pools', true).run();
