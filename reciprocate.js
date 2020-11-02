class Trampoline {
    constructor () {
        this._trampoline = []
    }

    sync (f) {
        this._trampoline.push({ sync: true, f })
    }

    promised (f) {
        this._trampoline.push({ sync: false, f })
    }

    seek () {
        while (this._trampoline.length != 0 && this._trampoline[0].sync) {
            this._trampoline.shift().f.call(null)
        }
        return this._trampoline.length != 0
    }

    shift () {
        return this._trampoline.shift().f.call(null)
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
