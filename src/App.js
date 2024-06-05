import React from 'react';
import { ApolloProvider, InMemoryCache, ApolloClient, split, HttpLink } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import Chat from './chat';

// Create an HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql', // Replace with your GraphQL server URL
});

// Create a WebSocket link for subscriptions
const wsLink = new WebSocketLink({
  uri: ' ws://localhost:4000/subscriptions', // Replace with your GraphQL subscriptions URL
  options: {
    reconnect: true,
  },
});

// Use split for proper routing of queries and subscriptions
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

// Initialize Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);

export default App;
