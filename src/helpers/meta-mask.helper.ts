export function isMetaMaskInstalled(): boolean {
    return Boolean(window['ethereum'] && window['ethereum'].isMetaMask);
}
