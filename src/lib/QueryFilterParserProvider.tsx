import * as React from 'react';
import QueryFilterParser from './QueryFilterParser';

export const QueryFilterParserContext = React.createContext<QueryFilterParser | null>(null);

export function QueryFilterParserProvider({
  children,
  parser,
}: {
  children: React.ReactNode;
  parser: QueryFilterParser;
}) {
  return (
    <QueryFilterParserContext.Provider value={parser}>{children}</QueryFilterParserContext.Provider>
  );
}

export function useQueryFilterParser() {
  const context = React.useContext(QueryFilterParserContext);

  if (!context) {
    throw new Error('useQueryFilterParser() should be used in QueryFilterParserProvider');
  }

  return context;
}
