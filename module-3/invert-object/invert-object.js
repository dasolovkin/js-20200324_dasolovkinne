/**
 * invertObj - returns sum of arguments if they can be converted to a number
 * @param {Object} value
 * @returns {Object}
 */
export function invertObj(obj) {
    if (!obj){
        return obj;
    }

    let result = Object.create(null);
    
    for(let objItem in obj){
        let newName = obj[objItem];
        result[newName] = objItem;
    }  
    
    return result;
}