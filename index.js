const inquirer = require("inquirer")
const chalk = require("chalk")
const fs = require("fs")

operation()

function operation() {
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    },
    ])
        .then((answer) => {
            const action = answer.action
            const actions = {
                'Criar conta': createAccount,
                'Consultar saldo': getAccountBalance,
                'Depositar': deposit,
                'Sacar': withdraw,
                'Sair': () => {
                    console.log(chalk.bgBlue.black("Obrigado por usar o Accounts!"))
                    process.exit()
                }
            }

            if (actions[action]) {
                actions[action]()
            } else {
                console.log(chalk.bgRed.black("Opção inválida!"))
                operation()
            }
        })
        .catch((err) => console.log(err))
}

function createAccount() {
    console.log(chalk.bgGreen.black("Obrigado por nos escolher!"))
    console.log(chalk.green("Defina as opções da sua conta a seguir"))

    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta:'
        }
    ]).then((answer) => {
        const accountName = answer.accountName

        console.info(accountName)

        !fs.existsSync('accounts') && fs.mkdirSync('accounts')

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black("Esta conta já existe, escolha outro nome!"))
            buildAccount()
            return
        }

        fs.writeFileSync(
            `accounts/${accountName}.json`,
            '{"balance": 0}',
            err => console.log(err),
        )

        console.log(chalk.green('Parabéns, a sua conta foi criada!'))
        operation()

    }).catch((err) => console.log(err))
}

function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual é o nome da sua conta?'
        },
    ])
        .then((answer) => {
            const accountName = answer.accountName

            if (!checkAccount(accountName)) {
                deposit()
            } else {
                inquirer.prompt([
                    {
                        name: 'amount',
                        message: 'Quanto você deseja depositar?'
                    },
                ]).then((answer) => {
                    const amount = answer.amount

                    addAmount(accountName, amount)
                    operation()

                })
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
}

function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe!'))
        return false
    }

    return true
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(`accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => console.log(err)
    )

    console.log(chalk.green(`Foi depositado o valor de R$ ${amount} na sua conta!`))

}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {
        const accountName = answer.accountName

        !checkAccount(accountName) && getAccountBalance()

        const accountData = getAccount(accountName)

        console.log(
            chalk.bgBlue.black(
                `Olá, o saldo da sua conta é de R$ ${accountData.balance}.`
            ),
        )

        operation()

    }).catch(err => {
        console.log(err)
    })
}

function withdraw() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        },
    ])
        .then((answer) => {
            const accountName = answer.accountName

            if (!checkAccount(accountName)) withdraw()

            else inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Quanto você deseja sacar?'
                }
            ])
                .then((answer) => {
                    const amount = answer.amount

                    removeAmount(accountName, amount)

                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))

}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black
            ('Ocorreu um erro, tente novamente mais tarde!')
        )
        return withdraw()
    }

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black
            (`Valor indisponível! O seu saldo é de ${accountData.balance}`)
        )
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => console.log(err)
    )

    console.log(
        chalk.green(`Foi realizado um saque de ${amount} e o seu saldo é de ${accountData.balance}`)
    )
    
    operation()
}