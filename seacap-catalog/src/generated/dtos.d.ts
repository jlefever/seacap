/**
 * A git commit
 */
export interface Commit {
    /**
     * A unique identifier for a commit
     */
    id: number;
    /**
     * The SHA-1 hash of this commit
     */
    sha1: string;
    /**
     * The commit message
     */
    message: string;
}

/**
 * A source code entity such as a file, class, method, etc.
 */
export interface Entity {
    /**
     * A unique identifier for an entity
     */
    id: number;
    /**
     * The local name of an entity
     */
    name: string;
    /**
     * The kind of entity
     */
    kind: string;
    /**
     * The commits where this entity was touched
     */
    commits: Commit[];
}

