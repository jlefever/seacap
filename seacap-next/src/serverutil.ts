/*
    This file contains server-side code I'm not sure where to put.
*/
import { promises as fs } from "fs";
import Repo from "models/repo";
import { basename, join } from "path";
import sqlite3 from "sqlite3";

const PROJECT_DIR = "projects";

export async function scanForDbFiles()
{
    const projectsDir = join(process.cwd(), PROJECT_DIR);
    const filenames = await fs.readdir(projectsDir);

    return filenames.map((filename) =>
    {
        return join(projectsDir, filename);
    });
}

export async function createDbMap()
{
    var dbMap = new Map<string, sqlite3.Database>();

    for (var path of await scanForDbFiles())
    {
        const name = basename(path, ".db");
        const db = new sqlite3.Database(path, sqlite3.OPEN_READONLY);
        dbMap.set(name, db);
    }

    return dbMap;
}

export async function getDbMap()
{
    // @ts-ignore
    if (global.dbMap)
    {
        // @ts-ignore
        return global.dbMap as Map<string, sqlite3.Database>;
    }

    const dbMap = await createDbMap();
    // @ts-ignore
    global.dbMap = dbMap;
    return dbMap;
}

export function query<T>(db: sqlite3.Database, sql: string): Promise<T[]>
{
    return new Promise((resolve, reject) =>
    {
        db.all(sql, (err, rows) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve(rows);
            }
        });
    });
}

export async function getRepo(name: string, db: sqlite3.Database): Promise<Repo>
{
    const meta = new Map<string, string>();

    const sql = "SELECT key, value FROM meta";

    for (var row of await query<{ key: string, value: string; }>(db, sql))
    {
        meta.set(row.key, row.value);
    }

    if (!meta.has("gitLeadRef"))
    {
        throw new Error("missing meta key 'gitLeadRef'");
    }

    return {
        name,
        displayName: meta.get("displayName") ?? name,
        description: meta.get("description") ?? "",
        gitWeb: meta.get("gitWeb") ?? null,
        gitLeadRef: meta.get("gitLeadRef")!
    };
}

export async function getRepos()
{
    const dbs = await getDbMap();

    return Promise.all(Array.from(dbs.entries(), ([name, db]) =>
    {
        return getRepo(name, db);
    }));
}