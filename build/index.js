"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// eslint-disable-next-line node/no-unpublished-import
const dotenv = __importStar(require("dotenv"));
const env = __importStar(require("env-var"));
const utils_1 = require("./utils");
const ensjs_1 = __importStar(require("@ensdomains/ensjs"));
const config_1 = require("./config");
// import {ETHRegistrarController as ETHRegistrarControllerAbi} from '@ensdomains/ens-contracts';
dotenv.config();
class ENSExample {
    constructor(network, provider) {
        this.network = network;
        this.provider = provider;
        this.ens = new ensjs_1.default({ provider, ensAddress: (0, ensjs_1.getEnsAddress)(network) });
    }
    // https://goerli.etherscan.io/tx/0x46c85637fa0ad5444021de6d75c348eee5060598ba0eae58404d6be458dff7ae
    async commit(wallet, name, duration) {
        const ETHRegistrarControllerAbi = [];
        const controllerAddress = config_1.Addresses['ETHRegistrarController'][this.network];
        const controller = new ethers_1.ethers.Contract(controllerAddress, ETHRegistrarControllerAbi, this.provider);
        const resolver = config_1.Addresses['PublicResolver'][this.network];
        const secret = (0, utils_1.randomSecret)();
        console.log('resolver', resolver, secret);
        const commitment = await controller.makeCommitment(name, wallet.address, duration, secret);
        console.log('commitment', commitment);
    }
    // https://goerli.etherscan.io/tx/0x4a735cd2b09413a43b2df3504cb124253e5ea7f21e597746c8b23f9a22116525
    async reveal(wallet, name, duration) { }
    async resolve(name) {
        return await this.ens.name(name).getAddress();
    }
    async resolveByGraph(name) {
        return Promise.resolve('name');
    }
    async lookupBy(account) {
        const { name } = await this.ens.getName(account.toLocaleLowerCase());
        return name;
    }
    async lookupByGraph(account) {
        return Promise.resolve('account');
    }
}
async function main() {
    const privateKey = env.get('PRIVATE_KEY').required().asString();
    const rpcUrl = env.get('RPC_URL').required().asString();
    const network = env.get('NETWORK').required().asInt().toString();
    console.log('providate key', privateKey);
    console.log('rpc url', rpcUrl);
    console.log('network', network);
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl, Number(network));
    const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
    const name = 'hungrywarrior.eth';
    const duration = 31556952;
    const example = new ENSExample(network, provider);
    await example.commit(wallet, name, duration);
    // await sleep(60000); // wait for 1 minute to prevent frontrunnning
    // await example.reveal(wallet, name, duration);
    // console.log(`Successfully registered ${name}`);
    console.time('Resolve');
    const address = await example.resolve(name);
    console.log(`Resolve ${name}`, address);
    console.timeEnd('Resolve');
    console.time('Lookup');
    const names = await example.lookupBy(wallet.address);
    console.log(`Lookup by ${wallet.address}`, names);
    console.timeEnd('Lookup');
}
main().catch(error => {
    console.error(error);
});
//# sourceMappingURL=index.js.map