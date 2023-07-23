export const saveToLocalStorage = (userAddress, ipfsHash) => {
    if(localStorage.getItem(userAddress)) {
        let existingHashes = localStorage.getItem(userAddress);
        existingHashes = JSON.parse(existingHashes)
        let newHashes = [...existingHashes, ipfsHash];
        localStorage.setItem(userAddress, newHashes);
    } else {
        localStorage.setItem(userAddress, JSON.stringify([ipfsHash]));
    }
}

