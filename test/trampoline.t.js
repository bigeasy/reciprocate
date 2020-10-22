require('proof')(1, async okay => {
    const Trampoline = require('..')

    const trampoline = new Trampoline
    const test = []

    trampoline.sync(() => test.push('sync'))

    trampoline.promised(async function () { test.push('async') })

    while (trampoline.seek()) {
        await trampoline.shift()
    }

    okay(test, [ 'sync', 'async' ], 'trampoline')
})
