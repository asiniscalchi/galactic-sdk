import { Router } from './Router';

import { RouteNotFound } from '../errors';
import { Hop, Pool, PoolFees, PoolToken } from '../pool';
import { fmt, math } from '../utils';
import { Amount, Transaction } from '../types';

import { BuySwap, SellSwap, Swap, Trade, TradeType } from './types';

export class TradeRouter extends Router {
  /**
   * Check whether trade is direct or not
   *
   * @param {Swap[]} swaps - trade route swaps
   * @returns true if direct trade, otherwise false
   */
  private isDirectTrade(swaps: Swap[]) {
    return swaps.length == 1;
  }

  /**
   * Find the best sell swap without errors
   *
   * @param {SellSwap[]} swaps - all possible sell routes
   * @returns best sell swap if exist, otherwise first one found
   */
  private findBestSellRoute(swaps: SellSwap[][]): SellSwap[] {
    const sortedResults = swaps.sort((a, b) => {
      const swapAFinal = a[a.length - 1].amountOut;
      const swapBFinal = b[b.length - 1].amountOut;
      return swapAFinal > swapBFinal ? -1 : 1;
    });

    return (
      sortedResults.find((route: SellSwap[]) =>
        route.every((swap: SellSwap) => swap.errors.length == 0)
      ) || sortedResults[0]
    );
  }

  /**
   * Route fee range [min,max] in case pool is using dynamic fees
   *
   * @param {Swap[]} swaps - trade routes
   * @returns min & max fee range if swapping through the pool with
   * dynamic fees support
   */
  private getRouteFeeRange(swaps: Swap[]): [number, number] | undefined {
    const hasDynFee = swaps.filter((s: Swap) => s.tradeFeeRange).length > 0;
    if (hasDynFee) {
      const min = swaps
        .map((s: Swap) => s.tradeFeeRange?.[0] ?? s.tradeFeePct)
        .reduce((a: number, b: number) => a + b);
      const max = swaps
        .map((s: Swap) => s.tradeFeeRange?.[1] ?? s.tradeFeePct)
        .reduce((a: number, b: number) => a + b);
      return [min, max];
    }
  }

  /**
   * Pool fee range [min,max] in case pool is using dynamic fees
   *
   * @param {PoolFees} fees - pool fees
   * @returns min & max fee range if swapping through the pool with
   * dynamic fees support
   */
  private getPoolFeeRange(fees: PoolFees): [number, number] | undefined {
    const feeMin = fees.min ? fmt.toPct(fees.min) : undefined;
    const feeMax = fees.max ? fmt.toPct(fees.max) : undefined;
    if (feeMin && feeMax) {
      return [feeMin, feeMax];
    }
    return undefined;
  }

  /**
   * Calculate and return best possible sell trade for assetIn>assetOut
   *
   * @param {string} assetIn - assetIn id
   * @param {string} assetOut - assetOut id
   * @param {bigint} amountIn - amount of assetIn to sell for assetOut
   * @returns best possible sell trade of given token pair
   */
  async getBestSell(
    assetIn: number,
    assetOut: number,
    amountIn: bigint
  ): Promise<Trade> {
    return this.getSell(assetIn, assetOut, amountIn);
  }

  /**
   * Calculate and return sell spot price for assetIn>assetOut
   *
   * @param route - best possible trade route (sell)
   * @returns sell spot price
   */
  async getSellSpot(route: SellSwap[]): Promise<bigint> {
    const lastSwap = route[route.length - 1];

    if (route.length === 1) {
      return lastSwap.spotPrice;
    }

    const cumulativeRouteDecimals = route
      .map((s: SellSwap) => s.assetOutDecimals)
      .reduce((a: number, b: number) => a + b);
    const cumulativeSpotPrice = route
      .map((s: SellSwap) => s.spotPrice)
      .reduce((a: bigint, b: bigint) => a * b);

    const spotAdjDecimals = cumulativeRouteDecimals - lastSwap.assetOutDecimals;
    const spotScalingFactor = Math.pow(10, spotAdjDecimals);
    return cumulativeSpotPrice / BigInt(spotScalingFactor);
  }

  /**
   * Calculate and return sell trade for assetIn>assetOut
   *
   * @param {string} assetIn - assetIn id
   * @param {string} assetOut - assetOut id
   * @param {bigint} amountIn - amount of assetIn to sell for assetOut
   * @param {Hop[]} route - explicit route to use for trade
   * @returns sell trade of given token pair
   */
  async getSell(
    assetIn: number,
    assetOut: number,
    amountIn: bigint,
    route?: Hop[]
  ): Promise<Trade> {
    const pools = await super.getPools();
    if (pools.length === 0) throw new Error('No pools configured');
    const { poolsMap } = await super.validateTokenPair(
      assetIn,
      assetOut,
      pools
    );
    const paths = super.getPaths(assetIn, assetOut, poolsMap, pools);
    if (paths.length === 0) throw new RouteNotFound(assetIn, assetOut);

    let swaps: SellSwap[];
    if (route) {
      swaps = await this.toSellSwaps(amountIn, route, poolsMap);
    } else {
      const routes = await Promise.all(
        paths.map((path) => this.toSellSwaps(amountIn, path, poolsMap))
      );
      swaps = this.findBestSellRoute([routes[1]]);
    }

    const firstSwap = swaps[0];
    const lastSwap = swaps[swaps.length - 1];
    const isDirect = this.isDirectTrade(swaps);

    const spotPrice = await this.getSellSpot(swaps);

    const deltaY = lastSwap.amountOut;
    const delta0Y = isDirect
      ? lastSwap.calculatedOut
      : this.calculateDelta0Y(firstSwap.amountIn, swaps, poolsMap);

    const tradeFee = delta0Y - deltaY;
    const tradeFeeRange = this.getRouteFeeRange(swaps);
    const tradeFeePct = isDirect
      ? lastSwap.tradeFeePct
      : math.calculateSellFee(delta0Y, deltaY);

    const swapScalingFactor = Math.pow(10, firstSwap.assetInDecimals);
    const swapAmount =
      (firstSwap.amountIn * spotPrice) / BigInt(swapScalingFactor);

    const priceImpactPct = math.calculateDiffToRef(delta0Y, swapAmount);

    const sellTx = (slippagePct?: number): Transaction => {
      const slippage = math.multiplyByFraction(
        lastSwap.amountOut,
        slippagePct || 1
      );

      return this.poolService.buildSellTx(
        assetIn,
        assetOut,
        firstSwap.amountIn,
        lastSwap.amountOut - slippage,
        swaps.map((swap: SellSwap) => {
          return swap as Hop;
        })
      );
    };

    return {
      type: TradeType.Sell,
      amountIn: firstSwap.amountIn,
      amountOut: lastSwap.amountOut,
      spotPrice: spotPrice,
      tradeFee: tradeFee,
      tradeFeePct: tradeFeePct,
      tradeFeeRange: tradeFeeRange,
      priceImpactPct: priceImpactPct,
      swaps: swaps,
      toTx: sellTx,
      toHuman() {
        return {
          type: TradeType.Sell,
          amountIn: fmt.toHuman(firstSwap.amountIn, firstSwap.assetInDecimals),
          amountOut: fmt.toHuman(lastSwap.amountOut, lastSwap.assetOutDecimals),
          spotPrice: fmt.toHuman(spotPrice, lastSwap.assetOutDecimals),
          tradeFee: fmt.toHuman(tradeFee, lastSwap.assetOutDecimals),
          tradeFeePct: tradeFeePct,
          tradeFeeRange: tradeFeeRange,
          priceImpactPct: priceImpactPct,
          swaps: swaps.map((s: SellSwap) => s.toHuman()),
        };
      },
    } as Trade;
  }

  /**
   * Calculate the amount out for best possible trade if fees are zero
   *
   * @param amountIn - amount of assetIn to sell for assetOut
   * @param route - best possible trade route (sell)
   * @param poolsMap - pools map
   * @returns the amount out for best possible trade if fees are zero
   */
  private calculateDelta0Y(
    amountIn: bigint,
    route: SellSwap[],
    poolsMap: Map<string, Pool>
  ) {
    const amounts: bigint[] = [];
    for (let i = 0; i < route.length; i++) {
      const swap = route[i];
      const pool = poolsMap.get(swap.poolAddress);
      if (pool == null) throw new Error('Pool does not exit');
      const poolPair = pool.parsePair(swap.assetIn, swap.assetOut);
      let aIn: bigint;
      if (i > 0) {
        aIn = amounts[i - 1];
      } else {
        aIn = amountIn;
      }
      const calculatedOut = pool.calculateOutGivenIn(poolPair, aIn);
      amounts.push(calculatedOut);
    }
    return amounts[amounts.length - 1];
  }

  /**
   * Calculate and return sell swaps for given path
   * - final amount of previous swap is entry to next one
   *
   * @param amountIn - amount of assetIn to sell for assetOut
   * @param path - current path
   * @param poolsMap - pools map
   * @returns sell swaps for given path with corresponding pool pairs
   */
  private async toSellSwaps(
    amountIn: bigint,
    path: Hop[],
    poolsMap: Map<string, Pool>
  ): Promise<SellSwap[]> {
    const swaps: SellSwap[] = [];
    for (let i = 0; i < path.length; i++) {
      const hop = path[i];
      const pool = poolsMap.get(hop.poolAddress);
      if (pool == null) throw new Error('Pool does not exit');

      const poolPair = pool.parsePair(hop.assetIn, hop.assetOut);

      let aIn: bigint;
      if (i > 0) {
        aIn = swaps[i - 1].amountOut;
      } else {
        aIn = amountIn;
      }

      const poolFees = await this.poolService.getPoolFees(
        pool,
        poolPair.assetOut
      );
      const { amountOut, calculatedOut, feePct, errors } = pool.validateAndSell(
        poolPair,
        aIn,
        poolFees
      );
      const feePctRange = this.getPoolFeeRange(poolFees);
      const spotPrice = pool.spotPriceOutGivenIn(poolPair);

      const swapScalingFactor = Math.pow(10, poolPair.decimalsIn);
      const swapAmount = (aIn * spotPrice) / BigInt(swapScalingFactor);

      const priceImpactPct = math.calculateDiffToRef(calculatedOut, swapAmount);

      swaps.push({
        ...hop,
        assetInDecimals: poolPair.decimalsIn,
        assetOutDecimals: poolPair.decimalsOut,
        amountIn: aIn,
        calculatedOut: calculatedOut,
        amountOut: amountOut,
        spotPrice: spotPrice,
        tradeFeePct: feePct,
        tradeFeeRange: feePctRange,
        priceImpactPct: priceImpactPct,
        errors: errors,
        toHuman() {
          return {
            ...hop,
            amountIn: fmt.toHuman(aIn, poolPair.decimalsIn),
            calculatedOut: fmt.toHuman(calculatedOut, poolPair.decimalsOut),
            amountOut: fmt.toHuman(amountOut, poolPair.decimalsOut),
            spotPrice: fmt.toHuman(spotPrice, poolPair.decimalsOut),
            tradeFeePct: feePct,
            tradeFeeRange: feePctRange,
            priceImpactPct: priceImpactPct,
            errors: errors,
          };
        },
      } as SellSwap);
    }
    return swaps;
  }

  /**
   * Calculate and return best possible spot price for tokenIn>tokenOut
   *
   * To avoid routing through the pools with low liquidity, 0.1% from the
   * most liquid pool asset is used as reference value to determine ideal
   * route to calculate spot.
   *
   * @param {number} assetIn - assetIn id
   * @param {number} assetOut - assetOut id
   * @return best possible spot price of given asset pair, or undefined
   * if given pair swap is not supported
   */
  async getBestSpotPrice(
    assetIn: number,
    assetOut: number
  ): Promise<Amount | undefined> {
    const pools = await super.getPools();
    if (pools.length === 0) throw new Error('No pools configured');
    const { poolsMap } = await super.validateTokenPair(
      assetIn,
      assetOut,
      pools
    );
    const paths = super.getPaths(assetIn, assetOut, poolsMap, pools);
    if (paths.length === 0) {
      return Promise.resolve(undefined);
    }

    const assetsByLiquidityDesc = pools
      .map((pool) => pool.tokens.find((t) => t.id === assetIn))
      .filter((a): a is PoolToken => !!a)
      .sort((a, b) => Number(b.balance) - Number(a.balance));

    const { balance, decimals } = assetsByLiquidityDesc[0];
    const liquidityIn = math.multiplyByFraction(balance, 0.1);

    const routes = await Promise.all(
      paths.map((path) => this.toSellSwaps(liquidityIn, path, poolsMap))
    );
    const route = this.findBestSellRoute(routes);

    const unit = Math.pow(10, decimals);
    const swaps = await this.toSellSwaps(BigInt(unit), route, poolsMap);

    const spotPrice = await this.getSellSpot(swaps);
    const spotPriceDecimals = swaps[swaps.length - 1].assetOutDecimals;
    return { amount: spotPrice, decimals: spotPriceDecimals };
  }

  /**
   * Find the best buy swap without errors, if there is none return first one found
   *
   * @param {BuySwap[]} swaps - all possible buy routes
   * @returns best buy swap if exist, otherwise first one found
   */
  private findBestBuyRoute(swaps: BuySwap[][]): BuySwap[] {
    const sortedResults = swaps.sort((a, b) => {
      const swapAFinal = a[0].amountIn;
      const swapBFinal = b[0].amountIn;
      return swapAFinal > swapBFinal ? 1 : -1;
    });

    return (
      sortedResults.find((route: BuySwap[]) =>
        route.every((swap: BuySwap) => swap.errors.length == 0)
      ) || sortedResults[0]
    );
  }

  /**
   * Calculate and return best possible buy trade for assetIn>assetOut
   *
   * @param {number} assetIn - assetIn id
   * @param {number} assetOut - assetOut id
   * @param {bigint} amountOut - amount of tokenOut to buy for tokenIn
   * @returns best possible buy trade of given token pair
   */
  async getBestBuy(
    assetIn: number,
    assetOut: number,
    amountOut: bigint
  ): Promise<Trade> {
    return this.getBuy(assetIn, assetOut, amountOut);
  }

  /**
   * Calculate and return buy spot price for assetIn>assetOut
   *
   * @param route - best possible trade route (buy)
   * @returns buy spot price
   */
  async getBuySpot(route: BuySwap[]): Promise<bigint> {
    const totalRouteDecimals = route
      .map((s: BuySwap) => s.assetInDecimals)
      .reduce((a: number, b: number) => a + b);
    const totalSpotPrice = route
      .map((s: BuySwap) => s.spotPrice)
      .reduce((a: bigint, b: bigint) => a * b);
    const spotScalingFactor = Math.pow(10, totalRouteDecimals);
    return totalSpotPrice / BigInt(spotScalingFactor);
  }

  /**
   * Calculate and return buy trade for assetIn>assetOut
   *
   * @param {number} assetIn - assetIn id
   * @param {number} assetOut - assetOut id
   * @param {bigint} amountOut - amount of tokenOut to buy for tokenIn
   * @param {Hop[]} route - explicit route to use for trade
   * @returns buy trade of given token pair
   */
  async getBuy(
    assetIn: number,
    assetOut: number,
    amountOut: bigint,
    route?: Hop[]
  ): Promise<Trade> {
    const pools = await super.getPools();
    if (pools.length === 0) throw new Error('No pools configured');
    const { poolsMap } = await super.validateTokenPair(
      assetIn,
      assetOut,
      pools
    );
    const paths = super.getPaths(assetIn, assetOut, poolsMap, pools);
    if (paths.length === 0) throw new RouteNotFound(assetIn, assetOut);

    let swaps: BuySwap[];
    if (route) {
      swaps = await this.toBuySwaps(amountOut, route, poolsMap);
    } else {
      const routes = await Promise.all(
        paths.map((path) => this.toBuySwaps(amountOut, path, poolsMap))
      );
      swaps = this.findBestBuyRoute(routes);
    }

    const firstSwap = swaps[swaps.length - 1];
    const lastSwap = swaps[0];
    const isDirect = this.isDirectTrade(swaps);

    const spotPrice = await this.getBuySpot(swaps);

    const deltaX = lastSwap.amountIn;
    const delta0X = isDirect
      ? lastSwap.calculatedIn
      : this.calculateDelta0X(firstSwap.amountOut, swaps, poolsMap);

    const tradeFee = deltaX - delta0X;
    const tradeFeeRange = this.getRouteFeeRange(swaps);
    const tradeFeePct = isDirect
      ? lastSwap.tradeFeePct
      : math.calculateBuyFee(delta0X, deltaX);

    const swapScalingFactor = Math.pow(10, firstSwap.assetOutDecimals);
    const swapAmount =
      (firstSwap.amountOut * spotPrice) / BigInt(swapScalingFactor);

    let priceImpactPct: number;
    if (delta0X === 0n) {
      priceImpactPct = -100;
    } else {
      priceImpactPct = math.calculateDiffToRef(swapAmount, delta0X);
    }

    const buyTx = (slippagePct?: number): Transaction => {
      const slippage = math.multiplyByFraction(
        firstSwap.amountOut,
        slippagePct || 1
      );

      return this.poolService.buildBuyTx(
        assetIn,
        assetOut,
        firstSwap.amountOut,
        firstSwap.amountOut + slippage,
        swaps.map((swap: BuySwap) => {
          return swap as Hop;
        })
      );
    };

    return {
      type: TradeType.Buy,
      amountOut: firstSwap.amountOut,
      amountIn: lastSwap.amountIn,
      spotPrice: spotPrice,
      tradeFee: tradeFee,
      tradeFeePct: tradeFeePct,
      tradeFeeRange: tradeFeeRange,
      priceImpactPct: priceImpactPct,
      swaps: swaps,
      toTx: buyTx,
      toHuman() {
        return {
          type: TradeType.Buy,
          amountOut: fmt.toHuman(
            firstSwap.amountOut,
            firstSwap.assetOutDecimals
          ),
          amountIn: fmt.toHuman(lastSwap.amountIn, lastSwap.assetInDecimals),
          spotPrice: fmt.toHuman(spotPrice, lastSwap.assetInDecimals),
          tradeFee: fmt.toHuman(tradeFee, lastSwap.assetInDecimals),
          tradeFeePct: tradeFeePct,
          tradeFeeRange: tradeFeeRange,
          priceImpactPct: priceImpactPct,
          swaps: swaps.map((s: BuySwap) => s.toHuman()),
        };
      },
    } as Trade;
  }

  /**
   * Calculate the amount in for best possible trade if fees are zero
   *
   * @param amountOut - amount of assetOut to buy for assetIn
   * @param bestRoute - best possible trade route (buy)
   * @param poolsMap - pools map
   * @returns the amount in for best possible trade if fees are zero
   */
  private calculateDelta0X(
    amountOut: bigint,
    bestRoute: BuySwap[],
    poolsMap: Map<string, Pool>
  ) {
    const amounts: bigint[] = [];
    for (let i = bestRoute.length - 1; i >= 0; i--) {
      const swap = bestRoute[i];
      const pool = poolsMap.get(swap.poolAddress);
      if (pool == null) throw new Error('Pool does not exit');
      const poolPair = pool.parsePair(swap.assetIn, swap.assetOut);
      let aOut: bigint;
      if (i == bestRoute.length - 1) {
        aOut = amountOut;
      } else {
        aOut = amounts[0];
      }
      const calculatedIn = pool.calculateInGivenOut(poolPair, aOut);
      amounts.unshift(calculatedIn);
    }
    return amounts[0];
  }

  /**
   * Calculate and return buy swaps for given path
   * - final amount of previous swap is entry to next one
   * - calculation is done backwards (swaps in reversed order)
   *
   * @param amountOut - amount of assetOut to buy for assetIn
   * @param path - current path
   * @param poolsMap - pools map
   * @returns buy swaps for given path
   */
  private async toBuySwaps(
    amountOut: bigint,
    path: Hop[],
    poolsMap: Map<string, Pool>
  ): Promise<BuySwap[]> {
    const swaps: BuySwap[] = [];
    for (let i = path.length - 1; i >= 0; i--) {
      const hop = path[i];
      const pool = poolsMap.get(hop.poolAddress);
      if (pool == null) throw new Error('Pool does not exit');

      const poolPair = pool.parsePair(hop.assetIn, hop.assetOut);

      let aOut: bigint;
      if (i == path.length - 1) {
        aOut = amountOut;
      } else {
        aOut = swaps[0].amountIn;
      }

      const poolFees = await this.poolService.getPoolFees(
        pool,
        poolPair.assetOut
      );
      const { amountIn, calculatedIn, feePct, errors } = pool.validateAndBuy(
        poolPair,
        aOut,
        poolFees
      );
      const feePctRange = this.getPoolFeeRange(poolFees);
      const spotPrice = pool.spotPriceInGivenOut(poolPair);

      const swapScalingFactor = Math.pow(10, poolPair.decimalsOut);
      const swapAmount = (aOut * spotPrice) / BigInt(swapScalingFactor);

      let priceImpactPct: number;
      if (calculatedIn === 0n) {
        priceImpactPct = -100;
      } else {
        priceImpactPct = math.calculateDiffToRef(swapAmount, calculatedIn);
      }

      swaps.unshift({
        ...hop,
        assetInDecimals: poolPair.decimalsIn,
        assetOutDecimals: poolPair.decimalsOut,
        amountOut: aOut,
        calculatedIn: calculatedIn,
        amountIn: amountIn,
        spotPrice: spotPrice,
        tradeFeePct: feePct,
        tradeFeeRange: feePctRange,
        priceImpactPct: priceImpactPct,
        errors: errors,
        toHuman() {
          return {
            ...hop,
            amountOut: fmt.toHuman(aOut, poolPair.decimalsOut),
            calculatedIn: fmt.toHuman(calculatedIn, poolPair.decimalsIn),
            amountIn: fmt.toHuman(amountIn, poolPair.decimalsIn),
            spotPrice: fmt.toHuman(spotPrice, poolPair.decimalsIn),
            tradeFeePct: feePct,
            tradeFeeRange: feePctRange,
            priceImpactPct: priceImpactPct,
            errors: errors,
          };
        },
      } as BuySwap);
    }
    return swaps;
  }
}
