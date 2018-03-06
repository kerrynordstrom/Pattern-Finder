'use strict';

const readline = require('readline');

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function (line) {
  //Here we receive stdin line-by-line, replace new lines with empty space, remove leading and trailing commas or forward slashes, then split each line into an array at either of those delimiting characters.
  return allDataIn.push(line.replace('\n', '').replace(/^(\/|,)|(\/|,)$/g, '').replace(/\*+/g, '*').trim().split(/[\/,]+/));
}).on('pause', () => {
  //Once the data from stdin has been pushed to an array, I call functionality to break the array into two and determine whether we have a match between each path and the set of patterns.
  breakInTwo(allDataIn);
  determineMatch(paths, patterns);
}).on('close', () => {
  process.exit(0);
})

let allDataIn = [], patterns = [], paths = [], forJest = 123;

let breakInTwo = allDataIn => {
  let patternSize = 0, pathSize = 0
  //The data from stdin is broken down into counts of patterns, paths, and the 2d arrays that hold both the patterns and paths.
  let dataSetSizes = allDataIn.filter(num => num > 0);
  patternSize = parseInt(dataSetSizes[0]);
  patterns = allDataIn.slice(1, patternSize + 1);
  pathSize = parseInt(dataSetSizes[1]);
  paths = allDataIn.slice(patternSize + 2);

}

let determineMatch = (paths, patterns) => {
 
  let exactMatch = null;
  let potentialMatches = [];

  let _logResults = (exactMatch, potentialMatches) => {
    if (exactMatch) {
      return console.log(exactMatch.toString());
    } else if (potentialMatches.length === 1) {
      return console.log(potentialMatches[0].toString);
    } else {
      let bestMatch = getBestPotentialMatch(potentialMatches)
      potentialMatches = [];
      return bestMatch === null ? console.log('NO MATCH') : console.log(bestMatch.toString());
    }
  }
  
    for (let path of paths) {
      for (let pattern of patterns) {
        if (path.toString() === pattern.toString()) {
          exactMatch = pattern
          break;
        } else if(path.length === pattern.length && pattern.includes('*')) {
          if(potentialMatch(path, patterns)) {
            potentialMatches.push(pattern);
          }
        } 
      }
      _logResults(exactMatch, potentialMatches);
      potentialMatches = [];
    }
    return true;
  }  
  
  //loop through path array and compare each index to the index of each pattern array
  //increase matching indices count when an exact match is found per index
  //once end of path array hit, test to see if number of wild cards + number of matching indices is equal to the length of the path, if so return true, if not return false
  //reset matching indices count and using the same path, start again on the next pattern in the patterns array
  //once the end of the patterns array is hit, another path can be compared
  let potentialMatch = (path, patterns) => {
    let matchingIndicesCount = 0;
    let numberOfWildCards = 0;
    
    //Helper function which calculates number of wild cards (*) in each pattern
    let _findWildCards = pattern => {
        numberOfWildCards = pattern.reduce( (total, x)  => x === '*' ? total + 1 : total, 0);
        return numberOfWildCards;
    }
    
    //Helper function which returns true if the number of indices matching between a path and pattern plus the number of wild cards in the pattern being compared equal the number of indices in the path being compared.
    let _findIndexEquality = (matchingIndicesCount, numberOfWildCards) => {
      return (matchingIndicesCount + numberOfWildCards === path.length) ? true : false; 
    }

    //This loop does the work of finding the matching indices by looping through both the patterns and paths passed to the potentialMatch function.  The path being compared and each pattern are being mapped over and at each index the characters are being compared.  If the path and pattern are of equal length and the characters are equal, the matching indices count is increased and returned outside of the path map.  Outside of the pattern map, the index equality is tested.
    for (let i = 0; i < patterns.length; i++) {
      patterns[i].map(patternChar => {
        path.map(pathChar => {
            if(path.length === patterns[i].length && patternChar === pathChar) {
                  matchingIndicesCount++;
              }
              return matchingIndicesCount;
            })
          })
        _findIndexEquality(matchingIndicesCount, _findWildCards(patterns[i]))
        matchingIndicesCount = 0
      }
      return true;
    }
  
//This function receives an array of potential matches and determines which of the patterns has fewer wildcards.  If there are ties, these are pushed to the same array and passed to the last function which breaks ties.
let getBestPotentialMatch = potentialMatches => {
  let fewestWildCards = [];
  let wildCardCounter = 0;
  let numberOfWildCards = 0;

  for (let match of potentialMatches) {
    numberOfWildCards = match.reduce((total, x) => x === '*' ? total + 1 : total, 0);
  
    if (!wildCardCounter) {  
      wildCardCounter = numberOfWildCards
      fewestWildCards.push(match);
    } else {
      if (numberOfWildCards < wildCardCounter) {
        wildCardCounter = numberOfWildCards;
        fewestWildCards = [];
        fewestWildCards.push(match);
      } else if (numberOfWildCards === wildCardCounter) {
        fewestWildCards.push(match);
      }
    }
  }
  return fewestWildCards.length === 1 ? fewestWildCards[0] : breakTie(fewestWildCards);
}

//This function determines which of the potential matches which have tied with the fewest wild cards have wildcards in the rightmost place, meaning that the "weight" of their placement is the greatest.
let breakTie = fewestWildCards => {
  let winner = null;
  let highestScore = 0;
  let indexScore = 0;
  
  //This map iterates over the provided array of potential matches with the fewest wild cards, finds the index of their wild cards (*) and adds to the index score variable these indices.  The pattern with the highest value at the end of the function is returned as the winner and printed as the best match.
  fewestWildCards.map(pattern => {
    for (let i = 0; i < pattern.length; i++) {
      let showIndices = pattern.findIndex(wildCard => wildCard === '*') 
        indexScore += parseInt(showIndices);
    }
    if (highestScore === 0) {
      highestScore = indexScore
      winner = pattern;
    } else if (indexScore > highestScore) {
      highestScore = indexScore;
      winner = pattern;
    }
    indexScore = 0;
  })
  return winner;
}
