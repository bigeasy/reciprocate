require('proof')(1, async okay => {
    const Trampoline = require('..')

    const trampoline = new Trampoline
    const test = []

    trampoline.push(() => test.push('called'))

    trampoline.push(async function () { test.push('called') } ())

    while (trampoline.seek()) {
        await trampoline.shift()
    }

    okay(test, [ 'called', 'called' ], 'trampoline')
})
