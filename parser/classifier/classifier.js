const natural = require("natural");
const classifier = new natural.BayesClassifier();
const { transactionData } = require("../data/trainingData");

const getClassifier = async () => {
  transactionData.map((data) =>
    classifier.addDocument(data.statement, data.type)
  );
  console.log('data trained');
  await classifier.train();

  return classifier;
}

module.exports = { getClassifier };