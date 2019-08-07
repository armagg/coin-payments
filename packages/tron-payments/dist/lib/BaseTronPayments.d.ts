import TronWeb from 'tronweb';
import { BalanceResult, PaymentsInterface, FeeOption, ResolvedFeeOption } from '@faast/payments-common';
import { Logger } from '@faast/ts-common';
import { TronTransactionInfo, TronUnsignedTransaction, TronSignedTransaction, TronBroadcastResult, CreateTransactionOptions, GetAddressOptions, BaseTronPaymentsConfig } from './types';
import { toMainDenomination, toBaseDenomination, isValidAddress, isValidPrivateKey, privateKeyToAddress } from './utils';
export declare abstract class BaseTronPayments<Config extends BaseTronPaymentsConfig> implements PaymentsInterface<Config, TronUnsignedTransaction, TronSignedTransaction, TronBroadcastResult, TronTransactionInfo> {
    fullNode: string;
    solidityNode: string;
    eventServer: string;
    logger: Logger;
    tronweb: TronWeb;
    constructor(config: Config);
    toMainDenomination: typeof toMainDenomination;
    toBaseDenomination: typeof toBaseDenomination;
    isValidAddress: typeof isValidAddress;
    isValidPrivateKey: typeof isValidPrivateKey;
    privateKeyToAddress: typeof privateKeyToAddress;
    abstract getFullConfig(): Config;
    abstract getPublicConfig(): Config;
    abstract getAccountId(index: number): string;
    abstract getAccountIds(): string[];
    abstract getAddress(index: number, options?: GetAddressOptions): Promise<string>;
    abstract getAddressIndex(address: string): Promise<number>;
    abstract getPrivateKey(index: number): Promise<string>;
    getAddressOrNull(index: number, options?: GetAddressOptions): Promise<string | null>;
    getAddressIndexOrNull(address: string): Promise<number | null>;
    getBalance(addressOrIndex: string | number): Promise<BalanceResult>;
    resolveFeeOption(feeOption: FeeOption): Promise<ResolvedFeeOption>;
    createSweepTransaction(from: string | number, to: string | number, options?: CreateTransactionOptions): Promise<TronUnsignedTransaction>;
    createTransaction(from: string | number, to: string | number, amountTrx: string, options?: CreateTransactionOptions): Promise<TronUnsignedTransaction>;
    signTransaction(unsignedTx: TronUnsignedTransaction): Promise<TronSignedTransaction>;
    broadcastTransaction(tx: TronSignedTransaction): Promise<TronBroadcastResult>;
    getTransactionInfo(txid: string): Promise<TronTransactionInfo>;
    private canSweepBalance;
    private extractTxFields;
    resolveAddress(addressOrIndex: string | number): Promise<string>;
    resolveFromTo(from: string | number, to: string | number): Promise<{
        fromIndex: number;
        fromAddress: string;
        toIndex: number | null;
        toAddress: string;
    }>;
}
export default BaseTronPayments;
