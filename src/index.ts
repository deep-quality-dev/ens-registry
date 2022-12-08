import {ethers} from 'ethers';
// eslint-disable-next-line node/no-unpublished-import
import * as dotenv from 'dotenv';
import * as env from 'env-var';
import {GraphQLClient} from 'graphql-request';
import {graphQLQuery, randomSecret, sleep} from './utils';
import {
  Addresses,
  Abis,
  SupportedNetworkId,
  QueryDomainByAccount,
  SubgraphURLs,
  QueryOwnerByDomain,
} from './config';

// import ENS, {getEnsAddress} from '@ensdomains/ensjs';
const {default: ENS, getEnsAddress} = require('@ensdomains/ensjs');

dotenv.config();

class ENSExample {
  private network: SupportedNetworkId;
  private provider: ethers.providers.JsonRpcProvider;
  private ens: any;
  private gqlClient: GraphQLClient;

  constructor(network: string, provider: ethers.providers.JsonRpcProvider) {
    this.network = network as SupportedNetworkId;
    this.provider = provider;
    this.ens = new ENS({provider, ensAddress: getEnsAddress(network)});
    const subgraphUrl = SubgraphURLs[this.network];
    this.gqlClient = new GraphQLClient(subgraphUrl);
  }

  // https://goerli.etherscan.io/tx/0x46c85637fa0ad5444021de6d75c348eee5060598ba0eae58404d6be458dff7ae
  // https://etherscan.io/tx/0x808a3fc80cfcc4248c42e713270840d9e95e2758f4baeb5d164899f1c650979b
  async commit(wallet: ethers.Wallet, name: string): Promise<string> {
    const controllerAddress = Addresses['ETHRegistrarController'][this.network];
    const resolverAddress = Addresses['PublicResolver'][this.network];

    const controllerAbi = Abis['ETHRegistrarController'];

    const controller = new ethers.Contract(
      controllerAddress,
      controllerAbi,
      wallet
    );

    const secret = randomSecret();
    const label = name.replace('.eth', '');
    console.log(
      'committing',
      controllerAddress,
      resolverAddress,
      secret,
      label
    );

    const commitment = await controller.makeCommitment(
      label,
      wallet.address,
      secret
    );
    console.log('commitment', commitment);

    const tx = await controller.commit(commitment);
    await tx.wait();
    console.log('committed');

    return secret;
  }

  // https://goerli.etherscan.io/tx/0x4a735cd2b09413a43b2df3504cb124253e5ea7f21e597746c8b23f9a22116525
  // https://etherscan.io/tx/0x8e540f150db9accea433cb4f7f7927038269b0312c4a8e1e9116d34442c03783
  async reveal(
    wallet: ethers.Wallet,
    name: string,
    duration: number,
    secret: string
  ) {
    const controllerAddress = Addresses['ETHRegistrarController'][this.network];
    const resolverAddress = Addresses['PublicResolver'][this.network];

    const controllerAbi = Abis['ETHRegistrarController'];

    const controller = new ethers.Contract(
      controllerAddress,
      controllerAbi,
      wallet
    );

    const label = name.replace('.eth', '');
    const owner = wallet.address;

    const rentPrice = await controller.rentPrice(label, duration);
    console.log(
      'rent price',
      rentPrice.toString(),
      ethers.utils.formatEther(rentPrice.toString())
    );

    const tx = await controller.registerWithConfig(
      label,
      owner,
      duration,
      secret,
      resolverAddress,
      owner,
      {
        value: rentPrice,
      }
    );
    await tx.wait();
  }

  async resolve(name: string): Promise<string> {
    return await this.ens.name(name).getAddress();
  }

  async resolveByGraph(name: string): Promise<string | undefined> {
    const result = await graphQLQuery(this.gqlClient, QueryOwnerByDomain, {
      name,
    });
    if (!result || !result.domains || result.domains.length < 1) {
      return undefined;
    }
    return result.domains[0].owner.id;
  }

  async lookupBy(account: string): Promise<string> {
    const {name} = await this.ens.getName(account.toLocaleLowerCase());
    return name;
  }

  async lookupByGraph(account: string): Promise<string | undefined> {
    const result = await graphQLQuery(this.gqlClient, QueryDomainByAccount, {
      id: account.toLocaleLowerCase(),
    });
    if (
      !result ||
      !result.account ||
      !result.account.domains ||
      result.account.domains.length < 1
    ) {
      return undefined;
    }
    return result.account.domains[0].name;
  }
}

async function main() {
  const privateKey = env.get('PRIVATE_KEY').required().asString();
  const rpcUrl = env.get('RPC_URL').required().asString();
  const network = env.get('NETWORK').required().asInt().toString();

  console.log('providate key', privateKey);
  console.log('rpc url', rpcUrl);
  console.log('network', network);

  const provider = new ethers.providers.JsonRpcProvider(
    rpcUrl,
    Number(network)
  );
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('wallet', wallet.address);

  const example = new ENSExample(network, provider);

  const name = 'stayhungry.eth';
  const duration = 31556952;

  const secret = await example.commit(wallet, name);
  console.log('waiting 65000 miliseconds');
  await sleep(65000); // wait for 1 minute to prevent frontrunnning
  await example.reveal(wallet, name, duration, secret);
  console.log(`Successfully registered ${name}`);

  const resolveName = 'hungrywarrior.eth';

  console.time('Resolve');
  // const address = await example.resolve(resolveName);
  const address = await example.resolveByGraph(resolveName);
  console.log(`Resolve ${resolveName}`, address);
  console.timeEnd('Resolve');

  console.time('Lookup');
  // const names = await example.lookupBy(wallet.address);
  const names = await example.lookupByGraph(wallet.address);
  console.log(`Lookup by ${wallet.address}`, names);
  console.timeEnd('Lookup');
}

main().catch(error => {
  console.error(error);
});
