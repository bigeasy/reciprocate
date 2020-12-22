async function main () {
    const assert = require('assert')
    const Trampoline = require('../reciprocate')

    class NoOpSync {
        get () {
            return 0
        }
    }

    class NoOpAsync {
        async get () {
            return 0
        }
    }

    class NoOpPromise {
        get () {
            return Promise.resolve(0)
        }
    }

    class NoOpTrampoline {
        get () {
            return new Trampoline().set(0)
        }
    }

    class NoOpPromised {
        get () {
            return new Trampoline().set(0).promise()
        }
    }

    const RUNS = 10000000

    console.log('--- test ---')

    {
        const start = Date.now()
        const cache = new NoOpSync
        for (let i = 0; i < RUNS; i++) {
            const got = cache.get()
            assert.equal(got, 0)
        }
        console.log('noop sync', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new NoOpAsync
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.get()
            assert.equal(got, 0)
        }
        console.log('noop async', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new NoOpPromise
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.get()
            assert.equal(got, 0)
        }
        console.log('noop promise', Date.now() - start)
    }


    {
        const start = Date.now()
        const cache = new NoOpTrampoline
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.get()
            assert.equal(got, 0)
        }
        console.log('noop trampoline internal', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new NoOpTrampoline
        for (let i = 0; i < 0; i++) {
            const trampoline = cache.get()
            trampoline.then(value => got = value, error => {})
            assert.equal(got, 0)
        }
        console.log('noop trampoline what the?', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new NoOpTrampoline
        for (let i = 0; i < RUNS; i++) {
            const trampoline = cache.get()
            while (trampoline.seek()) {
                await trampoline.shift()
            }
            assert.equal(trampoline.value, 0)
        }
        console.log('noop trampoline external', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new NoOpPromised
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.get()
            assert.equal(got, 0)
        }
        console.log('noop trampoline promise', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new NoOpPromised
        for (let i = 0; i < RUNS; i++) {
            const { trampoline } = cache.get()
            while (trampoline.seek()) {
                await trampoline.shift()
            }
            assert.equal(trampoline.value, 0)
        }
        console.log('noop promise trampoline', Date.now() - start)
    }
}

main()
