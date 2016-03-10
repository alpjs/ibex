import { ConsoleLogger } from 'nightingale';
import { EventEmitter } from 'events';
import compose from './compose';
import context from './context';

const logger = new ConsoleLogger('ibex');

export default class Application extends EventEmitter {
    constructor() {
        super();
        this.middleware = [];
        this.context = Object.create(context);
    }

    get environment() {
        return this.env;
    }

    use(fn) {
        logger.debug('use', { name: fn.name || '-' });
        this.middleware.push(fn);
        return this;
    }

    onerror(e) {
        logger.error(e);
    }

    run() {
        return Promise.all(this._initPromises).then(() => {
            delete this._initPromises;

            if (!this.listeners('error').length) {
                this.on('error', this.onerror);
            }

            this.callback = compose(this.middleware);
        });
    }

    load(url) {
        logger.debug('load', { url });

        if (url.startsWith('?')) {
            url = window.location.pathname + url;
        }

        this.context.path = url;
        this.callback.call(this.context)
            .then(() => respond.call(this.context))
            .catch((err) => this.emit('error', err));
    }
}

function respond() {
    // allow bypassing
    if (this.respond === false) {
        return;
    }

    if (!this.writable) return;

    let body = this.body;
    // let code = this.status;

    if (typeof body === 'string') {
        document.body.innerHTML = body;
        return;
    }

    if (body.nodeType) {
        document.body.innerHTML = '';
        document.body.appendChild(body);
    }

    throw new Error('Invalid body result');
}
