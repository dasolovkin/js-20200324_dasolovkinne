/**
 * createGetter
 * @param {String} fieldName 
 * @returns {Function} 
 */
export function createGetter(fieldName) {   
    return function GetField(obj) {          
        let result = obj;
        
        for(let fieldNameItem of fieldName.split('.')) {
          result = result[fieldNameItem];

          if (result == undefined){
            break;
          }
        }    
  
        return result;   
    };
  }