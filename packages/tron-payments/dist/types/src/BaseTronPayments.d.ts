import TronWeb from 'tronweb';
import { BalanceResult, PaymentsInterface, BroadcastResult } from 'payments-common';
import { TransactionInfo, UnsignedTransaction, SignedTransaction, CreateTransactionOptions, GetAddressOptions } from './types';
import { toMainDenomination, toBaseDenomination } from './utils';
export interface BaseTronPaymentsConfig {
    fullNode?: string;
    solidityNode?: string;
    eventServer?: string;
}
export declare abstract class BaseTronPayments implements PaymentsInterface<UnsignedTransaction, SignedTransaction, TransactionInfo> {
    fullNode: string;
    solidityNode: string;
    eventServer: string;
    tronweb: TronWeb;
    constructor(config: BaseTronPaymentsConfig);
    static toMainDenomination: typeof toMainDenomination;
    static toBaseDenomination: typeof toBaseDenomination;
    toMainDenomination: typeof toMainDenomination;
    toBaseDenomination: typeof toBaseDenomination;
    isValidAddress(address: string): boolean;
    isValidPrivateKey(privateKey: string): boolean;
    privateKeyToAddress(privateKey: string): string;
    abstract getAddress(index: number, options?: GetAddressOptions): Promise<string>;
    abstract getAddressIndex(address: string): Promise<number>;
    abstract getPrivateKey(index: number): Promise<string>;
    getAddressOrNull(index: number, options?: GetAddressOptions): Promise<string | null>;
    getAddressIndexOrNull(address: string): Promise<number | null>;
    getBalance(addressOrIndex: string | number): Promise<BalanceResult>;
    canSweep(addressOrIndex: string | number): Promise<boolean>;
    createSweepTransaction(from: string | number, to: string | number, options?: CreateTransactionOptions): Promise<UnsignedTransaction>;
    createTransaction(from: string | number, to: string | number, amountTrx: string, options?: CreateTransactionOptions): Promise<UnsignedTransaction>;
    signTransaction(unsignedTx: UnsignedTransaction): Promise<SignedTransaction>;
    broadcastTransaction(tx: SignedTransaction): Promise<BroadcastResult>;
    getTransactionInfo(txid: string): Promise<TransactionInfo>;
    private canSweepBalance;
    private extractTxFields;
    private resolveAddress;
    private resolveFromTo;
}
export default BaseTronPayments;
