require('proof')(10, async okay => {
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

    class Cache {
        constructor () {
            this._cache = {}
            this._nextValue = 0
        }

        async vivify (key) {
            this._cache[key] = this._nextValue++
        }

        get (key) {
            const trampoline = new Trampoline
            const got = this._cache[key]
            if (got == null) {
                return trampoline.promised(async () => {
                    await this.vivify(key)
                    trampoline.resolve(this.get(key), value => trampoline.set(value))
                })
            }
            return trampoline.set(got)
        }
    }

    const cache = new Cache

    {
        const trampoline = cache.get('a')
        while (trampoline.seek()) {
            await trampoline.shift()
        }
        okay(trampoline.value, 0, 'got')
    }

    {
        const trampoline = cache.get('a')
        while (trampoline.seek()) {
            await trampoline.shift()
        }
        okay(trampoline.value, 0, 'got')
    }

    {
        const got = await cache.get('a')
        okay(got, 0, 'got')
    }

    {
        cache.get('a').then(got => okay(got, 0, 'got'))
    }

    {
        const trampoline = new Trampoline
        const got = await trampoline.resolve(cache.get('b'), value => trampoline.set(value))
        okay(got, 1, 'trampoline resolve, then loop')
    }
})
