import {isMetaMaskInstalled} from '../helpers/meta-mask.helper';
import Web3 from 'web3';
import {AbiItem} from 'web3-utils';

//TODO: implement contract inheritance
export abstract class BaseContract {
    protected constructor(web3: Web3, abi: AbiItem[], address: string) {
        if (isMetaMaskInstalled()) {
            Object.assign(this, new web3.eth.Contract(abi, address));
        } else {
            throw new Error('Meta Mask is not installed');
        }
    }
}
