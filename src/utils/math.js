module.exports = {
    geometricMean: dataSet => {
        return Math.pow(dataSet.reduce((accumulator, element) => accumulator * element, 1), 1 / dataSet.length)
    }
}