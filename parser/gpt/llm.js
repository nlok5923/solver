// 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
// import { HNSWLib } from "langchain/vectorstores/hnswlib";
require('dotenv').config();
const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts");

const model = new OpenAI({modelName:"gpt-3.5-turbo-16k"});

const getResponse = async (question = "",  statement = "") => {
    // console.log("All empty", statement, question)
    if (!question) return null;

    // console.log('question and statement ', question, statement);
  
    const template = `
      Model Name: (Bot Created by Biomi)
  
      Description: Your goal is to answer the questions in most appropriate ways and as precise as possible
      
      Instruction: You will be given a statement and a question and you'll have to answer the question with one word or as directed and the answer should only be derived from that statement only and in case if the answer is not avalaible in the statement please return "-" as answer.
      ----------------------------------------------------------------------------------------
      Statement:-
      ${statement}
  
      ----------------------------------------------------------------------------------------
      Question: ${question}
      `;
  
    try {
      const res1 = await model.call(template);
      console.log(res1);
      return res1;
    } catch (error) {
      console.log({ error });
      console.log(error.response);
    }
  }

module.exports = { getResponse }