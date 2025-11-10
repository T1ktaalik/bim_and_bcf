/**
 * LocaleService class for handling localization in the BIM Viewer
 */
class LocaleService {
    /**
     * Constructs a LocaleService.
     * @param {Object} cfg Configuration object.
     * @param {Object} cfg.messages Translation messages.
     * @param {String} cfg.locale Current locale.
     */
    constructor(cfg = {}) {
        this._messages = cfg.messages || {};
        this._locale = cfg.locale || 'en';
        this._listeners = {};
    }

    /**
     * Gets the current locale.
     * @return {String} The current locale.
     */
    get locale() {
        return this._locale;
    }

    /**
     * Sets the current locale.
     * @param {String} locale The new locale.
     */
    set locale(locale) {
        this._locale = locale;
        this.fire('updated');
    }

    /**
     * Gets the translation messages.
     * @return {Object} The translation messages.
     */
    get messages() {
        return this._messages;
    }

    /**
     * Sets the translation messages.
     * @param {Object} messages The new translation messages.
     */
    set messages(messages) {
        this._messages = messages;
        this.fire('updated');
    }

    /**
     * Translates a key to the current locale.
     * @param {String} key The key to translate.
     * @param {Object} params Optional parameters for the translation.
     * @return {String} The translated string.
     */
    translate(key, params = {}) {
        if (!this._messages[this._locale]) {
            console.warn(`No messages found for locale: ${this._locale}`);
            return key;
        }

        const keys = key.split('.');
        let message = this._messages[this._locale];

        for (const k of keys) {
            if (!message[k]) {
                console.warn(`No translation found for key: ${key} in locale: ${this._locale}`);
                return key;
            }
            message = message[k];
        }

        // Replace placeholders with params
        for (const [paramKey, paramValue] of Object.entries(params)) {
            message = message.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
        }

        return message;
    }

    /**
     * Adds an event listener.
     * @param {String} event The event name.
     * @param {Function} callback The callback function.
     */
    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    }

    /**
     * Removes an event listener.
     * @param {String} event The event name.
     * @param {Function} callback The callback function.
     */
    off(event, callback) {
        if (!this._listeners[event]) return;
        const index = this._listeners[event].indexOf(callback);
        if (index > -1) {
            this._listeners[event].splice(index, 1);
        }
    }

    /**
     * Fires an event.
     * @param {String} event The event name.
     * @param {Object} data The event data.
     */
    fire(event, data = {}) {
        if (!this._listeners[event]) return;
        for (const callback of this._listeners[event]) {
            callback(data);
        }
    }
}

export { LocaleService };