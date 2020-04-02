/**
 * uniq
 * @param {Array} sourceArray 
 * @returns {Array} 
 */
export function uniq(sourceArray = []) {          
    return Array.from(new Set(sourceArray)); 
}