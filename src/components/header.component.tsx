import {FunctionComponentElement} from 'react';

type PropsType = { account: string, network: string, balance: number };

export function HeaderComponent({account, network, balance}: PropsType): FunctionComponentElement<PropsType> {
    return (
        <nav className="navbar navbar-light bg-light">
            <div className="container">
                <div className="ml-auto d-flex justify-content-around">
                    <div className="mx-2">
                        Network: {network}
                    </div>
                    <div className="mx-2">
                        Account: {account}
                    </div>
                    <div className="mx-2">
                        Balance: {balance} ETH
                    </div>
                </div>
            </div>
        </nav>
    );
}
