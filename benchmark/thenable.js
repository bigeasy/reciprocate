async function main () {
    const RUNS = 1000000
    console.log('--- test ---')

    class Derived extends Promise {
        constructor (extractor) {
            super((reject, resolve) => {
                return extractor(reject, resolve)
            })
        }
    }

    function derived () {
        return new Derived(resolve => resolve(1))
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
}

main()
