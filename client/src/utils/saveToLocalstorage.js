export const saveToLocalStorage = (userAddress, ipfsHash) => {
    if(localStorage.getItem(userAddress)) {
        let existingHashes = localStorage.getItem(userAddress);
        console.log('wiuthout pasing ', existingHashes)
        existingHashes = JSON.parse(existingHashes)
        console.log('these are existing hashes ', existingHashes)
        let newHashes = [...existingHashes, ipfsHash];
        console.log('saving this ', JSON.stringify(newHashes))
        localStorage.setItem(userAddress, JSON.stringify(newHashes));
    } else {
        localStorage.setItem(userAddress, JSON.stringify([ipfsHash]));
    }
}

