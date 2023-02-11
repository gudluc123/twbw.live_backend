function randomTransactionId(length, ...ranges) {
  let str = ""; // the string (initialized to "")
  while (length--) {
    // repeat this length of times
    let ind = Math.floor(Math.random() * ranges.length); // get a random range from the ranges object
    let min = ranges[ind][0].charCodeAt(0), // get the minimum char code allowed for this range
      max = ranges[ind][1].charCodeAt(0); // get the maximum char code allowed for this range
    let c = Math.floor(Math.random() * (max - min + 1)) + min; // get a random char code between min and max
    str += String.fromCharCode(c); // convert it back into a character and append it to the string str
  }
  return str; // return str
}
// const urlCode = randomTransactionId(9, ["A", "Z"], ["0", "9"]);

module.exports = { randomTransactionId };
