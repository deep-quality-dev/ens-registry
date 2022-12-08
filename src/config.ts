import {gql} from 'graphql-request';

export type SupportedNetworkId = '1' | '5';

export const Addresses = {
  ETHRegistrarController: {
    '1': '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5',
    '5': '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5',
  },
  PublicResolver: {
    '1': '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    '5': '0xE264d5bb84bA3b8061ADC38D3D76e6674aB91852',
  },
};

export const Abis = {
  ETHRegistrarController: [
    'function makeCommitment(string memory name, address owner, bytes32 secret) pure public view returns(bytes32)',
    'function commit(bytes32 commitment) public',
    'function register(string calldata name, address owner, uint duration, bytes32 secret) external payable',
    'function rentPrice(string memory name, uint duration) view public returns(uint)',
    'function registerWithConfig(string name, address owner, uint256 duration, bytes32 secret, address resolver, address addr) payable',
  ],
};

export const SubgraphURLs = {
  '1': 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  '5': 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli',
};

export const QueryDomainByAccount = gql`
  query Domain($id: String!) {
    account(id: $id) {
      domains {
        name
      }
    }
  }
`;

export const QueryOwnerByDomain = gql`
  query Domain($name: String!) {
    domains(where: {name: $name}) {
      name
      owner {
        id
      }
    }
  }
`;
