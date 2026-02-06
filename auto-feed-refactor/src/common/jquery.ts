import $ from 'jquery';

// jQuery wait plugin (ported from legacy script)
// Usage: $(selector).wait(fn, times?, interval?)
($.fn as any).wait = function (func: () => void, times?: number, interval?: number) {
    let _times = times || 100;
    const _interval = interval || 20;
    let _self: any = this;
    const _selector = (this as any).selector;
    let _iIntervalID: number | undefined;

    if (this.length) {
        func && func.call(this);
    } else {
        _iIntervalID = window.setInterval(() => {
            if (!_times) {
                if (_iIntervalID) window.clearInterval(_iIntervalID);
            }
            _times <= 0 || _times--;
            _self = $(_selector);
            if (_self.length) {
                func && func.call(_self);
                if (_iIntervalID) window.clearInterval(_iIntervalID);
            }
        }, _interval);
    }
    return this;
};

export { $ };
