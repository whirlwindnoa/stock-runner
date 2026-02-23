import Strategy from '../src/backtest/strategy.js';
import Backtest from '../src/backtest/index.js';
import IBKR from '../src/brokers/ibkr.js';

const periods = [90, 180, 360];
const increases = [1.45, 1.55, 1.75];

let minutes = 0;
let days = 0;

const universe = new Map(); // updated list of stocks according to the Momentum Effect

const momentum_rsi = new Strategy({
    intervals: {
        '1d': { count: 365, main: false },
        '5m': { count: 28, main: true, preload: false }
    },
    onTick: async ({ stocks, currentDate, ctx }) => {
        minutes = minutes + 5; // 1440 minutes in a day
        days++;

        // every 30 days update the list (only after a YEAR passed to gather data)
        // this stage uses daily data, while the rest uses 5 minute data.
        if (days % 30 && days >= 360) { 
            for (const s of stocks) {
                const { stockName, getCandles } = s;

                let score = 0; // stock's rank
                for (let i = 0; i < periods.length; i++) {
                    const candles = await getCandles("1d", periods[i]); // obtain candles for specific periods (90, 180, 360 days)
                    if (!candles || candles.length < periods[i]) break; // skip stock if data is cooked
                    
                    
                    const curr = candles[0].close;
                    const prev = candles[candles.length - 1].close;
                    const ratio = curr / prev;

                    if (ratio >= increases[i]) score++; // increase stock's rank if it meets the requirement (45%, 55%, 75% increase) in its respective period
                }

                if (score == 3) universe.set(stockName, score); 
                else universe.delete(stockName);
            }
            console.log(universe.size
                
            );
        }
    }
});

const bt = new Backtest({
    strategy: momentum_rsi,
    startDate: new Date('2023-09-14'),
    endDate: new Date('2026-02-12'),
    startCashBalance: 100_000,
    broker: new IBKR('tiered'),
    logs: {
        swaps: false,
        trades: true
    }
});

const result = await bt.runOnAllStocks();
bt.logMetrics(result);