import { JSONSchema4 } from "json-schema";
import { OpenAPIV2 } from "openapi-types";

type Schema = JSONSchema4 & OpenAPIV2.SchemaObject & OpenAPIV2.ItemsObject;

const repo: Schema = {
    title: "Repo",
    description: "A git repository with some additional metadata",
    type: "object",
    properties: {
        name: {
            description: "A unique name for a repo",
            type: "string"
        },
        displayName: {
            description: "How this entity is displayed in user interfaces",
            type: "string"
        }
    },
    additionalProperties: false,
    required: [
        "name",
        "displayName"
    ]
};

const commit: Schema = {
    title: "Commit",
    description: "A git commit",
    type: "object",
    properties: {
        id: {
            description: "A unique identifier for a commit",
            type: "integer"
        },
        sha1: {
            description: "The SHA-1 hash of this commit",
            type: "string"
        },
        message: {
            description: "The commit message",
            type: "string"
        }
    },
    additionalProperties: false,
    required: [
        "id",
        "sha1",
        "message"
    ]
};

const entity: Schema = {
    title: "Entity",
    description: "A source code entity such as a file, class, method, etc.",
    type: "object",
    properties: {
        id: {
            description: "A unique identifier for an entity",
            type: "integer"
        },
        name: {
            description: "The local name of an entity",
            type: "string"
        },
        kind: {
            description: "The kind of entity",
            type: "string"
        },
        commits: {
            description: "The commits where this entity was touched",
            type: "array",
            items: commit
        }
    },
    additionalProperties: false,
    required: [
        "id",
        "name",
        "kind",
        "commits"
    ]
};

export default {
    repo,
    commit,
    entity
};