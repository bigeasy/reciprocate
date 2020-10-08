class Trampoline {
    constructor () {
        this._trampoline = []
    }

    push (bounce) {
        this._trampoline.push(bounce)
    }

    seek () {
        while (this._trampoline.length != 0 && typeof this._trampoline[0] == 'function') {
            this._trampoline.shift()()
        }
        return this._trampoline.length != 0
    }

    shift () {
        return this._trampoline.shift()
    }
}

module.exports = Trampoline
