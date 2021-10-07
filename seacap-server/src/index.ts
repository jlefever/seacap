import express from "express";
import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";

function run(db: sqlite3.Database, sql: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getDatabases(dir: string) {
    const dbs = new Map<string, sqlite3.Database>();

    fs.readdirSync(dir).forEach(file => {
        const dbPath = path.resolve(dir, file);
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
        dbs.set(path.parse(file).name, db);
    });

    return dbs;
}

async function getRepo(db: sqlite3.Database): Promise<any> {
    const rows = await run(db, "SELECT key, value FROM meta");
    const repo: any = {};
    rows.forEach(row => repo[row.key] = row.value);
    return repo;
}

async function getRepos(dbs: Map<string, sqlite3.Database>) {
    const repos = new Map<string, any>();

    for (const [name, db] of dbs) {
        const repo = await getRepo(db);
        repo.name = name;
        repos.set(name, repo);
    }

    return Array.from(repos.values());
}

function handle(name: string, sql: string, res: express.Response) {
    const db = dbs.get(name);

    if (!db) {
        res.status(404).send(`Could not find project '${name}'`);
        return;
    }

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).json(err);
            return;
        }

        const json = JSON.stringify(rows, (_, value) => {
            if (value !== null) return value
        });

        res.status(200).type("json").send(json);
    });
}

const dbs = getDatabases("../projects/");
const repos = await getRepos(dbs);
const app = express();
const port = 3000;

app.get("/api/repos", (_, res) => res.status(200).json(repos));

app.get("/api/repo/:name/entities", (req, res) => {
    const sql = `
        SELECT
            id,
            parent_id AS parentId,
            name,
            kind,
            start_lineno AS fromLineno,
            end_lineno AS toLineno
        FROM entities`;

    handle(req.params["name"], sql, res);
});

app.get("/api/repo/:name/changes", (req, res) => {
    const sql = `
        SELECT
            CH.id,
            CH.entity_id as entityId,
            CO.sha1 AS commitHash,
            CH.churn
        FROM changes CH
        LEFT JOIN commits CO ON CH.commit_id = CO.id`;

    handle(req.params["name"], sql, res);
});

app.get("/api/repo/:name/deps", (req, res) => {
    const sql = `
        SELECT
            id,
            source_id AS sourceId,
            target_id AS targetId,
            weight,
            kind
        FROM deps`;

    handle(req.params["name"], sql, res);
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});