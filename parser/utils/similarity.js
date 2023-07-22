const isWordSimilar = (stringA, stringB) => {
    const lowerStringA = stringA.toLowerCase();
    const lowerStringB = stringB.toLowerCase();

    if(lowerStringA.includes(lowerStringB) || lowerStringB.includes(lowerStringA)) return 1;

    return 0;
  }

const isPairSimilar = (pair1, pair2) => {
  let identical = 0;
  for(let i=0 ;i < pair1.length; i++) {
    for(let j=0; j< pair2.length; j++) {
      if(pair1[i].toLowerCase() === pair2[j].toLowerCase()) {
        console.log(pair1[i], pair2[j]);
        identical++;
      }
    }
  }

  console.log(identical)

  if(identical >= 2) {
     return 1;
  }
  
  console.log('returning false here ', pair1)
  return 0;
}
module.exports = { isWordSimilar, isPairSimilar }