export const ERC20TokensQueryPolygon = `query ERC20TokensQuery($owner: Identity, $limit: Int) {
    polygon: TokenBalances(
      input: {filter: {owner: {_eq: $owner}, tokenType: {_eq: ERC20}}, blockchain: polygon, limit: $limit, order: {lastUpdatedTimestamp: DESC}}
    ) {
      TokenBalance {
        amount
        tokenType
        blockchain
        tokenAddress
        formattedAmount
        token {
          name
          symbol
          logo {
            small
          }
          projectDetails {
            imageUrl
          }
        }
      }
      pageInfo {
        nextCursor
        prevCursor
      }
    }
  }`;