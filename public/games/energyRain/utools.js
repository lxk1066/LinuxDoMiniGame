function randomInt(m, n) {
  const max = Math.max(m, n)
  const min = Math.min(m, n)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 随机选择
export function getProbability(probabilityArr) {
  console.log('getProbability', probabilityArr)
  const min = 0
  const max = 100
  let index = 0
  const random = randomInt(min, max)
  for (let i = 0; i < probabilityArr.length; i++) {
    index += probabilityArr[i]
    if (random <= index) {
      return i
    }
  }
}
