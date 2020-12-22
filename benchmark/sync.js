// The configuration with `DEPTH = 8` is what you'd expect in Memento. You can
// see that `thenable` with functions is about as fast as your promise boundary
// implementation. The `async` wrapper around functions is fastest. Both
// the promise boundary constructs a Promise so the thenable implementation must
// do the same internally. Seems like thenable is the correct choice for
// Memento to determine if you'd actually propagate a trampoline.

// This is obviously not a solution for minimal functions, only for what
// happened in Memento where you decorated an `async` operation.

//
async function main () {
    const Trampoline = require('../reciprocate')

    class Async {
        async recurse (count) {
            if (count == 0) {
                return 0
            } else {
                return (await this.recurse(count - 1)) + 1
            }
        }

        async get (count) {
            return await this.recurse(count)
        }
    }

    class External {
        recurse (count) {
            if (count == 0) {
                return new Trampoline().set(0)
            } else {
                const trampoline = new Trampoline
                return trampoline.resolve(this.recurse(count - 1), value => trampoline.set(value + 1))
            }
        }

        get (count) {
            const trampoline = new Trampoline
            return trampoline.resolve(this.recurse(count), value => trampoline.set(value))
        }
    }

    class Internal {
        recurse (trampoline, count, f) {
            if (count == 0) {
                f(0)
            } else {
                this.recurse(trampoline, count - 1, value => f(value + 1))
            }
        }

        async get (count) {
            const trampoline = new Trampoline
            let value
            this.recurse(trampoline, count, $value => value = $value)
            while (trampoline.seek()) {
                await trampoline.shift()
            }
            return value
        }

        trampolined (count) {
            const trampoline = new Trampoline
            let value
            this.recurse(trampoline, count, $value => value = $value)
            return trampoline.set(value)
        }

        promised (count) {
            const trampoline = new Trampoline
            let value
            this.recurse(trampoline, count, $value => value = $value)
            return trampoline.set(value).promise()
        }
    }

    const assert = require('assert')
    //const RUNS = 50000000
    const RUNS = 1000000
    const DEPTH = 8

    console.log('--- test ---')

    async function get (cache, key) {
        const trampoline = cache.get(key)
        while (trampoline.seek()) {
            await trampoline.shift()
        }
        return trampoline.value
    }

    {
        const start = Date.now()
        const cache = new Async
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.get(DEPTH)
            assert.equal(got, DEPTH)
        }
        console.log('standard await', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new External
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.get(DEPTH)
            assert.equal(got, DEPTH)
        }
        console.log('objects await', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new External
        for (let i = 0; i < RUNS; i++) {
            const trampoline = cache.get(DEPTH)
            while (trampoline.seek()) {
                await trampoline.shift()
            }
            assert.equal(trampoline.value, DEPTH)
        }
        console.log('objects external', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new Internal
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.get(DEPTH)
            assert.equal(got, DEPTH)
        }
        console.log('functions await async', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new Internal
        for (let i = 0; i < RUNS; i++) {
            const trampoline = new Trampoline
            let got
            cache.recurse(trampoline, DEPTH, value => got = value)
            while (trampoline.seek()) {
                await trampoline.shift()
            }
            assert.equal(got, DEPTH)
        }
        console.log('functions external', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new Internal
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.trampolined(DEPTH)
            assert.equal(got, DEPTH)
        }
        console.log('functions thenable', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new Internal
        for (let i = 0; i < RUNS; i++) {
            const trampoline = cache.trampolined(DEPTH)
            while (trampoline.seek()) {
                trampoline.shift()
            }
            assert.equal(trampoline.value, DEPTH)
        }
        console.log('functions recurse external alternate', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new Internal
        for (let i = 0; i < RUNS; i++) {
            const got = await cache.promised(DEPTH)
            assert.equal(got, DEPTH)
        }
        console.log('functions promise boundary', Date.now() - start)
    }

    {
        const start = Date.now()
        const cache = new Internal
        for (let i = 0; i < RUNS; i++) {
            const { trampoline } = cache.promised(DEPTH)
            while (trampoline.seek()) {
                trampoline.shift()
            }
            assert.equal(trampoline.value, DEPTH)
        }
        console.log('functions promise boundary external', Date.now() - start)
    }
}

main()
