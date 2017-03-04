'use strict';

class ErrorSubclass extends Error {
    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
    }
}

// These classes show a custom error name in stack traces. You may implement
// custom logic here, but it is also okay if they are empty.

class SecurityError extends ErrorSubclass {}

module.exports = {
    SecurityError
};
