import { ApiPromise } from "@polkadot/api";

import type { StorageKey } from "@polkadot/types";
import type { AnyTuple, Codec } from "@polkadot/types/types";

import { AssetMetadata } from "@polkadot/types/interfaces";
import "@polkadot/api-augment";
import { TokensAccountData } from "./types";

export class PolkadotClient {
  protected readonly api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
  }

  getStorageKey(asset: [StorageKey<AnyTuple>, Codec], index: number): string {
    return (asset[0].toHuman() as string[])[index];
  }

  getStorageEntryArray(asset: [StorageKey<AnyTuple>, Codec]): string[] {
    return asset[1].toHuman() as string[];
  }

  async getAssetMetadata(tokenKey: string): Promise<string> {
    const { symbol } =
      await this.api.query.assetRegistry.assetMetadataMap<AssetMetadata>(
        tokenKey
      );
    return symbol.toString();
  }

  async getSystemAccountBalance(accountId: string): Promise<string> {
    const {
      data: { free },
    } = await this.api.query.system.account(accountId);
    return free.toString();
  }

  async getTokenAccountBalance(
    accountId: string,
    tokenKey: string
  ): Promise<string> {
    const { free } = await this.api.query.tokens.accounts<TokensAccountData>(
      accountId,
      tokenKey
    );
    return free.toString();
  }
}
