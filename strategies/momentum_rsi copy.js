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
    onTick: async ({ candle, getCandles, buy, sell, stockBalance }) => {
        minutes = minutes + 5; // 1440 minutes in a day
        days++;

        // every 30 days update the list (only after a YEAR passed to gather data)
        // this stage uses daily data, while the rest uses 5 minute data.
        if (days % 30 && days >= 360) { 
            console.log(minutes, days, currentDate, candle.timestamp);
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

const result = await bt.runOnStock('APPL');
bt.logMetrics(result);