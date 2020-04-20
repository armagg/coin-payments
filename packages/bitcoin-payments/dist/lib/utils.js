import { NetworkType, FeeRateType } from '@faast/payments-common';
import request from 'request-promise-native';
import bs58 from 'bs58';
import { DEFAULT_NETWORK, NETWORK_TESTNET, NETWORK_MAINNET, DEFAULT_TESTNET_SERVER, DEFAULT_MAINNET_SERVER, COIN_SYMBOL, COIN_NAME, DECIMAL_PLACES, DEFAULT_DUST_THRESHOLD, DEFAULT_NETWORK_MIN_RELAY_FEE, DEFAULT_MIN_TX_FEE, DEFAULT_FEE_LEVEL, } from './constants';
const DEFAULT_BITCOINISH_CONFIG = {
    coinSymbol: COIN_SYMBOL,
    coinName: COIN_NAME,
    decimals: DECIMAL_PLACES,
    dustThreshold: DEFAULT_DUST_THRESHOLD,
    networkMinRelayFee: DEFAULT_NETWORK_MIN_RELAY_FEE,
    minTxFee: {
        feeRate: DEFAULT_MIN_TX_FEE.toString(),
        feeRateType: FeeRateType.BasePerWeight,
    },
    defaultFeeLevel: DEFAULT_FEE_LEVEL,
};
export function bip32MagicNumberToPrefix(magicNum) {
    const b = Buffer.alloc(82);
    b.writeUInt32BE(magicNum, 0);
    return bs58.encode(b).slice(0, 4);
}
export function toBitcoinishConfig(config) {
    const configWithDefaults = {
        ...DEFAULT_BITCOINISH_CONFIG,
        ...config,
        network: config.network || DEFAULT_NETWORK,
    };
    const { network, server } = configWithDefaults;
    return {
        ...configWithDefaults,
        bitcoinjsNetwork: network === NetworkType.Testnet ? NETWORK_TESTNET : NETWORK_MAINNET,
        server: typeof server !== 'undefined'
            ? server
            : (network === NetworkType.Testnet
                ? DEFAULT_TESTNET_SERVER
                : DEFAULT_MAINNET_SERVER),
    };
}
export async function getBlockcypherFeeEstimate(feeLevel, networkType) {
    const body = await request.get(`https://api.blockcypher.com/v1/btc/${networkType === NetworkType.Mainnet ? 'main' : 'test3'}`, { json: true });
    const feePerKbField = `${feeLevel}_fee_per_kb`;
    const feePerKb = body[feePerKbField];
    if (!feePerKb) {
        throw new Error(`Blockcypher response is missing expected field ${feePerKbField}`);
    }
    return feePerKb / 1000;
}
//# sourceMappingURL=utils.js.map