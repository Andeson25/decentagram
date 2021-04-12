import {AbiItem} from 'web3-utils';
import Web3 from 'web3';

import DecentagramAbi from '../abis/Decentagram.json';
import {BaseContract} from './base.contract';
import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';

export class DecentagramContract extends BaseContract {
    constructor(web3: Web3, network: string) {
        if (!isMetaMaskInstalled()) {
            throw new Error('Meta Mask is not installed');
        }

        const abi: AbiItem[] = DecentagramAbi.abi as AbiItem[];
        const address: string = DecentagramAbi.networks[network];
        console.log(address);
        if (address && abi) {
            super(web3, abi, address);
        } else {
            throw new Error('Decentagram contract not deployed to detected network.');
        }
    }
}
