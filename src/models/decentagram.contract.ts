import {AbiItem} from 'web3-utils';

import {BaseContract} from './base.contract';
import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';

import DecentagramJSON from '../abis/Decentagram.json';

export class DecentagramContract extends BaseContract {
    constructor(network: string) {
        if (!isMetaMaskInstalled()) {
            throw new Error('Meta Mask is not installed');
        }

        const abi: AbiItem[] = DecentagramJSON.abi as AbiItem[];
        const address: string = DecentagramJSON.networks[network];
        if (address && abi) {
            super(abi, address);
        } else {
            throw new Error('Decentagram contract not deployed to detected network.');
        }
    }
}
