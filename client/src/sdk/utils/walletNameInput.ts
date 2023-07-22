import { v4 } from "uuid";
import { BANANA_APP } from "../Constants";
import { getUsernameFromSessionId } from "../Controller";

export const walletNameInput = async (): Promise<string> => {
  const sessionId = v4();
  // open session corresponding to this sessio id
  const finalUrl = BANANA_APP + "/connect/" + sessionId + "?" + "dapp=" + window.location.hostname;
  // opening session for username input
  window.open(finalUrl, "_blank");

  //! Need to figure out solution for clearing timeout interval issue
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      const username = await getUsernameFromSessionId(sessionId);
      //@ts-ignore
      if (username) {
        clearInterval(intervalId);
        resolve(username);
      }
    }, 1000);
  });
};
