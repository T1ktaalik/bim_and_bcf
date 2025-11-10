/**
 * LocaleService class for handling localization in the BIM Viewer
 */
export class LocaleService {
    /**
     * Constructs a LocaleService.
     * @param cfg Configuration object.
     * @param cfg.messages Translation messages.
     * @param cfg.locale Current locale.
     */
    constructor(cfg?: { messages?: any; locale?: string });

    /**
     * Gets the current locale.
     * @return The current locale.
     */
    locale: string;

    /**
     * Sets the current locale.
     * @param locale The new locale.
     */
    locale: string;

    /**
     * Gets the translation messages.
     * @return The translation messages.
     */
    messages: any;

    /**
     * Sets the translation messages.
     * @param messages The new translation messages.
     */
    messages: any;

    /**
     * Translates a key to the current locale.
     * @param key The key to translate.
     * @param params Optional parameters for the translation.
     * @return The translated string.
     */
    translate(key: string, params?: any): string;

    /**
     * Adds an event listener.
     * @param event The event name.
     * @param callback The callback function.
     */
    on(event: string, callback: Function): void;

    /**
     * Removes an event listener.
     * @param event The event name.
     * @param callback The callback function.
     */
    off(event: string, callback: Function): void;

    /**
     * Fires an event.
     * @param event The event name.
     * @param data The event data.
     */
    fire(event: string, data?: any): void;
}