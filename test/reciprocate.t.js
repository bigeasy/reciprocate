require('proof')(5, async okay => {
    const Trampoline = require('..')

    const trampoline = new Trampoline
    const test = []

    trampoline.sync(() => test.push('sync'))

    trampoline.promised(async function () { test.push('async') })

    while (trampoline.seek()) {
        await trampoline.shift()
    }

    okay(test, [ 'sync', 'async' ], 'trampoline')

    test.length = 0
    trampoline.sync(() => test.push('sync'))
    trampoline.promised(async function () {
        trampoline.sync(() => {
            test.push('sync')
        })
        test.push('async')
    })

    const latch = { promise: null, resolve: null }
    latch.promise = new Promise(resolve => latch.resolve = resolve)

    trampoline.bounce(function (error) {
        okay(error == null, 'no error')
        okay(test, [ 'sync', 'async', 'sync' ], 'callback no error')
        latch.resolve()
    })
    await latch.promise

    latch.promise = new Promise(resolve => latch.resolve = resolve)
    trampoline.promised(async () => {
        throw new Error('error')
    })
    trampoline.bounce(function (error) {
        okay(error.message, 'error', 'callback async error')
        latch.resolve()
    })

    latch.promise = new Promise(resolve => latch.resolve = resolve)
    trampoline.sync(() => {
        throw new Error('error')
    })
    trampoline.bounce(function (error) {
        okay(error.message, 'error', 'callback sync error')
        latch.resolve()
    })

    await latch.promise
})
