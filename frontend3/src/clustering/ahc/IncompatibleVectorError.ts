export default class IncompatibleVectorError extends Error {
    constructor() {
        super("These vectors are not compatible.");
        this.name = "IncompatibleVectorError";
    }
}