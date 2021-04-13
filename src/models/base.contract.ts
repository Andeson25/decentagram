import {AbiItem} from 'web3-utils';

import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import {EthereumService} from '../services/ethereum.service';

export abstract class BaseContract extends EthereumService.getContractConstructor() {
    protected constructor(abi: AbiItem[], address: string) {
        if (isMetaMaskInstalled()) {
            super(abi, address);
        } else {
            throw new Error('Meta Mask is not installed');
        }
    }
}
