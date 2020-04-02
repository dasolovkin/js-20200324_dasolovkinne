/**
 * invertObj - returns sum of arguments if they can be converted to a number
 * @param {Object} value
 * @returns {Object}
 */
export function invertObj(obj) {
    if (!obj){
        return obj;
    }

    return Object.fromEntries(   
        Object.entries(obj).map(([key, value]) => [value, key])
    );    
}