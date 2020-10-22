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
}

module.exports = Trampoline
