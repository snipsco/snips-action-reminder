module.exports = (arr) => {
    var result=[]
    var l=arr.length
    if(arr.length) {
        for(var i=0;i<l;i++) {
            var temp=arr.slice(i+1,l)
            if(temp.indexOf(arr[i]) == -1) {
                result.push(arr[i])
            } else {
                continue
            }
        }
    }
    return result
}