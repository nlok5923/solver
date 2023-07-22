import React, { useState } from "react";
import "./Token.css";
import { getUSDCUSDTCurrentPrice } from "../../utils/priceFeeds";
import { useEffect } from "react";

const TokenSection = (props) => {
  const [usdcPrice, setUsdcPrice] = useState();
  const [usdtPrice, setUsdtPrice] = useState();

  const setPrices = async () => {
    const prices = await getUSDCUSDTCurrentPrice();
    setUsdcPrice(prices[0].price);
    setUsdtPrice(prices[1].price);
  };

  useEffect(() => {
    setPrices();
  }, []);

  return (
    <div className="container">
      <h3>Tokens</h3>
      {props.tokens.map((token, index) => (
        <div key={index} className="tokenContainer">
          <img
            src={token.token.logo.small}
            alt={token.token.name}
            className="tokenImage"
          />
          <div className="tokenInfo">
            <div>
              {token.token.symbol +
                " " +
                Number(token.amount) / 10 ** 6 +
                " (" +
                ((Number(token.amount) / 10 ** 6) *
                  (token.token.symbol === "USDC" ? usdcPrice : usdtPrice)).toFixed(3) + ')$'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TokenSection;
