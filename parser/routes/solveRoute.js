const express = require('express')
const router = express.Router();
const { transpiler } = require('../transpiler')
const { getClassifier } = require('../classifier/classifier')

const currentStep =
//   "Can you mint a BAYC NFT for me";
    // "Can you transfer this BAYC NFT to this address 0x288d1d682311018736B820294D22Ed0DBE372188"
    "Can you please send 10 USDC token to this address 0x288d1d682311018736B820294D22Ed0DBE372188"

router.get('/', async (req, res) => {
    const intent = req.query.intent;
    const chain = req.query.chain;
    const userAddress = req.query.userAddress;

    try {
        const classifier = await getClassifier();
        const txn = await transpiler(intent, classifier, userAddress, chain);
        console.log(txn)
        res.status(200).send({
            transactions: JSON.stringify(txn)
        })
    } catch (err) {
        console.log(err);
        res.status(503).send({
            transactions: ""
        })
    }

})

module.exports = router;