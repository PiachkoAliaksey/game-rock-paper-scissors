
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const crypto = require('crypto');

const selection = [...process.argv.slice(2)].map(val => val.toLowerCase());

class Rules {
    constructor(){
        this.rules =selection.map((val, i) => {
            return { 'name': val, 'result': i < Math.floor(selection.length / 2) ? 'win' : 'lose' }
        }) 
    }

    checkRules(answer) {
        return this.rules[answer].result;
    }
    findElement(answer) {
        return this.rules.find(val => val.name === answer).result
    }
}

class SecureRandomKey {
    constructor(choiceAi) {
        this.choiceAi = choiceAi
    }
    getSecureRandomKey() {
        const key = crypto.randomBytes(256).toString('hex');
        const HmacAi = crypto.createHmac('sha256', key).update(this.choiceAi)
            .digest('hex');
        return [key, HmacAi]
    }
}

class HelpTable {
    constructor(selection) {
        this.selection = selection
    }
    createTable() {
        let table = {};
        this.selection.forEach((element, i) => {
            let key = this.selection[i];
            const arr = selection.map((val, i) => {
                if (key === val) {
                    return [val, 'draw']
                } else {
                    return [val, i < Math.floor(selection.length / 2) ? 'win' : 'lose']
                }
            })
            table[key] = Object.fromEntries(arr);
        });
        return table;
    }
}

class Game {
    constructor(data) {
        this.HmacKey = ''
        this.gameEndMessage = '';
        this.Hmac = '';
        this.data = data
    }
    play() {
        function playAgain(message) {
            if (message) {
                console.log(message);
            }
            const instanceGame = new Game(selection);
            readline.question('Play again? (Yes | No)\n\n', answer =>
                answer.toLowerCase() === 'yes' ? instanceGame.play() : readline.close()
            )
        }
        if (this.data.length % 2 === 0) {
            console.log('Please, write odd initial parameters');
            return readline.close();
        }
        if (this.data.length !== [...new Set(this.data)].length) {
            console.log('Some of yours initial parameters repeats, please write again without repeating');
            return readline.close();
        }
        if (this.data.length === 1) {
            console.log('You write just one initial parameters, the minimum quantity of initial parameters is 3');
            return readline.close();
        }
        const randomChoiceGenerator = () => {
            return this.data[Math.floor(Math.random() * this.data.length)];
        };
        const choiceComputer = randomChoiceGenerator();
        const instanceSecureRandomKey = new SecureRandomKey(choiceComputer);
        const [key, HmacAi] = instanceSecureRandomKey.getSecureRandomKey();
        this.HmacKey = key;
        this.Hmac = HmacAi;
        console.log(this.Hmac);
        const menu = `Available moves:\n${this.data.map((val, i) => {
            return `${i + 1} - ${val}\n`
        }).join('')}0 - exit\n? - help\nEnter your move:`;
        readline.question(menu, answer => {
            if (answer === '0') {
                return readline.close();
            }
            if (answer === '?') {
                const instanceHelpTable = new HelpTable(this.data).createTable();
                console.table(instanceHelpTable);
                return playAgain();
            }
            const personChoice = this.data[Number(answer) - 1];
            console.log(`Your move:${personChoice}`);
            console.log(`Computer move:${choiceComputer}`);
            const instanceRules = new Rules();

            if (Number(answer) > this.data.length && Number(answer)) {
                return playAgain(`Value ${answer} isn't correct, Please, write correct value`);
            }
            if (instanceRules.checkRules(Number(answer) - 1) === 'win' && instanceRules.findElement(choiceComputer) === 'win') {
                return playAgain('Draw!');
            }
            if (instanceRules.checkRules(Number(answer) - 1) === 'win' && instanceRules.findElement(choiceComputer) === 'lose') {
                this.gameEndMessage = 'You win!';
                console.log(this.HmacKey);
            } else {
                this.gameEndMessage = 'Computer win';
                console.log(this.HmacKey);
            }
            playAgain(this.gameEndMessage);
        })
    }
}

const instanceGame = new Game(selection);
instanceGame.play();
