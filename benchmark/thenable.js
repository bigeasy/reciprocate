async function main () {
    const RUNS = 10000000

    class Derived extends Promise {
    }

    function promised () {
        return new Promise(resolve => resolve(1))
    }

    function thenable () {
        return {
            then (resolve, reject) {
                resolve(1)
            }
        }
    }

    function derived () {
        return new Derived(resolve => resolve(1))
    }

    const assert = require('assert')

    {
        const start = Date.now()
        for (let i = 0; i < RUNS; i++) {
            const got = await promised()
            assert.equal(got, 1)
        }
        console.log(Date.now() - start)
    }

    {
        const start = Date.now()
        for (let i = 0; i < RUNS; i++) {
            const got = await thenable()
            assert.equal(got, 1)
        }
        console.log(Date.now() - start)
    }

    {
        const start = Date.now()
        for (let i = 0; i < RUNS; i++) {
            const got = await derived()
            assert.equal(got, 1)
        }
        console.log(Date.now() - start)
    }

    {
        const start = Date.now()
        for (let i = 0; i < RUNS; i++) {
            promised()
        }
        console.log(Date.now() - start)
    }

    {
        const start = Date.now()
        for (let i = 0; i < RUNS; i++) {
            thenable()
        }
        console.log(Date.now() - start)
    }

    {
        const start = Date.now()
        for (let i = 0; i < RUNS; i++) {
            derived()
        }
        console.log(Date.now() - start)
    }
}

main()
