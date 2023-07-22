const natural = require("natural");
const classifier = new natural.BayesClassifier();
const { transactionData } = require("../data/trainingData");

const getClassifier = async () => {
  console.log('thid id datya ', transactionData)
  transactionData.map((data) =>
    classifier.addDocument(data.statement, data.type)
  );
  console.log('data trained');
  await classifier.train();

  return classifier;
}

module.exports = { getClassifier };