/**
 * trimSymbols
 * @param {String} sourceStr
 * @param {Number} lettersCount
 * @returns {String} 
 */
export function trimSymbols(sourceStr, lettersCount) {     
  sourceStr = sourceStr || "";

  if (+lettersCount != lettersCount){
      return sourceStr;
  }
  
  return sourceStr.split('').reduce(function(previousValue, item) {           
    let endsWith = new Array(lettersCount + 1).join(item);
    
    if (!previousValue.endsWith(endsWith)){
      previousValue += item;
    }

    return previousValue;
  }, "");
}