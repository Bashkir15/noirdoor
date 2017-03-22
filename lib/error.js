'use strict';

// Custom error names in stack traces for a more friendly user experience.

class SecurityError extends Error {
    constructor(...args) {
        super(...args);
        this.name = 'SecurityError';
    }
}

module.exports = {
    SecurityError
};
