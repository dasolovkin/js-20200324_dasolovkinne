/**
 * uniq
 * @param {Array} sourceArray 
 * @returns {Array} 
 */
export function uniq(sourceArray) {  
    sourceArray = sourceArray || [];
    
    return Array.from(new Set(sourceArray)); 
}