const fs = require('fs')

const favscore = JSON.parse(fs.readFileSync('favscore.json'))


let winner = []

for (let i = 0; i < 3; i++){
  let base = 0.0
  for (let e of favscore) {
    base += e.score
  }
  for (let idx = 0; idx < favscore.length; idx++) {
    e = favscore[idx]
    if (Math.random() < (e.score / base)) {
      winner.push(e)
      favscore.splice(idx, 1)
      break
    }
    base -= e.score
    console.log(base)
  }  
}

fs.writeFileSync('winner.json', JSON.stringify(winner, null, 2))
