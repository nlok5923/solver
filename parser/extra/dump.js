// tokenized statement
// const Tokenization = () => {
//     const tokens = step.split(' ');
//     return tokens;
// };

// getting sentence context
// const getContext = (tokens) => {

//     let currentScore = 0;
//     let currentContext = nftContext.context;
//     const nftScore = getSimilarityScore(tokens, nftContext.corpus);

//     if(nftScore >= currentScore) {
//         currentScore = nftScore;
//     }

//     const swapScore = getSimilarityScore(tokens, swapContext.corpus);

//     if(swapScore >= currentScore) {
//         currentScore = swapScore;
//         currentContext = swapContext.context
//     }

//     const bridgeScore = getSimilarityScore(tokens, bridgingContext.corpus);

//     if(bridgeScore >= currentScore) {
//         currentScore = bridgeScore;
//         currentContext = bridgingContext.context;
//     }

//     const transferScore = getSimilarityScore(tokens, transferContext.corpus);

//     if(transferScore >= currentScore) {
//         currentScore = transferScore;
//         currentContext = transferContext.context;
//     }

//     console.log(nftScore, bridgeScore, transferScore, swapScore)

//     return currentContext;
// }