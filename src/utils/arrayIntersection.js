module.exports = (array1, array2) => {
    var result=[];
    if(array1.length && array2.length) {
        array1.forEach(function(x){
            array2.forEach(function(y){
                if (x === y) {
                    result.push(x)
                }
            })
        })
        return result
    } else {
        return []
    }
}