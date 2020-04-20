import * as t from 'io-ts';
import { BaseUnsignedTransaction, BaseSignedTransaction, BaseTransactionInfo, BaseBroadcastResult, UtxoInfo, NetworkTypeT, ResolveablePayport, } from '@faast/payments-common';
import { extendCodec, nullable, instanceofCodec, requiredOptionalCodec, Logger, Numeric } from '@faast/ts-common';
import { BlockbookBitcoin, BlockInfoBitcoin } from 'blockbook-client';
export { UtxoInfo };
export class BlockbookServerAPI extends BlockbookBitcoin {
}
export const BlockbookConfigServer = t.union([
    t.string,
    t.array(t.string),
    instanceofCodec(BlockbookServerAPI),
    t.null,
], 'BlockbookConfigServer');
export const BlockbookConnectedConfig = requiredOptionalCodec({
    network: NetworkTypeT,
    server: BlockbookConfigServer,
}, {
    logger: nullable(Logger),
}, 'BlockbookConnectedConfig');
export const BitcoinishTxOutput = t.type({
    address: t.string,
    value: t.string,
}, 'BitcoinishTxOutput');
export const BitcoinishTxOutputSatoshis = t.type({
    address: t.string,
    satoshis: t.number,
}, 'BitcoinishTxOutputSatoshis');
export const BitcoinishWeightedChangeOutput = t.type({
    address: t.string,
    weight: t.number,
}, 'BitcoinishWeightedChangeOutput');
export const BitcoinishPaymentTx = requiredOptionalCodec({
    inputs: t.array(UtxoInfo),
    outputs: t.array(BitcoinishTxOutput),
    fee: t.string,
    change: t.string,
    changeAddress: nullable(t.string),
}, {
    externalOutputs: t.array(BitcoinishTxOutput),
    externalOutputTotal: t.string,
    changeOutputs: t.array(BitcoinishTxOutput),
    rawHex: t.string,
    rawHash: t.string,
}, 'BitcoinishPaymentTx');
export const BitcoinishUnsignedTransaction = extendCodec(BaseUnsignedTransaction, {
    amount: t.string,
    fee: t.string,
    data: BitcoinishPaymentTx,
}, 'BitcoinishUnsignedTransaction');
export const BitcoinishSignedTransaction = extendCodec(BaseSignedTransaction, {
    data: t.type({
        hex: t.string,
    }),
}, {}, 'BitcoinishSignedTransaction');
export const BitcoinishTransactionInfo = extendCodec(BaseTransactionInfo, {}, {}, 'BitcoinishTransactionInfo');
export const BitcoinishBroadcastResult = extendCodec(BaseBroadcastResult, {}, {}, 'BitcoinishBroadcastResult');
export const BitcoinishBlock = BlockInfoBitcoin;
export const PayportOutput = t.type({
    payport: ResolveablePayport,
    amount: Numeric,
}, 'PayportOutput');
//# sourceMappingURL=types.js.map