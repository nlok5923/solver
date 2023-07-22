const natural = require('natural');
const { transactionData } = require('../trainingData')

const classifier = new natural.BayesClassifier();

const trainClassifier = async () => {
    transactionData.map(data => classifier.addDocument(data.statement, data.type) );
    await classifier.train();
}

trainClassifier();


