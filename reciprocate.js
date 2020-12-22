const TRAMPOLINE = Symbol('TRAMPOLINE')
const SYNC = Symbol('SYNC')
const ASYNC = Symbol('SYNC')

class Trampoline {
    constructor () {
        this._trampoline = []
        this.value
    }

    set (value) {
        this.value = value
        return this
    }

    promise () {
        const promise = new Promise((resolve, reject) => {
            const again = () => {
                if (this.seek()) {
                    this.shift().then(again, reject)
                } else {
                    resolve(this.value)
                }
            }
            again()
        })
        promise.trampoline = this
        return promise
    }

    sync (f) {
        this._trampoline.push({ type: SYNC, operator: f, consumer: null })
        return this
    }

    promised (f) {
        this._trampoline.push({ type: ASYNC, operator: f, consumer: null })
        return this
    }

    resolve (trampoline, consumer) {
        this._trampoline.push({ type: TRAMPOLINE, operator: trampoline, consumer })
        return this
    }

    then (resolve, reject) {
        if (this._trampoline.length == 0) {
            resolve(this.value)
        } else {
            const again = () => {
                if (this.seek()) {
                    this.shift().then(again, reject)
                } else {
                    resolve(this.value)
                }
            }
            again()
        }
    }

    async _then (resolve, reject) {
        while (this.seek()) {
            await this.shift()
        }
        return this.value
    }

    ___then (resolve, reject) {
        return this._then().then(resolve, reject)
    }

    seek () {
        while (this._trampoline.length != 0 && this._trampoline[0].type != ASYNC) {
            if (this._trampoline[0].type == SYNC) {
                this._trampoline.shift().operator.call(null)
            } else {
                if (this._trampoline[0].operator.seek()) {
                    const { operator } = this._trampoline[0]
                    this._trampoline.unshift({ type: ASYNC, operator: () => operator.shift(), consumer: null })
                } else {
                    const { consumer, operator } = this._trampoline.shift()
                    consumer(operator.value)
                }
            }
        }
        return this._trampoline.length != 0
    }

    shift () {
        return this._trampoline.shift().operator.call(null)
    }

    bounce (callback) {
        try {
            if (this.seek()) {
                const promise = this.shift()
                promise.then(() => {
                    this.bounce(callback)
                }).catch(error => {
                    callback(error)
                })
            } else {
                callback()
            }
        } catch (error) {
            callback(error)
        }
    }
}

module.exports = Trampoline
