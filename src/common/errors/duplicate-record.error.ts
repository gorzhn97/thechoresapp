export class DuplicateRecordError extends Error {
    constructor(message = 'Record already exists') {
        super(message);
        this.name = 'DuplicateRecordError';
    }
}