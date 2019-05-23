export const camelize = {
    /**
     * Convert all non-camelized name to camelized format
     * 
     * Examples: 
     *      SetPokemon -> setPokemon
     *      set_Pokemon -> setPokemon
     *      set Pokemon -> setPokemon
     *      set-Pokemon -> setPokemon
     */
    camelize: (string: string): string => {
        return string.replace(/^([A-Z])|[\s-_](\w)/g, function(match, p1, p2, offset) {
            return p2 ? p2.toUpperCase() : p1.toLowerCase()  
        });
    },
    camelizeKeys: (obj: {[ key: string ]: any }) => {
        const clone: {[ key: string ]: any } = {}
        for(let key in obj){
            clone[camelize.camelize(key)] = obj[key]
        }
        return clone
    }
}
