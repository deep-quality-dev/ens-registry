import {randomBytes} from 'crypto';
import {GraphQLClient, RequestDocument, Variables} from 'graphql-request';

export const sleep = (m: number) => new Promise(r => setTimeout(r, m));

export const randomSecret = () => {
  return `0x${randomBytes(32).toString('hex')}`;
};

export const graphQLQuery = async (
  graphQLClient: GraphQLClient,
  query: RequestDocument,
  variables?: Variables,
  path = ''
) => {
  const response = await graphQLClient.request(query, variables);

  return !path ? response : response[path];
};
